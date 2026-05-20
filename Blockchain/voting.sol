// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

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

    // =========================
    // ADD CANDIDATE
    // =========================
    function addCandidate(
        string memory _name,
        string memory _party
    ) public {

        countCandidates++;

        candidates[countCandidates] = Candidate(
            countCandidates,
            _name,
            _party,
            0
        );
    }

    // =========================
    // SET DATES
    // =========================
    function setDates(
        uint _start,
        uint _end
    ) public {

        votingStart = _start;
        votingEnd = _end;
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
    }
}