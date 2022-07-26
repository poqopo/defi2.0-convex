// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';


contract FakeGauge {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 token;
    uint256 public totalSupply = 0; 

    constructor(IERC20 _token) public {
        token = _token;
    }

    function deposit(uint256 amount) public {
      token.safeTransferFrom(msg.sender, address(this), amount);
      totalSupply = totalSupply.add(amount);

    }

    function withdraw(uint256 amount) public {
      token.safeTransfer(msg.sender, amount);
    }

    function userInfo(address _addr) external view returns(uint256, uint256, uint256) {
      return(totalSupply, 0,0);
    }
}