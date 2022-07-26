// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

interface IAssetOracle {
    function getAssetPrice(address asset) external view returns (uint256);
}