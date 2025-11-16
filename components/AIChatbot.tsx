"use client";

import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

type EonState = "neutral" | "thinking" | "answering";

function now() {
  return new Date().toLocaleTimeString();
}

export default function AIOverlay() {
  const [message, setMessage] = useState("");
  const [userBubble, setUserBubble] = useState<string | null>(null);
  const [eonDisplayedText, setEonDisplayedText] = useState<string>("");
  const [eonState, setEonState] = useState<EonState>("neutral");
  const [historyUsed, setHistoryUsed] = useState<boolean | null>(null);
  const [historyLen, setHistoryLen] = useState<number>(0);

  const authTokenRef = useRef<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  );
  const isAuthenticatedRef = useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const encryptorRef = useRef<any>(null);
  const decryptorRef = useRef<any>(null);
  const sessionKeyCryptoRef = useRef<CryptoKey | null>(null);
  const sessionKeyRawRef = useRef<ArrayBuffer | null>(null);
  const encryptorReadyRef = useRef<boolean>(false);

  const messageQueue = useRef<any[]>([]);

  const typingIntervalRef = useRef<number | null>(null);
  const typingCancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // clientPublicPemRef will hold the generated client public key in PEM form
  const clientPublicPemRef = useRef<string | null>(null);

  // Server's public key (used to encrypt messages sent to the server).
  // This is public information and safe to include in the client bundle.
  const serverPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1yw284NS7NawWrgGlYHN
