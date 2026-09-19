from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List

router = APIRouter()

class TransactionPayload(BaseModel):
    amount: float
    is_recurring: bool
    description: str

class B2BRequest(BaseModel):
    requested_amount: float
    transactions: List[TransactionPayload]

def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != "valid-vsa-key": # Mock check
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

@router.post("/affordability-check")
async def b2b_affordability_check(
    payload: B2BRequest, 
    api_key: str = Depends(verify_api_key)
):
    """
    B2B Model: Affordability-as-a-Service.
    Evaluates a user's transaction history to approve/deny an installment/purchase.
    """
    # ... call core 90-day simulation engine here ...
    
    # Mock Response
    return {
        "status": "success",
        "affordability_status": True,
        "risk_score": 12.5, # Out of 100
        "safe_payment_plan": {
            "method": "4_installments",
            "first_payment_date": "2023-11-01",
            "installment_amount": payload.requested_amount / 4
        }
    }
