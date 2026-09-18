import base64
import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

KEY_DIR = Path("/app/keys")
PRIVATE_KEY_PATH = KEY_DIR / "private_key.pem"
PUBLIC_KEY_PATH = KEY_DIR / "public_key.pem"


class CryptoService:
    def __init__(self):
        KEY_DIR.mkdir(parents=True, exist_ok=True)
        self._ensure_keys()

    def _ensure_keys(self):
        if PRIVATE_KEY_PATH.exists() and PUBLIC_KEY_PATH.exists():
            return

        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )

        private_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )

        public_bytes = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

        PRIVATE_KEY_PATH.write_bytes(private_bytes)
        PUBLIC_KEY_PATH.write_bytes(public_bytes)

    def _load_private_key(self):
        return serialization.load_pem_private_key(
            PRIVATE_KEY_PATH.read_bytes(),
            password=None,
        )

    def _load_public_key(self):
        return serialization.load_pem_public_key(
            PUBLIC_KEY_PATH.read_bytes()
        )

    def encrypt(self, message: str) -> str:
        public_key = self._load_public_key()

        ciphertext = public_key.encrypt(
            message.encode("utf-8"),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )

        return base64.b64encode(ciphertext).decode("ascii")

    def decrypt(self, ciphertext_b64: str) -> str:
        private_key = self._load_private_key()

        ciphertext = base64.b64decode(ciphertext_b64)

        plaintext = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )

        return plaintext.decode("utf-8")
