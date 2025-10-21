import json
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding

key = b"""-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1yw284NS7NawWrgGlYHN
9qvmso5dKZFr4AifmRMBSrmG+65rqs9OTpmXEyqqUmrBbgW61n11mQM1dkMJjH//
jxm1AWv0/X7yKAsYSpAfonM49+ve1AWdJDvrLVrUrRDNI0vmUtUyqjde5fbZdAgV
sNxj1Q8TfsrJzpJniW9UUmbRd9iZ8PM4vGwVQAmFxbyFkKb0S7zJ+U1kutPgjCe+
gfiG1QATa37IYXO2hoz/EUGbqX2Vfd7CfpW53OXL/fXyHPPVarLMELnk6kE1auMT
KZwnnj95F4xfZpgf7/kJ7bwQD7MHLvdLlwWlXBW5qJdjVnZJ6EMIaHHhJjJnqrRV
qwIDAQAB
-----END PUBLIC KEY-----"""

public_key = serialization.load_pem_public_key(key)

def encrypt(data) -> str:
    try:
        if not isinstance(data, str):
            data = json.dumps(data)

        encrypted_bytes = public_key.encrypt(
            data.encode(),
            padding.PKCS1v15()
        )

        encrypted_b64 = base64.b64encode(encrypted_bytes).decode()
        return encrypted_b64

    except Exception as e:
        print(f"Error encrypting data: {e}")
        return ""
