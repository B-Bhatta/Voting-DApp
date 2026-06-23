// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Voting {

    address public owner;

    event CandidateAdded(uint indexed id, string name, string party);
    event DatesSet(uint start, uint end);
    event VoteCast(address indexed voter, uint indexed candidateId);

    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    uint public countCandidates;

    uint public votingStart;
    uint public votingEnd;

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not admin");
        _;
    }

    // =========================
    // ADD CANDIDATE
    // =========================
    function addCandidate(
        string memory _name,
        string memory _party
    ) public onlyOwner {

        require(
            votingStart == 0 || block.timestamp < votingStart,
            "Election already started"
        );

        countCandidates++;

        candidates[countCandidates] = Candidate(
            countCandidates,
            _name,
            _party,
            0
        );

        emit CandidateAdded(countCandidates, _name, _party);
    }

    // =========================
    // SET DATES
    // =========================
    function setDates(
        uint _start,
        uint _end
    ) public onlyOwner {

        require(_end > _start, "End must be after start");

        votingStart = _start;
        votingEnd = _end;

        emit DatesSet(_start, _end);
    }

    // =========================
    // VOTE
    // =========================
    function vote(uint _id) public {

        require(
            block.timestamp >= votingStart,
            "Voting not started"
        );

        require(
            block.timestamp <= votingEnd,
            "Voting ended"
        );

        require(
            !voters[msg.sender],
            "Already voted"
        );

        require(
            _id > 0 &&
            _id <= countCandidates,
            "Invalid candidate"
        );

        voters[msg.sender] = true;

        candidates[_id].voteCount++;

        emit VoteCast(msg.sender, _id);
    }
}
