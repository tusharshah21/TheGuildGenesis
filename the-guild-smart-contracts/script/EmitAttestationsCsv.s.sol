// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {EAS} from "eas-contracts/EAS.sol";
import {AttestationRequestData, MultiAttestationRequest} from "eas-contracts/IEAS.sol";
import {EASUtils} from "./utils/EASUtils.s.sol";
import {console} from "forge-std/console.sol";

contract EmitAttestationsCsv is Script {
    // Configuration constants
    uint256 constant MAX_BATCH_SIZE = 50; // Limit batch size to prevent gas issues
    uint256 constant MAX_CSV_LINES = 1000; // Reasonable limit for CSV processing

    struct AttestationData {
        address recipient;
        bytes32 badgeName;
        string distributionId;
        bytes justification;
    }

    function run() public {
        bool isDryRun = vm.envOr("DRY_RUN", false);

        console.log("=== TheGuild Batch Attestation Script ===");
        console.log("Dry run mode:", isDryRun ? "ENABLED" : "DISABLED");

        // Get EAS address for current network
        EAS eas = EAS(EASUtils.getEASAddress(vm));
        console.log("EAS Address:", address(eas));

        // Read and validate CSV from environment variable
        string memory csvData = vm.envString("CSV_DATA");
        console.log("Reading CSV data from environment variable");
        
        AttestationData[] memory attestations = parseAndValidateCsv(csvData);

        console.log(string(abi.encodePacked("Parsed ", vm.toString(attestations.length), " attestations from CSV")));

        // Validate distribution ID for idempotency (if provided)
        string memory distributionId = getDistributionId(attestations);
        if (bytes(distributionId).length > 0) {
            console.log("Distribution ID:", distributionId);
            // TODO: In production, check against on-chain storage for duplicates
        }

        // Get schema ID
        bytes32 schemaId = vm.envOr("SCHEMA_ID", bytes32(0xb167f07504166f717f2a2710dbcfbfdf8fad6e8c6128c1a7fa80768f61b1d0b2));
        console.log("Using Schema ID:", vm.toString(schemaId));

        // Create batch requests
        MultiAttestationRequest[] memory requests = createBatchRequests(attestations, schemaId);

        if (isDryRun) {
            console.log(string(abi.encodePacked("DRY RUN: Would process ", vm.toString(requests.length), " batches")));
            for (uint256 i = 0; i < requests.length; i++) {
                console.log(string(abi.encodePacked("Batch ", vm.toString(i), ": ", vm.toString(requests[i].data.length), " attestations")));
            }
            console.log("Dry run completed successfully!");
            return;
        }

        // Execute attestations
        executeAttestations(eas, requests);
    }

    function parseAndValidateCsv(string memory csvData) internal pure returns (AttestationData[] memory) {
        string[] memory lines = split(csvData, "\n");
        require(lines.length >= 2, "CSV must have at least header + 1 data row");
        require(lines.length <= MAX_CSV_LINES + 1, "CSV too large, max 1000 data rows allowed");

        uint256 dataLines = lines.length - 1; // Skip header
        AttestationData[] memory attestations = new AttestationData[](dataLines);

        for (uint256 i = 1; i < lines.length; i++) {
            if (bytes(lines[i]).length == 0) continue; // Skip empty lines

            string[] memory fields = split(lines[i], ",");
            require(fields.length >= 2, string(abi.encodePacked("Line ", vm.toString(i), ": must have at least address,badgeName")));

            address recipient = parseAddress(fields[0]);
            require(recipient != address(0), string(abi.encodePacked("Line ", vm.toString(i), ": invalid recipient address")));

            bytes32 badgeName = parseBytes32(fields[1]);
            require(badgeName != bytes32(0), string(abi.encodePacked("Line ", vm.toString(i), ": badgeName cannot be empty")));

            string memory distributionId = fields.length >= 3 ? fields[2] : "";

            bytes memory justification = bytes(distributionId).length > 0
                ? abi.encodePacked("Distribution: ", distributionId)
                : bytes("Batch attestation");

            attestations[i-1] = AttestationData({
                recipient: recipient,
                badgeName: badgeName,
                distributionId: distributionId,
                justification: justification
            });
        }

        return attestations;
    }

    function getDistributionId(AttestationData[] memory attestations) internal pure returns (string memory) {
        if (attestations.length == 0) return "";

        string memory firstId = attestations[0].distributionId;
        for (uint256 i = 1; i < attestations.length; i++) {
            require(
                keccak256(bytes(attestations[i].distributionId)) == keccak256(bytes(firstId)),
                "All attestations must have the same distributionId"
            );
        }
        return firstId;
    }

    function createBatchRequests(
        AttestationData[] memory attestations,
        bytes32 schemaId
    ) internal pure returns (MultiAttestationRequest[] memory) {
        uint256 totalBatches = (attestations.length + MAX_BATCH_SIZE - 1) / MAX_BATCH_SIZE;
        MultiAttestationRequest[] memory requests = new MultiAttestationRequest[](totalBatches);

        for (uint256 batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            uint256 startIdx = batchIndex * MAX_BATCH_SIZE;
            uint256 endIdx = startIdx + MAX_BATCH_SIZE;
            if (endIdx > attestations.length) endIdx = attestations.length;

            uint256 batchSize = endIdx - startIdx;
            requests[batchIndex].schema = schemaId;
            requests[batchIndex].data = new AttestationRequestData[](batchSize);

            for (uint256 i = 0; i < batchSize; i++) {
                AttestationData memory att = attestations[startIdx + i];
                requests[batchIndex].data[i] = AttestationRequestData({
                    recipient: att.recipient,
                    expirationTime: 0, // No expiration
                    revocable: true,
                    refUID: bytes32(0), // No reference
                    data: abi.encode(att.badgeName, att.justification),
                    value: 0 // No ETH value
                });
            }
        }

        return requests;
    }

    function executeAttestations(EAS eas, MultiAttestationRequest[] memory requests) internal {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        console.log("Starting batch attestation execution...");

        uint256 totalAttestations = 0;
        for (uint256 batchIndex = 0; batchIndex < requests.length; batchIndex++) {
            console.log(string(abi.encodePacked("Processing batch ", vm.toString(batchIndex + 1), "/", vm.toString(requests.length), " - ", vm.toString(requests[batchIndex].data.length), " attestations")));

            // Create single-element array for this batch
            MultiAttestationRequest[] memory singleBatch = new MultiAttestationRequest[](1);
            singleBatch[0] = requests[batchIndex];

            try eas.multiAttest(singleBatch) returns (bytes32[] memory uids) {
                console.log(string(abi.encodePacked("Batch ", vm.toString(batchIndex + 1), " completed with ", vm.toString(uids.length), " attestations")));
                totalAttestations += uids.length;

                // Log first few UIDs
                for (uint256 i = 0; i < uids.length && i < 3; i++) {
                    console.log(string(abi.encodePacked("  UID ", vm.toString(i), ": ", vm.toString(uids[i]))));
                }
                if (uids.length > 3) {
                    console.log(string(abi.encodePacked("  ... and ", vm.toString(uids.length - 3), " more")));
                }
            } catch Error(string memory reason) {
                console.log(string(abi.encodePacked("Batch ", vm.toString(batchIndex + 1), " failed: ", reason)));
                revert(string(abi.encodePacked("Batch ", vm.toString(batchIndex + 1), " failed: ", reason)));
            } catch {
                console.log(string(abi.encodePacked("Batch ", vm.toString(batchIndex + 1), " failed with unknown error")));
                revert(string(abi.encodePacked("Batch ", vm.toString(batchIndex + 1), " failed with unknown error")));
            }
        }

        vm.stopBroadcast();

        console.log("=== Attestation Summary ===");
        console.log("Total batches processed:", requests.length);
        console.log("Total attestations created:", totalAttestations);
        console.log("Execution completed successfully!");
    }


    // Helper function to parse address from string
    function parseAddress(string memory addrStr) public pure returns (address) {
        bytes memory addrBytes = bytes(addrStr);
        require(addrBytes.length == 42, "Invalid address length"); // 0x + 40 hex chars
        require(addrBytes[0] == '0' && (addrBytes[1] == 'x' || addrBytes[1] == 'X'), "Address must start with 0x");

        uint160 addr;
        for (uint256 i = 2; i < 42; i++) {
            uint8 digit;
            if (uint8(addrBytes[i]) >= 48 && uint8(addrBytes[i]) <= 57) {
                digit = uint8(addrBytes[i]) - 48;
            } else if (uint8(addrBytes[i]) >= 65 && uint8(addrBytes[i]) <= 70) {
                digit = uint8(addrBytes[i]) - 55;
            } else if (uint8(addrBytes[i]) >= 97 && uint8(addrBytes[i]) <= 102) {
                digit = uint8(addrBytes[i]) - 87;
            } else {
                revert("Invalid hex character in address");
            }
            addr = addr * 16 + digit;
        }
        return address(addr);
    }

    // Helper function to parse bytes32 from string
    function parseBytes32(string memory str) public pure returns (bytes32) {
        return bytes32(abi.encodePacked(str));
    }

    // Simple string splitting function
    function split(string memory str, string memory delimiter) public pure returns (string[] memory) {
        bytes memory strBytes = bytes(str);
        bytes memory delimBytes = bytes(delimiter);

        uint256 count = 1;
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == delimBytes[0]) {
                count++;
            }
        }

        string[] memory result = new string[](count);
        uint256 lastIndex = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 0; i <= strBytes.length; i++) {
            if (i == strBytes.length || strBytes[i] == delimBytes[0]) {
                bytes memory slice = new bytes(i - lastIndex);
                for (uint256 j = 0; j < slice.length; j++) {
                    slice[j] = strBytes[lastIndex + j];
                }
                result[resultIndex] = string(slice);
                resultIndex++;
                lastIndex = i + 1;
            }
        }

        return result;
    }
}