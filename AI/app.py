import os
import json
import base64
import asyncio
import jwt
import datetime
from Crypto.Cipher import AES
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import concurrent.futures
import threading
import traceback
import sqlite3
import secrets
# optional HTTP client for Supabase REST access
try:
    import requests
except Exception:
    requests = None


def _get_supabase_config():
    # Try several env names used across the repo
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_PROJECT_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    return url, key


def search_applicants(query, limit=5):
    """Query the Supabase 'applicants' table via PostgREST. Returns list of rows or [] on no results.
    This function is defensive: it returns None if requests isn't available or config is missing.
    """
    if not requests:
        return None
    supabase_url, supabase_key = _get_supabase_config()
    if not supabase_url or not supabase_key:
        return None
    try:
        from urllib.parse import quote_plus
        # If query looks like an email, use exact match on applicant_email
        import re
        email_m = re.search(r"[\w\.\-+]+@[\w\.-]+", query or "")
        headers = {"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Accept": "application/json"}
        base = supabase_url.rstrip('/') + '/rest/v1/applicants'
        if email_m:
            email = quote_plus(email_m.group(0))
            url = f"{base}?select=*&applicant_email=eq.{email}&limit={limit}"
        else:
            # search name or email with ilike
            ilike = quote_plus(f"%{query}%")
            # Use PostgREST or param-based filter
            url = f"{base}?select=*&or=applicant_name.ilike.{ilike},applicant_email.ilike.{ilike}&limit={limit}"

        r = requests.get(url, headers=headers, timeout=6)
        if r.status_code == 200:
            try:
                rows = r.json()
                return rows or []
            except Exception:
                return []
        else:
            return []
    except Exception:
        return None


def find_applicant_query(message: str):
    """Return a candidate query string when the user's message appears to ask
    for an applicant lookup. Returns None when no lookup intent detected.
    Detection rules:
      - email address in text
      - message starts with 'applicant:'
      - phrases like 'find', 'search for', 'look up', 'who is' followed by a name
    """
    if not message or not isinstance(message, str):
        return None
    import re
    s = message.strip()
    # email
    m = re.search(r"[\w\.\-+]+@[\w\.-]+", s)
    if m:
        return m.group(0)
    # applicant: prefix
    if s.lower().startswith("applicant:"):
        return s.split(":", 1)[1].strip()
    # common lookup phrasings
    m2 = re.search(r"(?:find|search for|look up|who is|who's)\s+(?:the\s+)?(?:applicant\s+)?['\"]?([A-Za-z0-9\-\._ ]{2,80})['\"]?", s, flags=re.I)
    if m2:
        return m2.group(1).strip()
    return None
# NOTE: avoid using naive UTC timestamps (datetime.utcnow()). Use timezone-aware datetimes.

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from GenerativeAI.app import AI_Interface
from encryptData import encrypt

# local helpers
import ai_crypto
from ai_cache import SimpleTTLCache

from base64 import b64decode
from werkzeug.utils import secure_filename

try:
    from pydub import AudioSegment
except Exception:
    AudioSegment = None

# Prefer loading the workspace root .env (avoid loading AI/.env which may contain
# multiline PEM values that python-dotenv can't parse). If that file is missing,
# fall back to the default behavior.
root_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
ai_env = os.path.join(os.path.dirname(__file__), '.env')
# Load root .env first (if present), then load AI/.env to allow project-local overrides.
if os.path.exists(root_env):
    print(f"[env] loading root .env from {root_env}")
    load_dotenv(root_env)
else:
    print("[env] root .env not found; falling back to default dotenv behavior")
    load_dotenv()
# Now load AI/.env (if present) to override root values for the AI service specifically
if os.path.exists(ai_env):
    print(f"[env] loading AI .env from {ai_env}")
    load_dotenv(ai_env, override=True)

# Flask app
app = Flask(__name__)
# If .env fails to parse or SECRET_KEY isn't set, fall back to a dev secret so the server
# doesn't crash during local development. Do NOT use this in production.
secret = os.getenv("SECRET_KEY")
if not secret:
    print("[warning] SECRET_KEY not found in environment; using fallback dev secret. Fix your .env for production.")
    secret = "dev_fallback_secret_change_me"
