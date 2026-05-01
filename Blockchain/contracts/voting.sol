// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint public countCandidates;
    uint256 public votingStart;
    uint256 public votingEnd;

    event CandidateAdded(uint id, string name, string party);
    event Voted(address voter, uint candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory name, string memory party)
        public
        onlyAdmin
        returns (uint)
    {
        countCandidates++;
        candidates[countCandidates] = Candidate(
            countCandidates,
            name,
            party,
            0
        );
        emit CandidateAdded(countCandidates, name, party);
        return countCandidates;
    }

    function vote(uint candidateID) public {
        require(
            block.timestamp >= votingStart &&
            block.timestamp <= votingEnd,
            "Voting not active"
        );
        require(candidateID > 0 && candidateID <= countCandidates, "Invalid candidate");
        require(!voters[msg.sender], "Already voted");

        voters[msg.sender] = true;
        candidates[candidateID].voteCount++;
        emit Voted(msg.sender, candidateID);
    }

    function setDates(uint256 _start, uint256 _end) public onlyAdmin {
        require(votingStart == 0 && votingEnd == 0, "Already set");
        require(_start > block.timestamp, "Start must be future");
        require(_end > _start, "End after start");

        votingStart = _start;
        votingEnd = _end;
    }

    function getCandidate(uint id)
        public
        view
        returns (uint, string memory, string memory, uint)
    {
        Candidate memory c = candidates[id];
        return (c.id, c.name, c.party, c.voteCount);
    }
}
