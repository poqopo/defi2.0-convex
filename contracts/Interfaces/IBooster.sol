// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IBooster {
    function owner() external view returns(address);
    function setVoteDelegate(address _voteDelegate) external;
    function vote(uint256 _voteId, address _votingAddress, bool _support) external returns(bool);
    function voteGaugeWeight(address[] calldata _gauge, uint256[] calldata _weight ) external returns(bool);
    function deposit(uint256 _pid, uint256 _amount) external returns(bool);
    function depositAll(uint256 _pid) external returns(bool);
    function withdraw(uint256 _pid, uint256 _amount) external returns(bool);
    function withdrawAll(uint256 _pid) external returns(bool);
    function mint_KP(uint256 _amount) external;
}