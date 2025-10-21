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
import concurrent.futures
import threading
from dotenv import load_dotenv
import os

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

from GenerativeAI.app import AI_Interface
from encryptData import encrypt

from base64 import b64decode

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Retrieve the secret key from the environment
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
CORS(app)

# Choose an async_mode that is available in the environment. Prefer eventlet if installed,
# otherwise fall back to the threading mode which works in most setups.
async_mode = None
try:
    import eventlet  # type: ignore
    async_mode = "eventlet"
except Exception:
    async_mode = "threading"

socketio = SocketIO(app, cors_allowed_origins="*", async_mode=async_mode)

limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])

# private_key is now loaded directly from the SECRET_KEY
private_key = serialization.load_pem_private_key(
    app.config["SECRET_KEY"].encode(), password=None
)

connected_users = {}

def generate_token(username):
    payload = {
        "user": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["user"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
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
    if instruction == "AI":
        result = await AI_Interface(message, "chat")
        return {"encrypted": encrypt({"message": result})}
    elif instruction == "grade":
        result = await AI_Interface(message, "grader")
        return {"encrypted": encrypt({"result": result})}
    else:
        return {"encrypted": encrypt({"error": "Unknown instruction"})}

@socketio.on("connect")
def on_connect():
    print("Client connected:", request.sid)

@socketio.on("disconnect")
def on_disconnect():
    print("🔌 Client disconnected:", request.sid)
    connected_users.pop(request.sid, None)

@socketio.on("authenticate")
def handle_auth(data):
    token = data.get("token")
    user = verify_token(token)
    if user:
        connected_users[request.sid] = user
        emit("auth_success", {"message": f"Welcome, {user}!"})
    else:
        emit("auth_failed", {"error": "Invalid or expired token"})
        disconnect()

@socketio.on("client_request")
@limiter.limit("150 per minute")
def handle_send(data):
    try:
        if request.sid not in connected_users:
            emit("result", {"error": "Unauthorized"})
            return

        encrypted = data.get("encrypted")
        encrypted_bytes = base64.b64decode(encrypted)

        decrypted = private_key.decrypt(
            encrypted_bytes,
            padding.PKCS1v15()
        )
        decrypted_text = decrypted.decode()

        payload = json.loads(decrypted_text)
        instruction = payload.get("instruction")
        message = payload.get("message")

        socketio.start_background_task(process_task, request.sid, instruction, message)

    except Exception as e:
        emit("result", {"error": str(e)})

def process_task(sid, instruction, message):
    result = asyncio.run(routing(instruction, message))
    socketio.emit("result", result, to=sid)

# Transcription/audio streaming removed: frontend will no longer send audio chunks

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
