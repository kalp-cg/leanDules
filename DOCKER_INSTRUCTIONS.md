# 🐳 How to Run LearnDuels using Docker

Here is your simple, step-by-step guide to running the entire application (Backend, Database, and Cache) using Docker.

## ✅ Prerequisites

1.  **Install Docker Desktop**:
    *   **Windows/Mac**: Download from [docker.com](https://www.docker.com/products/docker-desktop/) and install it.
    *   **Linux**: Install `docker` and `docker-compose`.
2.  **Start Docker**: Open Docker Desktop and wait until the engine is running (green icon).

---

## 🚀 Step 1: Run the Application

1.  Open your terminal (Command Prompt, PowerShell, or VS Code Terminal).
2.  Navigate to the project folder:
    ```bash
    cd c:\Users\kalp1\OneDrive\Desktop\learnDules
    ```
3.  Run the build and start command:
    ```bash
    docker-compose up --build
    ```
    *   *Note: This might take 2-3 minutes the first time as it downloads images.*

---

## 🎯 Step 2: Verify It's Working

Once you see logs like `Listening on port 4000`, your app is live!

1.  **Check Backend Health**:
    *   Open your browser and go to: [http://localhost:4000/health](http://localhost:4000/health)
    *   You should see: `{"success":true,"message":"LearnDuels API is healthy"}`

2.  **Check Database**:
    *   The database is running inside Docker on port `5432`.
    *   Docker automatically handles the connection between backend and database.

3.  **Check Redis**:
    *   Redis is running on port `6379`.

---

## 🛑 Step 3: Stop the Application

To stop everything cleanly:

1.  Go to the terminal where Docker is running.
2.  Press **`Ctrl + C`**.
3.  To remove the containers completely (optional):
    ```bash
    docker-compose down
    ```

---

## 🛠️ Troubleshooting

**"Port is already allocated" error?**
*   This means something is already running on port 4000, 5432, or 6379.
*   **Fix**: Stop any other running node servers, postgres, or redis instances on your machine.

**Database connection failed?**
*   Wait a few seconds. Sometimes the database takes longer to start than the backend. The backend is configured to restart automatically until it connects.