9qvmso5dKZFr4AifmRMBSrmG+65rqs9OTpmXEyqqUmrBbgW61n11mQM1dkMJjH//
jxm1AWv0/X7yKAsYSpAfonM49+ve1AWdJDvrLVrUrRDNI0vmUtUyqjde5fbZdAgV
sNxj1Q8TfsrJzpJniW9UUmbRd9iZ8PM4vGwVQAmFxbyFkKb0S7zJ+U1kutPgjCe+
gfiG1QATa37IYXO2hoz/EUGbqX2Vfd7CfpW53OXL/fXyHPPVarLMELnk6kE1auMT
KZwnnj95F4xfZpgf7/kJ7bwQD7MHLvdLlwWlXBW5qJdjVnZJ6EMIaHHhJjJnqrRV
qwIDAQAB
-----END PUBLIC KEY-----`;

  // Development flag: when true, client communicates in plaintext (no RSA encryption).
  // We force plaintext mode while you work on the project; toggle this back when
  // you want to re-enable encryption.
  const PLAINTEXT_MODE = true;

  // Determine API base URL. Allows overriding via localStorage (useful in dev).
  const getApiBase = () => {
    if (typeof window === "undefined") return "http://localhost:5000";
    const stored = localStorage.getItem("apiBase");
    const envBase = (window as any).__NEXT_PUBLIC_API_BASE || null;
    const loc = window.location;
    let base = stored || envBase || loc.origin || "http://localhost:5000";
    // If running the frontend on the Next dev server (localhost:3000) and the user
    // hasn't explicitly set an apiBase, assume backend runs on localhost:5000.
    if (!stored && (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") && loc.port === "3000") {
      base = envBase || "http://localhost:5000";
    }
    // Ensure it has a scheme
    if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
    // Strip trailing slash
    return base.replace(/\/$/, "");
  };

  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDXLDbzg1Ls1rBa
uAaVgc32q+ayjl0pkWvgCJ+ZEwFKuYb7rmuqz05OmZcTKqpSasFuBbrWfXWZAzV2
QwmMf/+PGbUBa/T9fvIoCxhKkB+iczj3697UBZ0kO+stWtStEM0jS+ZS1TKqN17l
9tl0CBWw3GPVDxN+ysnOkmeJb1RSZtF32Jnw8zi8bBVACYXFvIWQpvRLvMn5TWS6
0+CMJ76B+IbVABNrfshhc7aGjP8RQZupfZV93sJ+lbnc5cv99fIc89VqsswQueTq
QTVq4xMpnCeeP3kXjF9mmB/v+QntvBAPswcu90uXBaVcFbmol2NWdknoQwhoceEm
MmeqtFWrAgMBAAECggEAHyPGdhpoy17MmextA4EMGilJk0i4IdZqWrtUwZX3B2Xv
K4hUC53B0u02aG8xxAiwIqiQoA77EGBfAdT00lEJ3p9VSzXg+DjBedsVMmFGOr/b
HEIV9vAzDDXhtKgjBELctUF8PTuef/TQdo5xbPHolbZnekOayiw15X/ZnRGwDdaQ
XxWIcJTksgxGNl1Ar07aAIyq/oI0rP5HfHQlLVEnQpPD22f3JixkIcWWm/LLW3Ol
dCjXNcT8AK9+DhMtluWA1CVrNzMq0+2nCoMG2Y6jNMTDXYUMPNRFCI7emV9sQYDj
7spyFCjGIMjyPke4/rUUh+x3ueeEtfyTf6Bfwq1HuQKBgQD6/QZl+nqT8DP5v4SS
em6qa1FMgq4/MEPJGxp9PL3fJJpRq7S6dnAleDQmtUHyOau2NqDqdCN3BkPjnABO
bQN+jws8uSvlbf/oKIgKBjpapmxZMa6FaR/jFAd3VO9qO0e1ZWf4mLzjzqv8ia83
AuWUOJ2FAP81qj0jvq+dhaDJeQKBgQDbeBxtv4/O8kcidkpgsE4TvGoWM9RUhva6
XGCHWEIBDqkOfdKdChGjPn6k18YRmXb3eH7IMwJ9pHbZYffXGD0vPCwC39xhyAd3
jLlO5evXXbyrvvksGMGX3zTX1YON1Kz4aV5fc0PG8+YbxazGaTtWW1+rDI96Hdei
Jqrf+sCzQwKBgQCdO6WmfSQNSY1GCBSlLs3lNRXZOISwUSwl8DTIACVyhRunzkmK
Bmh7ELKbDTIi7L4FiHOGbPtKtUISdMg8WU63GiWQBPDa6e5HIh0XKo+j+l4mAlmy
egjf2MxUlYDmq/xgRwa7VfP/Qpm7uwVpEQeBs3X6vIUkuWFT40FhDTWNAQKBgQCh
CG2bnX5Qc3b8c105usNfOdWBewAmEW2B6nwtcvXjPrWO24WpEpVEeXuFSombqkYf
aLtl+/+s3vsRoA+xNKjYOsd0SHu1B4drEcd6e7vjp3Tjc9nyoCuUWwO0BodjjxRn
pTDIypOFrLo/0HhokRgn0h3NLQctrC3nXYXtmFjCbwKBgGrFXKQQmcd1+Ujnp5by
PTdMQ6uxoBTvU0q/y+JTqFV2GMtnzdKpmmlQrfcdwrTMqh/aFv7xHQ4qbqFwW2lk
ukjnv5ZBDIxD86vo4zLDR2KScUtl+RRHQWzsm+9qVVH4ERbhN9NoQ1ltGMFEYb5n
r7PBasRWL4oAa5LCFQUknsXw
-----END PRIVATE KEY-----`;

  // ---------- helpers ----------
  const cancelTyping = () => {
    typingCancelRef.current.cancelled = true;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
    typingCancelRef.current.cancelled = false;
    setEonDisplayedText("");
  };

  const startTypingAnimation = (text: string) => {
    cancelTyping();
    setEonState("answering");
    let idx = 0;
    typingIntervalRef.current = window.setInterval(() => {
      if (typingCancelRef.current.cancelled) {
        clearInterval(typingIntervalRef.current!);
        return;
      }
      idx++;
      setEonDisplayedText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(typingIntervalRef.current!);
        setEonState("neutral");
      }
    }, 25);
  };

  // Robust extractor: handles objects, strings that contain JSON, etc.
  const extractTextFromPayload = (payload: any): string => {
    try {
      if (payload == null) return "";

      // If it's a string, check if it's JSON-like (e.g. '{"message":"..."}')
      if (typeof payload === "string") {
        const trimmed = payload.trim();
        if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && (trimmed.includes('"') || trimmed.includes(":"))) {
          try {
            const parsed = JSON.parse(trimmed);
            return extractTextFromPayload(parsed);
          } catch {
            // not parseable — just return the raw string
            return trimmed;
          }
        }
        return trimmed;
      }

      // If it's an object, try common fields first
      if (typeof payload === "object") {
        if ("message" in payload && typeof payload.message === "string") return payload.message;
        if ("result" in payload && typeof payload.result === "string") return payload.result;
        // If there's a nested encrypted field that already got decrypted into object
        if ("encrypted" in payload && typeof payload.encrypted === "string") {
          return extractTextFromPayload(payload.encrypted);
        }
        // Otherwise try to find the first string value in the object
        const vals = Object.values(payload);
        for (const v of vals) {
          if (typeof v === "string") return v;
        }
        // fallback: stringify
        return JSON.stringify(payload);
      }

      return String(payload);
    } catch (err) {
      return String(payload);
    }
  };

  const handleServerResult = async (data: any) => {
    cancelTyping();
    let text = "";

    // If client is in plaintext mode, server will return plaintext objects
    if (PLAINTEXT_MODE) {
      text = extractTextFromPayload(data);
      // capture history flags if present
      try {
        if (data && typeof data === 'object') {
          if (typeof data.history_used !== 'undefined') setHistoryUsed(Boolean(data.history_used));
          if (typeof data.history_len !== 'undefined') setHistoryLen(Number(data.history_len) || 0);
        }
      } catch (e) {
        console.error('failed to read history flags from payload', e);
      }
    } else {
      // Prefer AES-GCM symmetric decryption if we have a session key
      if (sessionKeyCryptoRef.current && data?.encrypted && data?.iv) {
        try {
          const ctBuf = base64ToArrayBuffer(data.encrypted);
          const ivBuf = base64ToArrayBuffer(data.iv);
          const decryptedBuf = window.crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuf }, sessionKeyCryptoRef.current, ctBuf);
          // subtle.decrypt returns a Promise
          Promise.resolve(decryptedBuf)
            .then((buf) => {
              const decoder = new TextDecoder();
              const txt = decoder.decode(new Uint8Array(buf));
              const parsed = tryParseJSON(txt);
              const extracted = extractTextFromPayload(parsed ?? txt);
              startTypingAnimation(extracted);
            })
            .catch((err) => {
              console.error("AES decrypt failed:", err);
              const fallback = extractTextFromPayload(data);
              startTypingAnimation(fallback);
            });
          return; // we've started the typing animation asynchronously
        } catch (err) {
          console.error("AES decrypt (sync) error:", err);
        }
      }

      // Fallback to RSA decrypt (WebCrypto-based) if available
      if (decryptorRef.current && data?.encrypted) {
        try {
          const decrypted = await decryptorRef.current.decrypt(data.encrypted);
          text = extractTextFromPayload(decrypted ?? data);
        } catch (e) {
          console.error("RSA decrypt failed:", e);
          text = extractTextFromPayload(data);
        }
      } else {
        text = extractTextFromPayload(data);
      }
    }

    startTypingAnimation(text);
  };

  // ----- crypto helpers -----
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const base64ToArrayBuffer = (b64: string) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const tryParseJSON = (s: string) => {
    try {
      return JSON.parse(s);
    } catch (_) {
      return null;
    }
  };

  const processQueue = () => {
    // In plaintext mode we don't need the encryptor to be ready
    if (!socketRef.current || !isAuthenticatedRef.current || (!PLAINTEXT_MODE && !encryptorReadyRef.current)) return;
    while (messageQueue.current.length > 0) {
      const payload = messageQueue.current.shift();
      sendEncryptedMessage(payload);
    }
  };

  const sendEncryptedMessage = (payload: any) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (PLAINTEXT_MODE) {
      // send the payload as raw JSON (server handles plaintext when PLAINTEXT_MODE is enabled)
      socket.emit("client_request", payload);
      return;
    }

    // If we have a symmetric AES-GCM key for this session, use it
    if (sessionKeyCryptoRef.current) {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(payload));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, sessionKeyCryptoRef.current, data)
        .then((ct) => {
          const ct_b64 = arrayBufferToBase64(ct);
          const iv_b64 = arrayBufferToBase64(iv.buffer);
          socket.emit("client_request", { encrypted: ct_b64, iv: iv_b64 });
        })
        .catch((err) => {
          console.error("AES encrypt failed, falling back to RSA:", err);
          // fallback to RSA encryptor
          const encryptor = encryptorRef.current;
          if (!encryptor) return;
          const json = JSON.stringify(payload);
          Promise.resolve(encryptor.encrypt(json))
            .then((encrypted: any) => {
              if (!encrypted) {
                console.log(`[${now()}] RSA encryption failed, sending raw payload`);
                socket.emit("client_request", payload);
              } else {
                socket.emit("client_request", { encrypted });
              }
            })
            .catch((e) => {
              console.error("RSA encrypt (fallback) failed:", e);
              socket.emit("client_request", payload);
            });
        });
      return;
    }

    // Otherwise fall back to RSA encryptor (server public key)
    const encryptor = encryptorRef.current;
    if (!encryptor) return;

    const json = JSON.stringify(payload);
    Promise.resolve(encryptor.encrypt(json))
      .then((encrypted: any) => {
        if (!encrypted) {
          console.log(`[${now()}] encryption failed, sending raw payload`);
          socket.emit("client_request", payload);
        } else {
          socket.emit("client_request", { encrypted });
        }
      })
      .catch((e) => {
        console.error("RSA encrypt failed:", e);
        socket.emit("client_request", payload);
      });
  };

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setUserBubble(trimmed);
    setMessage("");
    setEonState("thinking");

    // If this is a >find command, perform a safe server-side lookup first
    // so the browser doesn't need DB service-role keys. The server will
    // then be able to summarize the results when it sees the DB_RESULTS prefix.
    try {
      const m = trimmed.match(/^>find\s+(.+)/i);
      if (m) {
        const query = m[1].trim();
        // call the server lookup endpoint
        fetch(`${getApiBase()}/lookup?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.db_lookup_unavailable) {
              // If server couldn't reach DB, fall back to sending original message
              const payload = { instruction: "AI", message: trimmed };
              messageQueue.current.push(payload);
              processQueue();
              return;
            }
            const rows = data?.rows || [];
            // Attach DB_RESULTS prefix so server routing can include/summarize them
            const dbResultsStr = JSON.stringify(rows);
            const messageWithResults = `[DB_RESULTS:${dbResultsStr}]\n${trimmed}`;
            const payload = { instruction: "AI", message: messageWithResults };
            messageQueue.current.push(payload);
            processQueue();
          })
          .catch((err) => {
            console.error("lookup failed:", err);
            // fallback: send original message to AI
            const payload = { instruction: "AI", message: trimmed };
            messageQueue.current.push(payload);
            processQueue();
          });
        return;
      }
    } catch (err) {
      console.error(">find handling error:", err);
    }

    const payload = { instruction: "AI", message: trimmed };
    messageQueue.current.push(payload);

    processQueue();
  };

  const initSocket = () => {
    if (socketRef.current) return socketRef.current;

    const apiBase = getApiBase();
    // Use the HTTP(S) apiBase for Socket.IO so the client can correctly use polling
    // and upgrade to websocket as needed. This avoids malformed ws:// schemes.
    const socket = io(apiBase, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log(`[${now()}] socket connected`, socket.id);

      // authenticate if token exists (include client public key so server can encrypt replies)
      let token = authTokenRef.current;
      if (token) {
        if (PLAINTEXT_MODE) {
          socket.emit("authenticate", { token });
          console.log(`[${now()}] PLAINTEXT_MODE: authenticate emit called with token only`);
        } else {
          const pub = clientPublicPemRef.current;
          socket.emit("authenticate", { token, client_public_key: pub });
          console.log(`[${now()}] authenticate emit called (with client_public_key present=${!!pub})`);
        }
      } else {
        fetchTokenAndAuth(socket);
      }
    });

    socket.on("auth_success", async (data: any) => {
      try {
        console.log(`[${now()}] auth_success`);
        isAuthenticatedRef.current = true;

        // If server provided an RSA-encrypted session key, decrypt and import as AES-GCM key
        if (data?.encrypted_session_key && decryptorRef.current) {
          try {
            const decrypted_b64 = await decryptorRef.current.decrypt(data.encrypted_session_key);
            if (decrypted_b64) {
              const rawBuf = base64ToArrayBuffer(decrypted_b64);
              const key = await window.crypto.subtle.importKey("raw", rawBuf, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
              sessionKeyCryptoRef.current = key;
              sessionKeyRawRef.current = rawBuf;
              console.log(`[${now()}] session_key imported for AES-GCM`);
              // Notify server that we successfully imported the session key so it
              // can start using AES-GCM for this session.
              try {
                socketRef.current?.emit('session_key_ack');
                console.log(`[${now()}] session_key_ack emitted to server`);
              } catch (e) {
                console.warn('failed to emit session_key_ack', e);
              }
            }
          } catch (err) {
            console.error("failed to decrypt/import session key:", err);
          }
        }

        processQueue();
      } catch (e) {
        console.error("auth_success handler error:", e);
        processQueue();
      }
    });

    socket.on("session_key_confirmed", (data: any) => {
      console.log(`[${now()}] session_key_confirmed`, data);
    });

    socket.on("auth_failed", () => {
      console.log(`[${now()}] auth_failed`);
      isAuthenticatedRef.current = false;
      fetchTokenAndAuth(socket);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[${now()}] socket disconnected`, reason);
      isAuthenticatedRef.current = false;
      cancelTyping();
      setEonState("neutral");
    });

    socket.on("result", handleServerResult);

    socket.connect();
    socketRef.current = socket;
    return socket;
  };

  const fetchTokenAndAuth = async (socket: Socket) => {
    try {
      const res = await fetch(`${getApiBase()}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "dev_" + Math.random().toString(36).slice(2, 8) }),
      });
      const data = await res.json();
        if (data?.token) {
          authTokenRef.current = data.token;
          localStorage.setItem("authToken", data.token);
          console.log(`[${now()}] token fetched`, data.token.slice(0, 12));
          // send authenticate; in plaintext mode only the token is required
          if (PLAINTEXT_MODE) {
            socket.emit("authenticate", { token: data.token });
          } else {
            socket.emit("authenticate", { token: data.token, client_public_key: clientPublicPemRef.current });
          }
        }
    } catch (err) {
      console.log(`[${now()}] fetch token failed`, err);
    }
  };

  useEffect(() => {
    // Use Web Crypto to generate an RSA-OAEP keypair in the browser and
    // prepare small helpers to encrypt to the server and decrypt values
    // addressed to this client. This replaces the previous JSEncrypt usage
    // with a browser-native, promise-based API that works with the server's
    // RSA-OAEP implementation.
    (async () => {
      try {
        if (!PLAINTEXT_MODE) {
          // helper: convert SPKI ArrayBuffer -> PEM
          const spkiToPem = (spki: ArrayBuffer) => {
            const b64 = arrayBufferToBase64(spki);
            const chunks = b64.match(/.{1,64}/g)?.join("\n") || b64;
            return `-----BEGIN PUBLIC KEY-----\n${chunks}\n-----END PUBLIC KEY-----`;
          };

          // helper: convert PEM -> ArrayBuffer (for importing keys)
          const pemToArrayBuffer = (pem: string) => {
            const b64 = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
            const binary = atob(b64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
            return bytes.buffer;
          };

          // generate client RSA-OAEP keypair
          const keyPair = await window.crypto.subtle.generateKey(
            { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
            true,
            ["encrypt", "decrypt"]
          );

          const pubSpki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
          const clientPubPem = spkiToPem(pubSpki);
          clientPublicPemRef.current = clientPubPem;

          // import server public key (PEM) so we can encrypt small payloads to server
          const serverPubBuf = pemToArrayBuffer(serverPublicKey);
          const serverCryptoKey = await window.crypto.subtle.importKey(
            "spki",
            serverPubBuf,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["encrypt"]
          );

          // small wrappers to keep the rest of the code simple
          encryptorRef.current = {
            encrypt: async (plaintext: string) => {
              const encoded = new TextEncoder().encode(plaintext);
              const ct = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, serverCryptoKey, encoded);
              return arrayBufferToBase64(ct);
            },
          };

          decryptorRef.current = {
            // decrypt a base64 RSA-OAEP ciphertext and return a UTF-8 string
            decrypt: async (b64cipher: string) => {
              const ctBuf = base64ToArrayBuffer(b64cipher);
              const plainBuf = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, keyPair.privateKey, ctBuf);
              return new TextDecoder().decode(plainBuf);
            },
          };

          encryptorReadyRef.current = true;
          console.log(`[${now()}] webcrypto encryptor ready; generated client RSA keypair`);
          processQueue();
        }
      } catch (err) {
        console.error("WebCrypto keypair generation failed:", err);
      }

      // initialize socket after keys are prepared (initSocket guards against double-init)
      initSocket();
    })();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const eonImage =
    eonState === "neutral"
      ? "/ai_neutral.png"
      : eonState === "thinking"
      ? "/ai_thinking.png"
      : "/ai_answering.png";

  return (
    <div className="fixed right-6 bottom-6 w-80 z-50 pointer-events-auto">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-t from-white/20 to-white/0">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `url('${eonImage}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
            filter: "blur(0.5px) brightness(0.95)",
            transition: "background-image .18s linear",
          }}
        />
        <div className="relative p-0">
          <div className="h-56" />
          <div className="mt-4 px-2 space-y-3">
            {userBubble && (
              <div className="flex justify-end">
                <div className="max-w-[48%] text-right">
                  <div className="text-xs text-white mb-1">You</div>
                  <div className="inline-block bg-blue-100 text-black p-3 rounded-xl shadow-md break-words whitespace-normal min-w-[48px]">
                    {userBubble}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-end">
              <div className="max-w-[68%]">
                <div className="text-xs text-white mb-1 ml-1">Eon</div>
                  <div className="bg-white/90 text-black p-3 rounded-xl shadow-md break-words whitespace-normal">
                    {eonDisplayedText || (eonState === "thinking" ? "thinking..." : "Lucky you! you got me. What can this handsome brain do for you?")}
                </div>
                {/* history indicator */}
                <div className="text-xs text-gray-300 mt-1">
                  {historyUsed === null ? null : historyUsed ? `Using session history (${historyLen/2} messages)` : `No session history used`}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 p-4">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full px-4 py-2 border border-gray-200 bg-white/80 focus:outline-none text-black placeholder-black"
              onKeyDown={onKeyDown}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
