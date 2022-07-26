// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.7.5;

import '../Uniswap/TransferHelper.sol';
import "./KUSDPoolLibrary.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import "../../Interfaces/IAssetOracle.sol";
import "../../Interfaces/IKPtoken.sol";
import "../../Interfaces/IKUSDtoken.sol";


contract KUSDBank is Ownable {
    using Address for address;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    ERC20 public collateral_token;

    address public kp;
    address public kusd;

    address public assetOracle;

    uint256 public minting_fee;
    uint256 public redemption_fee;
    uint256 public buyback_fee;
    uint256 public recollat_fee;

    mapping (address => uint256) public redeemKPBalances;
    mapping (address => uint256) public redeemCollateralBalances;
    uint256 public unclaimedPoolCollateral;
    uint256 public unclaimedPoolKP;
    mapping (address => uint256) public lastRedeemed;

    // Constants for various precisions
    uint256 private constant PRICE_PRECISION = 1e6;
    uint256 private constant COLLATERAL_RATIO_PRECISION = 1e6;
    uint256 private constant COLLATERAL_RATIO_MAX = 1e6;

    // Number of decimals needed to get to 18
    uint256 private immutable missing_decimals;
    
    // Pool_ceiling is the total units of collateral that a pool contract can hold
    uint256 public pool_ceiling = 1000000e18;

    // Stores price of the collateral, if price is paused
    uint256 public pausedPrice = 0;

    // Bonus rate on KP minted during recollateralizeKUSD(); 6 decimals of precision, set to 0.75% on genesis
    uint256 public bonus_rate = 7500;

    // Number of blocks to wait before being able to collectRedemption()
    uint256 public redemption_delay = 1;
    
    // AccessControl state variables
    bool public mintPaused = false;
    bool public redeemPaused = false;

    /* ========== MODIFIERS ========== */


    modifier notRedeemPaused() {
        require(redeemPaused == false, "Redeeming is paused");
        _;
    }

    modifier notMintPaused() {
        require(mintPaused == false, "Minting is paused");
        _;
    }
 
    /* ========== CONSTRUCTOR ========== */
    
    constructor (
        address _kp,
        address _kusd,
        address _collateral,
        address _oracle
    )
    {
        require(
            (_kp != address(0))
            && (_kusd != address(0))
            && (_collateral != address(0))
            && (_oracle != address(0))
        , "Zero address detected");
        kp = _kp;
        kusd = _kusd;
        collateral_token = ERC20(_collateral);
        missing_decimals = uint(18).sub(collateral_token.decimals());
        assetOracle = _oracle;
    }

    /* ========== VIEWS ========== */
    
    // Returns dollar value of collateral held in this KUSD pool
    
    function collatDollarBalance() public view returns (uint256) {
      return (collateral_token.balanceOf(address(this)).sub(unclaimedPoolCollateral)).mul(10 ** missing_decimals);//.div(PRICE_PRECISION);
    } 


    // Returns the value of excess collateral held in this KUSD pool, compared to what is needed to maintain the global collateral ratio
    function availableExcessCollatDV() public view returns (uint256) {
        uint256 total_supply = IKUSDtoken(kusd).totalSupply();
        uint256 cur_collateral_ratio = IKUSDtoken(kusd).current_collateral_ratio();
        uint256 collat_value = collatDollarBalance();

        if (cur_collateral_ratio > COLLATERAL_RATIO_PRECISION) cur_collateral_ratio = COLLATERAL_RATIO_PRECISION; // Handles an overcollateralized contract with CR > 1
        uint256 required_collat_dollar_value_d18 = (total_supply.mul(cur_collateral_ratio)).div(COLLATERAL_RATIO_PRECISION); // Calculates collateral needed to back each 1 KUSD with $1 of collateral at current collat ratio
        if (collat_value > required_collat_dollar_value_d18) return collat_value.sub(required_collat_dollar_value_d18);
        else return 0;
    }

    /* ========== PUBLIC FUNCTIONS ========== */
    
    // Returns the price of the pool collateral in USD
    function getCollateralPrice() public pure returns (uint256) {
        return 1000000;
    }

    // We separate out the 1t1, fractional and algorithmic minting functions for gas efficiency 
    function mint1t1KUSD(uint256 collateral_amount, uint256 KUSD_out_min) external notMintPaused {
        uint256 collateral_amount_d18 = collateral_amount * (10 ** missing_decimals);

        require(IKUSDtoken(kusd).current_collateral_ratio() >= COLLATERAL_RATIO_MAX, "Collateral ratio must be >= 1");
        require((collateral_token.balanceOf(address(this))).sub(unclaimedPoolCollateral).add(collateral_amount) <= pool_ceiling, "[Pool's Closed]: Ceiling reached");
        
        (uint256 KUSD_amount_d18) = KUSDPoolLibrary.calcMint1t1KUSD(
            getCollateralPrice(),
            collateral_amount_d18
        ); //1 KUSD for each $1 worth of collateral

        KUSD_amount_d18 = (KUSD_amount_d18.mul(uint(1e6).sub(minting_fee))).div(1e6); //remove precision at the end
        require(KUSD_out_min <= KUSD_amount_d18, "Slippage limit reached");

        TransferHelper.safeTransferFrom(address(collateral_token), msg.sender, address(this), collateral_amount);
        IKUSDtoken(kusd).Bank_mint(msg.sender, KUSD_amount_d18);
    }

    // 0% collateral-backed
    function mintAlgorithmicKUSD(uint256 KP_amount_d18, uint256 KUSD_out_min) external notMintPaused {
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
        require(IKUSDtoken(kusd).current_collateral_ratio() == 0, "Collateral ratio must be 0");
        
        (uint256 KUSD_amount_d18) = KUSDPoolLibrary.calcMintAlgorithmicKUSD(
            KP_price, // X KP / 1 USD
            KP_amount_d18
        );

        KUSD_amount_d18 = (KUSD_amount_d18.mul(uint(1e6).sub(minting_fee))).div(1e6);
        require(KUSD_out_min <= KUSD_amount_d18, "Slippage limit reached");

        IKPtoken(kp).Bank_burn_from(msg.sender, KP_amount_d18);
        IKUSDtoken(kusd).Bank_mint(msg.sender, KUSD_amount_d18);
    }

    // Will fail if fully collateralized or fully algorithmic
    // > 0% and < 100% collateral-backed
    function mintFractionalKUSD(uint256 collateral_amount, uint256 KP_amount, uint256 KUSD_out_min) external notMintPaused {
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
        uint256 current_collateral_ratio = IKUSDtoken(kusd).current_collateral_ratio();

        require(current_collateral_ratio < COLLATERAL_RATIO_MAX && current_collateral_ratio > 0, "Collateral ratio needs to be between .000001 and .999999");
        require(collateral_token.balanceOf(address(this)).sub(unclaimedPoolCollateral).add(collateral_amount) <= pool_ceiling, "Pool ceiling reached, no more KUSD can be minted with this collateral");

        uint256 collateral_amount_d18 = collateral_amount * (10 ** missing_decimals);
        KUSDPoolLibrary.MintFF_Params memory input_params = KUSDPoolLibrary.MintFF_Params(
            KP_price,
            getCollateralPrice(),
            KP_amount,
            collateral_amount_d18,
            current_collateral_ratio
        );

        (uint256 mint_amount, uint256 KP_needed) = KUSDPoolLibrary.calcMintFractionalKUSD(input_params);

        mint_amount = (mint_amount.mul(uint(1e6).sub(minting_fee))).div(1e6);
        require(KUSD_out_min <= mint_amount, "Slippage limit reached");
        require(KP_needed <= KP_amount, "Not enough KP inputted");

        IKPtoken(kp).Bank_burn_from(msg.sender, KP_needed);
        TransferHelper.safeTransferFrom(address(collateral_token), msg.sender, address(this), collateral_amount);
        IKUSDtoken(kusd).Bank_mint(msg.sender, mint_amount);
    }

    // Redeem collateral. 100% collateral-backed
    function redeem1t1KUSD(uint256 KUSD_amount, uint256 COLLATERAL_out_min) external notRedeemPaused {
        require(IKUSDtoken(kusd).current_collateral_ratio() == COLLATERAL_RATIO_MAX, "Collateral ratio must be == 1");

        // Need to adjust for decimals of collateral
        uint256 KUSD_amount_precision = KUSD_amount.div(10 ** missing_decimals);
        (uint256 collateral_needed) = KUSDPoolLibrary.calcRedeem1t1KUSD(
            getCollateralPrice(),
            KUSD_amount_precision
        );

        collateral_needed = (collateral_needed.mul(uint(1e6).sub(redemption_fee))).div(1e6);
        require(collateral_needed <= collateral_token.balanceOf(address(this)).sub(unclaimedPoolCollateral), "Not enough collateral in pool");
        require(COLLATERAL_out_min <= collateral_needed, "Slippage limit reached");

        redeemCollateralBalances[msg.sender] = redeemCollateralBalances[msg.sender].add(collateral_needed);
        unclaimedPoolCollateral = unclaimedPoolCollateral.add(collateral_needed);
        lastRedeemed[msg.sender] = block.number;
        
        // Move all external functions to the end
        IKUSDtoken(kusd).Bank_burn_from(msg.sender, KUSD_amount);
    }

    // Will fail if fully collateralized or algorithmic
    // Redeem KUSD for collateral and KP. > 0% and < 100% collateral-backed
    function redeemFractionalKUSD(uint256 KUSD_amount, uint256 KP_out_min, uint256 COLLATERAL_out_min) external notRedeemPaused {
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
        uint256 current_collateral_ratio = IKUSDtoken(kusd).current_collateral_ratio();

        require(current_collateral_ratio < COLLATERAL_RATIO_MAX && current_collateral_ratio > 0, "Collateral ratio needs to be between .000001 and .999999");
        uint256 col_price_usd = getCollateralPrice();

        uint256 KUSD_amount_post_fee = (KUSD_amount.mul(uint(1e6).sub(redemption_fee))).div(PRICE_PRECISION);

        uint256 KP_dollar_value_d18 = KUSD_amount_post_fee.sub(KUSD_amount_post_fee.mul(current_collateral_ratio).div(PRICE_PRECISION));
        uint256 KP_amount = KP_dollar_value_d18.mul(PRICE_PRECISION).div(KP_price);

        // Need to adjust for decimals of collateral
        uint256 KUSD_amount_precision = KUSD_amount_post_fee.div(10 ** missing_decimals);
        uint256 collateral_dollar_value = KUSD_amount_precision.mul(current_collateral_ratio).div(PRICE_PRECISION);
        uint256 collateral_amount = collateral_dollar_value.mul(PRICE_PRECISION).div(col_price_usd);


        require(collateral_amount <= collateral_token.balanceOf(address(this)).sub(unclaimedPoolCollateral), "Not enough collateral in pool");
        require(COLLATERAL_out_min <= collateral_amount, "Slippage limit reached [collateral]");
        require(KP_out_min <= KP_amount, "Slippage limit reached [KP]");

        redeemCollateralBalances[msg.sender] = redeemCollateralBalances[msg.sender].add(collateral_amount);
        unclaimedPoolCollateral = unclaimedPoolCollateral.add(collateral_amount);

        redeemKPBalances[msg.sender] = redeemKPBalances[msg.sender].add(KP_amount);
        unclaimedPoolKP = unclaimedPoolKP.add(KP_amount);

        lastRedeemed[msg.sender] = block.number;
        
        // Move all external functions to the end
        IKUSDtoken(kusd).Bank_burn_from(msg.sender, KUSD_amount);
        IKPtoken(kp).Bank_mint(address(this), KP_amount);
    }

    // Redeem KUSD for KP. 0% collateral-backed
    function redeemAlgorithmicKUSD(uint256 KUSD_amount, uint256 KP_out_min) external notRedeemPaused {
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
        uint256 current_collateral_ratio = IKUSDtoken(kusd).current_collateral_ratio();

        require(current_collateral_ratio == 0, "Collateral ratio must be 0"); 
        uint256 KP_dollar_value_d18 = KUSD_amount;

        KP_dollar_value_d18 = (KP_dollar_value_d18.mul(uint(1e6).sub(redemption_fee))).div(PRICE_PRECISION); //apply fees

        uint256 KP_amount = KP_dollar_value_d18.mul(PRICE_PRECISION).div(KP_price);
        
        redeemKPBalances[msg.sender] = redeemKPBalances[msg.sender].add(KP_amount);
        unclaimedPoolKP = unclaimedPoolKP.add(KP_amount);
        
        lastRedeemed[msg.sender] = block.number;
        
        require(KP_out_min <= KP_amount, "Slippage limit reached");
        // Move all external functions to the end
        IKUSDtoken(kusd).Bank_burn_from(msg.sender, KUSD_amount);
        IKPtoken(kp).Bank_mint(address(this), KP_amount);
    }

    // After a redemption happens, transfer the newly minted KP and owed collateral from this pool
    // contract to the user. Redemption is split into two functions to prevent flash loans from being able
    // to take out KUSD/collateral from the system, use an AMM to trade the new price, and then mint back into the system.
    function collectRedemption() external {
        require((lastRedeemed[msg.sender].add(redemption_delay)) <= block.number, "Must wait for redemption_delay blocks before collecting redemption");
        bool sendKP = false;
        bool sendCollateral = false;
        uint KPAmount = 0;
        uint CollateralAmount = 0;

        // Use Checks-Effects-Interactions pattern
        if(redeemKPBalances[msg.sender] > 0){
            KPAmount = redeemKPBalances[msg.sender];
            redeemKPBalances[msg.sender] = 0;
            unclaimedPoolKP = unclaimedPoolKP.sub(KPAmount);

            sendKP = true;
        }
        
        if(redeemCollateralBalances[msg.sender] > 0){
            CollateralAmount = redeemCollateralBalances[msg.sender];
            redeemCollateralBalances[msg.sender] = 0;
            unclaimedPoolCollateral = unclaimedPoolCollateral.sub(CollateralAmount);

            sendCollateral = true;
        }

        if(sendKP){
            TransferHelper.safeTransfer(address(kp), msg.sender, KPAmount);
        }
        if(sendCollateral){
            TransferHelper.safeTransfer(address(collateral_token), msg.sender, CollateralAmount);
        }
    }


    // When the protocol is recollateralizing, we need to give a discount of KP to hit the new CR target
    // Thus, if the target collateral ratio is higher than the actual value of collateral, minters get KP for adding collateral
    // This function simply rewards anyone that sends collateral to a pool with the same amount of KP + the bonus rate
    // Anyone can call this function to recollateralize the protocol and take the extra KP value from the bonus rate as an arb opportunity
    function recollateralizeKUSD(uint256 collateral_amount, uint256 KP_out_min) external {
        uint256 collateral_amount_d18 = collateral_amount * (10 ** missing_decimals);
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
        uint256 KUSD_total_supply = IKUSDtoken(kusd).totalSupply();
        uint256 current_collateral_ratio = IKUSDtoken(kusd).current_collateral_ratio();
        uint256 collat_value = collatDollarBalance();

        (uint256 collateral_units, uint256 amount_to_recollat) = KUSDPoolLibrary.calcRecollateralizeKUSDInner(
            collateral_amount_d18,
            getCollateralPrice(),
            collat_value,
            KUSD_total_supply,
            current_collateral_ratio
        ); 

        uint256 collateral_units_precision = collateral_units.div(10 ** missing_decimals);

        uint256 KP_paid_back = amount_to_recollat.mul(uint(1e6).add(bonus_rate).sub(recollat_fee)).div(KP_price);

        require(KP_out_min <= KP_paid_back, "Slippage limit reached");
        TransferHelper.safeTransferFrom(address(collateral_token), msg.sender, address(this), collateral_units_precision);
        IKPtoken(kp).Bank_mint(msg.sender, KP_paid_back);
    }

    // Function can be called by an KP holder to have the protocol buy back KP with excess collateral value from a desired collateral pool
    // This can also happen if the collateral ratio > 1
    function buyBackKP(uint256 KP_amount, uint256 COLLATERAL_out_min) external {
        uint256 KP_price = IAssetOracle(assetOracle).getAssetPrice(kp);
    
        KUSDPoolLibrary.BuybackKP_Params memory input_params = KUSDPoolLibrary.BuybackKP_Params(
            availableExcessCollatDV(),
            KP_price,
            getCollateralPrice(),
            KP_amount
        );

        (uint256 collateral_equivalent_d18) = (KUSDPoolLibrary.calcBuyBackKP(input_params)).mul(uint(1e6).sub(buyback_fee)).div(1e6);
        uint256 collateral_precision = collateral_equivalent_d18.div(10 ** missing_decimals);

        require(COLLATERAL_out_min <= collateral_precision, "Slippage limit reached");
        // Give the sender their desired collateral and burn the KP
        IKPtoken(kp).Bank_burn_from(msg.sender, KP_amount);
        TransferHelper.safeTransfer(address(collateral_token), msg.sender, collateral_precision);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function toggleMinting() external onlyOwner {
        mintPaused = !mintPaused;

        emit MintingToggled(mintPaused);
    }

    function toggleRedeeming() external onlyOwner {
        redeemPaused = !redeemPaused;

        emit RedeemingToggled(redeemPaused);
    }

    
    // Combined into one function due to 24KiB contract memory limit
    function setPoolParameters(uint256 new_ceiling, uint256 new_bonus_rate, uint256 new_redemption_delay, uint256 new_mint_fee, uint256 new_redeem_fee, uint256 new_buyback_fee, uint256 new_recollat_fee) external onlyOwner {
        pool_ceiling = new_ceiling;
        bonus_rate = new_bonus_rate;
        redemption_delay = new_redemption_delay;
        minting_fee = new_mint_fee;
        redemption_fee = new_redeem_fee;
        buyback_fee = new_buyback_fee;
        recollat_fee = new_recollat_fee;

        emit PoolParametersSet(new_ceiling, new_bonus_rate, new_redemption_delay, new_mint_fee, new_redeem_fee, new_buyback_fee, new_recollat_fee);
    }

    /* ========== EVENTS ========== */

    event PoolParametersSet(uint256 new_ceiling, uint256 new_bonus_rate, uint256 new_redemption_delay, uint256 new_mint_fee, uint256 new_redeem_fee, uint256 new_buyback_fee, uint256 new_recollat_fee);
    event MintingToggled(bool toggled);
    event RedeemingToggled(bool toggled);
    event ReserveRatioset(uint256 ratio);
}