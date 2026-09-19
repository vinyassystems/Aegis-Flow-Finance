import json
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# In production, keys are injected via KMS/Vault into ephemeral memory
WORKER_MASTER_KEY = os.getenv("VSA_EPHEMERAL_KEY", b"32_byte_master_key_for_aes256!!")

def encrypt_payload(data: dict) -> bytes:
    aesgcm = AESGCM(WORKER_MASTER_KEY)
    nonce = os.urandom(12) # 96-bit nonce for GCM
    json_data = json.dumps(data).encode('utf-8')
    ciphertext = aesgcm.encrypt(nonce, json_data, None)
    return nonce + ciphertext # Prepend nonce for storage

def decrypt_payload(encrypted_blob: bytes) -> dict:
    nonce, ciphertext = encrypted_blob[:12], encrypted_blob[12:]
    aesgcm = AESGCM(WORKER_MASTER_KEY)
    decrypted_data = aesgcm.decrypt(nonce, ciphertext, None)
    return json.loads(decrypted_data.decode('utf-8'))
