// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title TheGuildActivityToken (TGA)
/// @notice Simple ERC20 token for rewarding activity; owned by deployer, mint on demand.
contract TheGuildActivityToken is ERC20, Ownable {
    constructor() ERC20("TheGuildActivityToken", "TGA") Ownable(msg.sender) {}

    /// @notice Mint tokens to a recipient. Only owner can mint.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
