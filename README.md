# API Key Reverse Proxy & Credential Offloading - Frontend Application

This repository contains the containerized Nginx frontend web interface for the API key verification security exercise. It proxies client requests to the Express backend service (`api-key-backend`) while offloading sensitive credential management to the server side.

---

## 📁 Repository Structure

```text
api-key-frontend/
├── docker/                     # Nginx configurations & entrypoint scripts
│   ├── nginx.conf.template     # Nginx template with mode mapping & reverse proxy rules
│   └── docker-entrypoint.sh    # Script for envsubst environment variable substitution
├── src/                        # Static web application source code
│   ├── index.html              # Main HTML webpage with mode selection UI
│   ├── css/
│   │   └── styles.css          # Stylesheets and visual layout
│   └── js/
│       └── app.js              # Client application fetch logic (zero browser secrets)
├── .dockerignore               # Docker build exclusions
├── .env                        # Local environment secrets (ignored by Git)
├── .env.example                # Example environment template
├── .gitignore                  # Git exclusions
├── Dockerfile                  # Container build instructions
├── docker-compose.yml          # Container orchestration
└── README.md                   # Project documentation
```

---

## 🏗️ Architecture & Interaction Diagram

```text
       Browser (http://localhost:8080)
                     │
        1. GET /api/data?mode=valid (Sanitized headers ONLY - No secrets sent)
                     ▼
      Nginx Reverse Proxy Container (Port 80)
        - Serves static assets from src/ (index.html, css/styles.css, js/app.js)
        - Evaluates test mode parameter ($arg_mode) using server-side Nginx map
        - Injects header server-side: x-api-key: ${API_KEY} (or invalid/empty key)
                     │
        2. Proxied Request with Injected Header
                     ▼
      Backend API (http://host.docker.internal:3000)
                     │
        3. Returns JSON Data (200 OK / 401 Unauthorized)
                     ▼
      Browser UI (Displays response data & status badge)
```

---

## 🔒 Key Security Features

- **Server-Side Credential Offloading:** The sensitive `x-api-key` header is attached strictly by Nginx server-side (`proxy_set_header x-api-key $injected_api_key;`).
- **Header Sanitization:** Client-side JavaScript (`src/js/app.js`) sends zero credentials or secrets in browser requests (attaching standard `Accept` and `Content-Type` headers only).
- **Interactive Mode Testing:** Users can test different backend authorization responses without exposing secret keys in browser Developer Tools.
- **Dynamic Configuration:** Environment variables (`API_KEY`, `BACKEND_URL`) are injected into the Nginx configuration at container startup via `envsubst`.

---

## 🚀 How to Run

### ⚠️ Prerequisite: Start the Backend Server First

For the frontend reverse proxy to function, the backend API server must be running on port `3000`.

1. Open a terminal and navigate to the backend repository:
   ```bash
   cd ../api-key-backend
   ```
2. Install dependencies and start the backend:
   ```bash
   npm install
   npm start
   ```
   *Output:* `Server running on http://localhost:3000`

---

### Running the Frontend with Docker Compose (Recommended)

1. Ensure `.env` is configured:
   ```env
   API_KEY=SECRET_EDUCATIONAL_KEY_12345
   BACKEND_URL=http://host.docker.internal:3000
   ```
2. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```
3. Open your browser to:
   ```text
   http://localhost:8080
   ```

---

### Running with Docker CLI

```bash
# 1. Build the Docker image
docker build -t api-key-frontend .

# 2. Run the container with environment variables
docker run -d -p 8080:80 --name api-key-frontend --env-file .env api-key-frontend
```

---

## 🧪 Testing Key Scenarios & API Endpoints

Select a **Key Testing Mode** in the UI, then click an action button:

1. **Valid Key Mode (`Valid Key` button)**:
   - Request: `GET /api/data?mode=valid`
   - Nginx Behavior: Injects valid secret key `x-api-key: ${API_KEY}` server-side.
   - Response: `200 OK` with `{"message": "Protected data", ...}`.

2. **Invalid Key Mode (`Invalid Key` button)**:
   - Request: `GET /api/data?mode=invalid`
   - Nginx Behavior: Injects invalid key `x-api-key: INVALID_KEY_12345` server-side.
   - Response: `401 Unauthorized` with `{"error": "Unauthorized: Invalid API key"}`.

3. **Clear Key Mode (`Clear Key (No Key)` button)**:
   - Request: `GET /api/data?mode=none`
   - Nginx Behavior: Omits `x-api-key` header server-side.
   - Response: `401 Unauthorized` with `{"error": "Unauthorized: Missing API key"}`.

4. **Public Health Check (`GET /health`)**:
   - Request: `GET /health`
   - Output: `200 OK` with `{"status": "ok"}`.

---

## 🔍 Security Takeaway & Verification

Open browser Developer Tools (**F12**) ➔ **Network** tab ➔ Click `data`:

- **Request Headers sent by Browser:** Contains only standard HTTP headers (`Accept`, `Content-Type: application/json`, `User-Agent`, etc.). Zero `x-api-key` headers are exposed or sent by the browser.
- **Backend Receipt:** Nginx evaluates the mode parameter and injects the appropriate `x-api-key` on the server side before proxying to the backend, enabling secure credential offloading without client-side key leakage.
