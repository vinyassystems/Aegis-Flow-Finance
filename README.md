# 🛡️ Aegis Flow Finance

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.12-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

Aegis Flow Finance is a **Privacy-First Predictive Cash Flow Engine**.

Traditional budgeting apps tell you what you *already* spent. Aegis uses predictive machine learning to forecast your cash flow 90 days into the future. It is designed specifically for freelancers, gig workers, and creators with unpredictable income to prevent cash-flow crunches before they happen.

---

## 🚀 Features

*   **Zero-Knowledge Architecture:** Financial payload processing uses AES-GCM encryption in-memory. Your raw transactions are never persisted in plaintext.
*   **Predictive ML Boundaries:** 90-day trajectory forecasting with 95% Confidence Intervals for variable spending.
*   **Claude AI / MCP Integration:** Connects directly to Claude Desktop so you can ask your finances questions in plain English — no UI needed.
*   **REST API with Authentication:** A real authenticated FastAPI backend any developer can call using an `aegis_live_` API key.
*   **Offline Fallback Mode:** The React dashboard works even without the Python backend, using a local JS simulation engine.

---

## 🧩 Dashboard Modules

The dashboard is split into 4 modules, accessible from the left sidebar:

### 📊 1. Freelancer Engine (Core)
> **Who is it for?** Gig-workers, freelancers, and creators with unpredictable income.

- Interactive slider to adjust your **Daily Variable Spend Limit** (food, transport, etc).
- **Manual Transaction Entry:** Add any custom income or expense and watch the 90-day graph recalculate instantly.
- **CSV Upload:** Import your bank transactions by uploading a CSV file (`Name, Amount, Date`).
- A real-time **Recharts trajectory graph** showing Best Case, Expected, and Worst Case 90-day cash flow.

### 🛍️ 2. Consumer Copilot
> **Who is it for?** Everyday consumers who want a quick affordability check.

Ask the AI *"Can I afford a MacBook Pro?"*, input the price, and instantly see whether the purchase is **Safe, Risky, or Denied** based on your current balance and future trajectory.

### 🔑 3. Developer API (B2B)
> **Who is it for?** Companies and developers who want to embed predictive cash flow into their own apps.

This is the business layer of Aegis. Any external developer can:
1. Click **"Generate New Key"** to get a unique `aegis_live_XXXX` API key.
2. Use the **cURL Quickstart** shown on-screen to call the `/simulate` endpoint from their own app.
3. Receive a full 90-day ML trajectory in JSON format, powered by the Python engine.

> 💡 **Business Model:** Open-Core SaaS. The code is free to clone. Enterprise companies pay for the convenience of a managed hosted API — exactly how Stripe and OpenAI make money.

### 🔒 4. ZK-Enclave Terminal
> **Who is it for?** Security-conscious users who want to verify their data is never stored.

A hyper-premium Matrix-style dashboard that simulates AES-GCM client-side decryption. The encrypted financial payload is decrypted entirely **inside the browser**, meaning the server never handles raw financial data in plaintext.

---

## 🔑 API Key Authentication

The `/simulate` endpoint is protected by Bearer token authentication.

**Valid key prefixes:**
- `aegis_live_` → Production keys (paid tier)
- `aegis_test_` → Testing keys (free tier)

### ✅ Correct Usage (with key)
```bash
curl -X POST "http://localhost:8000/api/v1/freelancer/simulate" \
     -H "Authorization: Bearer aegis_live_YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"starting_balance": 8450, "transactions": [], "variable_daily_expense": 50}'
```

### ❌ Blocked (without key)
```bash
curl -X POST "http://localhost:8000/api/v1/freelancer/simulate"
# Returns: {"detail": "Not authenticated"}
```

### Sample JSON Response
```json
{
  "status": "success",
  "trajectory": [
    { "date": "Sep 20", "balance": 8400.0, "bestCase": 8500.0, "worstCase": 8200.0 }
  ],
  "lowest_balance": 3200.0,
  "danger_date": "2026-11-15",
  "recovery_playbook": "Delay the $2,500 equipment purchase by 14 days to clear the November cash crunch."
}
```

