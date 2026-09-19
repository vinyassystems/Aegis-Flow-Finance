from typing import List, Dict, Any
from datetime import datetime, timedelta

def run_90_day_simulation(current_balance: float, events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Simulates cash flow for 90 days.
    Events format: [{'amount': 1500, 'type': 'income', 'due_date': '2026-10-01'}]
    """
    lowest_balance = current_balance
    danger_date = None
    simulated_balance = current_balance
    
    # Sort events by date
    sorted_events = sorted(events, key=lambda x: x.get('due_date', '2099-01-01'))
    
    for event in sorted_events:
        amt = float(event.get('amount', 0))
        if event.get('type') == 'expense':
            simulated_balance -= amt
        else:
            simulated_balance += amt
            
        if simulated_balance < lowest_balance:
            lowest_balance = simulated_balance
            
        if simulated_balance < 0 and danger_date is None:
            danger_date = event.get('due_date')
            
    playbook = "Cash flow is stable."
    if danger_date:
        playbook = f"URGENT: Balance drops below zero on {danger_date}. Delay discretionary expenses immediately."
        
    return {
        "lowest_balance": lowest_balance,
        "danger_date": danger_date,
        "recovery_playbook": playbook
    }