app.config["SECRET_KEY"] = secret
# For now force plaintext mode to disable encryption/decryption while you're
# working on the project. We'll accept plaintext client_request and return
# plaintext responses. Set this back to environment-driven when you re-enable
# crypto later.
PLAINTEXT_MODE = True
print("[env] PLAINTEXT_MODE is FORCED ON — server will accept plaintext client_request and return plaintext responses")
# Configure CORS and explicitly allow Authorization header so browser workers can upload
# audio chunks with a Bearer token via fetch (preflight will include Authorization).
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"], supports_credentials=True)

# Choose an async_mode that is available in the environment. Prefer eventlet if installed,
# otherwise fall back to the threading mode which works in most setups.
async_mode = None
try:
    import eventlet
    async_mode = "eventlet"
except Exception:
    async_mode = "threading"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)

# Configure rate limiter storage. Prefer an explicit storage backend (e.g. Redis) via
# the RATELIMIT_STORAGE_URI or REDIS_URL environment variables. If none provided,
# fall back to a memory backend but explicitly set it to avoid the runtime warning.
_ratelimit_storage = os.getenv("RATELIMIT_STORAGE_URI") or os.getenv("REDIS_URL") or "memory://"
# Limiter expects key_func as a keyword arg (or first positional). Pass app explicitly by name
# to avoid accidentally binding the app to key_func (which causes TypeError during tests).
limiter = Limiter(key_func=get_remote_address, app=app, default_limits=["10 per minute"], storage_uri=_ratelimit_storage)

with open("private.pem", "rb") as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

connected_users = {}
# temporarily hold generated session keys until client acknowledges receipt
pending_session_keys = {}

# concurrency and caching for AI routing
_ai_semaphore = asyncio.Semaphore(8)  # limit concurrent AI tasks
_ai_cache = SimpleTTLCache(ttl_seconds=120, maxsize=500)

# --- SQLite session store ---
DB_PATH = os.path.join(os.path.dirname(__file__), "ai_sessions.db")
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            sid TEXT PRIMARY KEY,
            user TEXT,
            client_public_key TEXT,
            session_key TEXT,
            created_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


# --- input validation helpers ---
def is_valid_sid(sid: str) -> bool:
    if not isinstance(sid, str):
        return False
    if len(sid) > 128 or len(sid) == 0:
        return False
    # allow alphanumeric, dash, underscore
    import re
    return bool(re.match(r'^[A-Za-z0-9_-]+$', sid))


def is_valid_user(user: str) -> bool:
    if not isinstance(user, str):
        return False
    if len(user) == 0 or len(user) > 64:
        return False
    # basic check: printable characters only
    return all(32 <= ord(c) < 127 for c in user)


def is_valid_pem(pem: str) -> bool:
    if not isinstance(pem, str):
        return False
    if '-----BEGIN PUBLIC KEY-----' in pem and '-----END PUBLIC KEY-----' in pem:
        return True
    return False

init_db()

# --- simple file logger ---
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "server_events.txt")
def log_event(msg: str):
    ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
    line = f"[{ts}] {msg}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)

