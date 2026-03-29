// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SEAL.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract SEALTest is Test {
    SEAL public seal;

    bytes32 constant AGENT_1 = keccak256("agent-001");
    bytes32 constant TASK_1 = keccak256("task-001");
    bytes32 constant TASK_2 = keccak256("task-002");
    bytes32 constant MERKLE_ROOT = keccak256("merkle-root");
    bytes constant ATTESTATION_QUOTE = abi.encodePacked(
        "eyJwYXlsb2FkIjp7Im1vZHVsZV9pZCI6InNlYWwtZmx1ZW5jZS10ZWUifX0=",
        "extra-padding-to-reach-64-bytes"
    );
    bytes32 constant EXEC_HASH = keccak256("execution-output-hash");
    bytes constant TX_DATA = abi.encodePacked("tx-data-here");
    bytes constant SIG_DATA = abi.encodePacked("sig-data-here");

    address challenger = address(0xC0FFEE);
    address voter1 = address(0xBEEF);
    address voter2 = address(0xCAFE);
    address voter3 = address(0xFACE);

    function setUp() public {
        // Deploy via UUPS proxy
        SEAL implementation = new SEAL();
        bytes memory initData = abi.encodeCall(
            SEAL.initialize,
            (0.01 ether, 0.005 ether, 1 days)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        seal = SEAL(payable(address(proxy)));

        // Fund test accounts
        vm.deal(challenger, 10 ether);
        vm.deal(voter1, 1 ether);
        vm.deal(voter2, 1 ether);
        vm.deal(voter3, 1 ether);
    }

    // ── Agent Registration ──────────────────────────────

    function test_registerAgent() public {
        seal.registerAgent{value: 0.01 ether}(AGENT_1);
        (bool registered,,,, address agentOwner) = seal.agents(AGENT_1);
        assertTrue(registered);
        assertEq(agentOwner, address(this));
    }

    function test_revert_registerAgent_alreadyRegistered() public {
        seal.registerAgent{value: 0.01 ether}(AGENT_1);
        vm.expectRevert("SEAL: already registered");
        seal.registerAgent{value: 0.01 ether}(AGENT_1);
    }

    function test_revert_registerAgent_insufficientStake() public {
        vm.expectRevert("SEAL: insufficient stake");
        seal.registerAgent{value: 0.001 ether}(AGENT_1);
    }

    // ── Commitment Submission ───────────────────────────

    function test_submitCommitment() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        (
            bool committed,
            bool executed,
            bytes32 merkleRoot,
            uint256 nonce,
            ,
            uint256 timestamp,
            address submitter,
            bytes32 executionHash
        ) = seal.commitments(TASK_1);

        assertTrue(committed);
        assertFalse(executed);
        assertEq(merkleRoot, MERKLE_ROOT);
        assertEq(nonce, 1);
        assertEq(submitter, address(this));
        assertEq(executionHash, bytes32(0));
        assertEq(seal.commitmentCount(), 1);
    }

    function test_revert_submitCommitment_alreadyCommitted() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        vm.expectRevert("SEAL: already committed");
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 2, block.timestamp);
    }

    function test_revert_submitCommitment_emptyAttestation() public {
        vm.expectRevert("SEAL: empty attestation");
        seal.submitCommitment(TASK_1, MERKLE_ROOT, "", 1, block.timestamp);
    }

    // ── Attestation Verification ────────────────────────

    function test_verifyAttestation_valid() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        bool valid = seal.verifyAttestation(TASK_1, ATTESTATION_QUOTE);
        assertTrue(valid);
    }

    function test_verifyAttestation_wrongQuote() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        bytes memory wrongQuote = abi.encodePacked(
            "WRONG_QUOTE_WRONG_QUOTE_WRONG_QUOTE_WRONG_QUOTE_WRONG_QUOTE_WRONG_QUOTE_123"
        );
        bool valid = seal.verifyAttestation(TASK_1, wrongQuote);
        assertFalse(valid);
    }

    function test_verifyAttestation_notCommitted() public {
        bool valid = seal.verifyAttestation(TASK_1, ATTESTATION_QUOTE);
        assertFalse(valid);
    }

    // ── Task Execution ──────────────────────────────────

    function test_executeTask_afterCommitment() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);

        (,bool executed,,,,, bytes32 executionHash) = seal.getCommitment(TASK_1);
        assertTrue(executed);
        assertEq(executionHash, EXEC_HASH);
        assertEq(seal.executionCount(), 1);
    }

    function test_revert_executeTask_notCommitted() public {
        vm.expectRevert("SEAL: not committed");
        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);
    }

    function test_revert_executeTask_alreadyExecuted() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);
        vm.expectRevert("SEAL: already executed");
        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);
    }

    // ── Full Pipeline ───────────────────────────────────

    function test_fullPipeline_commitThenExecute() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        bool valid = seal.verifyAttestation(TASK_1, ATTESTATION_QUOTE);
        assertTrue(valid);

        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);

        (bool committed, bool executed,,,,,) = seal.getCommitment(TASK_1);
        assertTrue(committed);
        assertTrue(executed);
        assertEq(seal.commitmentCount(), 1);
        assertEq(seal.executionCount(), 1);
    }

    // ── Decentralized Dispute Resolution ────────────────

    function test_raiseDispute() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        bytes32 evidenceHash = keccak256("fraud-evidence");
        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, evidenceHash);

        (
            SEAL.DisputeStatus status,
            bytes32 agentId,
            bytes32 taskId,
            address ch,
            uint256 bond,
            bytes32 evHash,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 deadline,
            bool resolved
        ) = seal.getDispute(disputeId);

        assertEq(uint256(status), uint256(SEAL.DisputeStatus.Active));
        assertEq(agentId, AGENT_1);
        assertEq(taskId, TASK_1);
        assertEq(ch, challenger);
        assertEq(bond, 0.005 ether);
        assertEq(evHash, evidenceHash);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(deadline, block.timestamp + 1 days);
        assertFalse(resolved);
    }

    function test_revert_raiseDispute_insufficientBond() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        vm.expectRevert("SEAL: insufficient dispute bond");
        seal.raiseDispute{value: 0.001 ether}(AGENT_1, TASK_1, keccak256("evidence"));
    }

    function test_voteOnDispute() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        vm.prank(voter1);
        seal.voteOnDispute(disputeId, true);

        vm.prank(voter2);
        seal.voteOnDispute(disputeId, false);

        (,,,,,,uint256 votesFor, uint256 votesAgainst,,) = seal.getDispute(disputeId);
        assertEq(votesFor, 1);
        assertEq(votesAgainst, 1);
    }

    function test_revert_voteOnDispute_alreadyVoted() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        vm.prank(voter1);
        seal.voteOnDispute(disputeId, true);

        vm.prank(voter1);
        vm.expectRevert("SEAL: already voted");
        seal.voteOnDispute(disputeId, true);
    }

    function test_revert_voteOnDispute_periodEnded() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        vm.warp(block.timestamp + 2 days);

        vm.prank(voter1);
        vm.expectRevert("SEAL: voting period ended");
        seal.voteOnDispute(disputeId, true);
    }

    function test_resolveDispute_slashAgent() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        // 2 votes for slash, 1 against
        vm.prank(voter1);
        seal.voteOnDispute(disputeId, true);
        vm.prank(voter2);
        seal.voteOnDispute(disputeId, true);
        vm.prank(voter3);
        seal.voteOnDispute(disputeId, false);

        // Warp past deadline
        vm.warp(block.timestamp + 2 days);

        uint256 challengerBalBefore = challenger.balance;
        seal.resolveDispute(disputeId);

        // Agent should be slashed
        (,, uint256 stake, bool slashed,) = seal.agents(AGENT_1);
        assertTrue(slashed);
        assertEq(stake, 0);

        // Challenger gets bond back + half of slashed stake
        uint256 challengerBalAfter = challenger.balance;
        assertEq(challengerBalAfter - challengerBalBefore, 0.005 ether + 0.05 ether);

        (SEAL.DisputeStatus status,,,,,,,,,) = seal.getDispute(disputeId);
        assertEq(uint256(status), uint256(SEAL.DisputeStatus.Resolved));
    }

    function test_resolveDispute_rejectDispute() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        // 1 for, 2 against
        vm.prank(voter1);
        seal.voteOnDispute(disputeId, true);
        vm.prank(voter2);
        seal.voteOnDispute(disputeId, false);
        vm.prank(voter3);
        seal.voteOnDispute(disputeId, false);

        vm.warp(block.timestamp + 2 days);
        seal.resolveDispute(disputeId);

        // Agent NOT slashed
        (,, uint256 stake, bool slashed,) = seal.agents(AGENT_1);
        assertFalse(slashed);
        assertEq(stake, 0.1 ether);

        // Bond goes to agent owner (this contract)
        (SEAL.DisputeStatus status,,,,,,,,,) = seal.getDispute(disputeId);
        assertEq(uint256(status), uint256(SEAL.DisputeStatus.Rejected));
    }

    function test_revert_resolveDispute_periodNotEnded() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(challenger);
        uint256 disputeId = seal.raiseDispute{value: 0.005 ether}(AGENT_1, TASK_1, keccak256("ev"));

        vm.expectRevert("SEAL: voting period not ended");
        seal.resolveDispute(disputeId);
    }

    // ── Emergency Slash (owner-only) ────────────────────

    function test_emergencySlash() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        uint256 ownerBalBefore = address(this).balance;
        seal.emergencySlash(AGENT_1, TASK_1);
        uint256 ownerBalAfter = address(this).balance;

        (,, uint256 stake, bool slashed,) = seal.agents(AGENT_1);
        assertTrue(slashed);
        assertEq(stake, 0);
        assertEq(ownerBalAfter - ownerBalBefore, 0.1 ether);
    }

    function test_revert_emergencySlash_notOwner() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);

        vm.prank(address(0xDA0));
        vm.expectRevert();
        seal.emergencySlash(AGENT_1, TASK_1);
    }

    function test_revert_emergencySlash_alreadySlashed() public {
        seal.registerAgent{value: 0.1 ether}(AGENT_1);
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        seal.emergencySlash(AGENT_1, TASK_1);

        vm.expectRevert("SEAL: already slashed");
        seal.emergencySlash(AGENT_1, TASK_1);
    }

    // ── Pending Execution ───────────────────────────────

    function test_isPendingExecution() public {
        seal.submitCommitment(TASK_1, MERKLE_ROOT, ATTESTATION_QUOTE, 1, block.timestamp);
        assertTrue(seal.isPendingExecution(TASK_1));

        seal.executeTask(TASK_1, TX_DATA, EXEC_HASH, SIG_DATA);
        assertFalse(seal.isPendingExecution(TASK_1));
    }

    // ── UUPS Proxy ──────────────────────────────────────

    function test_proxyOwnership() public view {
        assertEq(seal.owner(), address(this));
    }

    function test_proxyConfig() public view {
        assertEq(seal.minStake(), 0.01 ether);
        assertEq(seal.disputeBond(), 0.005 ether);
        assertEq(seal.disputePeriod(), 1 days);
    }

    // Allow contract to receive ETH (for slash payouts)
    receive() external payable {}
}