---

## 🤖 Claude AI Integration (MCP Server)

Aegis includes a built-in **Model Context Protocol (MCP)** server (`vsa_financial_mcp.py`). This allows AI clients like **Claude Desktop** to run financial forecasts, check affordability, audit subscriptions, and analyze live bank data directly via natural language.

> ⚠️ **Important:** MCP requires the official **Claude Desktop Application** (Windows / macOS). Browser-based Claude (`claude.ai`) does not support local machine MCP connections.

### What Claude can do with Aegis:
| What you say to Claude... | Tool Executed | Result |
|---|---|---|
| *"What is my financial runway?"* | `get_monthly_summary` | Returns monthly burn rate, total liquid cash, and runway in months. |
| *"Run a 90-day simulation with $8,450 starting balance"* | `run_predictive_cash_flow` | Simulates 90 days of cash flow with 95% confidence intervals. |
| *"Can I afford a $2,500 equipment purchase?"* | `get_affordability_check` | Analyzes post-purchase reserves & returns safety rating. |
| *"Audit my subscriptions and suggest cuts"* | `audit_subscriptions` | Analyzes active recurring payments and suggests savings. |
| *"Sync my live bank data"* | `sync_live_bank_data` | Pulls simulated Plaid/Teller real-time transactions. |

---

### ⚙️ Step-by-Step Setup Guide

#### 1. Install Dependencies
```bash
pip install "mcp<2"
```

#### 2. Install Claude Desktop
Download and install the official app: [claude.ai/download](https://claude.ai/download).

#### 3. Configure the MCP Connection
Open your Claude configuration file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following configuration:
```json
{
  "mcpServers": {
    "aegis-flow-finance": {
      "command": "python",
      "args": ["C:\\Users\\YOUR_USERNAME\\Desktop\\Aegis-Flow-Finance\\vsa_financial_mcp.py"]
    }
  }
}
```
*(Replace `C:\\Users\\YOUR_USERNAME\\...` with your actual full path to `vsa_financial_mcp.py`)*

#### 4. Test Standalone (Without Claude Desktop)
You can verify and test all MCP tools directly from your terminal anytime:
```bash
python -X utf8 -c "import vsa_financial_mcp; print(vsa_financial_mcp.get_affordability_check(8450, 2500, 4500)); print(vsa_financial_mcp.get_monthly_summary())"
```

#### 5. Launch & Use
Restart Claude Desktop. The **`aegis-flow-finance`** tools will automatically appear in Claude's prompt bar. You can now chat naturally with your finances!

---

## 🏗️ Architecture

```
Aegis-Flow-Finance/
├── backend/
│   ├── main.py              # FastAPI app entry point + CORS
│   ├── core_engine.py       # 90-day ML simulation math
│   └── routers/
│       └── freelancer.py    # /simulate endpoint with API key auth
├── frontend/
│   └── app/src/
│       ├── VSADashboard.jsx       # Main premium React dashboard
│       └── VSASecureDashboard.jsx # ZK-Enclave Terminal
├── vsa_financial_mcp.py     # Claude Desktop MCP server
├── start_aegis.bat          # One-click Windows launcher
└── README.md
```

---

## 💻 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/vinyassystems/Aegis-Flow-Finance.git
cd Aegis-Flow-Finance
```

### 2. Start the Backend
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
# API live at http://localhost:8000
```

### 3. Start the Frontend
```bash
cd frontend/app
npm install && npm run dev
# Dashboard live at http://localhost:5173
```

> 💡 **Windows shortcut:** Double-click `start_aegis.bat` to start both servers at once!

### 4. (Optional) Connect Claude Desktop
Follow the [Claude AI Integration](#-claude-ai-integration-mcp) steps above.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/) © Vinyas Systems

