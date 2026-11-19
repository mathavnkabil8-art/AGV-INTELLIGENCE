# Production Web Deployment Guide — AGV Intelligence Platform

**Project Title:** AGV Intelligence — Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses Using Discrete Mathematics  
**Repository Architecture:** Decoupled Monorepo (FastAPI Python Backend + React Vite SPA Frontend)

---

## 1. Architectural Overview & Hosting Evaluation

The AGV Intelligence platform consists of two decoupled tiers:

1. **Backend (Python 3.13 / FastAPI):**
   - High-performance asynchronous REST API running on `uvicorn`.
   - Executes exact symbolic mathematics (SymPy), graph theory algorithms (NetworkX), matrix calculations (NumPy), and discrete simulation loops.
   - **Database Requirement:** None. State is maintained in-memory as an operational digital twin. No external database instance (PostgreSQL, MySQL, MongoDB) is needed.
   - **Hosting Characteristics:** Requires an active Python runtime (web service container). Cannot be hosted on static file providers (such as GitHub Pages).

2. **Frontend (React 18 / Vite / Tailwind CSS):**
   - Single Page Application (SPA) compiled into static HTML, CSS, and minified JavaScript (`dist/`).
   - Communicates asynchronously with the backend API via `fetch()` through `src/api/client.js`.
   - **Hosting Characteristics:** Highly optimized for Global Edge CDNs (Vercel, Netlify, Cloudflare Pages).

### Recommended Production Topology

```text
┌────────────────────────────────────────────────────────┐
│                   Global Internet                      │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│       Frontend (Vercel)       │ │     Backend (Render.com)      │
│  https://agv-intel.vercel.app │ │ https://agv-api.onrender.com  │
│                               │ │                               │
│  • Edge CDN Distribution      │ │  • Python 3.13 Runtime        │
│  • Client-Side Routing (SPA)  │ │  • FastAPI / Uvicorn Server   │
│  • Environment: VITE_API_URL  │ │  • Discrete Math Engines      │
└──────────────┬────────────────┘ └──────────────┬────────────────┘
               │                                 │
               └───────── CORS REST APIs ────────┘
                  /api/health, /api/simulation,
                  /api/algorithms, /api/experiments
```

---

## 2. Pre-Deployment Checklist

Before deploying, ensure:

- [x] All 77 automated backend tests pass cleanly (`python -m pytest backend/tests -v`).
- [x] Frontend production build compiles with zero errors (`npm --prefix frontend run build`).
- [x] No hardcoded `localhost:8000` URLs exist in frontend source code (`import.meta.env.VITE_API_URL` is used).
- [x] Root `.gitignore` is in place to exclude `.env`, `node_modules`, `__pycache__`, and `dist/`.
- [x] Local `.env` files are not tracked in Git.

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Push Project to GitHub

1. Initialize Git in the project root:
   ```bash
   git init
   git add .
   git commit -m "feat: prepare AGV Intelligence platform for GitHub and web deployment"
   ```

2. Link to your GitHub repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

### Step 2: Deploy Backend to Render (Free Tier)

Render provides an official Python hosting environment with automatic deployment on `git push`.

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`AGV-INTELLIGENCE`).
4. Configure the Web Service settings:
   - **Name:** `agv-intelligence-api`
   - **Region:** Closest to your target users (e.g., *Singapore*, *Frankfurt*, *Oregon*)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank — runs from project root)*
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install --no-cache-dir -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. Expand **Advanced** and add the following **Environment Variables**:
   | Variable | Value | Purpose |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.13.0` | Specifies Python 3.13 runtime |
   | `AGV_DEBUG` | `False` | Disables debug mode in production |
   | `AGV_API_PREFIX` | `/api` | Base API prefix |
   | `AGV_CORS_ORIGINS` | `*` *(or your Vercel URL once deployed)* | Allows cross-origin requests from frontend |
   | `AGV_WAREHOUSE__GRID_WIDTH` | `8` | Warehouse dimension |
   | `AGV_WAREHOUSE__GRID_HEIGHT` | `8` | Warehouse dimension |
   | `AGV_FLEET__ROBOT_COUNT` | `8` | Active robot count |
   | `AGV_SIMULATION__TICK_INTERVAL_MS` | `800` | Tick speed |
6. Set **Health Check Path** to: `/api/health`
7. Click **Create Web Service**.
8. Once deployed, copy your backend URL (e.g. `https://agv-intelligence-api.onrender.com`).

---

### Step 3: Deploy Frontend to Vercel (Recommended)

Vercel provides edge hosting and automatic continuous integration for Vite applications.

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Select your `AGV-INTELLIGENCE` repository.
4. Configure the project settings:
   - **Project Name:** `agv-intelligence`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `frontend`.
   - **Build Command:** `npm run build` *(auto-detected)*
   - **Output Directory:** `dist` *(auto-detected)*
   - **Install Command:** `npm install` *(auto-detected)*
