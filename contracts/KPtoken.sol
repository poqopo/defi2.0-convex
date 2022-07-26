// SPDX-License-Identifier: MIT
pragma solidity =0.7.5;


import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "./Interfaces/IKUSDtoken.sol";
import "./Interfaces/Interfaces.sol";
import "./ERC20Custom.sol";
import "./bank/Owned.sol";

contract KPtoken is ERC20Custom, Owned {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    string public symbol;
    string public name;
    uint8 public constant decimals = 18;

    address public operator;
    address public voterProxy;
    address public kusd;
    address public creator_address;

    uint256 public maxSupply = 100 * 1000000 * 1e18; //100mil


    /* ========== MODIFIERS ========== */

    modifier onlyBank() {
        require(msg.sender == IKUSDtoken(kusd).kusdbank() , "You are not bank");
        _;
    } 
  

    /* ========== CONSTRUCTOR ========== */

    constructor(
      address _proxy,
      string memory _name,
      string memory _symbol,
      address _creator_address
    )  public Owned(_creator_address)
    {
        name = _name;
        symbol = _symbol;
        creator_address = _creator_address;
        operator = msg.sender;
        voterProxy = _proxy;
    }
    
    /* ========== RESTRICTED FUNCTIONS ========== */

    function setVoterproxy(address _newproxy) external onlyOwner {
      voterProxy = _newproxy;
    }
    function updateOperator() public {
        operator = IStaker(voterProxy).operator();
    }

    function setKUSDAddress(address _kusd) external onlyOwner {
        require(_kusd != address(0), "Zero address detected");
        kusd = _kusd;
        emit KUSDAddressSet(_kusd);
    }
    
    // This function is what other WUSD pools will call to mint new WMF (similar to the WUSD mint) 
    function Bank_mint(address m_address, uint256 m_amount) external onlyBank {        
        _mint(m_address, m_amount);
        emit BankMinted(address(this), m_address, m_amount);
    }

    // This function is what other WUSD pools will call to burn WMF 
    function Bank_burn_from(address b_address, uint256 b_amount) external onlyBank {

        _burnFrom(b_address, b_amount);
        emit BankBurned(b_address, address(this), b_amount);
    }

    function mint(address _to, uint256 _amount) external {
        if(msg.sender != operator){
            //dont error just return. if a shutdown happens, rewards on old system
            //can still be claimed, just wont mint cvx
            return;
        }

        uint256 supply = totalSupply();
        if(supply == 0){
            //premine, one time only
            _mint(_to,_amount);
            //automatically switch operators
            updateOperator();
            return;
        }
        supply = supply.add(_amount);
        require(supply <= maxSupply, "Already MaxSup");
        _mint(_to, _amount);
    }
    /* ========== EVENTS ========== */

    event KUSDAddressSet(address kusd);
    // Track WMF burned
    event BankBurned(address indexed from, address indexed to, uint256 amount);
    // Track WMF minted
    event BankMinted(address indexed from, address indexed to, uint256 amount);
    event Minted(address indexed from, address indexed to, uint256 amount);
}