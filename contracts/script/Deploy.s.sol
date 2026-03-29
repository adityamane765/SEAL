// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SEAL.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeploySEAL is Script {
    function run() external {
        uint256 minStake = 0.01 ether;
        uint256 disputeBond = 0.005 ether;
        uint256 disputePeriod = 1 days;

        vm.startBroadcast();

        // 1. Deploy implementation
        SEAL implementation = new SEAL();
        console.log("SEAL implementation:", address(implementation));

        // 2. Deploy proxy with initialize call
        bytes memory initData = abi.encodeCall(
            SEAL.initialize,
            (minStake, disputeBond, disputePeriod)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        console.log("SEAL proxy (use this):", address(proxy));

        // 3. Verify
        SEAL seal = SEAL(payable(address(proxy)));
        console.log("Owner:", seal.owner());
        console.log("Min stake:", seal.minStake());
        console.log("Dispute bond:", seal.disputeBond());

        vm.stopBroadcast();
    }
}
