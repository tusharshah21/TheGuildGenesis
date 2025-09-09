// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {IEAS} from "eas-contracts/IEAS.sol";
import {TheGuildActivityToken} from "../src/TheGuildActivityToken.sol";

contract TheGuildActivityTokenScript is Script {
    function getEASAddress() internal view returns (address) {
        // Base and Optimism chains use canonical predeploy
        if (
            block.chainid == 8453 ||
            block.chainid == 84531 ||
            block.chainid == 84532 ||
            block.chainid == 10 ||
            block.chainid == 11155420
        ) {
            return 0x4200000000000000000000000000000000000021;
        }
        // Arbitrum Sepolia
        if (block.chainid == 421614) {
            return 0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE;
        }
        // Polygon Amoy
        if (block.chainid == 80002) {
            return 0xb101275a60d8bfb14529C421899aD7CA1Ae5B5Fc;
        }
        // Linea Goerli
        if (block.chainid == 59140) {
            return 0xaEF4103A04090071165F78D45D83A0C0782c2B2a;
        }
        //Mainnet
        if (block.chainid == 1) {
            return 0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587;
        }
        //Sepolia
        if (block.chainid == 11155111) {
            return 0xC2679fBD37d54388Ce493F1DB75320D236e1815e;
        }
        //Arbitrum One
        if (block.chainid == 42161) {
            return 0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458;
        }
        //Polygon
        if (block.chainid == 137) {
            return 0x5E634ef5355f45A855d02D66eCD687b1502AF790;
        }
        // Fallback to env var for other networks
        address fallbackAddr = vm.envOr("EAS_ADDRESS", address(0));
        require(
            fallbackAddr != address(0),
            "EAS_ADDRESS not set for this network"
        );
        return fallbackAddr;
    }

    function run() public {
        address eas;
        // EAS addresses per https://github.com/ethereum-attestation-service/eas-contracts deployments
        // Base mainnet (8453) and Base Goerli/Sepolia (84531/84532) use the canonical predeploy 0x...21
        // Optimism mainnet (10) and OP Sepolia (11155420) also use canonical 0x...21

        eas = getEASAddress();

        vm.startBroadcast();
        new TheGuildActivityToken(IEAS(eas));
        vm.stopBroadcast();
    }
}
