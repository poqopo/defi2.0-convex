// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract FakeClaim {
    using SafeERC20 for IERC20;

    IERC20 ekl;
    IERC20 postekl;
    uint256 public totalSupply = 0; 

    constructor(IERC20 _ekl, IERC20 _postekl) public {
      ekl= _ekl;
      postekl = _postekl;
    }

    function claimAll(address _to) public {
      ekl.safeTransfer(_to, 10e18);
      postekl.safeTransfer(_to, 5e18);
    }
    
}