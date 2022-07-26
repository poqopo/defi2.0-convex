// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/Interfaces.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract EKLDepositor{
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public constant ekl = address(0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA);
    address public constant escrow = address(0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58);
    uint256 private constant MAXTIME = 4 * 364 * 86400;
    uint256 private constant WEEK = 7 * 86400;

    uint256 public lockIncentive = 10; //incentive to users who spend gas to lock EKL
    uint256 public constant FEE_DENOMINATOR = 10000;

    address public feeManager;
    address public immutable staker;
    address public immutable minter;
    uint256 public incentiveEKL = 0;
    uint256 public unlockTime;

    constructor(address _staker, address _minter) public {
        staker = _staker;
        minter = _minter;
        feeManager = msg.sender;
    }

    function setFeeManager(address _feeManager) external {
        require(msg.sender == feeManager, "!auth");
        feeManager = _feeManager;
    }

    function setFees(uint256 _lockIncentive) external{
        require(msg.sender==feeManager, "!auth");

        if(_lockIncentive >= 0 && _lockIncentive <= 30){
            lockIncentive = _lockIncentive;
       }
    }

    function initialLock() external{
        require(msg.sender==feeManager, "!auth");

        (uint256 veekl,,,) = IEklipseVoteEscrow(escrow).userInfo(address(this));
        if(veekl == 0){
            uint256 unlockAt = block.timestamp + MAXTIME;
            uint256 unlockInWeeks = (unlockAt/WEEK)*WEEK;

            //release old lock if exists
            IStaker(staker).release();
            //create new lock
            uint256 eklBalanceStaker = IERC20(ekl).balanceOf(staker);
            IStaker(staker).createLock(eklBalanceStaker);
            unlockTime = unlockInWeeks;
        }
    }

    //lock curve
    function _lockEklipse() internal {
        uint256 eklBalance = IERC20(ekl).balanceOf(address(this));
        if(eklBalance > 0){
            IERC20(ekl).safeTransfer(staker, eklBalance);
        }
        
        //increase ammount
        uint256 eklBalanceStaker = IERC20(ekl).balanceOf(staker);
        if(eklBalanceStaker == 0){
            return;
        }
        //increase amount
        IStaker(staker).createLock(eklBalanceStaker);
    }

    function lockEklipse() external {
        _lockEklipse();
        //mint incentives
        if(incentiveEKL > 0){
            ITokenMinter(minter).mint(msg.sender,incentiveEKL);
            incentiveEKL = 0;
        }
    }

    function withdrawexpiredekl() external {
      IStaker(staker).release();
      if(incentiveEKL > 0){
          ITokenMinter(minter).mint(msg.sender,incentiveEKL);
          incentiveEKL = 0;
      }
      _lockEklipse();      
    }

    //deposit ekl for cvxEKl
    //can locking immediately or defer locking to someone else by paying a fee.
    //while users can choose to lock or defer, this is mostly in place so that
    //the cvx reward contract isnt costly to claim rewards
    function deposit(uint256 _amount, bool _lock, address _stakeAddress) public {
        require(_amount > 0,"!>0");
        
        if(_lock){
            //lock immediately, transfer directly to staker to skip an erc20 transfer
            IERC20(ekl).safeTransferFrom(msg.sender, staker, _amount);
            _lockEklipse();
            if(incentiveEKL > 0){
                //add the incentive tokens here so they can be staked together
                _amount = _amount.add(incentiveEKL);
                incentiveEKL = 0;
            }
        }else{
            //move tokens here
            IERC20(ekl).safeTransferFrom(msg.sender, address(this), _amount);
            //defer lock cost to another user
            uint256 callIncentive = _amount.mul(lockIncentive).div(FEE_DENOMINATOR);
            _amount = _amount.sub(callIncentive);

            //add to a pool for lock caller
            incentiveEKL = incentiveEKL.add(callIncentive);
        }

        bool depositOnly = _stakeAddress == address(0);
        if(depositOnly){
            //mint for msg.sender
            ITokenMinter(minter).mint(msg.sender,_amount);
        }else{
            //mint here 
            ITokenMinter(minter).mint(address(this),_amount);
            //stake for msg.sender
            IERC20(minter).safeApprove(_stakeAddress,0);
            IERC20(minter).safeApprove(_stakeAddress,_amount);
            IRewards(_stakeAddress).stakeFor(msg.sender,_amount);
        }
    }

    function depositEKL(uint256 _amount, bool _lock) external {
        deposit(_amount,_lock,address(0));
    }

    function depositAll(bool _lock, address _stakeAddress) external{
        uint256 eklBal = IERC20(ekl).balanceOf(msg.sender);
        deposit(eklBal,_lock,_stakeAddress);
    }
}