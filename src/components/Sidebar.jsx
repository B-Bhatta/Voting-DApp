import React from 'react';

export default function Sidebar({ walletAddress, activeTab, setActiveTab, role = "voter" }) {
  
  // Define navigation menus dynamically based on user role
  const adminItems = [
    { id: 'dashboard', label: 'Timeline Settings' },
    { id: 'candidates', label: 'Register Candidates' },
    { id: 'results', label: 'Live Results' },
  ];

  const voterItems = [
    { id: 'candidates', label: 'Digital Ballot Sheet' } // Keeps 'candidates' id to load the ballot on the voter page
  ];

  // Pick the right menu array
  const menuItems = role === "admin" ? adminItems : voterItems;

  return (
    <div className="w-72 bg-slate-800/50 border-r border-slate-700/50 p-6 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="mb-10 px-2">
          <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
            SECURE<span className="text-blue-500">VOTE</span>
          </h2>
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-slate-500 bg-slate-900/40 px-2 py-0.5 rounded-md border border-slate-700/30">
            {role} Panel
          </span>
        </div>
        
        <nav className="space-y-2 text-sm font-semibold">
          {menuItems.map((item) => (
            <NavItem 
              key={item.id}
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* Wallet Info Box */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Connected Wallet</p>
        <p className="text-xs font-mono text-blue-400 break-all bg-slate-950/50 p-2 rounded-lg border border-blue-900/30">
          {walletAddress ? walletAddress : "No Wallet Linked"}
        </p>
      </div>
    </div>
  );
}

function NavItem({ label, active = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${active ? 'bg-white' : 'bg-transparent'}`} />
      {label}
    </div>
  );
}