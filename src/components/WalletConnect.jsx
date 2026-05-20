import React, { useState, useEffect } from "react";

export default function WalletConnect({ onConnect }) {
  const [address, setAddress] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // 1. Initial Connection Check & Event Listener
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect(accounts[0]);
        }
      }
    };

    checkConnection();

    // Listen for account changes (important for JEC Demo)
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect(accounts[0]);
        } else {
          setAddress("");
          onConnect("");
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install Rabby or MetaMask to participate in this vote.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      onConnect(accounts[0]);
    } catch (error) {
      console.error("Connection rejected");
    }
  };

  const formatAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="flex items-center gap-4">
      {!address ? (
        <button
          onClick={connectWallet}
          className="relative group overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/40 active:scale-95 flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6" />
          </svg>
          Connect Wallet
        </button>
      ) : (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 border border-slate-700/50 rounded-2xl transition-all cursor-default"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none mb-1">
              Active Wallet
            </span>
            <span className="text-sm font-mono font-bold text-blue-400">
              {formatAddress(address)}
            </span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-inner" />
          
          {isHovered && (
            <button 
              onClick={() => { setAddress(""); onConnect(""); }}
              className="ml-2 text-xs text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
}