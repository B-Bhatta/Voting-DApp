import React, { useCallback, useEffect, useState } from "react";
import { checkNetwork } from "../services/blockchain";

export default function WalletConnect({ onConnect, onNetworkError }) {
  const [address, setAddress] = useState("");
  const [connectionError, setConnectionError] = useState("");

  const updateNetwork = useCallback(async () => {
    try {
      onNetworkError(await checkNetwork());
    } catch (error) {
      onNetworkError(error.message || "Unable to read the current network.");
    }
  }, [onNetworkError]);

  useEffect(() => {
    if (!window.ethereum) {
      setConnectionError("MetaMask is not installed.");
      onNetworkError("MetaMask is not installed.");
      return undefined;
    }

    const handleAccountsChanged = (accounts) => {
      const nextAddress = accounts[0] || "";
      setAddress(nextAddress);
      onConnect(nextAddress);
    };
    const handleChainChanged = () => updateNetwork();

    window.ethereum.request({ method: "eth_accounts" }).then(handleAccountsChanged).catch(() => {});
    updateNetwork();
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [onConnect, onNetworkError, updateNetwork]);

  const connectWallet = async () => {
    setConnectionError("");
    if (!window.ethereum) {
      setConnectionError("Please install MetaMask to continue.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const nextAddress = accounts[0] || "";
      setAddress(nextAddress);
      onConnect(nextAddress);
      await updateNetwork();
    } catch (error) {
      setConnectionError(
        error?.code === 4001 ? "Wallet connection rejected." : error?.message || "Wallet connection failed."
      );
    }
  };

  const formatAddress = (value) => `${value.slice(0, 6)}...${value.slice(-4)}`;

  return (
    <div className="text-right">
      {address ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-mono text-sm text-emerald-300">
          {formatAddress(address)}
        </div>
      ) : (
        <button onClick={connectWallet} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">
          Connect Wallet
        </button>
      )}
      {connectionError && <p className="mt-2 max-w-xs text-xs text-red-400">{connectionError}</p>}
    </div>
  );
}
