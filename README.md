# API Key Reverse Proxy, RSA Encryption & OpenLDAP Suite - Frontend Application

This repository contains the containerized **Nginx reverse proxy, frontend web application, and asymmetric cryptography service** for the security architecture lab. It offloads credential management server-side, provides OpenLDAP user authentication, supports RSA payload encryption/decryption, and integrates 2-minute automated secret rotation.

---

## 📁 Repository Structure

```text
api-key-frontend/
├── crypto_app/                       # 🔒 Embedded Cryptography API (Python 3.12 + FastAPI)
│   ├── main.py                       # RSA Encrypt & Decrypt Endpoints
│   ├── models/crypto.py              # Pydantic Schemas
│   └── services/crypto_service.py    # RSA Key Generation & Crypto Service
├── docker/                           # 🐳 Nginx Proxy Configurations & Entrypoint
│   ├── nginx.conf.template           # Reverse Proxy Config (/api/, /crypto/, /ldap/ routes)
│   └── docker-entrypoint.sh          # Dynamic envsubst & Uvicorn startup script
├── scripts/                          # 🔄 Secret Rotation Daemons
│   ├── rotate_secret.js              # Node.js 2-minute rotation daemon
│   └── rotate_secret.ps1             # PowerShell 2-minute rotation daemon
├── src/                              # 🌐 Web Application Frontend
│   ├── login.html                    # OpenLDAP Directory Login Page
│   ├── index.html                    # Main Security Suite Dashboard
│   ├── css/styles.css                # Stylesheet & visual layout
│   └── js/
│       ├── login.js                  # Login form handler & session redirect
│       └── app.js                    # Dashboard API & Encryption fetch logic
├── .env                              # Local environment secrets (ignored by Git)
├── .env.example                      # Example environment template
├── Dockerfile                        # 🐳 Unified Dockerfile (Python + Nginx)
├── docker-compose.yml                # Multi-container local orchestration
├── package.json                      # NPM script registry (`npm run rotate`)
└── README.md                         # Project documentation
```

---

## 🏗️ Architecture & Interaction Diagram

```text
       Browser (http://localhost:8080/login.html)
                         │
      1. POST /ldap/login (User: alice / Pass: alice123)
                         │ (Authenticated 200 OK)
                         ▼
       Browser (http://localhost:8080/index.html)
        ├── 2. GET /api/data?mode=valid  ──► Nginx Injects x-api-key: ${API_SECRET} ──► Backend API (:3000)
        ├── 3. POST /crypto/encrypt     ──► Nginx Proxy ──► Internal RSA Service (:8000)
        └── 4. POST /ldap/login         ──► Nginx Proxy ──► LDAP FastAPI Service (:8001) ──► OpenLDAP Container (:389)
```

---

## 🔒 Key Security Features

- **Server-Side Credential Offloading:** The sensitive `x-api-key` header is attached strictly by Nginx server-side (`proxy_set_header x-api-key $injected_api_key;`).
- **Header Sanitization:** Client-side JavaScript (`src/js/app.js`) sends zero credentials or secrets in browser requests.
- **OpenLDAP Directory Authentication:** Interactive 2-page login flow (`login.html` ➔ `index.html`) validating credentials against OpenLDAP directory users (`alice` / `alice123`).
- **Asymmetric RSA Encryption/Decryption:** Payload encryption before database storage (`POST /crypto/encrypt` & `POST /crypto/decrypt`).
- **Secret Isolation & 2-Minute Rotation:**
  - `API_SECRET` and `LDAP_ADMIN_PASSWORD`: Rotated automatically every 2 minutes.
  - `DATABASE_ENCRYPTION_KEY`: Static/permanent key for persistent database data decryption.

---

## 🚀 How to Run

### 1. Ensure Backend API Server is Running
```bash
cd ../api-key-backend
npm start
```
*Output:* `Server running on http://localhost:3000`

---

### 2. Build & Start Containers
From `api-key-frontend`:
```bash
docker-compose up -d --build
```

---

### 3. Open Web Application in Browser
Navigate to:
```text
http://localhost:8080/login.html
```

- **LDAP Demo Credentials:**
  - Username: `alice` | Password: `alice123`
  - Username: `bob`   | Password: `bob123`

---

## 🔄 Automatic Secret Rotation

To start the automated 2-minute secret rotation daemon:

### Node.js
```bash
npm run rotate
```

### PowerShell
```powershell
.\scripts\rotate_secret.ps1
```

### Verification Commands
Inspect secrets inside the running container:
```powershell
# Active Rotated API_SECRET
docker exec api-key-frontend sh -c '. /etc/environment && echo $API_SECRET'

# Permanent Database Encryption Key (Unchanged)
docker exec api-key-frontend sh -c 'echo $DATABASE_ENCRYPTION_KEY'
```

---

## 🧪 Key Scenarios & API Endpoints

1. **LDAP Login (`POST /ldap/login`)**:
   - Request: `POST /ldap/login` with `{"username": "alice", "password": "alice123"}`
   - Response: `200 OK` with user DN `uid=alice,ou=users,dc=example,dc=com`.

2. **RSA Encryption (`POST /crypto/encrypt`)**:
   - Request: `POST /crypto/encrypt` with `{"message": "Confidential Data"}`
   - Response: `200 OK` with base64 ciphertext.

3. **RSA Decryption (`POST /crypto/decrypt`)**:
   - Request: `POST /crypto/decrypt` with base64 ciphertext
   - Response: `200 OK` with original plaintext `"Confidential Data"`.

4. **Valid Key Mode (`GET /api/data?mode=valid`)**:
   - Nginx Behavior: Injects valid secret key `x-api-key: ${API_SECRET}` server-side.
   - Response: `200 OK`.
