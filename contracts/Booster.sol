// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "./Interfaces/Interfaces.sol";
import "./Interfaces/IKPtoken.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract Booster{
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public constant ekl = address(0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA); //EKL
    address public constant escrow = address(0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58); //vEKL

    uint256 public lockIncentive = 2000; //kpEKL Staker에게 뿌려줄 EKL
    uint256 public stakerIncentive = 1990; //KP Staker에게 뿌려줄 EKL
    uint256 public earmarkIncentive = 10; //함수Caller에게 뿌려줄 EKL
    uint256 public platformFee = 6000; //Locker에게 뿌려줄 EKL
    uint256 public distributionrate = 2000; // kpEKL Locker 3mmon disrate
    uint256 public kpdisrate = 5000;
    uint256 public constant MaxFees = 10000; 
    uint256 public constant FEE_DENOMINATOR = 10000;
    

    address public owner; //multisig
    address public feeManager;
    address public poolManager;
    address public immutable staker; // voterproxy
    address public immutable minter; // KP
    address public rewardFactory;
    address public tokenFactory;
    address public voteDelegate;
    address public treasury; //StakingProxy
    address public stakerRewards; //KP stake 주소
    address public lockRewards; //kpEKL stake 주소
    address public lockFees; //kpekl 3moon Virtual
    address public feeToken;

    bool public isShutdown;

    struct PoolInfo {
        address lptoken;
        address token;
        address gauge;
        bool shutdown;
    }

    //index(pid) -> pool
    PoolInfo[] public poolInfo;
    mapping(address => bool) public gaugeMap;

    event Deposited(address indexed user, uint256 indexed poolid, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed poolid, uint256 amount);

    constructor(address _staker, address _minter) public {
        isShutdown = false;
        staker = _staker; //VoterProxy
        owner = msg.sender;
        voteDelegate = msg.sender;
        feeManager = msg.sender;
        poolManager = msg.sender;
        feeToken = address(0); //address(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490); //3Moon
        treasury = address(0); //StakingProxy(Locker에게 줄 ekl, 3Moon)
        minter = _minter; //KP
    }


    /// SETTER SECTION ///

    function setOwner(address _owner) external {
        require(msg.sender == owner, "!auth");
        owner = _owner;
    }

    function setFeeManager(address _feeM) external {
        require(msg.sender == feeManager, "!auth");
        feeManager = _feeM;
    }

    function setPoolManager(address _poolM) external {
        require(msg.sender == poolManager, "!auth");
        poolManager = _poolM;
    }

    function setFactories(address _rfactory, address _tfactory) external {
        require(msg.sender == owner, "!auth");
        
        //reward factory only allow this to be called once even if owner
        //removes ability to inject malicious staking contracts
        //token factory can also be immutable
        if(rewardFactory == address(0)){
            rewardFactory = _rfactory;
            tokenFactory = _tfactory;
        }
    }

    function setVoteDelegate(address _voteDelegate) external {
        require(msg.sender==voteDelegate, "!auth");
        voteDelegate = _voteDelegate;
    }

    function setRewardContracts(address _rewards, address _stakerRewards) external {
        require(msg.sender == owner, "!auth");
        
        //reward contracts are immutable or else the owner
        //has a means to redeploy and mint kp via rewardClaimed()
        if(lockRewards == address(0)){
            lockRewards = _rewards;
            stakerRewards = _stakerRewards;
        }
    }

    // Set reward token and claim contract, get from Curve's registry
    function setFeeInfo(address _feetoken) external {
        require(msg.sender==feeManager, "!auth");

        if(feeToken != _feetoken){
            //create a new reward contract for the new token
            lockFees = IRewardFactory(rewardFactory).CreateTokenRewards(_feetoken,lockRewards,address(this));
            feeToken = _feetoken;
        }
    }

    function setKPdisrate(uint256 _kprate) public returns(uint256) {
      require(msg.sender == owner, "!auth");
      require(_kprate < 10000, "MAx reached");
      kpdisrate = _kprate;
      return kpdisrate;
    }

    function setFees(uint256 _lockFees, uint256 _stakerFees, uint256 _callerFees, uint256 _platform, uint256 _distrrate) external{
        require(msg.sender==feeManager, "!auth");

        uint256 total = _lockFees.add(_stakerFees).add(_callerFees).add(_platform);
        require(total == MaxFees, ">MaxFees");

        //values must be within certain ranges     
        if(_lockFees >= 1000 && _lockFees <= 3000
            && _stakerFees >= 1000 && _stakerFees <= 3000
            && _callerFees >= 10 && _callerFees <= 100
            && _platform <= 6000){
            lockIncentive = _lockFees;
            stakerIncentive = _stakerFees;
            earmarkIncentive = _callerFees;
            platformFee = _platform;
            distributionrate = _distrrate;
        }
    }

    function setTreasury(address _treasury) external {
        require(msg.sender==feeManager, "!auth");
        treasury = _treasury;
    } 
    /// END SETTER SECTION ///
    function mint_KP(address _to, uint256 _amount) external {
      require(msg.sender ==owner, "!auth");
      ITokenMinter(minter).mint(_to, _amount);
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    //create a new pool
    function addPool(address _lptoken, address _gauge) external returns(bool){
        require(msg.sender==poolManager && !isShutdown, "!add");
        require(_gauge != address(0) && _lptoken != address(0),"!param");

        //the next pool's pid
        uint256 pid = poolInfo.length;
        //create a tokenized deposit
        address token = ITokenFactory(tokenFactory).CreateDepositToken(_lptoken);
        //add the new pool
        poolInfo.push(
            PoolInfo({
                lptoken: _lptoken,
                token: token,
                gauge: _gauge,
                shutdown: false
            })
        );
        gaugeMap[_gauge] = true;
        //give stashes access to rewardfactory and voteproxy
        //   voteproxy so it can grab the incentive tokens off the contract after claiming rewards
        //   reward factory so that stashes can make new extra reward contracts if a new incentive is added to the gauge
        return true;
    }

    //shutdown pool
    function shutdownPool(uint256 _pid) external returns(bool){
        require(msg.sender==poolManager, "!auth");
        PoolInfo storage pool = poolInfo[_pid];

        //withdraw from gauge
        try IStaker(staker).withdrawAll(pool.lptoken,pool.gauge){
        }catch{}

        pool.shutdown = true;
        gaugeMap[pool.gauge] = false;
        return true;
    }

    //shutdown this contract.
    //  unstake and pull all lp tokens to this address
    //  only allow withdrawals
    function shutdownSystem() external{
        require(msg.sender == owner, "!auth");
        isShutdown = true;

        for(uint i=0; i < poolInfo.length; i++){
            PoolInfo storage pool = poolInfo[i];
            if (pool.shutdown) continue;

            address token = pool.lptoken;
            address gauge = pool.gauge;

            //withdraw from gauge
            try IStaker(staker).withdrawAll(token,gauge){
                pool.shutdown = true;
            }catch{}
        }
    }


    //deposit lp tokens and stake
    function deposit(uint256 _pid, uint256 _amount) public returns(bool){
        require(!isShutdown,"shutdown");
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.shutdown == false, "pool is closed");

        //send to proxy to stake
        address lptoken = pool.lptoken;
        IERC20(lptoken).safeTransferFrom(msg.sender, staker, _amount);

        //stake
        address gauge = pool.gauge;
        require(gauge != address(0),"!gauge setting");
        IStaker(staker).deposit(lptoken, gauge);

        address token = pool.token;
        ITokenMinter(token).mint(msg.sender,_amount);
        
        emit Deposited(msg.sender, _pid, _amount);
        return true;
    }

    //deposit all lp tokens and stake
    function depositAll(uint256 _pid) external returns(bool){
        address lptoken = poolInfo[_pid].lptoken;
        uint256 balance = IERC20(lptoken).balanceOf(msg.sender);
        deposit(_pid,balance);
        return true;
    }

    //withdraw lp tokens
    function _withdraw(uint256 _pid, uint256 _amount, address _from, address _to) internal {
        PoolInfo storage pool = poolInfo[_pid];
        address lptoken = pool.lptoken;
        address gauge = pool.gauge;

        //remove lp balance
        address token = pool.token;
        ITokenMinter(token).burn(_from,_amount);

        //pull from gauge if not shutdown
        // if shutdown tokens will be in this contract
        if (!pool.shutdown) {
            IStaker(staker).withdraw(lptoken,gauge, _amount);
        }
        
        //return lp tokens
        IERC20(lptoken).safeTransfer(_to, _amount);
        emit Withdrawn(_to, _pid, _amount);
    }

    //withdraw lp tokens
    function withdraw(uint256 _pid, uint256 _amount) public returns(bool){
        require(msg.sender == feeManager, "!auth");
        _withdraw(_pid,_amount,msg.sender,msg.sender);
        return true;
    }

    //withdraw all lp tokens
    function withdrawAll(uint256 _pid) public returns(bool){
        require(msg.sender == feeManager, "!auth");
        address token = poolInfo[_pid].token;
        uint256 userBal = IERC20(token).balanceOf(msg.sender);
        withdraw(_pid, userBal);
        return true;
    }

    //delegate address votes on dao
    function gaugevote(address _gaugeAddress, uint256 _amount) external returns(bool){
        require(msg.sender == voteDelegate, "!auth");
        
        IStaker(staker).vote(_gaugeAddress,_amount);
        return true;
    }

    //claim ekl and extra rewards and disperse to reward contracts
    function _earmarkRewards() internal {

        IStaker(staker).claimRewards();

        //ekl balance
        uint256 eklBal = IERC20(ekl).balanceOf(address(this));

        if (eklBal > 0) {
            uint256 _lockIncentive = eklBal.mul(lockIncentive).div(FEE_DENOMINATOR);
            uint256 _stakerIncentive = eklBal.mul(stakerIncentive).div(FEE_DENOMINATOR);
            uint256 _callIncentive = eklBal.mul(earmarkIncentive).div(FEE_DENOMINATOR);
            
            //send treasury
            if(treasury != address(0) && treasury != address(this) && platformFee > 0){
                //only subtract after address condition check
                uint256 _platform = eklBal.mul(platformFee).div(FEE_DENOMINATOR);
                IERC20(ekl).safeTransfer(treasury, _platform);
            }
            //send incentives for calling
            IERC20(ekl).safeTransfer(msg.sender, _callIncentive);          

            //send lockers' share of ekl to reward contract
            IERC20(ekl).safeTransfer(lockRewards, _lockIncentive);
            IRewards(lockRewards).queueNewRewards(_lockIncentive);

            //send stakers's share of ekl to reward contract
            IERC20(ekl).safeTransfer(stakerRewards, _stakerIncentive);
            IRewards(stakerRewards).queueNewRewards(_stakerIncentive);
        }
    }

    function earmarkRewards() external returns(bool){
        require(!isShutdown,"shutdown");
        _earmarkRewards();
        return true;
    }

    //claim fees from curve distro contract, put in lockers' reward contract
    function earmarkFees(uint256 _pid) external returns(bool){
        uint256 feebal = IEklipseVoteEscrow(escrow).calculateFeeReward(staker);
        if (feebal > 0 ) {
          //claim fee rewards
          IStaker(staker).claimFees(feeToken);
        }

        uint256 voterbal = IERC20(feeToken).balanceOf(staker);
        if (voterbal > 0) {
            PoolInfo storage pool = poolInfo[_pid];
            address lptoken = pool.lptoken;
            address gauge = pool.gauge;
          if (!pool.shutdown) {
            IStaker(staker).withdraw(lptoken, gauge, voterbal);
          }
        }

        //send fee rewards to reward contract
        uint256 _balance = IERC20(feeToken).balanceOf(address(this));
        uint256 _kplockfee = _balance.mul(distributionrate).div(FEE_DENOMINATOR);
        _balance = _balance.sub(_kplockfee); 
        IERC20(feeToken).safeTransfer(lockFees, _balance);
        IRewards(lockFees).queueNewRewards(_balance); //Have to Change
        IERC20(feeToken).safeTransfer(treasury, _kplockfee);
        return true;
    }

        //callback from reward contract when crv is received.
    function rewardClaimed(address _address, uint256 _amount) external returns(bool){
        require(msg.sender == lockRewards, "!auth");
        uint256 reward = _amount.mul(kpdisrate).div(FEE_DENOMINATOR);
        IKPtoken(minter).mint(_address,reward);
        return true;
    }

    function sendExtras(address _asset, address _to) external returns(bool) {
      require(msg.sender == poolManager, "!auth");
      uint256 balance = IERC20(_asset).balanceOf(address(this));
      IERC20(_asset).safeTransfer(_to, balance);
    }
    function sendExtrasfromVoterProxy(address _asset, address _to) external returns(bool) {
      require(msg.sender == poolManager, "!auth");
      IStaker(staker).withdrawOther(_asset);
      uint256 balance = IERC20(_asset).balanceOf(address(this));
      IERC20(_asset).safeTransfer(_to, balance);
    }

}