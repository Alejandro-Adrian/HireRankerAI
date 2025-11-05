# jwt_check.py
import jwt
from cryptography.hazmat.primitives import serialization

priv_p = "private.pem"
pub_p = "publicServer.pem"   # use the exact filename you expect

try:
    priv = open(priv_p, "rb").read().decode()
    pub = open(pub_p, "rb").read().decode()
except Exception as e:
    print("Failed reading PEM files:", e)
    raise SystemExit(1)

tok = jwt.encode({"user":"test_user","exp": 9999999999}, priv, algorithm="RS256")
print("token (prefix):", tok[:80], "...\n")

try:
    decoded = jwt.decode(tok, pub, algorithms=["RS256"])
    print("decoded ok:", decoded.get("user"))
except Exception as e:
    print("verify failed:", type(e).__name__, str(e))
