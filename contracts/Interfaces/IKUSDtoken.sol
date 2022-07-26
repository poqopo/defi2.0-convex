// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IKUSDtoken {
    function totalSupply() external view returns(uint256);
    function kusdbank() external view returns(address);
    function current_collateral_ratio() external view returns(uint256);
    function maxSupply() external view returns(uint256);
    function Bank_mint(address m_address, uint256 m_amount) external;
    function Bank_burn_from(address b_address, uint256 b_amount) external;
}