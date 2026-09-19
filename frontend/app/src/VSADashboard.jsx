import React, { useState, useEffect } from 'react';
import { LineChart, Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import VSASecureDashboard from './VSASecureDashboard';

export default function VSADashboard() {
  const [activeModel, setActiveModel] = useState('freelancer');
  const [loading, setLoading] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [secureMode, setSecureMode] = useState(false);
  const [variableExpense, setVariableExpense] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real State for Engine Results
  const [data, setData] = useState([]);
  const [lowestBalance, setLowestBalance] = useState(0);
  const [dangerDate, setDangerDate] = useState(null);
  const [playbook, setPlaybook] = useState("Run simulation to analyze cash flow.");

  // Mock Transactions for the UI
  const [transactions, setTransactions] = useState([
    { id: 1, name: "Acme Corp Client", amount: 5000, type: "income", due_date: "2026-10-15" },
    { id: 2, name: "AWS Server Hosting", amount: 200, type: "expense", due_date: "2026-10-05" },
    { id: 3, name: "Office Rent", amount: 1500, type: "expense", due_date: "2026-11-01" },
    { id: 4, name: "Design Freelancer", amount: 800, type: "expense", due_date: "2026-11-20" },
  ]);

  // Run Real Backend Simulation
  const runSimulation = async (extraExpense = null) => {
    setLoading(true);
    try {
      const payload = {
        starting_balance: 8450.0,
        transactions: transactions,
        variable_daily_expense: variableExpense
      };

      if (extraExpense) {
        payload.transactions.push(extraExpense);
      }

      const response = await fetch('http://localhost:8000/api/v1/freelancer/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      setData(result.trajectory);
      setLowestBalance(result.lowest_balance);
      setDangerDate(result.danger_date);
      setPlaybook(result.recovery_playbook);
    } catch (err) {
      console.error("Backend offline. Please start FastAPI.", err);
      setPlaybook("⚠️ Error: Could not connect to FastAPI backend on port 8000.");
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    runSimulation();
  }, []);

  const handleMLUpdate = (e) => {
    setVariableExpense(parseInt(e.target.value));
    runSimulation();
  };

  const handleB2CPurchase = (e) => {
    e.preventDefault();
    const newPurchase = {
      id: 99, 
      name: purchaseItem, 
      amount: parseInt(purchaseAmount), 
      type: "expense", 
      due_date: new Date().toISOString().split('T')[0]
    };
    runSimulation(newPurchase);
  };

  // Filter transactions based on Search Bar
  const filteredTransactions = transactions.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (secureMode) {
    return (
      <div className="relative">
        <button onClick={() => setSecureMode(false)} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-50 hover:bg-red-700">
          Exit Secure Terminal
        </button>
        <VSASecureDashboard />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-64 bg-gray-900 text-white flex flex-col p-6 space-y-4">
        <div className="text-2xl font-bold text-blue-400 mb-6">Aegis Flow</div>
        <button onClick={() => setActiveModel('freelancer')} className={`text-left p-3 rounded-lg transition-colors ${activeModel === 'freelancer' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>1. Freelancer Predictor</button>
        <button onClick={() => setActiveModel('b2c')} className={`text-left p-3 rounded-lg transition-colors ${activeModel === 'b2c' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>2. B2C Copilot</button>
        <button onClick={() => setActiveModel('b2b')} className={`text-left p-3 rounded-lg transition-colors ${activeModel === 'b2b' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>3. B2B Merchant API</button>
        <div className="mt-auto pt-8">
          <button onClick={() => setSecureMode(true)} className="w-full bg-gray-700 text-green-400 border border-green-500 p-3 rounded-lg hover:bg-gray-600 flex items-center justify-center space-x-2">
            <span>🔒 ZK-Terminal</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
            {activeModel === 'freelancer' && "Freelancer Cash Flow"}
            {activeModel === 'b2c' && "AI Purchase Copilot"}
            {activeModel === 'b2b' && "Merchant API Gateway"}
          </h1>
          <button onClick={() => runSimulation()} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">
            {loading ? "Computing..." : "Run Engine"}
          </button>
        </header>

        {activeModel === 'freelancer' && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold">🧠 ML Forecasting & Live Search</h2>
               <input 
                 type="text" 
                 placeholder="🔍 Search invoices/expenses..." 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
                 className="border p-2 rounded w-64 bg-gray-50"
               />
            </div>
            <p className="text-sm text-gray-500 mb-4">Adjust your daily variable spend.</p>
            <input type="range" min="10" max="200" value={variableExpense} onMouseUp={handleMLUpdate} onChange={e => setVariableExpense(parseInt(e.target.value))} className="w-64" />
            <span className="font-bold text-blue-600 ml-4">${variableExpense} / day</span>
            
            {/* Search Results Table */}
            <div className="mt-4 border-t pt-4">
               <h3 className="text-sm font-bold text-gray-700 mb-2">Matching Transactions ({filteredTransactions.length})</h3>
               <div className="max-h-32 overflow-y-auto">
                 {filteredTransactions.map(t => (
                   <div key={t.id} className="flex justify-between text-sm py-1 border-b">
                     <span>{t.name} ({t.due_date})</span>
                     <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                       {t.type === 'income' ? '+' : '-'}${t.amount}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeModel === 'b2c' && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Ask the AI: Can I afford this?</h2>
            <form onSubmit={handleB2CPurchase} className="flex space-x-4">
              <input type="text" placeholder="e.g. MacBook Pro" value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)} className="flex-1 border p-2 rounded" required />
              <input type="number" placeholder="Cost ($)" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} className="w-32 border p-2 rounded" required />
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Check Affordability
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
             <p className="text-sm font-medium text-gray-500 uppercase">Lowest Balance</p>
             <p className={`text-3xl font-bold mt-2 ${lowestBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
               ${lowestBalance.toLocaleString()}
             </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
             <p className="text-sm font-medium text-gray-500 uppercase">Danger Date</p>
             <p className="text-3xl font-bold mt-2 text-gray-900">{dangerDate || "Safe!"}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
             <p className="text-sm font-medium text-gray-500 uppercase">AI Recommendation</p>
             <p className="text-sm mt-2 text-gray-700">{playbook}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-96 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Real Backend API Projection</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="bestCase" fill="#DBEAFE" stroke="none" />
                <Area type="monotone" dataKey="worstCase" fill="#ffffff" stroke="none" />
                <Line type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="worstCase" stroke="#93C5FD" strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="bestCase" stroke="#93C5FD" strokeDasharray="3 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Loading projection data...</div>
          )}
        </div>
      </div>
    </div>
  );
}
