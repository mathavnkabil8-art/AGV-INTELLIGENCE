# AGV Intelligence — Mathematical Modelling & Optimization of Autonomous Guided Vehicle Traffic Routing & Smart Charging in Automated Warehouses

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/Frontend-React%2018.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Pytest-77%20Passed%20(100%25)-brightgreen.svg?logo=pytest&logoColor=white)](https://docs.pytest.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An academic experiential learning software platform translating foundational **Discrete Mathematics and Graph Theory** principles directly into real-time algorithms for multi-agent autonomous guided vehicle (AGV) routing, conflict-free scheduling, deadlock recovery, smart charging matching, and backup energy quota distribution.

---

## 📌 1. Project Overview

Modern automated distribution centers rely on fleets of Autonomous Guided Vehicles (AGVs) operating simultaneously within dense physical grids. Conventional warehouse management heuristics often address traffic congestion and charging assignment using isolated, ad-hoc rules that can cause deadlock stalls, persistent corridor queuing, or power over-allocation.

**AGV Intelligence** implements a rigorous mathematical approach: every operational challenge in the automated facility is modeled as a formal discrete mathematical structure. The software features an interactive **8×8 Warehouse Digital Twin** paired with real-time computational solvers that execute, visualize, and benchmark discrete optimization algorithms against uncoordinated baseline heuristics.

---

## 🎯 2. Problem Being Addressed

1. **Topological Space Contention:** How to navigate a fleet of AGVs over constrained planar grids without physical cell collisions or simultaneous edge swaps.
2. **Mutual Exclusion & Scheduling Delay:** How to partition conflicting agent movement trajectories into minimum distinct temporal execution phases without exhaustive combinatorial search.
3. **Restricted Resource Matching:** How to allocate charging docks to robots under strict physical clearance and hardware incompatibility constraints ($B \subseteq [n] \times [m]$).
4. **Deadlock in Constrained Trajectories:** How to detect circular wait dependencies in real time and execute physical detour replanning without artificially eliminating edge barriers.
5. **Constrained Energy Budgeting:** How to distribute finite microgrid backup electricity among charging bays subject to individual minimum reserves ($x_i \ge m$).

---

## 🏆 3. Project Objectives

- Construct a formal undirected planar graph $G=(V, E)$ of an $8 \times 8$ warehouse with static obstacle racks, charging stations, and storage zones.
- Implement unweighted Breadth-First Search (BFS) and weighted Dijkstra shortest-path algorithms for dynamic AGV route synthesis.
- Construct spatio-temporal conflict graphs $G_c=(V_c, E_c)$ detecting vertex interferences and opposing edge swaps, solving phase separation via Welsh-Powell greedy graph coloring bounded by Brooks' Theorem ($\chi(G_c) \le \Delta(G_c) + 1$).
- Formulate the restricted dock assignment problem via Rook Polynomials $R(x, B) = \sum r_k(B) x^k$ and evaluate admissible matching permutations using the Principle of Inclusion-Exclusion (PIE), validating against classical derangements ($!n$).
- Formulate constrained backup electricity allocation via Ordinary Generating Functions (OGFs) $G(x) = \frac{x^{mn}}{(1-x)^n}$, extracting exact integer solution counts via the Negative Binomial Theorem and Stars-and-Bars combinatorial reduction.
- Detect multi-agent circular waiting in real time via directed Wait-For Graphs (WFGs) $D=(V_A, E_W)$ and Tarjan's Strongly Connected Components (SCC), resolving cycles through physical Dijkstra detour route replanning.
- Provide a dual-theme (Light Theme Command Center default with Dark Mode toggle) React web interface with 8 full-featured modules and 5 reproducible empirical benchmark experiments.

---

## 🛠️ 4. Technology Stack Actually Detected

### Backend Tier
- **Language:** Python 3.13.5
- **Web Framework:** FastAPI 0.115.0+ (Asynchronous ASGI REST API)
- **ASGI Server:** Uvicorn 0.32.0+ with standard uvloop extensions
- **Graph Algorithms:** NetworkX 3.4.0+ (Planar graphs, shortest paths, bipartite matching, cycle decomposition)
- **Symbolic Mathematics:** SymPy 1.13.0+ (Exact polynomial expansion, series coefficient extraction)
- **Numerical Computing:** NumPy 2.1.0+ (Matrix distance calculations and numerical metric arrays)
- **Configuration & Validation:** Pydantic 2.9.0+ & Pydantic-Settings 2.5.0+ (Strict type enforcement, environment variable overrides)
- **Testing:** Pytest 8.3.0+ & HTTPX 0.27.0+ (77 isolated unit and integration test cases)

### Frontend Tier
- **Language:** JavaScript (ES2022+ / JSX)
- **UI Library:** React 18.3.1 (Modern functional components, hooks, custom contexts)
- **Bundler & Build Tool:** Vite 6.1.0 (Lightning-fast HMR and optimized Rollup production packaging)
- **Styling & Design System:** Tailwind CSS 3.4.17 (Custom semantic tokens for command-center aesthetic, Light theme default, Dark mode class fallback)
- **Motion & Transitions:** Framer Motion 12.4.7 (Fluid UI state transitions)
- **Telemetry & Charts:** Recharts 2.15.1 (Responsive SVG line charts, comparative bar charts, and spectrum graphs)
- **Iconography:** Lucide React 0.475.0 (Crisp industrial robotics and mathematical icons)

### Persistence & State Architecture
- **In-Memory Digital Twin:** Real-time warehouse floor state, AGV coordinates, battery levels, and route reservations are maintained in high-speed Python memory (`backend/simulation/engine.py`).
- **No Heavy Relational Database Required:** Eliminates complex external database provisioning (PostgreSQL/MySQL), allowing zero-dependency cloud deployments.

---

## 🏗️ 5. System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│               FRONTEND: React 18 / Vite SPA (Port 5173)                │
│                                                                        │
│  [TopNav: Live Clock | Theme Toggle | Global Optimization Trigger]     │
│  [Sidebar: Module Navigation | Live Backend Status Pill]               │
│                                                                        │
│  ┌─────────────────────── 8 COMMAND MODULES ────────────────────────┐ │
│  │ 1. Overview       2. Simulator    3. Traffic Control  4. Charging │ │
│  │ 5. Energy Mgmt    6. Deadlock     7. Experiments      8. Math Lab │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
│                                     │ (REST JSON via src/api/client.js)│
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ HTTP /api/*
┌─────────────────────────────────────▼──────────────────────────────────┐
│               BACKEND: Python 3.13 / FastAPI (Port 8000)               │
│                                                                        │
│  [FastAPI ASGI Router with Dynamic CORS Middleware]                    │
│                                                                        │
│  ┌────────────────────────── API ROUTES ─────────────────────────────┐ │
│  │ /api/health       /api/warehouse   /api/simulation                │ │
│  │ /api/algorithms   /api/experiments                                │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
│                                     │                                  │
│  ┌────────────────────── SIMULATION & TWIN ──────────────────────────┐ │
│  │ SimulationEngine (Clock, Spatio-Temporal Reservations, AGV State)  │ │
│  │ WarehouseState (8x8 Floor, Charging Stations, Storage, Obstacles) │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
│                                     │                                  │
│  ┌───────────────────── DISCRETE MATH ENGINES ───────────────────────┐ │
│  │ • GraphRouting: Planar Grid G=(V,E), Welsh-Powell Chromatic Phases │ │
│  │ • RookPolynomial: R(x,B) Generating Function & PIE Derangements   │ │
│  │ • GeneratingFunctions: OGF G(x) & Negative Binomial Stars-and-Bars│ │
│  │ • DeadlockDetector: Directed WFG D=(V_A, E_W) & Dijkstra Detours  │ │
│  │ • FleetOptimizer: Kuhn-Munkres Bipartite Matching                 │ │
│  │ • IntegratedController: Master Multi-Objective Optimization       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 6. Major Application Modules

The application is organized into 8 fully operational Command Center modules:

### 1. Warehouse Environment Visualisation
- **Component:** `frontend/src/components/warehouse/WarehouseGrid.jsx` & `frontend/src/pages/SimulatorPage.jsx`
- **Functionality:** High-resolution interactive SVG digital twin rendering the physical $8 \times 8$ warehouse grid ($64$ discrete cells). Displays real-time coordinates of 8 AGVs, 4 peripheral inductive charging stations (`(0,0)`, `(0,7)`, `(7,0)`, `(7,7)`), 6 storage bay delivery docks, and static obstacle racks. Users can click any floor cell to toggle obstacle placement and watch robots dynamically replan routes.

### 2. AGV Route Planning Using BFS and Dijkstra's Algorithm
- **Component:** `backend/algorithms/graph_routing.py` & `TrafficControlPage.jsx`
- **Functionality:** Formulates the warehouse as an undirected graph $G = (V, E)$. Provides both unweighted Breadth-First Search (BFS) for minimal hop transitions and weighted Dijkstra's algorithm supporting configurable terrain traversal costs $c(u, v) = 1.0$. Dynamically verifies connectivity ($k$-connectedness) and average vertex degree ($\bar{d} \approx 3.5$).

### 3. Traffic Conflict Management and Reservation-Based Scheduling
- **Component:** `backend/simulation/engine.py`
- **Functionality:** Discrete-event spatio-temporal reservation table preventing mutual exclusion violations. Checks $(x, y, t)$ occupancy tuples before committing movement ticks, preventing both vertex collisions (two AGVs occupying cell $c$ at step $t$) and opposing edge swap collisions (robot $A$ moving $u \to v$ while robot $B$ moves $v \to u$ at step $t$).

### 4. Graph Colouring for Scheduling Priorities
- **Component:** `backend/algorithms/graph_routing.py` & `TrafficControlPage.jsx`
- **Functionality:** Constructs the spatio-temporal conflict graph $G_c = (V_c, E_c)$ where vertices represent active robot journeys and edges connect mutually incompatible trajectories. Partitions non-interfering routes into parallel execution time slots using Welsh-Powell largest-first greedy vertex coloring, proving satisfaction of Brooks' Theorem upper bound $\chi(G_c) \le \Delta(G_c) + 1$. Includes interactive SVG conflict graph visualization with circular layouts and degree inspector.

### 5. Deadlock Detection Using Wait-For Graphs
- **Component:** `backend/algorithms/deadlock_detection.py` & `DeadlockMonitoringPage.jsx`
- **Functionality:** Models dynamic blocking dependencies as a directed Wait-For Graph (WFG) $D = (V_A, E_W)$, where directed edge $u \to v$ signifies agent $u$ waiting for a cell held by agent $v$. Applies Tarjan's Strongly Connected Components (SCC) and NetworkX simple cycle detection to isolate circular waits ($\exists \text{ cycle } C \subseteq D$). Features an intentional 4-robot deadlock injection scenario and a true **Physical Detour Route Recovery Engine** that recalculates safe Dijkstra detours around the blocking counterpart without artificially deleting obstacle barriers.

### 6. Smart Charging Allocation Using Rook Polynomials
- **Component:** `backend/algorithms/rook_polynomial.py` & `ChargingOptimizationPage.jsx`
- **Functionality:** Models incompatible robot-charger pairs as forbidden positions $B \subseteq [n] \times [m]$ on an $n \times m$ board. Computes the symbolic Rook Polynomial:
  $$R(x, B) = \sum_{k=0}^{\min(n, m)} r_k(B) x^k$$
  and evaluates the Principle of Inclusion-Exclusion (PIE) to find the exact number of valid, clearance-safe matching permutations:
  $$N = \sum_{k=0}^n (-1)^k r_k(B) (n - k)!$$
  Includes an interactive compatibility board, dimension sliders ($2 \times 2$ to $6 \times 6$), benchmark derangement presets ($!3=2, !4=9, !5=44$), step-by-step alternating summation tables, and exhaustive backtracking verification.

### 7. Energy Distribution Using Generating Functions
- **Component:** `backend/algorithms/generating_functions.py` & `EnergyManagementPage.jsx`
- **Functionality:** Solves the constrained integer Diophantine equation $x_1 + x_2 + \dots + x_n = R$ subject to minimum reserve constraints $x_i \ge m$ for $n$ charging bays with total backup electricity $R$. Formulates the Ordinary Generating Function (OGF):
  $$G(x) = \left(\sum_{k=m}^\infty x^k\right)^n = \left(\frac{x^m}{1 - x}\right)^n = \frac{x^{mn}}{(1 - x)^n}$$
  Extracts the exact coefficient $[x^R] G(x)$ via the Negative Binomial Theorem and Stars-and-Bars reduction:
  $$[x^R] G(x) = \binom{(R - mn) + n - 1}{n - 1}$$
  Validates the official benchmark ($n=4, R=100\text{ kWh}, m=15\text{ kWh} \implies \binom{43}{3} = 12,341\text{ ways}$) symbolically with SymPy, and provides interactive energy spectrum bar charts.

### 8. Monitoring and Analytics Dashboard
- **Component:** `backend/api/routes/experiments.py` & `ExperimentsAnalyticsPage.jsx`
- **Functionality:** Comprehensive experimental research laboratory containing **5 predefined, reproducible academic benchmarks**:
  1. *EXP-01:* Normal Warehouse Routing (baseline vs uncoordinated)
  2. *EXP-02:* Intersecting Robot Routes (conflict graph coloring validation)
  3. *EXP-03:* Restricted Charging Stations (rook polynomial & PIE validation)
  4. *EXP-04:* Backup Energy Shortage (OGF deficit and surplus boundary analysis)
  5. *EXP-05:* Circular Waiting & True Route Recovery (WFG cycle breaking)
  Features comparative matrix tables, Recharts progression curves, and one-click **CSV and JSON data export**.

---

## 🔢 7. Mathematical Formulations Summary

| Principle | Formula / Expression | Academic Context |
| :--- | :--- | :--- |
| **Grid Graph** | $G = (V, E), \quad V \subseteq \{0,\dots,W-1\} \times \{0,\dots,H-1\} \setminus B_{\text{obs}}$ | 4-connectivity orthogonal planar warehouse topology |
| **Conflict Graph** | $(T_i, T_j) \in E_c \iff \exists t: p_i(t) = p_j(t) \lor (p_i(t) = p_j(t+1) \land p_i(t+1) = p_j(t))$ | Spatio-temporal interference modeling |
| **Brooks' Theorem** | $\chi(G_c) \le \Delta(G_c) + 1$ | Greedy chromatic coloring scheduling upper bound |
| **Rook Polynomial** | $R(x, B) = \sum_{k=0}^{\min(n, m)} r_k(B) x^k$ | Generating function for non-attacking rooks on forbidden board $B$ |
| **PIE Permutations** | $N = \sum_{k=0}^n (-1)^k r_k(B) (n - k)!$ | Principle of Inclusion-Exclusion valid assignment count |
| **Derangements** | $!n = n! \sum_{k=0}^n \frac{(-1)^k}{k!}$ | Main diagonal forbidden board benchmark ($!4 = 9$) |
| **OGF Energy Series** | $G(x) = \frac{x^{mn}}{(1 - x)^n} = x^{mn} \sum_{k=0}^\infty \binom{k + n - 1}{n - 1} x^k$ | Power series modeling infinite integer energy allocations |
| **Stars-and-Bars** | $[x^R] G(x) = \binom{(R - mn) + n - 1}{n - 1}$ | Negative binomial coefficient extraction ($R \ge mn$) |
| **WFG Deadlock** | $\text{Deadlock} \iff \exists \text{ directed cycle } C \subseteq D = (V_A, E_W)$ | Coffman circular wait condition |

---

## 🚀 8. Installation & Local Execution

### Prerequisites
- **Python:** Version 3.10 to 3.13 (Python 3.13.5 verified)
- **Node.js:** Version 18+ (Node v20+ / npm 10+ recommended)
- **Git:** Version 2.30+

---

### Step 1: Clone Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/AGV-INTELLIGENCE.git
cd AGV-INTELLIGENCE
```

---

### Step 2: Backend Setup
1. Open a terminal in the project root:
   ```bash
   # (Optional) Create Python virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install --no-cache-dir -r backend/requirements.txt
   ```

3. Run the automated test suite to verify installation:
   ```bash
   python -m pytest backend/tests -v
   ```
   *(Expected output: 77 passed in ~15s)*

4. Launch the FastAPI server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Root: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Diagnostic Endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Step 3: Frontend Setup
1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Launch Vite development server:
   ```bash
   npm run dev
   ```
   - Open your browser at: [http://localhost:5173](http://localhost:5173)

---

### Step 4: Docker Compose Execution (Alternative Zero-Config)
To run both backend and frontend simultaneously inside isolated Docker containers:

```bash
docker compose up -d --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Health Check: `http://localhost:8000/api/health`

---

## ⚙️ 9. Environment Variable Setup

The repository includes template files:
- [`.env.example`](file:///.env.example) (Unified root reference)
- [`backend/.env.example`](file:///backend/.env.example) (Backend settings)
- [`frontend/.env.example`](file:///frontend/.env.example) (Frontend settings)

### Key Variables Table

| Variable Name | Tier | Default | Description |
| :--- | :--- | :--- | :--- |
| `AGV_DEBUG` | Backend | `True` | Enables FastAPI debug logging |
| `AGV_API_PREFIX` | Backend | `/api` | Standard API route prefix |
| `AGV_CORS_ORIGINS` | Backend | `http://localhost:5173,...` | Comma-separated allowed origins (supports `*` in production) |
| `AGV_WAREHOUSE__GRID_WIDTH` | Backend | `8` | Warehouse grid width (cells) |
| `AGV_WAREHOUSE__GRID_HEIGHT` | Backend | `8` | Warehouse grid height (cells) |
| `AGV_FLEET__ROBOT_COUNT` | Backend | `8` | Total active AGVs deployed |
| `AGV_SIMULATION__TICK_INTERVAL_MS`| Backend | `800` | Discrete-event clock tick interval (ms) |
| `VITE_API_URL` | Frontend | `http://localhost:8000/api` | Base API endpoint URL consumed by `src/api/client.js` |

---

## 📸 10. Application Screenshots

| Module View | Description |
| :--- | :--- |
| ![Overview Dashboard](documentation/screenshots/overview_dashboard.png) | **Overview Dashboard:** High-level fleet KPIs, objective function tuner, and 5-pillar mathematical pipeline. |
| ![Warehouse Simulator](documentation/screenshots/warehouse_simulator.png) | **Warehouse Simulator:** Real-time 8x8 digital twin floor plan with dynamic obstacle avoidance and battery gauges. |
| ![Traffic Control](documentation/screenshots/traffic_control_coloring.png) | **Traffic Control & Conflict Graph:** Circular SVG conflict graph $G_c$, Welsh-Powell coloring phases, and BFS/Dijkstra solver. |
| ![Charging Optimization](documentation/screenshots/charging_rook_pie.png) | **Smart Charging & Rook Polynomials:** Interactive $n \times m$ forbidden board, rook numbers $r_k$, and PIE alternating sum. |
| ![Energy Management](documentation/screenshots/energy_generating_functions.png) | **Energy Management & OGFs:** Power series algebraic expansion, parameter sliders, and power allocation spectrum. |
| ![Deadlock Monitoring](documentation/screenshots/deadlock_wfg_recovery.png) | **Deadlock Monitoring & Recovery:** Wait-For Graph (WFG) directed cycle visualizer and Dijkstra detour replanning audit. |

*(High-resolution screenshots are stored in [`documentation/screenshots/`](file:///documentation/screenshots/)).*

---

## 🌐 11. Deployment Information

The project is fully prepared for cloud deployment:
- **Frontend:** Pre-configured for **Vercel** or **Netlify** with client-side SPA routing (`vercel.json`, `netlify.toml`).
- **Backend:** Pre-configured for **Render**, **Railway**, **Fly.io**, or Docker container hosting with `/api/health` probe.
- **Detailed Step-by-Step Instructions:** Refer to [`DEPLOYMENT.md`](file:///DEPLOYMENT.md) for complete cloud setup instructions.

---

## 🔮 12. Future Scope

1. **3D Three.js / WebGL Visualizer:** Extending the 2D SVG warehouse floor plan into a hardware-accelerated 3D digital twin.
2. **Multi-Floor Elevator Graph Routing:** Expanding the planar grid graph $G=(V, E)$ into a multi-layered 3D graph connecting warehouse mezzanines via industrial lifts.
3. **Dynamic Wireless Power Transfer (DWPT):** Integrating dynamic inductive road-charging modeling with non-linear battery degradation equations.
4. **Decentralized Multi-Agent Consensus:** Evaluating distributed conflict negotiation algorithms running directly on embedded robot microcontrollers.

---

## 📄 13. License & Academic Attribution

This project is developed as an experiential learning research software platform for **Discrete Mathematics and Graph Theory**.  
Released under the [MIT License](LICENSE).

For academic citations or paper references:
```bibtex
@misc{agv_intelligence_2026,
  author = {AGV Intelligence Research Team},
  title = {AGV Intelligence: Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses Using Discrete Mathematics},
  year = {2026},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/<YOUR_USERNAME>/AGV-INTELLIGENCE}}
}
```
