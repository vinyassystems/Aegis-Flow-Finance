from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from ..core_engine import run_90_day_simulation

router = APIRouter()
security = HTTPBearer()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Validates that the provided Bearer token is a valid Aegis API key.
    In a production SaaS, this would check a PostgreSQL database.
    For this open-source core, we just validate the prefix structure.
    """
    token = credentials.credentials
    if not token.startswith("aegis_live_") and not token.startswith("aegis_test_"):
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key. Keys must start with 'aegis_live_' or 'aegis_test_'"
        )
    return token

class Transaction(BaseModel):
    id: int
    name: str
    amount: float
    type: str  # 'income' or 'expense'
    due_date: str

class SimulationRequest(BaseModel):
    starting_balance: float
    transactions: List[Transaction]
    variable_daily_expense: float = 50.0

@router.post("/simulate")
async def simulate(payload: SimulationRequest, api_key: str = Depends(verify_api_key)):
    """
    Takes real transactions, runs the 90-day core engine, and generates
    the trajectory array and ML bounds for the React chart.
    """
    events = [t.dict() for t in payload.transactions]
    engine_result = run_90_day_simulation(payload.starting_balance, events)
    
    trajectory = []
    current_balance = payload.starting_balance
    current_date = datetime.now()
    
    sorted_txs = sorted(payload.transactions, key=lambda x: x.due_date)
    tx_idx = 0
    
    for day in range(90):
        date_str = current_date.strftime("%Y-%m-%d")
        
        while tx_idx < len(sorted_txs) and sorted_txs[tx_idx].due_date <= date_str:
            tx = sorted_txs[tx_idx]
            if tx.type == 'income':
                current_balance += tx.amount
            else:
                current_balance -= tx.amount
            tx_idx += 1
            
        current_balance -= payload.variable_daily_expense
        margin = payload.variable_daily_expense * 0.2 * day
        
        if day in [0, 20, 45, 65, 89]:
            trajectory.append({
                "date": current_date.strftime("%b %d"),
                "balance": round(current_balance, 2),
                "bestCase": round(current_balance + margin, 2),
                "worstCase": round(current_balance - margin, 2)
            })
            
        current_date += timedelta(days=1)

    return {
        "status": "success",
        "trajectory": trajectory,
        "lowest_balance": engine_result["lowest_balance"],
        "danger_date": engine_result["danger_date"],
        "recovery_playbook": engine_result["recovery_playbook"]
    }
