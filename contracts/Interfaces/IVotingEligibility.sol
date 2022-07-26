// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface IVotingEligibility{
    function isEligible(address _account) external view returns(bool);
}