import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import WalletConnect from "../components/WalletConnect";
import api from "../services/api";

export default function AdminDashboard() {
  const [wallet, setWallet] = useState("");
  const [voterStats, setVoterStats] = useState({ total: 0, participated: 0 });
  const [candidate, setCandidate] = useState({ name: "", party: "" });
  const [timeWindow, setTimeWindow] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/voter-stats");
        setVoterStats(res.data); 
      } catch (err) {
        console.error("Failed to fetch voter stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200">
      <Sidebar walletAddress={wallet} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Control <span className="text-blue-500">Center</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage election state and candidate registry.</p>
          </div>
          <WalletConnect onConnect={setWallet} />
        </header>

        {/* System Stats Section - Focused solely on Participation */}
        <div className="mb-10 max-w-sm">
          <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider text-center md:text-left">Voter Participation</p>
            <p className="text-3xl font-mono mt-2 text-white text-center md:text-left">
               {voterStats.participated} <span className="text-slate-600">/</span> {voterStats.total}
            </p>
            <div className="mt-4 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
               <div 
                 className="bg-blue-500 h-full transition-all duration-1000" 
                 style={{ width: `${(voterStats.participated / voterStats.total) * 100}%` }}
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidate Registration Form */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Register Candidate
            </h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" 
                onChange={(e) => setCandidate({...candidate, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Political Party" 
                className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" 
                onChange={(e) => setCandidate({...candidate, party: e.target.value})}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all">
                Add to Blockchain Registry
              </button>
            </div>
          </div>

          {/* Voting Window Control */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Voting Window
            </h2>
            <div className="space-y-4">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Start Time</label>
                <input 
                  type="datetime-local" 
                  value={timeWindow.start}
                  onChange={(e) => setTimeWindow({ ...timeWindow, start: e.target.value })}
                  className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white" 
                />
              </div>
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">End Time</label>
                <input 
                  type="datetime-local" 
                  value={timeWindow.end}
                  onChange={(e) => setTimeWindow({ ...timeWindow, end: e.target.value })}
                  className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white" 
                />
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                Update Election Timeline
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}