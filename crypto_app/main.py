from fastapi import FastAPI
from crypto_app.models.crypto import CryptoRequest, CryptoResponse
from crypto_app.services.crypto_service import CryptoService

app = FastAPI(
    title="Asymmetric Cryptography API",
    description="Educational RSA encryption/decryption API",
    version="1.0.0",
)

service = CryptoService()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/crypto/encrypt", response_model=CryptoResponse)
def encrypt(request: CryptoRequest):
    return {"ciphertext": service.encrypt(request.message)}

@app.post("/crypto/decrypt")
def decrypt(request: CryptoRequest):
    return {"plaintext": service.decrypt(request.message)}
