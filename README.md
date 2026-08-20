# API Key Authentication Anti-Pattern - Frontend Web Application

This repository contains the frontend web interface for the API key verification security exercise. It interacts with the Express backend service (`api-key-backend`).

---

## 📁 Repository Structure

```text
api-key-frontend/
├── index.html   # Webpage structure & user controls
├── styles.css   # Clean modern visual presentation
├── app.js       # Client-side fetch() API logic & header management
└── README.md    # Frontend documentation
```

---

## 🏗️ Architecture & Interaction Diagram

```text
                   Browser User Interface
                             |
                             |
                   Frontend Repository
                             |
                    x-api-key: SECRET
                             |
                             v
                     +---------------+
                     |   Backend API  |
                     +---------------+
                       /      |      \
                      /       |       \
                 /health   GET /api   POST /api
                    |          |          |
                 Public     Protected  Protected
```

---

## 🚀 How to Run

### ⚠️ Prerequisite: Start the Backend Server First

For the frontend application to function, the backend API server must be running on `http://localhost:3000`.

1. Open a terminal and navigate to the backend repository:
   ```bash
   cd ../api-key-backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   *You should see:* `Server running on http://localhost:3000`

---

### Starting the Frontend

#### Option 1: Direct File Opening
Open `index.html` directly in any web browser by double-clicking the file or opening it via file path:
`C:\Users\Acer\.gemini\antigravity\scratch\api-key-frontend\index.html`

#### Option 2: Local HTTP Server
Using Node.js static server:
```bash
npx serve .
```

Or using Python HTTP server:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

---

## 🧪 Testing API Key Scenarios

Make sure the backend (`api-key-backend`) is running on `http://localhost:3000`.

1. **Public Health Request (`GET /health`)**:
   - Click **GET /health**.
   - Output: `200 OK` with `{"status": "ok"}`.
2. **Valid Protected GET (`GET /api/data`)**:
   - Ensure the API Key field contains `SECRET_EDUCATIONAL_KEY_12345`.
   - Click **Get Protected Data**.
   - Output: `200 OK` with `{"message": "Protected data", ...}`.
3. **Valid Protected POST (`POST /api/data`)**:
   - Click **Send POST Request**.
   - Output: `200 OK` with `{"message": "POST received"}`.
4. **Testing Unauthorized Access (401)**:
   - Click **Clear Key** (or enter a wrong key like `invalid-123`).
   - Click **Get Protected Data** or **Send POST Request**.
   - Output: `401 Unauthorized` with `{"error": "Unauthorized: Missing API key"}`.

---

## ⚠️ Security Takeaway

Inspecting network requests in browser Developer Tools (Network tab) immediately reveals the `x-api-key` header value sent by `app.js`. This demonstrates why static API keys embedded in client code are vulnerable to interception.
