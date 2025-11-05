import base64
import secrets
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_session_key_b64():
    raw = secrets.token_bytes(32)
    return base64.b64encode(raw).decode()


def encrypt_session_key_with_client_pub(session_key_b64: str, client_pub_pem: str) -> str:
    """Encrypt base64-encoded session key (string) with client's PEM public key and return base64 ciphertext."""
    client_pub = serialization.load_pem_public_key(client_pub_pem.encode())
    encrypted = client_pub.encrypt(
        session_key_b64.encode(),
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return base64.b64encode(encrypted).decode()


def rsa_decrypt_with_private(private_key, b64cipher: str) -> str:
    ct = base64.b64decode(b64cipher)
    plain = private_key.decrypt(
        ct,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
    )
    return plain.decode('utf-8')


def aes_decrypt_b64(session_key_b64: str, iv_b64: str, ct_b64: str) -> bytes:
    key = base64.b64decode(session_key_b64)
    aes = AESGCM(key)
    iv = base64.b64decode(iv_b64)
    ct = base64.b64decode(ct_b64)
    return aes.decrypt(iv, ct, None)


def aes_encrypt_b64(session_key_b64: str, plaintext_bytes: bytes) -> (str, str):
    key = base64.b64decode(session_key_b64)
    aes = AESGCM(key)
    iv = secrets.token_bytes(12)
    ct = aes.encrypt(iv, plaintext_bytes, None)
    return base64.b64encode(ct).decode(), base64.b64encode(iv).decode()
