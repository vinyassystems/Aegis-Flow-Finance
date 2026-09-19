from fastapi import APIRouter

router = APIRouter()

@router.post("/purchase-query")
async def purchase_query():
    return {"status": "success", "message": "B2C Copilot Stub"}
