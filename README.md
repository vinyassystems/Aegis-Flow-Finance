# 🛡️ Aegis Flow Finance

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.12-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

Aegis Flow Finance is a **Privacy-First Predictive Cash Flow Engine**. 

Traditional budgeting apps tell you what you *already* spent. Aegis uses predictive machine learning to forecast your cash flow 90 days into the future. It is designed specifically for freelancers, gig workers, and creators with unpredictable income to prevent cash-flow crunches.

## 🚀 Features

*   **Zero-Knowledge Architecture:** Financial payload processing uses AES-GCM encryption in-memory. Your raw transactions are never persisted in plaintext.
*   **Predictive ML Boundaries:** 90-day trajectory forecasting with 95% Confidence Intervals for variable spending.
*   **Model Context Protocol (MCP):** Connects directly to AI clients like Claude Desktop to provide agentic financial reasoning natively in your chat.
*   **B2B & B2C Modules:** Includes a full React UI for consumer copilot queries, freelancer invoice tracking, and B2B API key management.

## 🏗️ Architecture

Aegis is a Full-Stack Monorepo consisting of three layers:
1.  **FastAPI Backend:** The core mathematical simulation engine and AES-GCM cryptography layer.
2.  **React + Tailwind Frontend:** A Vite-powered dashboard for data visualization using Recharts.
3.  **FastMCP Server:** A headless server bridging the predictive engine to LLMs.

## 💻 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/vinyassystems/Aegis-Flow-Finance.git
cd Aegis-Flow-Finance
```

### 2. Start the Backend API (FastAPI)
```bash
# From the root directory
pip install -r requirements.txt
uvicorn backend.main:app --reload
```
*API will be live at `http://localhost:8000`*

### 3. Start the Frontend Dashboard (React/Vite)
```bash
cd frontend/app
npm install
npm run dev
```
*Dashboard will be live at `http://localhost:5173`*

*(Tip: Windows users can simply double-click `start_aegis.bat` in the root folder to boot both servers simultaneously!)*

### 4. Setup the AI MCP Server (Claude Desktop)
To allow Claude to run financial simulations locally, add this to your `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "aegis-flow-finance": {
      "command": "python",
      "args": ["C:\\absolute\\path\\to\\vsa_financial_mcp.py"]
    }
  }
}
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
