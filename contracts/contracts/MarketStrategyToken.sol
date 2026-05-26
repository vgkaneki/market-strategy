// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title MarketStrategyToken
 * @notice Fixed-supply ERC20 token for the Market Strategy ecosystem.
 * @dev Uses OpenZeppelin ERC20, ERC20Permit, ERC20Votes, AccessControl, and Pausable.
 *
 * Security model:
 * - Fixed supply is minted once to the treasury.
 * - No public mint function.
 * - Pause authority should be controlled by a Safe multisig and ideally a timelock.
 * - Governance/admin addresses must never be single hot wallets in production.
 */
contract MarketStrategyToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, Pausable {
    /// @notice Role allowed to pause and unpause transfers.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Total fixed token supply: 1 billion MST.
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 ether;

    /**
     * @notice Deploys the token and mints fixed supply to treasury.
     * @param treasury Address receiving the full initial supply.
     * @param admin Safe/timelock/admin address receiving admin and pause roles.
     */
    constructor(address treasury, address admin)
        ERC20("Market Strategy Token", "MST")
        ERC20Permit("Market Strategy Token")
    {
        require(treasury != address(0), "treasury zero");
        require(admin != address(0), "admin zero");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        _mint(treasury, TOTAL_SUPPLY);
    }

    /**
     * @notice Pause token transfers.
     * @dev Intended for emergency use only.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause token transfers.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Required override for ERC20Votes and pause enforcement.
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused
    {
        super._update(from, to, value);
    }

    /**
     * @dev Required Solidity override due to ERC20Permit and Nonces inheritance.
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
