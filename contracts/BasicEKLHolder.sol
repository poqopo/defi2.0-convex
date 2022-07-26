// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/IRewardStaking.sol";
import "./Interfaces/ILockedKP.sol";
import "./Interfaces/IDelegation.sol";
import "./Interfaces/IEKLDepositor.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


//Basic functionality to integrate with locking kp
contract BasicEKLHolder{
    using SafeERC20 for IERC20;
    using Address for address;


    address public constant kpEKL = address(0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7);
    address public constant kpEKLStaking = address(0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e);
    address public constant kp = address(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    address public constant ekl = address(0xD533a949740bb3306d119CC777fa900bA034cd52);
    address public constant eklDeposit = address(0x8014595F2AB54cD7c604B00E9fb932176fDc86Ae);

    address public operator;
    ILockedKP public immutable kplocker;

    constructor(address _kplocker) public {
        kplocker = ILockedKP(_kplocker);
        operator = msg.sender;
    }

    function setApprovals() external {
        IERC20(kpEKL).safeApprove(kpEKLStaking, 0);
        IERC20(kpEKL).safeApprove(kpEKLStaking, uint256(-1));

        IERC20(kp).safeApprove(address(kplocker), 0);
        IERC20(kp).safeApprove(address(kplocker), uint256(-1));

        IERC20(ekl).safeApprove(eklDeposit, 0);
        IERC20(ekl).safeApprove(eklDeposit, uint256(-1));
    }

    function setOperator(address _op) external {
        require(msg.sender == operator, "!auth");
        operator = _op;
    }

    function setDelegate(address _delegateContract, address _delegate) external{
        require(msg.sender == operator, "!auth");
        // IDelegation(_delegateContract).setDelegate(keccak256("kp.eth"), _delegate);
        IDelegation(_delegateContract).setDelegate("kp.klay", _delegate);
    }

    function lock(uint256 _amount, uint256 _spendRatio) external{
        require(msg.sender == operator, "!auth");

        if(_amount > 0){
            IERC20(kp).safeTransferFrom(msg.sender, address(this), _amount);
        }
        _amount = IERC20(kp).balanceOf(address(this));

        kplocker.lock(address(this),_amount,_spendRatio);
    }

    function processExpiredLocks(bool _relock) external{
        require(msg.sender == operator, "!auth");

        kplocker.processExpiredLocks(_relock);
    }

    function processRewards() external{
        require(msg.sender == operator, "!auth");

        kplocker.getLockReward(address(this), true);
        IRewardStaking(kpEKLStaking).getReward(address(this), true);

        uint256 eklBal = IERC20(ekl).balanceOf(address(this));
        if (eklBal > 0) {
            IEKLDepositor(eklDeposit).depositEKL(eklBal, true);
        }

        uint kpEKLBal = IERC20(kpEKL).balanceOf(address(this));
        if(kpEKLBal > 0){
            IRewardStaking(kpEKLStaking).stake(kpEKLBal);
        }
    }

    function withdrawkpEKL(uint256 _amount, address _withdrawTo) external{
        require(msg.sender == operator, "!auth");
        require(_withdrawTo != address(0),"bad address");

        IRewardStaking(kpEKLStaking).withdraw(_amount, true);
        uint kpEKLBal = IERC20(kpEKL).balanceOf(address(this));
        if(kpEKLBal > 0){
            IERC20(kpEKL).safeTransfer(_withdrawTo, kpEKLBal);
        }
    }
    
    function withdrawTo(IERC20 _asset, uint256 _amount, address _to) external {
    	require(msg.sender == operator, "!auth");

        _asset.safeTransfer(_to, _amount);
    }

    function execute(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external returns (bool, bytes memory) {
        require(msg.sender == operator,"!auth");

        (bool success, bytes memory result) = _to.call{value:_value}(_data);

        return (success, result);
    }

}