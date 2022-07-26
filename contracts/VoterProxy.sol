// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/Interfaces.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract EklipseVoterProxy {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public constant ekl = address(0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA);
    address public constant postekl = address(0x0e23BeE35717987E71Fa8445E4Dd750aD718BA8a);
    address public constant eklclaim = address(0xAb7f8facb7db88db80F35c96CD67A9e9d381C7Ee);
    address public constant escrow = address(0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58);
    address public constant gaugeController = address(0x18428b7826C2588207e39b742c15642B8D9755B4);
    
    address public owner;
    address public operator;
    address public depositor;
    
    mapping (address => bool) private stashPool;
    mapping (address => bool) private protectedTokens;

    constructor() public {
        owner = msg.sender;
    }

    function getName() external pure returns (string memory) {
        return "EklipseVoterProxy";
    }

    function setOwner(address _owner) external {
        require(msg.sender == owner, "!auth");
        owner = _owner;
    }

    function setOperator(address _operator) external {
        require(msg.sender == owner, "!auth");
        require(operator == address(0) || IDeposit(operator).isShutdown() == true, "needs shutdown");
        
        operator = _operator;
    }

    function setDepositor(address _depositor) external {
        require(msg.sender == owner, "!auth");

        depositor = _depositor;
    }

    function deposit(address _token, address _gauge) external returns(bool){
        require(msg.sender == operator, "!auth");
        if(protectedTokens[_token] == false){
            protectedTokens[_token] = true;
        }
        if(protectedTokens[_gauge] == false){
            protectedTokens[_gauge] = true;
        }
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(_token).safeApprove(_gauge, 0);
            IERC20(_token).safeApprove(_gauge, balance);
            IEklipseGauge(_gauge).deposit(balance);
        }
        return true;
    }

    //stash only function for pulling extra incentive reward tokens out
    function withdrawOther(IERC20 _asset) external returns (uint256 balance) {
        require(msg.sender == operator, "!auth");

        //check protection
        if(protectedTokens[address(_asset)] == true){
            return 0;
        }

        balance = _asset.balanceOf(address(this));
        _asset.safeTransfer(msg.sender, balance);
        return balance;
    }

    // Withdraw partial funds
    function withdraw(address _token, address _gauge, uint256 _amount) public returns(bool){
        require(msg.sender == operator, "!auth");
        uint256 _balance = IERC20(_token).balanceOf(address(this));
        if (_balance < _amount) {
            _amount = _withdrawSome(_gauge, _amount.sub(_balance));
            _amount = _amount.add(_balance);
        }
        IERC20(_token).safeTransfer(msg.sender, _amount);
        return true;
    }

     function withdrawAll(address _token, address _gauge) external returns(bool){
        require(msg.sender == operator, "!auth");
        (uint256 amount,,) = IEklipseGauge(_gauge).userInfo(address(this));
        amount = amount.add(IERC20(_token).balanceOf(address(this)));
        withdraw(_token, _gauge, amount);
        return true;
    }

    function _withdrawSome(address _gauge, uint256 _amount) internal returns (uint256) {
        IEklipseGauge(_gauge).withdraw(_amount);
        return _amount;
    }

    function createLock(uint256 _value) external returns(bool){
        require(msg.sender == depositor, "!auth");
        IERC20(ekl).safeApprove(escrow, 0);
        IERC20(ekl).safeApprove(escrow, _value);
        IEklipseVoteEscrow(escrow).addLock(_value, 365 * 4);
        return true;
    }

    function release() external returns(bool){
        require(msg.sender == depositor, "!auth");
        IEklipseVoteEscrow(escrow).withdrawEkl();
        return true;
    }

    function vote(address _gaugeAddress, uint256 _amount) external returns(bool){
        require(msg.sender == operator, "!auth");
        IVoting(gaugeController).voteForGauge(_gaugeAddress,_amount);
        return true;
    }

    function claimRewards() external returns(bool){
        require(msg.sender == operator, "!auth");
        IEKLClaim(eklclaim).claimAll(address(this));
        uint256 eklbal = IERC20(ekl).balanceOf(address(this));
        if (eklbal > 0) {
          IERC20(ekl).safeTransfer(operator, eklbal);
        }
        uint256 posteklbal = IERC20(postekl).balanceOf(address(this));
        if (posteklbal > 0) {
          IERC20(postekl).safeTransfer(operator, posteklbal);
        }
        return true;
    }

    function claimFees(address _token) external returns (uint256){
        require(msg.sender == operator, "!auth");
        IEklipseVoteEscrow(escrow).withdrawFeeReward();
        uint256 _balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(operator, _balance);
        return _balance;
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