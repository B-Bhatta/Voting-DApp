import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusMessage from "../components/StatusMessage";
import WalletConnect from "../components/WalletConnect";
import {
  describeTransactionError,
  getContract,
  validateNetwork,
} from "../services/blockchain";

export default function AdminDashboard() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [candidate, setCandidate] = useState({ name: "", party: "" });
  const [timeline, setTimeline] = useState({ start: "", end: "" });
  const [blockchainCandidates, setBlockchainCandidates] = useState([]);
  const [networkError, setNetworkError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadBlockchainData = useCallback(async () => {
    if (!account || networkError) return;
    try {
      await validateNetwork();
      const contract = getContract();
      const count = Number(await contract.methods.countCandidates().call());
      const loaded = [];
      for (let id = 1; id <= count; id += 1) {
        const value = await contract.methods.candidates(id).call();
        loaded.push({
          id: (value.id || value[0]).toString(),
          name: value.name || value[1],
          party: value.party || value[2],
          voteCount: (value.voteCount || value[3]).toString(),
        });
      }
      setBlockchainCandidates(loaded);
    } catch (error) {
      setTransactionStatus(describeTransactionError(error));
    }
  }, [account, networkError]);

  useEffect(() => {
    if (activeTab === "results") loadBlockchainData();
  }, [activeTab, loadBlockchainData]);

  const runTransaction = async (sendTransaction, confirmedMessage) => {
    if (!account) {
      setTransactionStatus({ type: "error", message: "Connect the owner wallet first." });
      return false;
    }
    setIsProcessing(true);
    setTransactionStatus({ type: "pending", message: "Confirm the transaction in MetaMask." });
    try {
      await validateNetwork();
      await sendTransaction();
      setTransactionStatus({ type: "confirmed", message: confirmedMessage });
      return true;
    } catch (error) {
      setTransactionStatus(describeTransactionError(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!candidate.name.trim() || !candidate.party.trim()) {
      setTransactionStatus({ type: "error", message: "Fill in the candidate name and party." });
      return;
    }
    const succeeded = await runTransaction(
      () =>
        getContract().methods
          .addCandidate(candidate.name.trim(), candidate.party.trim())
          .send({ from: account }),
      "Candidate added on-chain."
    );
    if (succeeded) {
      setCandidate({ name: "", party: "" });
      await loadBlockchainData();
    }
  };

  const handleSetDates = async () => {
    if (!timeline.start || !timeline.end) {
      setTransactionStatus({ type: "error", message: "Select both start and end dates." });
      return;
    }
    const startUnix = Math.floor(new Date(timeline.start).getTime() / 1000);
    const endUnix = Math.floor(new Date(timeline.end).getTime() / 1000);
    await runTransaction(
      () => getContract().methods.setDates(startUnix, endUnix).send({ from: account }),
      "Voting dates confirmed on-chain."
    );
  };

  const disabled = isProcessing || Boolean(networkError);

  const renderContent = () => {
    if (activeTab === "dashboard") {
      return (
        <section className="max-w-xl rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8">
          <h2 className="mb-6 text-xl font-bold text-emerald-400">Set Election Dates</h2>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-400">
              START DATE
              <input type="datetime-local" value={timeline.start} onChange={(event) => setTimeline({ ...timeline, start: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white" />
            </label>
            <label className="block text-xs font-bold text-slate-400">
              END DATE
              <input type="datetime-local" value={timeline.end} onChange={(event) => setTimeline({ ...timeline, end: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white" />
            </label>
            <button onClick={handleSetDates} disabled={disabled} className="w-full rounded-xl bg-emerald-600 py-3 font-bold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
              {isProcessing ? "Processing..." : "Update Timeline"}
            </button>
          </div>
        </section>
      );
    }

    if (activeTab === "candidates") {
      return (
        <section className="max-w-xl rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8">
          <h2 className="mb-6 text-xl font-bold text-blue-400">Register Candidate</h2>
          <input type="text" placeholder="Candidate Name" value={candidate.name} onChange={(event) => setCandidate({ ...candidate, name: event.target.value })} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white" />
          <input type="text" placeholder="Party Name" value={candidate.party} onChange={(event) => setCandidate({ ...candidate, party: event.target.value })} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-white" />
          <button onClick={handleAddCandidate} disabled={disabled} className="w-full rounded-xl bg-blue-600 py-3 font-bold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            {isProcessing ? "Processing..." : "Add Candidate"}
          </button>
        </section>
      );
    }

    return (
      <section className="max-w-2xl rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8">
        <h2 className="mb-6 text-xl font-bold text-indigo-400">Live Blockchain Results</h2>
        <div className="space-y-4">
          {blockchainCandidates.length === 0 ? <p className="text-slate-400">No candidates available.</p> : blockchainCandidates.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div><h3 className="font-bold text-white">{item.name}</h3><p className="text-xs text-slate-500">{item.party}</p></div>
              <strong className="text-2xl text-indigo-400">{item.voteCount}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar walletAddress={account} activeTab={activeTab} setActiveTab={setActiveTab} role="admin" />
      <main className="flex-1 p-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black italic text-white">SECURE<span className="text-blue-500">VOTE</span></h1>
          <WalletConnect onConnect={setAccount} onNetworkError={setNetworkError} />
        </header>
        {networkError && <StatusMessage status={{ type: "error", message: networkError }} />}
        <StatusMessage status={transactionStatus} />
        {renderContent()}
      </main>
    </div>
  );
}
