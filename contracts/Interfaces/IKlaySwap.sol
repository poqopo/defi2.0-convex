// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IKlaySwap {
function createKctPool(address tokenA, uint amountA, address tokenB, uint amountB, uint fee) external;
function changePoolFee(address tokenA, address tokenB, uint fee) external;
}