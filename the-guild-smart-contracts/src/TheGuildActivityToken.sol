// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {SchemaResolver} from "eas-contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "eas-contracts/IEAS.sol";

/// @title TheGuildActivityToken (TGA)
/// @notice ERC20 that also serves as an EAS schema resolver; mints on attest.
contract TheGuildActivityToken is ERC20, Ownable, SchemaResolver {
    // enumerate attestation ids
    bytes32[] private attestationIds;

    //IEAS private _eas;

    constructor(
        IEAS eas
    )
        ERC20("TheGuildActivityToken", "TGA")
        Ownable(msg.sender)
        SchemaResolver(eas)
    {}

    /// @notice Mint tokens to a recipient. Only owner can mint.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @inheritdoc SchemaResolver
    function onAttest(
        Attestation calldata attestation,
        uint256
    ) internal override returns (bool) {
        _mint(attestation.attester, 10 * (10 ** decimals()));
        // TODO: get rid of this when we have our graphQL setup
        attestationIds.push(attestation.uid);
        return true;
    }

    /// @inheritdoc SchemaResolver
    function onRevoke(
        Attestation calldata,
        uint256
    ) internal pure override returns (bool) {
        return true;
    }

    // TODO: get rid of this when we have our graphQL setup

    /// @notice Get attestation count
    function getAttestationCount() external view returns (uint256) {
        return attestationIds.length;
    }

    /// @notice Get attestation id at a specific index
    function getAttestationAtIndex(
        uint256 index
    ) external view returns (Attestation memory) {
        return _eas.getAttestation(attestationIds[index]);
    }
}
