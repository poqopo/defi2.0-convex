// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';


contract FakeVote {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    constructor() public {
    }

    function voteForGauge(address _gaugeAddress, uint256 amount) public {
      return;
    }
}