5. Expand **Environment Variables** and add:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://agv-intelligence-api.onrender.com/api` *(Your Render backend URL with `/api` suffix)* |
6. Click **Deploy**.
7. Vercel will build the frontend and provide your live application URL (e.g. `https://agv-intelligence.vercel.app`).

*Note: The included [frontend/vercel.json](file:///e:/semester%203/discrete%20mathematics%20and%20graph%20theory/AGV-INTELLIGENCE/frontend/vercel.json) automatically handles SPA client-side route rewrites so deep page refreshes work properly.*

---

### Step 4: Finalize CORS on Backend

After obtaining your production Vercel frontend URL:

1. Open your Render dashboard for `agv-intelligence-api`.
2. Navigate to **Environment**.
3. Update `AGV_CORS_ORIGINS`:
   ```text
   https://agv-intelligence.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes** (Render will automatically redeploy with the updated CORS policy).

---

## 4. Alternative Deployment Options

### Alternative A: Netlify (Frontend)
1. In Netlify, click **Add new site** → **Import an existing project**.
2. Connect your GitHub repository.
3. Set **Base directory** to `frontend`.
4. Set **Build command** to `npm run build`.
5. Set **Publish directory** to `frontend/dist`.
6. Add Environment Variable: `VITE_API_URL = https://agv-intelligence-api.onrender.com/api`.
7. Click **Deploy site**.
*(The repository includes [frontend/netlify.toml](file:///e:/semester%203/discrete%20mathematics%20and%20graph%20theory/AGV-INTELLIGENCE/frontend/netlify.toml) with 200 redirect rules for SPA navigation).*

### Alternative B: Railway.app (Full-Stack Monorepo)
Railway can deploy both backend and frontend from a single repository using the included `Dockerfile` and `docker-compose.yml`.
1. Sign in to [railway.app](https://railway.app).
2. Create **New Project** → **Deploy from GitHub repo**.
3. Add backend service with Dockerfile `backend/Dockerfile`.
4. Add frontend service pointing to `frontend/`.

### Alternative C: Docker Compose (Self-Hosted Linux VPS / Cloud VM)
To deploy on an Ubuntu / Debian cloud virtual machine (AWS EC2, DigitalOcean Droplet, Linode, GCP):

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/AGV-INTELLIGENCE.git
cd AGV-INTELLIGENCE

# Launch with Docker Compose
docker compose up -d --build

# Verify running services
docker compose ps
curl http://localhost:8000/api/health
```

---

## 5. Post-Deployment Verification

Verify your live production deployment using this checklist:

1. **Backend Health Check:**
   Open in browser or run curl:
   ```bash
   curl -I https://<YOUR_BACKEND_URL>/api/health
   ```
   *Expected response:* `HTTP/2 200` with JSON payload confirming `"status": "healthy"` and active algorithm modules.

2. **Frontend UI Connectivity:**
   - Open your deployed frontend URL (`https://<YOUR_FRONTEND_URL>`).
   - Check the top header **System Status Indicator**: it should display an emerald green pulsing dot with low latency (e.g. `Online 42ms v2.0.0`).
   - If red or disconnected, check browser DevTools Console and verify `VITE_API_URL` points to the correct backend HTTPS URL.

3. **Simulation Test:**
   - Navigate to the **Warehouse Simulator** tab.
   - Click **Play** or **Step**: AGVs should navigate smoothly on the 8x8 grid.
   - Click any grid cell to toggle an obstacle and verify dynamic path recalculation.

4. **Mathematical Verification:**
   - Navigate to **Charging Optimization**: verify that the 4x4 diagonal derangement benchmark computes $N = 9$ valid matchings.
   - Navigate to **Energy Management**: verify that the 100 kWh default scenario computes exactly $12,341$ admissible allocations.
   - Navigate to **Deadlock Monitoring**: click **Inject Deadlock Demo** and confirm the Wait-For Graph renders the 4-robot cycle and that **Replan Detour Route** resolves it.

---

## 6. Academic Paper Citation & Availability Section

For your university experiential learning report or IEEE conference paper submission, use the following standardized text in your **Software Availability** or **Experimental Setup** section:

> **Software and Prototype Availability:**  
> The complete software prototype developed for this research is released as open-source software under the MIT License and hosted on GitHub at `https://github.com/<YOUR_USERNAME>/AGV-INTELLIGENCE`. A live, interactive web demonstration is accessible at `https://<YOUR_FRONTEND_URL>.vercel.app`, powered by a high-performance Python FastAPI backend hosted at `https://<YOUR_BACKEND_URL>.onrender.com`. All algorithmic implementations (Rook polynomials, ordinary generating functions, graph coloring, and wait-for graph cycle detection) are accompanied by an automated test suite containing 77 independent verification test cases guaranteeing full experimental reproducibility.
