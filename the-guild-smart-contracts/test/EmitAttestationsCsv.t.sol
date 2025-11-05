// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {EmitAttestationsCsv} from "../script/EmitAttestationsCsv.s.sol";

contract EmitAttestationsCsvTest is Test {
    EmitAttestationsCsv private script;

    function setUp() public {
        script = new EmitAttestationsCsv();
    }

    function test_ParseAddress() public view {
        address expected = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e;
        address result = script.parseAddress("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
        assertEq(result, expected);
    }

    function test_ParseBytes32() public view {
        bytes32 expected = bytes32(abi.encodePacked("Rust"));
        bytes32 result = script.parseBytes32("Rust");
        assertEq(result, expected);
    }

    function test_SplitString() public view {
        string memory input = "a,b,c";
        string[] memory result = script.split(input, ",");
        assertEq(result.length, 3);
        assertEq(result[0], "a");
        assertEq(result[1], "b");
        assertEq(result[2], "c");
    }

    function test_ParseCsvToAttestations() public view {
        string memory csvData = "address,badgeName,distributionId\n0x742d35Cc6634C0532925a3b844Bc454e4438f44e,Rust,dist-001\n0x742d35Cc6634C0532925a3b844Bc454e4438f44e,Solidity,dist-001";

        // We can't directly call internal functions from tests, so we'll test the components
        // This is a limitation of Solidity testing - internal functions aren't directly testable

        // Test the split function with newlines
        string[] memory lines = script.split(csvData, "\n");
        assertEq(lines.length, 3); // header + 2 data lines
        assertEq(lines[0], "address,badgeName,distributionId");
        assertEq(lines[1], "0x742d35Cc6634C0532925a3b844Bc454e4438f44e,Rust,dist-001");
    }
}