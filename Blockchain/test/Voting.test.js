const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting", function () {
  let voting;
  let owner;
  let voter;
  let other;

  async function setActiveVotingWindow() {
    const now = await time.latest();
    await voting.setDates(now + 10, now + 1000);
    await time.increaseTo(now + 10);
  }

  beforeEach(async function () {
    [owner, voter, other] = await ethers.getSigners();
    voting = await ethers.deployContract("Voting");
    await voting.waitForDeployment();
  });

  it("allows the owner to add a 1-indexed candidate", async function () {
    await expect(voting.addCandidate("Alice", "Party A"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(1, "Alice", "Party A");
    expect(await voting.countCandidates()).to.equal(1);
  });

  it("rejects candidate creation by a non-owner", async function () {
    await expect(voting.connect(voter).addCandidate("Alice", "Party A"))
      .to.be.revertedWith("Not admin");
  });

  it("allows the owner to set dates", async function () {
    await expect(voting.setDates(100, 200))
      .to.emit(voting, "DatesSet")
      .withArgs(100, 200);
    expect(await voting.votingStart()).to.equal(100);
    expect(await voting.votingEnd()).to.equal(200);
  });

  it("rejects date changes by a non-owner", async function () {
    await expect(voting.connect(voter).setDates(100, 200))
      .to.be.revertedWith("Not admin");
  });

  it("rejects an invalid date range", async function () {
    await expect(voting.setDates(200, 100))
      .to.be.revertedWith("End must be after start");
  });

  it("freezes candidate creation once voting starts", async function () {
    const now = await time.latest();
    await voting.setDates(now + 10, now + 1000);
    await time.increaseTo(now + 10);
    await expect(voting.addCandidate("Alice", "Party A"))
      .to.be.revertedWith("Election already started");
  });

  it("accepts a valid vote", async function () {
    await voting.addCandidate("Alice", "Party A");
    await setActiveVotingWindow();
    await expect(voting.connect(voter).vote(1)).not.to.be.reverted;
  });

  it("rejects a duplicate wallet vote", async function () {
    await voting.addCandidate("Alice", "Party A");
    await setActiveVotingWindow();
    await voting.connect(voter).vote(1);
    await expect(voting.connect(voter).vote(1)).to.be.revertedWith("Already voted");
  });

  it("rejects an invalid candidate ID", async function () {
    await voting.addCandidate("Alice", "Party A");
    await setActiveVotingWindow();
    await expect(voting.connect(voter).vote(0)).to.be.revertedWith("Invalid candidate");
    await expect(voting.connect(other).vote(2)).to.be.revertedWith("Invalid candidate");
  });

  it("rejects a vote before the start", async function () {
    await voting.addCandidate("Alice", "Party A");
    const now = await time.latest();
    await voting.setDates(now + 100, now + 1000);
    await expect(voting.connect(voter).vote(1)).to.be.revertedWith("Voting not started");
  });

  it("rejects a vote after the end", async function () {
    await voting.addCandidate("Alice", "Party A");
    const now = await time.latest();
    await voting.setDates(now + 10, now + 20);
    await time.increaseTo(now + 21);
    await expect(voting.connect(voter).vote(1)).to.be.revertedWith("Voting ended");
  });

  it("updates the selected candidate vote count", async function () {
    await voting.addCandidate("Alice", "Party A");
    await setActiveVotingWindow();
    await voting.connect(voter).vote(1);
    const candidate = await voting.candidates(1);
    expect(candidate.voteCount).to.equal(1);
  });

  it("emits VoteCast with the voter and candidate ID", async function () {
    await voting.addCandidate("Alice", "Party A");
    await setActiveVotingWindow();
    await expect(voting.connect(voter).vote(1))
      .to.emit(voting, "VoteCast")
      .withArgs(voter.address, 1);
  });

  it("records gas used by the four primary operations", async function () {
    const deployReceipt = await voting.deploymentTransaction().wait();
    const addReceipt = await (await voting.addCandidate("Alice", "Party A")).wait();
    const now = await time.latest();
    const datesReceipt = await (await voting.setDates(now + 10, now + 1000)).wait();
    await time.increaseTo(now + 10);
    const voteReceipt = await (await voting.connect(voter).vote(1)).wait();

    console.log("Deploy gasUsed:", deployReceipt.gasUsed.toString());
    console.log("addCandidate gasUsed:", addReceipt.gasUsed.toString());
    console.log("setDates gasUsed:", datesReceipt.gasUsed.toString());
    console.log("vote gasUsed:", voteReceipt.gasUsed.toString());
  });
});
