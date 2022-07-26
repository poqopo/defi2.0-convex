// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "./interface/IBondTreasury.sol";
import "./interface/IStakedToken.sol";
import "./library/upgradeable/VersionedInitializable.sol";
import "./interface/IBondDepository.sol";
import "../Interfaces/IAssetOracle.sol";
import "../bank/Uniswap/interfaces/IUniswapV2Pair.sol";

interface IKlaySwapOracle {
    function estimatePos(address , uint256) external view returns (uint256);
    function balanceOf(address) external view returns(uint256);
    function totalSupply() external view returns(uint256);
    function getCurrentPool() external view returns(uint256, uint256);
}
abstract contract EKLkpEKLBondDepository is Ownable, VersionedInitializable, IBondDepository  {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    /* ======== EVENTS ======== */

    event BondCreated(address depositor, uint256 deposit, uint256 indexed payout, uint256 indexed expires, uint256 indexed priceInUSD);
    event BondRedeemed(address indexed recipient, uint256 payout, uint256 remaining);
    event BondPriceChanged(uint256 indexed priceInUSD, uint256 indexed debtRatio);
    event ControlVariableAdjustment(uint256 initialBCV, uint256 newBCV, uint256 adjustment, bool addition);

    /* ======== STATE VARIABLES ======== */

    address public DAO;
    address public kp; // token given as payment for bond

    address public ekllp;
    address public kplp;
    address public constant ekl = address(0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA);
    // address public oracle; 
    // UniswapPairOracle private Token0USDTOracle;
    // UniswapPairOracle private Token1USDTOracle;   
    // IUniswapV2Pair private principle; // token used to create bond(아마도 lp)
    address public override principle; // token used to create bond??
    address public treasury; // mints OHM when receives principle

    address public staking; // to auto-stake payout

    Terms public terms; // stores terms for new bonds
    Adjust public adjustment; // stores adjustment to BCV data

    mapping(address => Bond) public bondInfo; // stores bond information for depositors

    uint256 public totalDebt; // total value of outstanding bonds; used for pricing
    uint256 public lastDecay; // reference block for debt decay




    /* ======== STRUCTS ======== */

    // Info for creating new bonds
    struct Terms {
        uint256 controlVariable; // scaling variable for price in 10**2
        uint256 vestingTerm; // in blocks
        uint256 minimumPriceRate; // when calculate payout in 10**9
        uint256 maxPayout; // in ten thousandths of a %. i.e. 5000 = 0.5%
        uint256 fee; // as % of bond payout, in hundreths. (500 = 5% = 0.05 for every 1 paid) 1e4
        uint256 maxDebt; // 10**18 max debt amount
    }

    // Info for bond holder
    struct Bond {
        uint256 payout; // KP remaining to be paid
        uint256 vesting; // Blocks left to vest
        uint256 lastBlock; // Last interaction
        uint256 pricePaid; // In USDT, for front end viewing
    }

    // Info for incremental adjustments to control variable
    struct Adjust {
        bool add; // addition or subtraction
        uint256 rate; // increment
        uint256 target; // BCV when adjustment finished
        uint256 buffer; // minimum length (in blocks) between adjustments
        uint256 lastBlock; // block when last adjustment made
    }




    /* ======== INITIALIZATION ======== */

    function __initialize(
        address _kp,
        address _DAO,
        address _principle,
        address _ekllp,
        address _kplp
    ) external initializer {
        require(_kp != address(0));
        kp = _kp;
        require(_DAO != address(0));
        DAO = _DAO;
        require(_principle != address(0));
        principle = _principle;
        ekllp = _ekllp;
        kplp = _kplp;
    }

    /**
     *  @notice initializes bond parameters
     *  @param _controlVariable uint256
     *  @param _vestingTerm uint256
     *  @param _minimumPriceRate uint256
     *  @param _maxPayout uint256
     *  @param _fee uint256
     *  @param _maxDebt uint256
     *  @param _initialDebt uint256
     */
    function initializeBondTerms(
        uint256 _controlVariable,
        uint256 _vestingTerm,
        uint256 _minimumPriceRate,
        uint256 _maxPayout,
        uint256 _fee,
        uint256 _maxDebt,
        uint256 _initialDebt
    ) external onlyOwner() {
        require(terms.controlVariable == 0, "BondDepository: bonds must be initialized from 0");
        require(_maxPayout <= 10000, "BondDepository: payout cannot be above 1 percent");
        require(_fee <= 10000, "BondDepository: DAO fee cannot exceed payout");
        require(_minimumPriceRate <= 10**9, "BondDepository: min discount rate exceed");
        terms = Terms ({
            controlVariable: _controlVariable,
            vestingTerm: _vestingTerm,
            minimumPriceRate: _minimumPriceRate,
            maxPayout: _maxPayout,
            fee: _fee,
            maxDebt: _maxDebt
        });
        totalDebt = _initialDebt;
        lastDecay = block.number;
    }




    /* ======== POLICY FUNCTIONS ======== */

    enum PARAMETER { VESTING, PAYOUT, FEE, DEBT, MIN }
    /**
     *  @notice set parameters for new bonds
     *  @param _parameter PARAMETER
     *  @param _input uint256
     */
    function setBondTerms(PARAMETER _parameter, uint256 _input) external onlyOwner() {
        if (_parameter == PARAMETER.VESTING) { // 0
            terms.vestingTerm = _input;
        } else if (_parameter == PARAMETER.PAYOUT) { // 1
            require(_input <= 10000, "BondDepository: payout cannot be above 1 percent");
            terms.maxPayout = _input;
        } else if (_parameter == PARAMETER.FEE) { // 2
            require(_input <= 10000, "BondDepository: DAO fee cannot exceed payout");
            terms.fee = _input;
        } else if (_parameter == PARAMETER.DEBT) { // 3
            terms.maxDebt = _input;
        } else if (_parameter == PARAMETER.MIN) { // 4
            require(_input <= 10**9, "BondDepository: min discount rate exceed");
            terms.minimumPriceRate = _input;
        }
    }

    /**
     *  @notice set control variable adjustment
     *  @param _addition bool
     *  @param _increment uint256
     *  @param _target uint256
     *  @param _buffer uint256
     */
    function setAdjustment (
        bool _addition,
        uint256 _increment,
        uint256 _target,
        uint256 _buffer
    ) external onlyOwner() {
        require(_increment <= terms.controlVariable.mul(25).div(1000), "BondDepository: increment too large");
        require(_addition ? (_target > terms.controlVariable) : (_target < terms.controlVariable), "BondDepository: wrong target value");

        adjustment = Adjust({
            add: _addition,
            rate: _increment,
            target: _target,
            buffer: _buffer,
            lastBlock: block.number
        });
    }

    function setTreasury(address _treasury) external onlyOwner() {
        require(_treasury != address(0));
        treasury = _treasury;
    }


    /* ======== USER FUNCTIONS ======== */

    /**
     *  @notice deposit bond
     *  @param _amount uint256 in 10 ** 18 precision
     *  @param _maxPrice uint256
     *  @param _depositor address
     *  @return uint256
     */
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor
    ) external override returns (uint256) {
        require(_depositor != address(0), "BondDepository: Invalid address");

        decayDebt();
        require(totalDebt <= terms.maxDebt, "BondDepository: Max capacity reached");

        uint256 priceInUSD = bondPrice();
        // console.log("priceInUSD", priceInUSD);

        require(_maxPrice >= priceInUSD, "BondDepository: Slippage limit: more than max price"); // slippage protection

        uint256 principleValue = assetPrice().mul(_amount).div(10**6); // returns principle value, in USD, 10**18
        uint256 payout = payoutFor(principleValue); // payout to bonder is computed, bond amount

        require(payout >= 10 ** 16, "BondDepository: Bond too small"); // must be > 0.01 KP (underflow protection)
        require(payout <= maxPayout(), "BondDepository: Bond too large"); // size protection because there is no slippage

        // profits are calculated
        uint256 fee = payout.mul(terms.fee).div(10000);

        /**
            asset carries risk and is not minted against
            asset transferred to treasury and rewards minted as payout
         */
        // console.log("IERC20(principle)", IERC20(principle).balanceOf(msg.sender)/1e18);
        // IERC20(principle).approve(address(this), _amount);
        // console.log("allowance", IERC20(principle).allowance(msg.sender, address(this)));
        IERC20(principle).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(principle).approve(address(treasury), _amount);
        IBondTreasury(treasury).deposit(_amount, principle, payout.add(fee));

        if (fee != 0) { // fee is transferred to dao
            IERC20(kp).safeTransfer(DAO, fee);
        }

        // total debt is increased
        totalDebt = totalDebt.add(payout);

        // depositor info is stored
        bondInfo[_depositor] = Bond({
            payout: bondInfo[_depositor].payout.add(payout),
            vesting: terms.vestingTerm,
            lastBlock: block.number,
            pricePaid: priceInUSD
        });

        // indexed events are emitted
        emit BondCreated(_depositor, _amount, payout, block.number.add(terms.vestingTerm), priceInUSD);
        emit BondPriceChanged(bondPrice(), debtRatio());

        adjust(); // control variable is adjusted
        return payout;
    }

    /**
     *  @notice redeem bond for user
     *  @param _recipient address
     *  @return uint256
     */
    function redeem(address _recipient) external returns (uint256) {
        Bond memory info = bondInfo[_recipient];
        uint256 percentVested = percentVestedFor(_recipient); // (blocks since last interaction / vesting term remaining)

        if (percentVested >= 10000) { // if fully vested
            delete bondInfo[_recipient]; // delete user info
            emit BondRedeemed(_recipient, info.payout, 0); // emit bond data
            IERC20(kp).transfer(_recipient, info.payout);  // pay user everything due

        } else { // if unfinished
            // calculate payout vested
            uint256 payout = info.payout.mul(percentVested).div(10000);
            // console.log("here?", info.payout, percentVested);

            // store updated deposit info
            bondInfo[_recipient] = Bond({
                payout: info.payout.sub(payout),
                vesting: info.vesting.sub(block.number.sub(info.lastBlock)),
                lastBlock: block.number,
                pricePaid: info.pricePaid
            });

            emit BondRedeemed(_recipient, payout, bondInfo[_recipient].payout);
            IERC20(kp).transfer(_recipient, payout); 
        }
    }

    /**
     *  @notice makes incremental adjustment to control variable
     */
    function adjust() internal {
        uint256 blockCanAdjust = adjustment.lastBlock.add(adjustment.buffer);
        if (adjustment.rate != 0 && block.number >= blockCanAdjust) {
            uint256 initial = terms.controlVariable;
            if (adjustment.add) {
                terms.controlVariable = terms.controlVariable.add(adjustment.rate);
                if (terms.controlVariable >= adjustment.target) {
                    adjustment.rate = 0;
                }
            } else {
                terms.controlVariable = terms.controlVariable.sub(adjustment.rate);
                if (terms.controlVariable <= adjustment.target) {
                    adjustment.rate = 0;
                }
            }
            adjustment.lastBlock = block.number;
            emit ControlVariableAdjustment(initial, terms.controlVariable, adjustment.rate, adjustment.add);
        }
    }

    /**
     *  @notice reduce total debt
     */
    function decayDebt() internal {
        totalDebt = totalDebt.sub(debtDecay());
        lastDecay = block.number;
    }




    /* ======== VIEW FUNCTIONS ======== */

    function NAME() external pure virtual returns(string memory);

    /**
     *  @notice determine maximum bond size
     *  @return uint256
     */
    function maxPayout() public view returns (uint256) {
        return IERC20(kp).totalSupply().mul(terms.maxPayout).div(1000000);
    }

    /**
     *  @notice calculate interest due for new bond
     *  @param _value uint256 10**18 precision
     *  @return uint256 10**18 precision
     */
    function payoutFor(uint256 _value) public view returns (uint256) {
        return _value.mul(1e18).div(bondPrice()).div(1e12);
    }

    /**
     *  @notice calculate current bond premium
     *  @return price_ uint256 in 10**6 precision in usd
     */
    function bondPrice() public view returns (uint256 price_) {
        uint256 _KPPrice = IKlaySwapOracle(kplp).estimatePos(kp, 1e18);
        uint256 _priceRate = priceRate(); // 1e9
        price_ = _KPPrice.mul(_priceRate).div(10**9);
    }
    /**
     *  @notice calculate bond price rate
     *  @return rate_ uint256 in 10**9 precision
     */
    function priceRate() public view returns (uint256 rate_) {
        rate_ = terms.controlVariable.mul(debtRatio()).div(100);
        if (rate_ < terms.minimumPriceRate) {
            rate_ = terms.minimumPriceRate;
        }
    }

    /**
     *  @notice get asset price from klaybank oracle
     *  @return uint256 in 10 ** 6 precision
     */

    // function token0price() public view returns(uint256) {
    //   Token0addr = Token0USDTOracle.token0()
    //   if (Token0addr == usdt_address) {
    //     return 1000000;
    //   } else {
    //     price0_ = uint256(Token0USDTOracle.consult(Token0addr, PRICE_PRECISION));
    //     return price0_;
    //   }
    // }

    // function token1price() public view returns(uint256) {
    //   Token1addr = Token1USDTOracle.token0()
    //   if (Token1addr = usdt_address) {
    //     return 1000000;
    //   } else {
    //     price1_ = uint256(Token1USDTOracle.consult(Token1addr, PRICE_PRECISION));
    //     return price1_;
    //   }
    // }

    // pair의 단위 가격을 구한다 in USD
    function assetPrice() public view returns (uint256) {
        uint256 lpSupply = IKlaySwapOracle(principle).totalSupply();
        uint256 eklprice = IKlaySwapOracle(ekllp).estimatePos(ekl, 1e18);
        (uint256 eklbal, ) = IKlaySwapOracle(principle).getCurrentPool();
        return eklbal.mul(2).mul(eklprice).div(lpSupply); //자릿수 맞추기..?!
    }

    // function assetPrice() public view returns (uint256) {
    //     totalSup = IUniswapV2Pair(_principle).totalSupply();
    //     token0value = IUniswapV2Pair(_principle).price0CumulativeLast().mul(token0price());
    //     token1value = IUniswapV2Pair(_principle).price0CumulativeLast().mul(token1price());
    //     return (token0value.add(token1value)).div(totalSup).mul(1e18); //자릿수 맞추기..?!
    // }

    /**
     *  @notice calculate current ratio of debt to KP supply
     *  @return debtRatio_ uint256 in 10 ** 9 precision
     */
    function debtRatio() public view returns (uint256 debtRatio_) {
        debtRatio_ = currentDebt().mul(1e9).mul(1e18).div(terms.maxDebt).div(1e18);
    }

    /**
     *  @notice calculate debt factoring in decay
     *  @return uint256 in 10 ** 18 precision
     */
    function currentDebt() public view returns (uint256) {
        return totalDebt.sub(debtDecay());
    }

    /**
     *  @notice amount to decay total debt by
     *  @return decay_ uint256
     */
    function debtDecay() public view returns (uint256 decay_) {
        uint256 blocksSinceLast = block.number.sub(lastDecay);
        decay_ = totalDebt.mul(blocksSinceLast).div(terms.vestingTerm);
        if (decay_ > totalDebt) {
            decay_ = totalDebt;
        }
    }


    /**
     *  @notice calculate how far into vesting a depositor is
     *  @param _depositor address
     *  @return percentVested_ uint256
     */
    function percentVestedFor(address _depositor) public view returns (uint256 percentVested_) {
        Bond memory bond = bondInfo[_depositor];
        uint256 blocksSinceLast = block.number.sub(bond.lastBlock);
        uint256 vesting = bond.vesting;

        if (vesting > 0) {
            percentVested_ = blocksSinceLast.mul(10000).div(vesting);
        } else {
            percentVested_ = 0;
        }
    }

    /**
     *  @notice calculate amount of KP available for claim by depositor
     *  @param _depositor address
     *  @return pendingPayout_ uint256
     */
    function pendingPayoutFor(address _depositor) external view returns (uint256 pendingPayout_) {
        uint256 percentVested = percentVestedFor(_depositor);
        uint256 payout = bondInfo[_depositor].payout;

        if (percentVested >= 10000) {
            pendingPayout_ = payout;
        } else {
            pendingPayout_ = payout.mul(percentVested).div(10000);
        }
    }




    /* ======= AUXILLIARY ======= */

    /**
     *  @notice allow anyone to send lost tokens (excluding principle or KP) to the DAO
     *  @return bool
     */
    function recoverLostToken(address _token) external returns (bool) {
        require(_token != kp, "BondTreasury: cannot withdraw KP");
        require(_token != principle, "BondTreasury: cannot withdraw principle");
        IERC20(_token).safeTransfer(DAO, IERC20(_token).balanceOf(address(this)));
        return true;
    }
}