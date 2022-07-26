// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/IEKLDepositor.sol";
import "./Interfaces/Interfaces.sol";
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';


interface IKPRewards {
    function withdraw(uint256 _amount, bool _claim) external;

    function balanceOf(address _account) external view returns(uint256);

    function getKPReward(bool _stake) external;

    function stakeAll() external;
}

interface IKPLocker {
    function notifyRewardAmount(address _rewardsToken, uint256 reward) external;
}


// receive tokens to stake
// get current staked balance
// withdraw staked tokens
// send rewards back to owner(ekl locker)
// register token types that can be distributed

contract KPStakingProxyV2 {
    using SafeERC20
    for IERC20;
    using Address
    for address;
    using SafeMath
    for uint256;

    //tokens
    address public constant ekl = address(0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA);
    address public constant kp = address(0xF05d180a169418959a017865866F0aBaF7DB7EAd);
    address public constant kpEKL = address(0x08644836b786B69a5082fD4644a3F2D1534B11A8);

    //convex addresses
    address public constant kpStaking = address(0x5042D8158d3c3C7f95374512b726fB2fA82EBa6B);
    address public constant kpEKLStaking = address(0x58337263cf52A4906913866242cfdeE16dEe82Bb);
    address public constant eklDeposit = address(0xABe0F9cFf7d77aEd6b6C9107f0584f897cC0942d);
    uint256 public constant denominator = 10000;

    address public immutable rewards;

    address public owner;
    address public pendingOwner;
    uint256 public callIncentive = 100;

    address public booster;

    mapping(address => bool) public distributors;
    bool public UseDistributors = true;

    event AddDistributor(address indexed _distro, bool _valid);
    event RewardsDistributed(address indexed token, uint256 amount);

    constructor(address _rewards, address _booster) public {
        rewards = _rewards;
        owner = msg.sender;
        distributors[msg.sender] = true;
        booster = _booster;
    }

    function setPendingOwner(address _po) external {
        require(msg.sender == owner, "!auth");
        pendingOwner = _po;
    }

    function applyPendingOwner() external {
        require(msg.sender == owner, "!auth");
        require(pendingOwner != address(0), "invalid owner");

        owner = pendingOwner;
        pendingOwner = address(0);
    }

    function setCallIncentive(uint256 _incentive) external {
        require(msg.sender == owner, "!auth");
        require(_incentive <= 100, "too high");
        callIncentive = _incentive;
    }

    function setDistributor(address _distro, bool _valid) external {
        require(msg.sender == owner, "!auth");
        distributors[_distro] = _valid;
        emit AddDistributor(_distro, _valid);
    }

    function setUseDistributorList(bool _use) external {
        require(msg.sender == owner, "!auth");
        UseDistributors = _use;
    }

    function setApprovals() external {
        IERC20(kp).safeApprove(kpStaking, 0);
        IERC20(kp).safeApprove(kpStaking, uint256(-1));

        IERC20(ekl).safeApprove(eklDeposit, 0);
        IERC20(ekl).safeApprove(eklDeposit, uint256(-1));

        IERC20(kpEKL).safeApprove(rewards, 0);
        IERC20(kpEKL).safeApprove(rewards, uint256(-1));

        IERC20(ekl).safeApprove(rewards, 0);
        IERC20(ekl).safeApprove(rewards, uint256(-1));

    }

    function rescueToken(address _token, address _to) external {
        require(msg.sender == owner, "!auth");
        require(_token != ekl && _token != kp && _token != kpEKL, "not allowed");

        uint256 bal = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(_to, bal);
    }

    function getBalance() external view returns(uint256) {
        return IKPRewards(kpStaking).balanceOf(address(this));
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == rewards, "!auth");

        //unstake
        IKPRewards(kpStaking).withdraw(_amount, false);

        //withdraw kp
        IERC20(kp).safeTransfer(msg.sender, _amount);
    }


    function stake() external {
        require(msg.sender == rewards, "!auth");

        IKPRewards(kpStaking).stakeAll();
    }

    function distribute() external {
        if(UseDistributors){
            require(distributors[msg.sender], "!auth");
        }

        //claim rewards
        IKPRewards(kpStaking).getKPReward(false);

        //convert any ekl that was directly added
        uint256 eklBal = IERC20(ekl).balanceOf(address(this));
        uint256 converteklBal = eklBal.div(2); //Change
        eklBal = eklBal.sub(converteklBal); //Change

        if (eklBal > 0) {
            IEKLDepositor(eklDeposit).depositEKL(converteklBal, false); // 50%만 바꾸기.Change
        }

        //make sure nothing is in here
        uint256 sCheck  = IKPRewards(kpEKLStaking).balanceOf(address(this));
        if(sCheck > 0){
            IKPRewards(kpEKLStaking).withdraw(sCheck,false);
        }

        //distribute kpEKL
        uint256 kpEKLBal = IERC20(kpEKL).balanceOf(address(this));

        if (kpEKLBal > 0) {
            uint256 incentiveAmount = kpEKLBal.mul(callIncentive).div(denominator);
            kpEKLBal = kpEKLBal.sub(incentiveAmount);
            
            //send incentives
            IERC20(kpEKL).safeTransfer(msg.sender,incentiveAmount);

            //update rewards
            IKPLocker(rewards).notifyRewardAmount(kpEKL, kpEKLBal);
            IKPLocker(rewards).notifyRewardAmount(ekl, eklBal);  //Change

            emit RewardsDistributed(kpEKL, kpEKLBal);
        }
    }

    //in case a new reward is ever added, allow generic distribution
    function distributeOther(IERC20 _token) external {
        if(UseDistributors){
          require(distributors[msg.sender], "!auth");
        }
        require( address(_token) != ekl && address(_token) != kpEKL, "not allowed");

        uint256 bal = _token.balanceOf(address(this));

        if (bal > 0) {
            uint256 incentiveAmount = bal.mul(callIncentive).div(denominator);
            bal = bal.sub(incentiveAmount);
            
            //send incentives
            _token.safeTransfer(msg.sender,incentiveAmount);

            //approve
            _token.safeApprove(rewards, 0);
            _token.safeApprove(rewards, uint256(-1));

            //update rewards
            IKPLocker(rewards).notifyRewardAmount(address(_token), bal);

            emit RewardsDistributed(address(_token), bal);
        }
    }
}