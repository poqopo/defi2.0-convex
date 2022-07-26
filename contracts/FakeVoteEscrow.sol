// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';


contract FakeVoteEscrow {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 public MAX_LOCK_DURATION = 86400 * 365 * 4;
    IERC20 ekl;
    IERC20 fee;

    constructor(IERC20 _ekl, IERC20 _fee) public {
        ekl = _ekl;
        fee = _fee;
    }

  function addLock(uint256 _amount, uint256 _time) external {
    ekl.safeTransferFrom(msg.sender, address(this), _amount);
  }

  function withdrawEkl() external {
    uint256 bal = ekl.balanceOf(address(this));
    ekl.safeTransfer(msg.sender, bal);
  }

  function withdrawFeeReward() external returns(uint256) {
    uint256 bal = fee.balanceOf(address(this));
    fee.safeTransfer(msg.sender, bal);
  }

  function userInfo(address user) external view returns(uint256, uint256, uint256, uint256){
    return (0, 0, 0, 0);
  }
}