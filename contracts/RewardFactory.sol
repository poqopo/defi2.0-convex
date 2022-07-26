// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/Interfaces.sol";
import "./BaseRewardPool.sol";
import "./VirtualBalanceRewardPool.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract RewardFactory {
    using Address for address;

    address public operator;

    constructor(address _operator) public {
        operator = _operator;
    }

    //create a virtual balance reward pool that mimicks the balance of a pool's main reward contract
    //used for extra incentive tokens(ex. snx) as well as veekl fees
    function CreateTokenRewards(address _token, address _mainRewards, address _operator) external returns (address) {
        require(msg.sender == operator, "!auth");

        //create new pool, use main pool for balance lookup
        VirtualBalanceRewardPool rewardPool = new VirtualBalanceRewardPool(_mainRewards,_token,_operator);
        address rAddress = address(rewardPool);
        //add the new pool to main pool's list of extra rewards, assuming this factory has "reward manager" role
        IRewards(_mainRewards).addExtraReward(rAddress);
        //return new pool's address
        return rAddress;
    }
}