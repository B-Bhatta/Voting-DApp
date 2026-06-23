import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatusMessage from "../components/StatusMessage";
import WalletConnect from "../components/WalletConnect";
import {
  describeTransactionError,
  getContract,
  validateNetwork,
} from "../services/blockchain";

export default function VoterPage() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("candidates");
  const [candidates, setCandidates] = useState([]);
  const [networkError, setNetworkError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const loadBallotData = useCallback(async () => {
    if (!account || networkError) return;
    setLoadingData(true);
    try {
      await validateNetwork();
      const contract = getContract();
      const count = Number(await contract.methods.countCandidates().call());
      const loaded = [];
      for (let id = 1; id <= count; id += 1) {
        const value = await contract.methods.candidates(id).call();
        loaded.push({
          id: Number(value.id || value[0]),
          name: value.name || value[1],
          party: value.party || value[2],
        });
      }
      setCandidates(loaded);
    } catch (error) {
      setTransactionStatus(describeTransactionError(error));
    } finally {
      setLoadingData(false);
    }
  }, [account, networkError]);

  useEffect(() => {
    loadBallotData();
  }, [loadBallotData]);

  const handleCastVote = async (candidateId) => {
    if (!account) {
      setTransactionStatus({ type: "error", message: "Connect your wallet first." });
      return;
    }
    setIsProcessing(true);
    setTransactionStatus({ type: "pending", message: "Confirm the vote in MetaMask." });
    try {
      await validateNetwork();
      await getContract().methods.vote(candidateId).send({ from: account });
      setTransactionStatus({ type: "confirmed", message: "Vote confirmed on-chain." });
      await loadBallotData();
    } catch (error) {
      setTransactionStatus(describeTransactionError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar walletAddress={account} activeTab={activeTab} setActiveTab={setActiveTab} role="voter" />
      <main className="flex-1 p-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black italic text-white">SECURE<span className="text-blue-500">VOTE</span></h1>
          <WalletConnect onConnect={setAccount} onNetworkError={setNetworkError} />
        </header>
        {networkError && <StatusMessage status={{ type: "error", message: networkError }} />}
        <StatusMessage status={transactionStatus} />
        <section className="max-w-2xl rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8">
          <h2 className="mb-2 text-xl font-bold text-blue-400">Digital Ballot</h2>
          <p className="mb-6 text-slate-400">Select one candidate and confirm the wallet transaction.</p>
          {loadingData ? <p className="text-slate-400">Loading candidates...</p> : candidates.length === 0 ? <p className="text-slate-400">No candidates available.</p> : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 p-5">
                  <div><h3 className="text-lg font-bold text-white">{candidate.name}</h3><p className="text-sm text-slate-400">{candidate.party}</p></div>
                  <button onClick={() => handleCastVote(candidate.id)} disabled={isProcessing || Boolean(networkError)} className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {isProcessing ? "Processing..." : "Vote"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
