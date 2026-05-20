import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import WalletConnect from "../components/WalletConnect";
import { getContract } from "../services/blockchain";

export default function VoterPage() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("vote");

  const [candidates, setCandidates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // =========================
  // LOAD CANDIDATES (FIXED)
  // =========================
  const loadBallotData = async () => {
    if (!account) return;

    try {
      setLoadingData(true);

      const contract = getContract();

      
      const count = Number(
        await contract.methods.countCandidates().call()
      );

      console.log("Candidate Count:", count);

      const tempArray = [];

      for (let i = 1; i <= count; i++) {
        try {
          // ✅ FIXED: mapping getter
          const res = await contract.methods
            .candidates(i)
            .call();

          console.log("Candidate:", res);

          tempArray.push({
            id: Number(res.id || res[0]),
            name: res.name || res[1],
            party: res.party || res[2],
            voteCount: Number(res.voteCount || res[3]),
          });

        } catch (err) {
          console.log(`Error fetching candidate ${i}:`, err);
        }
      }

      setCandidates(tempArray);

    } catch (err) {
      console.error("Error loading ballot:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // =========================
  // LOAD WHEN WALLET CONNECTS
  // =========================
  useEffect(() => {
    if (account) {
      loadBallotData();
    }
  }, [account]);

  // =========================
  // CAST VOTE
  // =========================
  const handleCastVote = async (candidateId) => {
    if (!account) {
      return alert("Connect wallet first");
    }

    try {
      setIsProcessing(true);

      const contract = getContract();

      await contract.methods
        .vote(candidateId)
        .send({
          from: account,
          gas: 300000,
        });

      alert("Vote Cast Successfully!");

      await loadBallotData();

    } catch (err) {
      console.error(err);

      alert(
        "Voting Failed: " +
          (err?.message || "Unknown Error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex min-h-screen bg-[#0F172A]">

      <Sidebar
        walletAddress={account}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="voter"
      />

      <main className="flex-1 p-10">

        <header className="flex justify-between mb-10 items-center">

          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            SECURE
            <span className="text-blue-500">VOTE</span>
          </h1>

          <WalletConnect onConnect={setAccount} />

        </header>

        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 max-w-2xl">

          <h2 className="text-xl font-bold mb-2 text-blue-400">
            Vote Here
          </h2>

          <p className="text-slate-400 mb-6">
            Select one candidate and submit your vote.
          </p>

          {loadingData ? (
            <p className="text-slate-400">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p className="text-slate-400">No candidates available.</p>
          ) : (
            <div className="space-y-4">

              {candidates.map((c, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 flex justify-between items-center"
                >

                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {c.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {c.party}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCastVote(c.id)}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl text-white font-bold"
                  >
                    {isProcessing ? "Processing..." : "Vote"}
                  </button>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}