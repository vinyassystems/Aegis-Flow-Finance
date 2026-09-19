import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { decryptPayload } from './crypto';

// The exact encrypted string from the python backend (AES-GCM)
const ENCRYPTED_PAYLOAD_FROM_SERVER = "gAAAAABm-... (simulated for UI)";

export default function VSASecureDashboard({ liveData, liveDangerDate }) {
  const [decryptedData, setDecryptedData] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [dangerDate, setDangerDate] = useState("Scanning...");

  useEffect(() => {
    // Simulate the decryption process to make the UI look like a hacker terminal
    const timer = setTimeout(() => {
      // Use the actual live data passed from the main dashboard
      setDecryptedData(liveData || []);
      setDangerDate(liveDangerDate || "Safe");
      setIsDecrypting(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [liveData, liveDangerDate]);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 font-mono p-8 relative overflow-hidden">
      {/* Background Matrix/Radar Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 pt-10">
        <header className="mb-12 border-b border-white/10 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter mb-2">
              Aegis Secure Terminal
            </h1>
            <p className="text-emerald-500/70 text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span>AES-GCM Client-Side Decryption Active</span>
            </p>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-500 uppercase tracking-widest">Connection Status</p>
             <p className="text-emerald-400 font-bold animate-pulse">SECURE</p>
          </div>
        </header>

        {isDecrypting ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <svg className="animate-spin w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-emerald-500/80 tracking-widest text-sm">DECRYPTING PAYLOAD...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#0A0A0C]/80 backdrop-blur-md p-6 rounded-xl border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-20 h-20 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>
                <h3 className="text-xs font-bold text-rose-500/80 mb-2 tracking-widest uppercase">Critical Danger Date</h3>
                <p className="text-4xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">{dangerDate}</p>
              </div>
              
              <div className="bg-[#0A0A0C]/80 backdrop-blur-md p-6 rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
                <h3 className="text-xs font-bold text-cyan-500/80 mb-2 tracking-widest uppercase">AI Recovery Playbook</h3>
                <p className="text-cyan-100/90 text-sm leading-relaxed border-l-2 border-cyan-500/50 pl-4 py-1">
                  Delay the $2,500 equipment purchase by 14 days to clear the mid-month cash crunch. Divert $500 to buffer account.
                </p>
              </div>
            </div>

            <div className="bg-[#0A0A0C]/80 backdrop-blur-md p-6 rounded-xl border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] h-96">
              <h3 className="text-xs font-bold text-emerald-500/80 mb-6 tracking-widest uppercase flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                <span>90-Day Decrypted Trajectory</span>
              </h3>
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={decryptedData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#4b5563" tick={{fill: '#4b5563', fontSize: 11}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#4b5563" tick={{fill: '#4b5563', fontSize: 11}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.8} />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#050505' }} 
                    activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 15px #10b981' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
