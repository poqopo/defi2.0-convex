// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

interface IBondTreasury {
    function deposit(uint256 _amount, address _token, uint256 _profit) external;

    event ReservesUpdated(uint256 indexed totalReserves);
    event Deposit(address indexed token, uint256 amount, uint256 pay);
    event LPDeposited(uint256 pid, uint256 amount);
    event LPDepositedAll(uint256 pid);
    event LPWithdrawed(uint256 pid, uint256 amount);
    event LPWithdrawedAll(uint256 pid);
} 