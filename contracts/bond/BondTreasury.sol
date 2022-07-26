// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;


import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "./interface/IBondTreasury.sol";
import "../Interfaces/IBooster.sol";
import "./library/upgradeable/VersionedInitializable.sol";

contract BondTreasury is Ownable, VersionedInitializable, IBondTreasury {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    uint256 public constant REVISION = 1;

    address public DAO;
    address public kp;
    address public booster;

    address[] internal _reserveTokens;
    mapping(address => bool) public isReserveToken;
    mapping(address => uint256) public tokenPaidAmounts;
    address[] internal _reserveDepositors;
    mapping(address => bool) public isReserveDepositor;

    function __initialize(
        address DAO_,
        address kp_
    ) external initializer {
        // _setInitialOwner();
        require(DAO_ != address(0), "BondTreasury: 0 address");
        DAO = DAO_;
        require(kp_ != address(0), "BondTreasury: 0 address");
        kp = kp_;
    }

    function setBooster(address _booster) external onlyOwner {
      booster = _booster;
    }

    function getBalance() external view returns (uint256) {
        return IERC20(kp).balanceOf(address(this));
    }

    function getRevision() internal pure override returns (uint256) {
        return REVISION;
    }

    function reserveTokens() external view returns (address[] memory) {
        return _reserveTokens;
    }

    function reserveDepositors() external view returns (address[] memory) {
        return _reserveDepositors;
    }

    function deposit(uint256 _amount, address _token, uint256 _pay) external override {
        require(isReserveToken[ _token ], "BondTreasury: not registered");
        require(isReserveDepositor[ msg.sender ], "BondTreasury: not authorized");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // mint KP needed and store amount of rewards for distribution
        IERC20(kp).transfer(msg.sender, _pay);

        tokenPaidAmounts[_token] = tokenPaidAmounts[_token].add(_pay);
        emit Deposit(_token, _amount, _pay);
    }

    function register(address _token, address _depositor) external onlyOwner {
        require(_token != address(0) && _depositor != address(0), "BondTreasury: 0 address");
        require(!isReserveDepositor[_depositor], "BondTreasury: already registered");
        _register(_token, _depositor);
    }

    function _register(address _token, address _depositor) internal {
        if (!isReserveToken[_token]) {
            _reserveTokens.push(_token);
            isReserveToken[_token] = true;
        }
        address[] memory reserveDepositors_ = _reserveDepositors;
        bool exist = false;
        for (uint256 i = 0; i < reserveDepositors_.length; i++) {
            if (reserveDepositors_[i] == _depositor) {
                exist = true;
            }
        }
        if (!exist) {
            _reserveDepositors.push(_depositor);
        }
        isReserveDepositor[_depositor] = true;
    }

    function unregisterDepositor(address _depositor) external onlyOwner {
        require(isReserveDepositor[_depositor], "BondTreasury: not registered");
        isReserveDepositor[_depositor] = false;
    }



// //For Convex

    function setApprovals() external {
      for (uint256 i = 0; i < _reserveTokens.length; i ++) {
        IERC20(_reserveTokens[i]).safeApprove(booster, 0);
        IERC20(_reserveTokens[i]).safeApprove(booster, uint256(-1));
      }
    }

    function depositLP(uint256 _pid, uint256 _amount) external onlyOwner returns(bool){

      IBooster(booster).deposit(_pid, _amount);
      emit LPDeposited(_pid, _amount);
      return true;
    }

    function depositAll(uint256 _pid) external onlyOwner returns(bool){

      IBooster(booster).depositAll(_pid);
      emit LPDepositedAll(_pid);
      return true;
    }

    function withdrawLP(uint256 _pid, uint256 _amount) external  onlyOwner returns(bool){

      IBooster(booster).withdraw(_pid, _amount);
      emit LPWithdrawed(_pid, _amount);
      return true;
    }

    function withdrawAll(uint256 _pid) external onlyOwner returns(bool){
      IBooster(booster).withdrawAll(_pid);
      emit LPWithdrawedAll(_pid);
      return true;
    }

    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (excluding principle or KP) to the DAO
     *  @return bool
     */
    function recoverLostToken(address _token) external returns (bool) {
        require(_token != kp, "BondTreasury: cannot withdraw KP");
        require(!isReserveToken[_token], "BondTreasury: cannot withdraw reserve tokens");
        IERC20(_token).safeTransfer(DAO, IERC20(_token).balanceOf(address(this)));
        return true;
    }

}