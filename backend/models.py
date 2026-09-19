from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    company_name = Column(String, nullable=True) # For B2B clients
    
    api_keys = relationship("APIKey", back_populates="owner")
    financial_items = relationship("FinancialItem", back_populates="owner")
    simulations = relationship("SimulationLog", back_populates="owner")

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    key_hash = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
    owner = relationship("User", back_populates="api_keys")

class FinancialItem(Base):
    __tablename__ = "financial_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_type = Column(String) # 'income' or 'expense'
    name = Column(String)
    amount = Column(Float)
    event_date = Column(DateTime)
    is_recurring = Column(Boolean, default=False)
    
    owner = relationship("User", back_populates="financial_items")

class SimulationLog(Base):
    __tablename__ = "simulation_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_type = Column(String) # 'b2b', 'b2c', or 'freelancer'
    run_date = Column(DateTime, default=datetime.utcnow)
    
    # Universal Metrics
    lowest_balance = Column(Float)
    danger_date = Column(DateTime, nullable=True)
    
    # Model-Specific Outputs (Stored as JSON strings)
    affordability_status = Column(Boolean, nullable=True) # B2B
    risk_score = Column(Float, nullable=True) # B2B
    ai_recommendation = Column(String, nullable=True) # B2C & Freelancer
    
    owner = relationship("User", back_populates="simulations")
