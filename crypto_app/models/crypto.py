from pydantic import BaseModel

class CryptoRequest(BaseModel):
    message: str

class CryptoResponse(BaseModel):
    ciphertext: str
