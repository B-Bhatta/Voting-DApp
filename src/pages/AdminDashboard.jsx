import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import WalletConnect from "../components/WalletConnect";

import { getContract } from "../services/blockchain";

export default function AdminDashboard() {

  const [account, setAccount] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");

  const [candidate, setCandidate] = useState({
    name: "",
    party: ""
  });

  const [timeline, setTimeline] = useState({
    start: "",
    end: ""
  });

  const [blockchainCandidates, setBlockchainCandidates] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);

  // ====================================
  // LOAD BLOCKCHAIN DATA
  // ====================================
  const loadBlockchainData = async () => {

    try {

      const contract = getContract();

      // IMPORTANT:
      // Using public mapping getter
      // NOT getCandidate()

      const count = Number(
        await contract.methods.countCandidates().call()
      );

      console.log("Candidate Count:", count);

      if (count === 0) {
        setBlockchainCandidates([]);
        return;
      }

      const candidatesArray = [];

      for (let i = 1; i <= count; i++) {

        try {

          const c = await contract.methods
            .candidates(i)
            .call();

          console.log("Candidate:", c);

          candidatesArray.push({
            id: c.id?.toString() || c[0].toString(),
            name: c.name || c[1],
            party: c.party || c[2],
            voteCount:
              c.voteCount?.toString() ||
              c[3].toString()
          });

        } catch (candidateErr) {

          console.error(
            `Error fetching candidate ${i}:`,
            candidateErr
          );

        }
      }

      setBlockchainCandidates(candidatesArray);

    } catch (err) {

      console.error(
        "Error loading ledger data:",
        err
      );

    }
  };

  // ====================================
  // LOAD WHEN ACCOUNT/TAB CHANGES
  // ====================================
  useEffect(() => {

    if (
      account &&
      (
        activeTab === "dashboard" ||
        activeTab === "results"
      )
    ) {
      loadBlockchainData();
    }

    // eslint-disable-next-line
  }, [account, activeTab]);

  // ====================================
  // ADD CANDIDATE
  // ====================================
  const handleAddCandidate = async () => {

    if (!candidate.name || !candidate.party) {
      return alert("Fill all fields");
    }

    if (!account) {
      return alert("Connect wallet first");
    }

    setIsProcessing(true);

    try {

      const contract = getContract();

      await contract.methods
        .addCandidate(
          candidate.name.trim(),
          candidate.party.trim()
        )
        .send({
          from: account,
          gas: 500000
        });

      alert("Candidate Added!");

      setCandidate({
        name: "",
        party: ""
      });

      await loadBlockchainData();

    } catch (err) {

      console.error(err);

      alert(
        "Blockchain Error: " +
        (err?.message || "Unknown Error")
      );

    } finally {

      setIsProcessing(false);

    }
  };

  // ====================================
  // SET DATES
  // ====================================
  const handleSetDates = async () => {

    if (!timeline.start || !timeline.end) {
      return alert("Select both dates");
    }

    setIsProcessing(true);

    try {

      const startUnix = Math.floor(
        new Date(timeline.start).getTime() / 1000
      );

      const endUnix = Math.floor(
        new Date(timeline.end).getTime() / 1000
      );

      const contract = getContract();

      await contract.methods
        .setDates(startUnix, endUnix)
        .send({
          from: account,
          gas: 300000
        });

      alert("Voting dates updated!");

    } catch (err) {

      console.error(err);

      alert(
        "Failed to update dates"
      );

    } finally {

      setIsProcessing(false);

    }
  };

  // ====================================
  // UI
  // ====================================
  const renderContent = () => {

    switch (activeTab) {

      // ====================================
      // DASHBOARD
      // ====================================
      case "dashboard":

        return (

          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 max-w-xl">

            <h2 className="text-xl font-bold mb-6 text-emerald-400">
              Set Election Dates
            </h2>

            <div className="space-y-4">

              <div>

                <label className="text-xs font-bold text-slate-400 block mb-1">
                  START DATE
                </label>

                <input
                  type="datetime-local"
                  className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
                  onChange={(e) =>
                    setTimeline({
                      ...timeline,
                      start: e.target.value
                    })
                  }
                />

              </div>

              <div>

                <label className="text-xs font-bold text-slate-400 block mb-1">
                  END DATE
                </label>

                <input
                  type="datetime-local"
                  className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
                  onChange={(e) =>
                    setTimeline({
                      ...timeline,
                      end: e.target.value
                    })
                  }
                />

              </div>

              <button
                onClick={handleSetDates}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold"
              >
                {
                  isProcessing
                    ? "Processing..."
                    : "Update Timeline"
                }
              </button>

            </div>

          </div>

        );

      // ====================================
      // CANDIDATES
      // ====================================
      case "candidates":

        return (

          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 max-w-xl">

            <h2 className="text-xl font-bold mb-6 text-blue-400">
              Register Candidate
            </h2>

            <input
              type="text"
              placeholder="Candidate Name"
              value={candidate.name}
              className="w-full p-3 mb-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
              onChange={(e) =>
                setCandidate({
                  ...candidate,
                  name: e.target.value
                })
              }
            />

            <input
              type="text"
              placeholder="Party Name"
              value={candidate.party}
              className="w-full p-3 mb-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white"
              onChange={(e) =>
                setCandidate({
                  ...candidate,
                  party: e.target.value
                })
              }
            />

            <button
              onClick={handleAddCandidate}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold"
            >
              {
                isProcessing
                  ? "Processing..."
                  : "Add Candidate"
              }
            </button>

          </div>

        );

      // ====================================
      // RESULTS
      // ====================================
      case "results":

        return (

          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 max-w-2xl">

            <h2 className="text-xl font-bold mb-2 text-indigo-400">
              Election Results
            </h2>

            <p className="text-xs text-slate-400 mb-6">
              Live Blockchain Vote Count
            </p>

            <div className="space-y-4">

              {
                blockchainCandidates.length === 0 ? (

                  <p className="text-sm font-mono text-slate-500 text-center py-4">
                    No candidates available.
                  </p>

                ) : (

                  blockchainCandidates.map((c, index) => (

                    <div
                      key={index}
                      className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center"
                    >

                      <div>

                        <h4 className="font-bold text-white text-base">
                          {c.name}
                        </h4>

                        <p className="text-xs text-slate-500 font-mono">
                          {c.party}
                        </p>

                      </div>

                      <div className="text-right">

                        <span className="text-2xl font-black font-mono text-indigo-400">
                          {c.voteCount}
                        </span>

                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                          Votes
                        </p>

                      </div>

                    </div>

                  ))

                )
              }

            </div>

          </div>

        );

      default:

        return (
          <div className="p-10 text-center text-slate-500 font-mono">
            Select an option
          </div>
        );
    }
  };

  // ====================================
  // MAIN
  // ====================================
  return (

    <div className="flex min-h-screen bg-[#0F172A]">

      <Sidebar
        walletAddress={account}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="admin"
      />

      <main className="flex-1 p-10">

        <header className="flex justify-between mb-10 items-center">

          <h1 className="text-3xl font-black text-white italic tracking-tighter">
            SECURE
            <span className="text-blue-500">
              VOTE
            </span>
          </h1>

          <WalletConnect
            onConnect={setAccount}
          />

        </header>

        {renderContent()}

      </main>

    </div>
  );
}