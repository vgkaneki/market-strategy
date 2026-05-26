// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiquidityTreasury
 * @notice Controlled treasury vault for platform-owned liquidity tokens.
 * @dev This is not an AMM and not a staking/yield contract. It is a simple guarded token vault.
 *
 * Production controls:
 * - DEFAULT_ADMIN_ROLE should be a Safe multisig + timelock.
 * - TREASURY_MANAGER_ROLE should be limited to operational multisig addresses.
 * - Withdrawals should be subject to off-chain monitoring and policy controls.
 */
contract LiquidityTreasury is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role allowed to move approved assets.
    bytes32 public constant TREASURY_MANAGER_ROLE = keccak256("TREASURY_MANAGER_ROLE");

    /// @notice Role allowed to pause/unpause the treasury.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);
    event RescueNative(address indexed to, uint256 amount);

    /**
     * @notice Deploy treasury.
     * @param admin Safe/timelock/admin address.
     * @param manager Operational multisig address.
     */
    constructor(address admin, address manager) {
        require(admin != address(0), "admin zero");
        require(manager != address(0), "manager zero");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(TREASURY_MANAGER_ROLE, manager);
    }

    receive() external payable {}

    /**
     * @notice Pause withdrawals.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause withdrawals.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Deposit ERC20 tokens into treasury.
     * @param token ERC20 token address.
     * @param amount Amount to deposit.
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "token zero");
        require(amount > 0, "amount zero");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(token, msg.sender, amount);
    }

    /**
     * @notice Withdraw ERC20 tokens from treasury.
     * @param token ERC20 token address.
     * @param to Recipient address.
     * @param amount Amount to withdraw.
     */
    function withdraw(address token, address to, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        onlyRole(TREASURY_MANAGER_ROLE)
    {
        require(token != address(0), "token zero");
        require(to != address(0), "to zero");
        require(amount > 0, "amount zero");

        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    /**
     * @notice Rescue native ETH accidentally sent to treasury.
     * @param to Recipient address.
     * @param amount Native token amount.
     */
    function rescueNative(address payable to, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        onlyRole(TREASURY_MANAGER_ROLE)
    {
        require(to != address(0), "to zero");
        require(amount > 0, "amount zero");
        require(address(this).balance >= amount, "insufficient balance");

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "native transfer failed");
        emit RescueNative(to, amount);
    }
}
