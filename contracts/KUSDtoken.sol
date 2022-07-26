// SPDX-License-Identifier: MIT
pragma solidity =0.7.5;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "./Interfaces/IKPtoken.sol";
import "./Interfaces/IAssetOracle.sol";
import "./ERC20Custom.sol";
import "./bank/Owned.sol";

contract KUSDtoken is ERC20Custom, Owned  {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

  string public symbol;
  string public name;
  uint8 public constant decimals = 18;
  
  address public kp;
  // address public usdt;
  address public creator_address;

  uint256 public constant genesis_supply = 2000000e18; // 2M SCMAP 선발행
  address public kusdbank; //kusd Bank address받기
  address public assetOracle;

  //Bank에 필요한 variables
  uint256 private constant PRICE_PRECISION = 1e6;
  uint256 public current_collateral_ratio;
  uint256 public redemption_fee;
  uint256 public minting_fee; 
  uint256 public kusd_step;
  uint256 public refresh_cooldown; 
  uint256 public price_target;
  uint256 public price_band;

  bool public collateral_ratio_paused = false;



  /*===============modifiers================== */

  modifier onlyBank() {
    require(msg.sender == kusdbank, "only Bank Contract!");
    _;
  }


  /*=============constructor================*/

  constructor(
    string memory _name,
    string memory _symbol,
    address _creator_address
  ) Owned(_creator_address){
    name = _name;
    symbol = _symbol;
    creator_address = _creator_address;
    _mint(creator_address, genesis_supply);
    kusd_step = 2500;
    refresh_cooldown = 3600;
    price_target = 1000000;
    price_band = 5000;
  }

  /* ========= views =============*/


  function kusd_info() public view returns (uint256, uint256, uint256, uint256, uint256) {
    return (
      IAssetOracle(assetOracle).getAssetPrice(IKPtoken(kp).kusd()),
      totalSupply(),
      current_collateral_ratio,
      minting_fee,
      redemption_fee
    );
  }

  /*=========== public functions ============ */
  uint256 public last_call_time;

  function refreshCollateralRatio() public {
    uint256 kusd_cur_price = IAssetOracle(assetOracle).getAssetPrice(IKPtoken(kp).kusd());
    require(block.timestamp - last_call_time >= refresh_cooldown, "Please wait refresh_cooldown");

    if (kusd_cur_price > price_target.add(price_band)) {
      if(current_collateral_ratio <= kusd_step) {
        current_collateral_ratio = 0;
      } else {
        current_collateral_ratio = current_collateral_ratio.sub(kusd_step);
      }
    } else if (kusd_cur_price < price_target.sub(price_band)) {
      if(current_collateral_ratio.add(kusd_step) >= 1000000) {
        current_collateral_ratio = 1000000;
      } else {
        current_collateral_ratio = current_collateral_ratio.add(kusd_step);
      }
    }

    last_call_time = block.timestamp;

    emit CollateralRatioRefreshed(current_collateral_ratio);
  }

  /* ============= Restricted Funtions ============ */

  function Bank_burn_from(address b_address, uint256 b_amoount) public onlyBank {
    _burnFrom(b_address, b_amoount);
    emit kusdBurned(b_address, msg.sender ,b_amoount);
  }

  function Bank_mint (address m_address, uint256 m_amount) public onlyBank {
    _mint(m_address, m_amount);
    emit kusdMinted(msg.sender, m_address, m_amount);
  }

  function setRedemptionFee(uint256 red_fee) external onlyOwner {
    redemption_fee = red_fee;
    emit RedemptionFeeSet(red_fee);
  }

  function setMintingFee(uint256 mint_fee) external onlyOwner {
    minting_fee = mint_fee;
    emit MintingFeeSet(mint_fee);
  }

  function setPriceTarget(uint256 _new_price_target) external onlyOwner {
    price_target = _new_price_target;
    emit PriceTargetSet(_new_price_target);
  }

  function setkusdStep(uint256 _new_step) external onlyOwner {
    kusd_step = _new_step;
    emit kusdStepSet(_new_step);
  }
  function setPriceBand(uint256 _price_band) external onlyOwner {
    price_band = _price_band;
    emit PriceBandSet(_price_band);
  }

  function setRefreshCooldown(uint256 _new_cooldown) external onlyOwner {
    refresh_cooldown = _new_cooldown;
    emit RefreshCooldownSet(_new_cooldown);
  }

  function setkpAddress(address _kp_address) external onlyOwner {
    require(_kp_address != address(0), "Zero address detected");

    kp = _kp_address;
    emit KPAddressSet(_kp_address);
  }

  function setBankAddress(address _Bank_address) external onlyOwner {
    require(_Bank_address != address(0), "Zero address detected");

    kusdbank = _Bank_address;
    emit BankAddressSet(_Bank_address);
  }

  function setOracleAddress(address _oracleAddress) external onlyOwner {
    require(_oracleAddress != address(0), "Zero address detected");

    assetOracle = _oracleAddress;
  }

  function toggleCollateralRatio() external onlyOwner {
    collateral_ratio_paused = !collateral_ratio_paused;

    emit CollateralRatioToggled(collateral_ratio_paused);
  }

      /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for `accounts`'s tokens of at least
     * `amount`.
     */

  /* ===========EVENTS ==========*/
    // Track kusd burned
  event kusdBurned(address indexed from, address indexed to, uint256 amount);
  // Track WUSD minted
  event kusdMinted(address indexed from, address indexed to, uint256 amount);

  event CollateralRatioRefreshed(uint256 current_collateral_ratio);
  event RedemptionFeeSet(uint256 red_fee);
  event MintingFeeSet(uint256 min_fee);
  event kusdStepSet(uint256 new_step);
  event PriceTargetSet(uint256 new_price_target);
  event RefreshCooldownSet(uint256 new_cooldown);
  event KPAddressSet(address KP_address);
  event ControllerSet(address controller_address);
  event BankAddressSet(address Bank_address);
  event PriceBandSet(uint256 price_band);
  event KLAYUSDTOracleSet(address Klay_oracle_addr, address klay_address);
  event CollateralRatioToggled(bool collateral_ratio_paused);

}