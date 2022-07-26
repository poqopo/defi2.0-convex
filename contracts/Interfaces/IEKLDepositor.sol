// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IEKLDepositor {
    function depositEKL(uint256, bool) external;
    function depositAll(bool, address) external;
}