def db_add_session(sid, user, client_public_key, session_key):
    # validate inputs
    if not is_valid_sid(sid) or not is_valid_user(user):
        raise ValueError("Invalid session inputs")
    if client_public_key and not is_valid_pem(client_public_key):
        raise ValueError("Invalid client public key format")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "REPLACE INTO sessions (sid, user, client_public_key, session_key, created_at) VALUES (?, ?, ?, ?, ?)",
        (sid, user, client_public_key, session_key, datetime.datetime.now(datetime.timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()

def db_remove_session(sid):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM sessions WHERE sid=?", (sid,))
    conn.commit()
    conn.close()

def db_get_session(sid):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT sid, user, client_public_key, session_key, created_at FROM sessions WHERE sid=?", (sid,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "sid": row[0],
        "user": row[1],
        "client_public_key": row[2],
        "session_key": row[3],
        "created_at": row[4],
    }

def generate_token(username):
    payload = {
        "user": username,
        # Use a timezone-aware UTC expiry
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    try:
        if not token:
            return None
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded.get("user")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except TypeError as e:
        # catch cases where SECRET_KEY wasn't a string or token is malformed
        print(f"[verify_token] TypeError decoding token: {e}")
        return None
    except Exception as e:
        print(f"[verify_token] unexpected error: {e}")
        return None

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@app.route("/token", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    username = request.json.get("username")
    if not username:
        return jsonify({"error": "Missing username"}), 400
    token = generate_token(username)
    return jsonify({"token": token})

async def routing(instruction, message):
    # cache key
    key = f"{instruction}:{message}"
    cached = _ai_cache.get(key)
    if cached is not None:
        return cached

    

    async with _ai_semaphore:
        try:
            # Check whether this message asks for an applicant lookup
            db_rows = None
            query_term = find_applicant_query(message)
            if query_term:
                try:
                    rows = search_applicants(query_term, limit=6)
                    if rows:
                        # attach DB rows and also prepend them into the prompt so the AI can reference them
                        db_rows = rows
                        try:
                            message = f"[DB_RESULTS:{json.dumps(rows)}]\n" + (message or "")
                        except Exception:
                            # fall back to stringified rows
                            message = f"[DB_RESULTS:{str(rows)}]\n" + (message or "")

                except Exception:
                    pass

            if instruction == "AI":
                result = await AI_Interface(message, "chat")
                if PLAINTEXT_MODE:
                    payload = {"message": result}
                else:
                    payload = {"encrypted": encrypt({"message": result})}
            elif instruction == "grade":
                result = await AI_Interface(message, "grader")
                if PLAINTEXT_MODE:
                    payload = {"result": result}
                else:
                    payload = {"encrypted": encrypt({"result": result})}
            else:
                if PLAINTEXT_MODE:
                    payload = {"error": "Unknown instruction"}
                else:
                    payload = {"encrypted": encrypt({"error": "Unknown instruction"})}

            # If DB rows were found, include them explicitly in the payload so the client can show them
            if db_rows is not None:
                try:
                    payload["db_results"] = db_rows
                except Exception:
                    pass

            # store in cache
            try:
                _ai_cache.set(key, payload)
            except Exception:
                pass

            return payload
        except Exception as e:
            print(f"[routing] error processing instruction={instruction}: {e}")
            traceback.print_exc()
            if PLAINTEXT_MODE:
                return {"error": str(e)}
            return {"encrypted": encrypt({"error": str(e)})}

@socketio.on("connect")
def on_connect():
    print("Client connected:", request.sid)

@socketio.on("disconnect")
def on_disconnect():
    print("🔌 Client disconnected:", request.sid)
    # remove from in-memory map
    connected_users.pop(request.sid, None)
    # remove from sqlite
    try:
        db_remove_session(request.sid)
        log_event(f"DISCONNECT sid={request.sid} removed from DB")
    except Exception as e:
        print(f"[on_disconnect] failed to remove session from DB for sid={request.sid}: {e}")
        log_event(f"DISCONNECT sid={request.sid} DB removal failed: {e}")


@app.route("/upload_audio_chunk", methods=["POST"])
def upload_audio_chunk():
    try:
        # Parse token from Authorization header (Bearer) or fallback to form/json/args
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()

        # allow token via form field, query param, or JSON body for non-multipart clients
        if not token:
            token = request.form.get("token") or request.args.get("token")
            if not token:
                try:
                    body = request.get_json(silent=True) or {}
                    token = body.get("token")
                except Exception:
                    token = None

        user = verify_token(token)
        if not user:
            return jsonify({"error": "unauthorized"}), 401
        username = user

        # Determine upload destination
        dest_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", username, "audio"))
        os.makedirs(dest_dir, exist_ok=True)

        # 1) Multipart form upload (file input named 'audio')
        if "audio" in request.files:
            f = request.files["audio"]
            filename = secure_filename(f.filename) if f.filename else None
            ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
            ext = os.path.splitext(filename or "")[1] or ".webm"
            out_name = f"chunk_{ts}{ext}"
            out_path = os.path.join(dest_dir, out_name)
            f.save(out_path)
            log_event(f"AUDIO chunk (form) saved for user={username} path={out_path}")
            return jsonify({"status": "ok", "path": out_path}), 200

        # 2) JSON body with base64 field 'b64' or form field 'b64' (compatible with fetch sending JSON)
        b64 = None
        filename = None
        # prefer JSON body
        try:
            body = request.get_json(silent=True)
            if isinstance(body, dict):
                b64 = body.get("b64") or body.get("data")
                filename = body.get("filename")
        except Exception:
            body = None

        # fallback to form fields
        if not b64:
            b64 = request.form.get("b64") or request.form.get("data")
            filename = filename or request.form.get("filename")

        if b64:
            try:
                data = base64.b64decode(b64)
            except Exception as e:
                return jsonify({"error": "invalid base64"}), 400

            if not filename:
                filename = f"chunk_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}.webm"
            out_path = os.path.join(dest_dir, secure_filename(filename))
            with open(out_path, "wb") as fh:
                fh.write(data)
            log_event(f"AUDIO chunk (json b64) saved for user={username} path={out_path}")
            return jsonify({"status": "ok", "path": out_path}), 200

        return jsonify({"error": "no audio provided (expected multipart file 'audio' or JSON 'b64')"}), 400
    except Exception as e:
        print(f"[upload_audio_chunk] error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@socketio.on("upload_chunk")
def socket_upload_chunk(payload):
    """
    Optional socket-based audio chunk upload support. Accepts a payload like:
    { token: <jwt>, username: <user>, filename: <name>, b64: <base64 audio data> }
    This handler is tolerant and will return a JSON-like dict via emit to the sender.
    """
    try:
        if not isinstance(payload, dict):
            emit("upload_chunk_result", {"ok": False, "error": "expected object payload"})
            return
        token = payload.get("token")
        user = verify_token(token)
        if not user:
            emit("upload_chunk_result", {"ok": False, "error": "unauthorized"})
            return
        username = payload.get("username") or user
        b64 = payload.get("b64")
        filename = payload.get("filename") or f"chunk_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')}.webm"
        if not b64:
            emit("upload_chunk_result", {"ok": False, "error": "missing b64 audio data"})
            return
        try:
            data = base64.b64decode(b64)
        except Exception as e:
            emit("upload_chunk_result", {"ok": False, "error": "invalid base64"})
            return

        dest_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", username, "audio")
        os.makedirs(dest_dir, exist_ok=True)
        out_path = os.path.join(dest_dir, secure_filename(filename))
        with open(out_path, "wb") as fh:
            fh.write(data)
        log_event(f"AUDIO (socket) chunk saved for user={username} path={out_path}")
        emit("upload_chunk_result", {"ok": True, "path": out_path})
    except Exception as e:
        print(f"[socket_upload_chunk] error: {e}")
        traceback.print_exc()
        emit("upload_chunk_result", {"ok": False, "error": str(e)})


@app.route("/merge_audio", methods=["POST"])
def merge_audio():
    try:
        data = request.get_json(force=True, silent=True) or {}
        username = data.get('username') or request.args.get('username')
        if not username:
            return jsonify({"error": "missing username"}), 400
        base_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", username, "audio")
        if not os.path.isdir(base_dir):
            return jsonify({"error": "no audio chunks found"}), 404
        files = sorted([os.path.join(base_dir, p) for p in os.listdir(base_dir) if os.path.isfile(os.path.join(base_dir,p))])
        if len(files) == 0:
            return jsonify({"error": "no audio chunks found"}), 404

        if AudioSegment is None:
            return jsonify({"error": "server missing pydub/ffmpeg for merging"}), 500

        # Concatenate all chunks
        merged = None
        for fp in files:
            try:
                seg = AudioSegment.from_file(fp)
            except Exception as e:
                print(f"[merge_audio] failed to read {fp}: {e}")
                continue
            if merged is None:
                merged = seg
            else:
                merged += seg

        if merged is None:
            return jsonify({"error": "failed to read any chunks"}), 500

        out_name = f"merged_{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.wav"
        out_path = os.path.join(base_dir, out_name)
        merged.export(out_path, format="wav")
        log_event(f"AUDIO merged for user={username} out={out_path}")

        # Optionally, remove chunk files after merging
        try:
            for fp in files:
                os.remove(fp)
        except Exception:
            pass

        return jsonify({"status": "ok", "merged_path": out_path}), 200
    except Exception as e:
        print(f"[merge_audio] error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@socketio.on("authenticate")
def handle_auth(data):
    try:
        token = data.get("token") if isinstance(data, dict) else None
        client_public_key = data.get("client_public_key") if isinstance(data, dict) else None
        user = verify_token(token)
        if user:
            # Only generate and persist a symmetric session_key if the client provided a valid
            # client_public_key and the server was able to encrypt the session key for the client.
            enc_session_key_b64 = None
            session_key_b64 = None
            if client_public_key and is_valid_pem(client_public_key):
                try:
                    # generate a per-session random session_key (32 bytes) for symmetric AES-GCM
                    raw_session_key = secrets.token_bytes(32)
                    session_key_b64 = base64.b64encode(raw_session_key).decode()
                    client_pub = serialization.load_pem_public_key(client_public_key.encode())
                    # encrypt the base64 session key as bytes using RSA-OAEP so browser WebCrypto can decrypt
                    encrypted_bytes = client_pub.encrypt(
                        session_key_b64.encode(),
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None,
                        ),
                    )
                    enc_session_key_b64 = base64.b64encode(encrypted_bytes).decode()
                except Exception as e:
                    # If encryption failed, do not persist a symmetric session key — fall back to RSA-only mode
                    print(f"[auth] failed to RSA-OAEP-encrypt session key for sid={request.sid}: {e}")
            # store session info in memory. If we generated a session_key and encrypted it
            # for the client, keep the symmetric key in pending_session_keys until the
            # client acknowledges receipt. This avoids the server assuming the client
            # has the AES key when it hasn't imported it yet.
            connected_users[request.sid] = {
                "user": user,
                "client_public_key": client_public_key,
                # don't set session_key here if we generated one; wait for client ack
                "session_key": None,
            }

            if session_key_b64:
                # store in pending until client confirms
                pending_session_keys[request.sid] = session_key_b64

            # persist session to sqlite now with session_key NULL; we'll update on ack
            try:
                db_add_session(request.sid, user, client_public_key, None)
            except Exception as e:
                print(f"[auth] warning: failed to persist session to DB: {e}")

            log_event(f"AUTH success sid={request.sid} user={user} client_public_key_present={bool(client_public_key)} session_key_pending={bool(session_key_b64)}")

            # respond with success and send encrypted_session_key if available
            payload = {"message": f"Welcome, {user}!"}
            if enc_session_key_b64:
                payload["encrypted_session_key"] = enc_session_key_b64
            emit("auth_success", payload)
        else:
            print(f"[auth] authentication failed for sid={request.sid} token_present={bool(token)}")
            log_event(f"AUTH failed sid={request.sid} token_present={bool(token)}")
            # Notify client that authentication failed and allow client to re-authenticate.
            emit("auth_failed", {"error": "Invalid or expired token"})
    except Exception as e:
        print(f"[handle_auth] Exception processing authentication for sid={request.sid}: {e}")
        traceback.print_exc()
        log_event(f"AUTH error sid={request.sid} err={e}")
        emit("auth_failed", {"error": "Authentication error"})
        try:
            disconnect(request.sid)
        except Exception:
            pass

@socketio.on("client_request")
@limiter.limit("150 per minute")
def handle_send(data):
    try:
        if request.sid not in connected_users:
            emit("result", {"error": "Unauthorized"})
            return
        # If server is in plaintext mode, accept raw payload directly from client
        if PLAINTEXT_MODE:
            # payload expected to be an object like { instruction: 'AI', message: '...' }
            if isinstance(data, dict):
                payload = data
            else:
                try:
                    payload = json.loads(data)
                except Exception:
                    emit("result", {"error": "Invalid payload format (expected JSON)"})
                    return
        else:
            # If a per-session symmetric key exists (in DB) or is pending (just generated
            # and awaiting ack), prefer AES-GCM decryption when the payload provides
            # both 'encrypted' and 'iv'. Otherwise fall back to RSA decryption.
            session = db_get_session(request.sid)
            session_key_db = session.get("session_key") if session else None
            pending_sk = pending_session_keys.get(request.sid)
            effective_sk = session_key_db or pending_sk

            enc_b64 = data.get("encrypted")
            iv_b64 = data.get("iv")

            # If we have a session key (either persisted or pending) and the client provided iv, try AES decrypt
            if effective_sk and enc_b64 and iv_b64:
                try:
                    plain_bytes = ai_crypto.aes_decrypt_b64(effective_sk, iv_b64, enc_b64)
                    decrypted_text = plain_bytes.decode("utf-8")
                    payload = json.loads(decrypted_text)
                except Exception as e:
                    print(f"[recv] AES decrypt failed for sid={request.sid} (maybe wrong key/order): {e}")
                    traceback.print_exc()
                    # If AES failed but an RSA-style payload exists, try RSA as a fallback
                    try:
                        if enc_b64 and not iv_b64:
                            decrypted_text = ai_crypto.rsa_decrypt_with_private(private_key, enc_b64)
                            payload = json.loads(decrypted_text)
                        else:
                            emit("result", {"error": "Decryption failed"})
                            return
                    except Exception as e2:
                        print(f"[recv] fallback RSA decrypt also failed for sid={request.sid}: {e2}")
                        traceback.print_exc()
                        emit("result", {"error": "Decryption/parse failed"})
                        return

            else:
                # fallback to RSA path if no session key or client didn't send iv
                if not enc_b64:
                    emit("result", {"error": "No encrypted field present"})
                    return
                try:
                    decrypted_text = ai_crypto.rsa_decrypt_with_private(private_key, enc_b64)
                    print(f"[recv] sid={request.sid} decrypted_text_preview={decrypted_text[:200]}")
                    payload = json.loads(decrypted_text)
                except Exception as e:
                    print(f"[recv] RSA decrypt/parse failed for sid={request.sid}: {e}")
                    traceback.print_exc()
                    emit("result", {"error": "Decryption/parse failed"})
                    return
        instruction = payload.get("instruction")
        message = payload.get("message")

        socketio.start_background_task(process_task, request.sid, instruction, message)

    except Exception as e:
        print("[handle_send] Exception:")
        traceback.print_exc()
        emit("result", {"error": str(e)})


@socketio.on("session_key_ack")
def handle_session_key_ack():
    try:
        # client signals it successfully received and imported the AES session key
        sk = pending_session_keys.pop(request.sid, None)
        if not sk:
            emit("session_key_confirmed", {"status": "no_pending_key"})
            return
        # attach to in-memory session and persist to DB
        if request.sid in connected_users:
            connected_users[request.sid]["session_key"] = sk
        try:
            # retrieve user and client_public_key for persistence
            session = db_get_session(request.sid)
            user = connected_users.get(request.sid, {}).get("user")
            client_pub = connected_users.get(request.sid, {}).get("client_public_key")
            db_add_session(request.sid, user, client_pub, sk)
        except Exception as e:
            print(f"[session_key_ack] failed to persist session key for sid={request.sid}: {e}")
        emit("session_key_confirmed", {"status": "ok"})
    except Exception as e:
        print(f"[session_key_ack] Exception for sid={request.sid}: {e}")
        traceback.print_exc()

def process_task(sid, instruction, message):
    try:
        result = asyncio.run(routing(instruction, message))
        user_info = connected_users.get(sid)
        print(f"[process_task] sid={sid} instruction={instruction} message_preview={str(message)[:140]}")
        print(f"[process_task] routing result preview={str(result)[:200]}")
        # If server is configured for plaintext mode, emit result directly
        if PLAINTEXT_MODE:
            print(f"[process_task] PLAINTEXT_MODE ON — emitting plaintext result to sid={sid}")
            socketio.emit("result", result, to=sid)
            return

        # Try symmetric AES-GCM encryption using per-session session_key if available
        session = db_get_session(sid)
        if session and session.get("session_key"):
            try:
                plaintext = json.dumps(result).encode()
                ct_b64, iv_b64 = ai_crypto.aes_encrypt_b64(session.get("session_key"), plaintext)
                print(f"[process_task] emitting AES-encrypted response to sid={sid} (ct_len={len(ct_b64)})")
                socketio.emit("result", {"encrypted": ct_b64, "iv": iv_b64}, to=sid)
                return
            except Exception as e:
                print(f"[process_task] AES encryption failed for sid={sid}:")
                traceback.print_exc()
                # fall through to try RSA encryption

        # Fallback: encrypt using client's RSA public key if present
        if user_info and user_info.get("client_public_key"):
            client_pub_pem = user_info["client_public_key"]
            try:
                print(f"[process_task] found client_public_key for sid={sid}, preparing to encrypt response via RSA-OAEP")
                client_pub = serialization.load_pem_public_key(client_pub_pem.encode())
                plaintext = json.dumps(result).encode()
                encrypted_bytes = client_pub.encrypt(
                    plaintext,
                    padding.OAEP(
                        mgf=padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None,
                    ),
                )
                encrypted_b64 = base64.b64encode(encrypted_bytes).decode()
                print(f"[process_task] emitting RSA-OAEP encrypted response to sid={sid} (len={len(encrypted_b64)})")
                socketio.emit("result", {"encrypted": encrypted_b64}, to=sid)
            except Exception as e:
                print(f"[process_task] RSA-OAEP encryption failed for sid={sid}:")
                traceback.print_exc()
                # fallback to plaintext for debugging
                socketio.emit("result", {"plaintext": result, "error": str(e)}, to=sid)
        else:
            print(f"[process_task] no client_public_key for sid={sid}, sending plaintext")
            socketio.emit("result", {"plaintext": result}, to=sid)
    except Exception as e:
        print("[process_task] Exception:")
        traceback.print_exc()
        socketio.emit("result", {"error": str(e)}, to=sid)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
