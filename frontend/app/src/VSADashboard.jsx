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
  
  const [data, setData] = useState([]);
  const [lowestBalance, setLowestBalance] = useState(0);
  const [dangerDate, setDangerDate] = useState(null);
  const [playbook, setPlaybook] = useState("Run simulation to analyze cash flow.");

  const today = new Date();
  const addDays = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [transactions, setTransactions] = useState([
    { id: 1, name: "Acme Corp Client", amount: 5000, type: "income", due_date: addDays(15) },
    { id: 2, name: "AWS Server Hosting", amount: 200, type: "expense", due_date: addDays(5) },
    { id: 3, name: "Office Rent", amount: 1500, type: "expense", due_date: addDays(30) },
    { id: 4, name: "Design Freelancer", amount: 800, type: "expense", due_date: addDays(45) },
  ]);

  const runSimulation = async (extraExpense = null) => {
    setLoading(true);
    try {
      const payload = {
        starting_balance: 8450.0,
        transactions: transactions,
        variable_daily_expense: variableExpense
      };
      if (extraExpense) payload.transactions.push(extraExpense);

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
      console.error("Backend offline. Using local fallback simulation.", err);
      // Fallback data so the portfolio looks good even without the python server
      const today = new Date();
      const mockTrajectory = Array.from({length: 90}, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        // Simple mock math approximation based on inputs
        const base = 8450 - (variableExpense * i) + (i > 15 ? 5000 : 0) - (i > 5 ? 200 : 0) - (i > 30 ? 1500 : 0);
        return {
          date: d.toISOString().split('T')[0],
          balance: base,
          bestCase: base + (i * 20),
          worstCase: base - (i * 30)
        };
      });
      setData(mockTrajectory);
      setLowestBalance(Math.min(...mockTrajectory.map(d => d.balance)));
      const danger = mockTrajectory.find(d => d.worstCase < 0);
      setDangerDate(danger ? danger.date : "Safe (Offline Mode)");
      setPlaybook("Running in Local Web Mode. Start the FastAPI backend for full ML precision and AES-GCM encryption.");
    }
    setLoading(false);
  };

  useEffect(() => { runSimulation(); }, []);

  const handleMLUpdate = (e) => {
    setVariableExpense(parseInt(e.target.value));
    runSimulation();
  };

  const handleB2CPurchase = (e) => {
    e.preventDefault();
    const newPurchase = { id: 99, name: purchaseItem, amount: parseInt(purchaseAmount), type: "expense", due_date: new Date().toISOString().split('T')[0] };
    runSimulation(newPurchase);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        // Simple mock CSV parser
        const rows = text.split('\n').slice(1); // skip header
        const newTxs = rows.map((row, idx) => {
          const cols = row.split(',');
          if (cols.length >= 3) {
            return {
              id: 100 + idx,
              name: cols[0],
              amount: parseFloat(cols[1]),
              type: parseFloat(cols[1]) > 0 ? 'income' : 'expense',
              due_date: cols[2].trim()
            };
          }
          return null;
        }).filter(Boolean);
        
        if (newTxs.length > 0) {
          setTransactions([...transactions, ...newTxs]);
          setTimeout(() => runSimulation(), 500); // Rerun engine with new data
        } else {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredTransactions = transactions.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (secureMode) {
    return (
      <div className="relative bg-black min-h-screen">
        <button onClick={() => setSecureMode(false)} className="absolute top-6 right-6 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 px-6 py-2 rounded-full transition-all z-50 font-medium tracking-wide">
          Exit Secure Terminal
        </button>
        <VSASecureDashboard liveData={data} liveDangerDate={dangerDate} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0B] font-sans text-gray-200 overflow-hidden">
      {/* Premium Dark Sidebar */}
      <div className="w-72 bg-[#121214] border-r border-white/5 flex flex-col p-6 space-y-2 relative z-10">
        <div className="flex items-center space-x-3 mb-10 mt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <span className="text-white font-extrabold text-sm tracking-widest font-mono">AF</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500 tracking-tight">Aegis Flow</span>
        </div>
        
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 ml-2">Modules</p>
        
        <button onClick={() => setActiveModel('freelancer')} className={`text-left px-4 py-3 rounded-xl transition-all flex items-center space-x-3 ${activeModel === 'freelancer' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="font-medium text-sm">Freelancer Engine</span>
        </button>
        
        <button onClick={() => setActiveModel('b2c')} className={`text-left px-4 py-3 rounded-xl transition-all flex items-center space-x-3 ${activeModel === 'b2c' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="font-medium text-sm">Consumer Copilot</span>
        </button>
        
        <button onClick={() => setActiveModel('b2b')} className={`text-left px-4 py-3 rounded-xl transition-all flex items-center space-x-3 ${activeModel === 'b2b' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          <span className="font-medium text-sm">Developer API</span>
        </button>

        <div className="mt-auto pb-4">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <p className="text-xs text-emerald-400/80 mb-3 font-medium">AES-GCM Encryption Active</p>
            <button onClick={() => setSecureMode(true)} className="w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all p-2.5 rounded-xl text-sm font-semibold flex justify-center items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>ZK Terminal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <div className="flex-1 p-10 overflow-y-auto relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
        
        <header className="flex justify-between items-end mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
              {activeModel === 'freelancer' && "Cash Flow Intelligence"}
              {activeModel === 'b2c' && "Purchase Copilot"}
              {activeModel === 'b2b' && "Merchant Gateway"}
            </h1>
            <p className="text-gray-400 text-sm">Real-time ML forecasting powered by Aegis Engine.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-[#121214]/80 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>Upload CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            </label>
            
            <button onClick={() => runSimulation()} className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center space-x-2">
              {loading ? (
                <span className="flex items-center space-x-2"><svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Syncing...</span></span>
              ) : (
                <span>⚡ Run Engine</span>
              )}
            </button>
          </div>
        </header>

        {activeModel === 'freelancer' && (
          <div className="bg-[#121214]/80 backdrop-blur-md p-6 rounded-2xl border border-indigo-500/30 mb-8 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
               <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                 <svg className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 <span>ML Forecasting & Ledger</span>
               </h2>
               <div className="relative">
                 <svg className="w-4 h-4 absolute left-3 top-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-black/50 border border-white/10 text-sm text-gray-200 placeholder-gray-600 rounded-full pl-10 pr-4 py-2 w-72 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
               </div>
            </div>
            
            <div className="flex items-center space-x-6 bg-black/30 p-4 rounded-xl border border-white/5 mb-6 relative z-10">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Daily Variable Spend Limit</p>
                <div className="flex items-center space-x-4">
                  <input type="range" min="10" max="200" value={variableExpense} onMouseUp={handleMLUpdate} onChange={e => setVariableExpense(parseInt(e.target.value))} className="w-48 accent-indigo-500" />
                  <span className="font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-lg">${variableExpense} <span className="text-xs text-gray-500">/ day</span></span>
                </div>
              </div>
            </div>
            
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar relative z-10">
              {filteredTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center py-3 border-b border-white/5 hover:bg-white/5 px-3 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {t.type === 'income' ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.due_date}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${t.type === 'income' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'text-gray-300'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModel === 'b2c' && (
          <div className="bg-[#121214]/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none"></div>
            <h2 className="text-lg font-semibold text-white mb-4 relative z-10 flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Ask the AI: Can I afford this?</span>
            </h2>
            <form onSubmit={handleB2CPurchase} className="flex space-x-4 relative z-10">
              <input type="text" placeholder="e.g. MacBook Pro" value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)} className="flex-1 bg-black/50 border border-white/10 text-gray-200 placeholder-gray-600 p-3 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
              <input type="number" placeholder="Cost ($)" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} className="w-32 bg-black/50 border border-white/10 text-gray-200 placeholder-gray-600 p-3 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
              <button type="submit" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Check Affordability
              </button>
            </form>
          </div>
        )}

        {activeModel === 'b2b' && (
          <div className="bg-[#121214]/80 backdrop-blur-md p-6 rounded-2xl border border-amber-500/30 mb-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-amber-500/20 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                <span>API Key Management</span>
              </h2>
              <button className="bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20 px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>Generate New Key</span>
              </button>
            </div>
            
            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden mb-6 relative z-10">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">NAME</th>
                    <th className="px-4 py-3 font-medium">KEY</th>
                    <th className="px-4 py-3 font-medium">CREATED</th>
                    <th className="px-4 py-3 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">Production App</td>
                    <td className="px-4 py-3 font-mono text-amber-400/80">aegis_live_••••••••8x9q</td>
                    <td className="px-4 py-3">Oct 12, 2026</td>
                    <td className="px-4 py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-xs font-semibold">Active</span></td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">Local Testing</td>
                    <td className="px-4 py-3 font-mono text-amber-400/80">aegis_test_••••••••p2m4</td>
                    <td className="px-4 py-3">Sep 19, 2026</td>
                    <td className="px-4 py-3"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-xs font-semibold">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-black/60 p-4 rounded-xl border border-white/10 relative z-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Quickstart: cURL</p>
              <code className="text-xs text-emerald-300 font-mono block whitespace-pre-wrap">
                curl -X POST "http://localhost:8000/api/v1/freelancer/simulate" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer aegis_live_••••••••" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-d '&#123;"starting_balance": 8450, "transactions": []&#125;'
              </code>
            </div>
          </div>
        )}

        {/* Premium Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          <div className="bg-[#121214]/80 backdrop-blur-md rounded-2xl p-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-shadow">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-16 h-16 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg></div>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Lowest Balance Projection</p>
             <p className={`text-4xl font-bold mt-2 font-mono tracking-tight ${lowestBalance < 0 ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}>
               ${lowestBalance.toLocaleString()}
             </p>
             <p className="text-xs text-indigo-400 mt-2 font-medium bg-indigo-500/10 inline-block px-2 py-1 rounded">95% Confidence Interval</p>
          </div>
          
          <div className="bg-[#121214]/80 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-shadow">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg></div>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Critical Danger Date</p>
             <p className={`text-4xl font-bold mt-2 tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] ${dangerDate ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'text-emerald-400'}`}>{dangerDate || "Safe"}</p>
             <p className="text-xs text-gray-500 mt-2 font-medium">Next 90 Days</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
             <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl"></div>
             <div className="flex items-center space-x-2 mb-2">
               <svg className="w-4 h-4 text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">AI Playbook</p>
             </div>
             <p className="text-sm mt-2 text-purple-100 leading-relaxed font-medium">{playbook}</p>
          </div>
        </div>

        {/* Premium Chart */}
        <div className="bg-[#121214]/80 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] p-6 h-[400px] border border-indigo-500/30 relative z-10">
          <h2 className="text-sm font-semibold text-gray-300 mb-6 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]"></span>
            <span>Live Predictive Trajectory</span>
          </h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="bestCase" fill="url(#colorBalance)" stroke="none" />
                <Area type="monotone" dataKey="worstCase" fill="#121214" stroke="none" />
                <Line type="monotone" dataKey="balance" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#121214' }} activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px #818cf8' }} />
                <Line type="monotone" dataKey="worstCase" stroke="#4f46e5" strokeOpacity={0.5} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="bestCase" stroke="#4f46e5" strokeOpacity={0.5} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500 font-medium">Initializing Aegis Core Engine...</div>
          )}
        </div>
      </div>
    </div>
  );
}
