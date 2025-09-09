// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {TheGuildBadgeRegistry} from "../src/TheGuildBadgeRegistry.sol";

contract TheGuildBadgeRegistryScript is Script {
    function run() public {
        // Salt can be provided via env var or defaults to zero salt
        bytes32 salt = bytes32(vm.envOr("CREATE2_SALT", uint256(0)));

        vm.startBroadcast();
        new TheGuildBadgeRegistry{salt: salt}();
        vm.stopBroadcast();
    }
}
