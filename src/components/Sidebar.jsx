export default function Sidebar({ walletAddress }) {
  return (
    <div className="w-72 bg-slate-800/50 border-r border-slate-700/50 p-6 flex flex-col justify-between">
      <div>
        <div className="mb-10 px-2">
          <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
            SECURE<span className="text-blue-500">VOTE</span>
          </h2>
        </div>
        
        <nav className="space-y-2 text-sm font-semibold">
          <NavItem label="Dashboard" active />
          <NavItem label="Candidates" />
          <NavItem label="Voter Logs" />
          <NavItem label="Results" />
        </nav>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Connected Wallet</p>
        <p className="text-xs font-mono text-blue-400 break-all">
          {walletAddress ? walletAddress : "No Wallet Linked"}
        </p>
      </div>
    </div>
  );
}

function NavItem({ label, active = false }) {
  return (
    <div className={`p-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`}>
      {label}
    </div>
  );
}