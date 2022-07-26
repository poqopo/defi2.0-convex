// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;



interface IEklipseGauge {
    function deposit(uint256) external;
    function withdraw(uint256) external;
    function userInfo(address) external view returns(uint256, uint256, uint256);
    function lp_token() external view returns(address);
    function EKLToken() external view returns(address);
}

interface IEKLClaim {
  function claimAll(address) external;
}

interface IEklipseVoteEscrow {
    function MAX_LOCK_DURATION() external view returns(uint256); 
    function userInfo(address) external view returns(uint256, uint256, uint256, uint256);
    function addLock(uint256, uint256) external;
    function withdrawEkl() external;
    function getUserVekl(address) external view returns(uint256);
    function withdrawFeeReward() external returns(uint256);
    function calculateFeeReward(address)external view returns (uint256);
}

interface IVoting{

    function voteForGauge(address,uint256) external;
    function getPortion(uint256,address) external view returns(uint256, uint256);
    function currentWeek() external view returns(uint256);
    function getLeftVotingPower(address) external view returns(uint256);
}

interface IStaker{
    function deposit(address, address) external;
    function withdrawOther(address) external;
    function withdraw(address, address, uint256) external;
    function withdrawAll(address, address) external;
    function createLock(uint256) external returns (bool);
    function release() external;
    function claimRewards() external;
    function claimFees(address) external;
    function vote(address,uint256) external;
    function operator() external view returns (address);
    function getPortion(address) external view returns (uint256);
    function execute(address _to, uint256 _value, bytes calldata _data) external returns (bool, bytes memory);
}

interface IRewards{
    function stake(address, uint256) external;
    function stakeFor(address, uint256) external;
    function withdraw(address, uint256) external;
    function exit(address) external;
    function getReward(address) external;
    function queueNewRewards(uint256) external;
    function notifyRewardAmount(uint256) external;
    function addExtraReward(address) external;
    function stakingToken() external view returns (address);
    function rewardToken() external view returns(address);
    function earned(address account) external view returns (uint256);
}

interface ITokenMinter{
    function mint(address,uint256) external;
    function burn(address,uint256) external;
}

interface IDeposit{
    function isShutdown() external view returns(bool);
    function balanceOf(address _account) external view returns(uint256);
    function totalSupply() external view returns(uint256);
    function poolInfo(uint256) external view returns(address,address,address,address,address, bool);
    function withdrawTo(uint256,uint256,address) external;
    function claimRewards(uint256,address) external returns(bool);
    function rewardClaimed(address,uint256) external;
    function owner() external returns(address);
}

interface IEKLDeposit{
    function depositEKL(uint256, bool) external;
    function lockIncentive() external view returns(uint256);
}

interface IRewardFactory{
    function setAccess(address,bool) external;
    function CreateCrvRewards(uint256,address) external returns(address);
    function CreateTokenRewards(address,address,address) external returns(address);
    function activeRewardCount(address) external view returns(uint256);
    function addActiveReward(address,uint256) external returns(bool);
    function removeActiveReward(address,uint256) external returns(bool);
}

interface ITokenFactory{
    function CreateDepositToken(address) external returns(address);
}


interface IVestedEscrow{
    function fund(address[] calldata _recipient, uint256[] calldata _amount) external returns(bool);
}

