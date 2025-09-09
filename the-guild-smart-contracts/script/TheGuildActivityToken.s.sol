// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {TheGuildActivityToken} from "../src/TheGuildActivityToken.sol";

contract TheGuildActivityTokenScript is Script {
    function run() public {
        vm.startBroadcast();
        new TheGuildActivityToken();
        vm.stopBroadcast();
    }
}
