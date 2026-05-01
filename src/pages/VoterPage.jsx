import React, { useState } from "react";
import WalletConnect from "../components/WalletConnect";

export default function VoterPage() {
  const [wallet, setWallet] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [candidates] = useState([
    { id: 1, name: "Hussian ", party: "Islamic Liberty" },
    { id: 2, name: "Ali g", party: "Tech hindu" },
    { id: 3, name: "Liza ", party: "Global Green" },
  ]);

  const handleVote = () => {
    if (!selectedCandidate || !wallet) return;
    setIsSubmitting(true);
    
    // Logic for Ethers.js transaction would go here
    setTimeout(() => {
      alert(`Vote successfully cast for ${selectedCandidate.name}`);
      setIsSubmitting(false);
      setSelectedCandidate(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200">
      {/* Subtle Background Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(30,58,138,0.15)_0%,_rgba(15,23,42,1)_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight">
              Cast Your <span className="text-blue-500">Vote</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Selection is finalized via Blockchain</p>
          </div>
          <WalletConnect onConnect={setWallet} />
        </header>

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <button
              key={c.id}
              disabled={!wallet}
              onClick={() => setSelectedCandidate(c)}
              className={`relative flex flex-col items-center p-10 rounded-[2.5rem] border-2 transition-all duration-300 group ${
                !wallet ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              } ${
                selectedCandidate?.id === c.id
                  ? "bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/10"
                  : "bg-slate-800/40 border-slate-700 hover:border-slate-500"
              }`}
            >
              {/* Profile Avatar  */}
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 transition-all border ${
                selectedCandidate?.id === c.id 
                ? "bg-blue-600 text-white border-blue-400" 
                : "bg-slate-900 text-slate-500 border-slate-700 group-hover:border-slate-500"
              }`}>
                {c.name.charAt(0)}
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{c.name}</h2>
              <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">{c.party}</p>

              {/* Selection Indicator */}
              {selectedCandidate?.id === c.id && (
                <div className="absolute top-4 right-4 text-blue-500 animate-in">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Confirmation Footer */}
        {selectedCandidate && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-in">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2rem] shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Target Selection</p>
                  <p className="text-white font-bold">{selectedCandidate.name}</p>
                </div>
                <button
                  onClick={handleVote}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Confirm Vote"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}