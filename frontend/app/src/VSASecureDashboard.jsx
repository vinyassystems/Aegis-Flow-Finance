import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateClientKey, decryptClientData } from './crypto';

export default function VSASecureDashboard({ encryptedServerPayload, iv }) {
  const [data, setData] = useState(null);
  const [playbook, setPlaybook] = useState('');
  
  // Decrypt data on the client side when the component mounts
  useEffect(() => {
    async function loadSecureData() {
      try {
        // In production, prompt user for vault password to derive key
        const key = await generateClientKey("user_master_password"); 
        
        // Mock fallback if no payload is provided for testing UI
        if (!encryptedServerPayload) {
           setData([
             { date: 'Nov 01', balance: 4500 },
             { date: 'Nov 15', balance: 2000 },
             { date: 'Dec 01', balance: -500 }, // Danger!
             { date: 'Dec 15', balance: 3000 }
           ]);
           setPlaybook("Delay the $2,500 equipment purchase by 14 days to clear the December cash crunch.");
           return;
        }

        const decrypted = await decryptClientData(key, encryptedServerPayload, iv);
        setData(decrypted.timeSeriesData);
        setPlaybook(decrypted.recoveryPlaybook);
      } catch (e) {
        console.error("Decryption failed", e);
      }
    }
    loadSecureData();
  }, [encryptedServerPayload, iv]);

  if (!data) return <div className="p-8 animate-pulse text-blue-500">Decrypting Secure Enclave...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-400">VSA Secure Terminal</h1>
        <p className="text-gray-400 text-sm mt-1">🔒 End-to-End Encrypted Cash Flow Predictor</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
           <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Danger Date Detected</h2>
           <p className="text-4xl font-bold mt-2">Dec 01, 2026</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg border-t-4 border-t-green-500">
           <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">AI Recovery Playbook</h2>
           <p className="text-md mt-2 text-gray-300">{playbook}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg h-96">
        <h2 className="text-lg font-bold text-gray-200 mb-4">90-Day Decrypted Trajectory</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Zero Balance', fill: '#EF4444' }} />
            <Line type="monotone" dataKey="balance" stroke="#60A5FA" strokeWidth={3} dot={{ r: 4, fill: '#60A5FA' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
