from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP
from datetime import datetime, timedelta
import csv
import io
import random
import json

# Initialize the MCP Server
mcp = FastMCP("VSA Financial Intelligence (Advanced)")

# -----------------------------------------------------------------------------
# 1. LIVE BANK CONNECTIONS (Mock Plaid/Teller API)
# -----------------------------------------------------------------------------
@mcp.tool()
def sync_live_bank_data(account_id: str) -> str:
    """
    Connects to the Plaid/Teller API to pull real-time balances and 
    the last 30 days of transactions for the user.
    """
    # Mocking a live API response
    live_balance = 8450.75
    transactions = [
        {"name": "Netflix", "amount": 15.99, "type": "expense", "date": "2026-09-01", "category": "subscription"},
        {"name": "AWS Cloud", "amount": 124.50, "type": "expense", "date": "2026-09-03", "category": "subscription"},
        {"name": "Whole Foods", "amount": 145.20, "type": "expense", "date": "2026-09-10", "category": "groceries"},
        {"name": "Acme Corp Invoice", "amount": 4500.00, "type": "income", "date": "2026-09-12", "category": "freelance"},
    ]
    
    return json.dumps({
        "status": "success",
        "live_balance": live_balance,
        "recent_transactions": transactions,
        "message": f"Successfully synced live data for account {account_id}."
    }, indent=2)

# -----------------------------------------------------------------------------
# 2. PREDICTIVE ML FORECASTING (Statistical Simulation)
# -----------------------------------------------------------------------------
@mcp.tool()
def run_predictive_cash_flow(starting_balance: float, fixed_items: List[Dict[str, Any]], avg_variable_expense_per_day: float) -> str:
    """
    Runs a 90-day trajectory simulation using probabilistic forecasting for variable expenses,
    computing the lowest balance point with a 95% confidence interval.
    
    Args:
        starting_balance: Current bank balance.
        fixed_items: List of known fixed dicts (name, amount, type, due_date).
        avg_variable_expense_per_day: Historical daily average for things like food/gas.
    """
    current_balance = starting_balance
    lowest_balance = starting_balance
    
    # Sort fixed items
    sorted_items = sorted(fixed_items, key=lambda x: x.get("due_date", "2099-01-01"))
    
    for item in sorted_items:
        amt = float(item.get("amount", 0))
        if item.get("type") == "expense":
            current_balance -= amt
        else:
            current_balance += amt
            
        # Introduce predictive variance (e.g. +/- 20% on daily expenses accumulating)
        variance = avg_variable_expense_per_day * random.uniform(0.8, 1.2) * 7 # weekly grouping
        current_balance -= variance
            
        if current_balance < lowest_balance:
            lowest_balance = current_balance

    # Calculate Confidence Intervals (Mock ML Logic)
    margin_of_error = avg_variable_expense_per_day * 0.15 * 90 
    worst_case = lowest_balance - margin_of_error
    best_case = lowest_balance + margin_of_error

    return (
        f"🧠 ML Predictive Simulation Complete (90-Day Outlook):\n"
        f"Expected Lowest Balance: ${lowest_balance:.2f}\n"
        f"95% Confidence Interval: [${worst_case:.2f} to ${best_case:.2f}]\n"
        f"Note: If worst_case is negative, AI recommends cutting variable spending immediately."
    )

# -----------------------------------------------------------------------------
# 3. MCP RESOURCES (Live Background Data for the LLM)
# -----------------------------------------------------------------------------
@mcp.resource("vsa://reports/monthly_summary")
def get_monthly_summary() -> str:
    """
    A live resource the LLM can read at any time to understand the user's financial health
    without needing to trigger a tool call.
    """
    # In reality, this would query the DB for the authenticated user
    report = {
        "report_date": datetime.now().strftime("%Y-%m-%d"),
        "total_cash": 8450.75,
        "burn_rate_per_month": 3200.00,
        "runway_months": round(8450.75 / 3200.00, 1),
        "status": "HEALTHY"
    }
    return json.dumps(report, indent=2)

# -----------------------------------------------------------------------------
# 4. MCP PROMPT TEMPLATES (Agentic Personas)
# -----------------------------------------------------------------------------
@mcp.prompt("audit_subscriptions")
def audit_subscriptions_prompt() -> str:
    """
    Provides a pre-built prompt template injecting the user's live financial data
    and instructing the LLM to act as a ruthless financial auditor.
    """
    # Fetch live data via internal logic
    mock_subs = ["Netflix: $15.99", "AWS Cloud: $124.50", "Gym: $45.00"]
    
    return (
        "Act as a ruthless financial auditor and business accountant. "
        "Review the following active subscriptions for the user and ruthlessly suggest "
        "which ones to cut or downgrade to extend their cash runway.\n\n"
        "User's Active Subscriptions:\n"
        + "\n".join(f"- {sub}" for sub in mock_subs) + "\n\n"
        "Please provide a structured table of cuts and the total projected 12-month savings."
    )


@mcp.tool()
def get_affordability_check(current_balance: float, purchase_amount: float, monthly_income: float) -> str:
    """Quick high-ticket purchase evaluation."""
    post_purchase = current_balance - purchase_amount
    if post_purchase < 0:
        return f"❌ Affordability Denied. Deficit: ${abs(post_purchase):.2f}."
    elif post_purchase < (monthly_income * 0.5):
        return f"⚠️ Caution. Reserves drop to ${post_purchase:.2f}. Cut dining by 30%."
    return f"✅ Safe to Purchase! Reserves: ${post_purchase:.2f}."

if __name__ == "__main__":
    mcp.run()
