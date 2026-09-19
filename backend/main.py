from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import b2b, b2c, freelancer
from .database import engine, Base

app = FastAPI(title="Aegis Flow Finance API", version="1.0.0")

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(b2b.router, prefix="/api/v1/b2b", tags=["B2B API"])
app.include_router(b2c.router, prefix="/api/v1/b2c", tags=["B2C Copilot"])
app.include_router(freelancer.router, prefix="/api/v1/freelancer", tags=["Freelancer SaaS"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Aegis API Engine"}
