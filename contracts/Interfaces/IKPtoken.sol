// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IKPtoken {
    function reductionPerCliff() external view returns(uint256);
    function totalSupply() external view returns(uint256);
    function totalCliffs() external view returns(uint256);
    function maxSupply() external view returns(uint256);
    function kusd() external view returns(address);
    function Bank_mint(address m_address, uint256 m_amount) external;
    function Bank_burn_from(address b_address, uint256 b_amount) external;
    function mint(address m_address, uint256 m_amount) external;
}