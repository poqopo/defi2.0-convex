const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");

const main = async () => {
    const [owner, dao, treasury] = await ethers.getSigners();
    const ethUnit = ethers.utils.parseEther("1");
    // const treasuryAddress = "0x0F6B6f436759F705D54E73E06c90CD920771ae31";

    // Get the ContractFactory and Signers here.
    let SCAMPFactory = await ethers.getContractFactory("SCAMP");
    let SCAMP = await SCAMPFactory.deploy(owner.address);
    console.log("SCAMP address is:", await SCAMP.address);

    let CAMPFactory = await ethers.getContractFactory("CAMP");
    let CAMP = await CAMPFactory.deploy(owner.address);
    console.log("CAMP address is:", await CAMP.address);

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    const assetOracle = await assetOracleFactory.deploy();
    console.log("assetOracle:", assetOracle.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    let mock = await mockFactory.deploy();
    await mock.setBalance(owner.address, toBn("1000000"))
    console.log("mock address is:", await mock.address);

    SCAMPPoolLibraryFactory = await ethers.getContractFactory("SCAMPPoolLibrary");
    let SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.deploy();
    console.log("SCAMPPoolLibrary address is:", await SCAMPPoolLibrary.address);

    BankFactory = await ethers.getContractFactory("SCAMPBank", {
        libraries: {
            SCAMPPoolLibrary: SCAMPPoolLibrary.address,
        },
    });
    let Bank = await BankFactory.deploy(SCAMP.address, CAMP.address, mock.address, owner.address, assetOracle.address);
    console.log("Bank address is:", Bank.address);

    // approve
    await SCAMP.approve(Bank.address, toBn("10000"));
    await CAMP.approve(Bank.address, toBn("10000"));

    // Set controller
    await SCAMP.setController("0x91Add885cdF83Ba62578eF7de912067f52aB3130");
    await SCAMP.setCAMPAddress(CAMP.address);
    await SCAMP.setBankAddress(Bank.address);
    await CAMP.setSCAMPAddress(SCAMP.address);
    await SCAMP.setMintingFee(3000);
    await SCAMP.setOracleAddress(assetOracle.address);

    // ADD LIQUIDITY
    const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await uniConFactory.deploy(owner.address);
    console.log("Factory address is:", factory.address);
    const pairCodeHash = await factory.pairCodeHash();
    console.log("pairCodeHash:", pairCodeHash);

    // create SCAMP, mock pair
    let SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
    if (SCAMPPair == ethers.constants.AddressZero) {
      console.log("create scamp pair");
      await factory.createPair(SCAMP.address, mock.address);
      SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
    }
    console.log("SCAMP pair:", SCAMPPair);

    // create CAMP, mock pair
    let CAMPPair = await factory.getPair(CAMP.address, mock.address);
    if (CAMPPair == ethers.constants.AddressZero) {
      console.log("create camp pair");
      await factory.createPair(CAMP.address, mock.address);
      CAMPPair = await factory.getPair(CAMP.address, mock.address);
    }
    console.log("CAMP pair:", CAMPPair);

    const wKLAYFactory = await ethers.getContractFactory("WKLAY");
    const wKLAY = await wKLAYFactory.deploy();
    console.log("wKLAY address:", wKLAY.address);

    const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
    const router = await RouterFactory.deploy(factory.address, wKLAY.address);
    console.log("router address:", router.address);

    // Approve and addLiquidity
    const SCAMPAllowance = await SCAMP.allowance(owner.address, router.address);
    if (SCAMPAllowance == 0) {
      await SCAMP.approve(router.address, toBn("10000"));
    }
    console.log("SCAMPAllowance:", SCAMPAllowance.toString());
    const mockAllowance = await mock.allowance(owner.address, router.address);
    if (mockAllowance == 0) {
      await mock.approve(router.address, toBn("10000"));
    }
    console.log("mockCollatAllowance:", mockAllowance.toString());

    const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    let pairContract = PairFactory.attach(SCAMPPair);
    // console.log(await pairContract.factory(), await pairContract.token0(), await pairContract.token1());
    let reserve = await pairContract.getReserves();
    console.log(reserve[0].toString(), reserve[1].toString(), reserve[2])
    if (reserve[0] == 0) {
      console.log("add to liquidity to scamp pair");
      const tx = await router.addLiquidity(SCAMP.address, mock.address, toBn("100"), toBn("100"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
      SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
      pairContract = PairFactory.attach(SCAMPPair);
      console.log("SCAMP pair:", SCAMPPair);
      reserve = await pairContract.getReserves();
      console.log(reserve[0].toString(), reserve[1].toString(), reserve[2])
    }
    
    let pairContract_CAMP = PairFactory.attach(CAMPPair);
    let reserve_CAMP = await pairContract_CAMP.getReserves();
    console.log(reserve_CAMP[0].toString(), reserve_CAMP[1].toString(), reserve_CAMP[2])
    if (reserve_CAMP[0] == 0) {
      console.log("add to liquidity to camp pair");
      await CAMP.approve(router.address, toBn("10000"));
      await router.addLiquidity(CAMP.address, mock.address, toBn("100"), toBn("10"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
      CAMPPair = await factory.getPair(CAMP.address, mock.address);
      pairContract_CAMP = PairFactory.attach(CAMPPair);
      console.log("CAMP pair:", CAMPPair);
      reserve_CAMP = await pairContract_CAMP.getReserves();
      console.log(reserve_CAMP[0].toString(), reserve_CAMP[1].toString(), reserve_CAMP[2])
    }

    // swap
    // const swapamounts = await router.getAmountsOut(1e6, [CAMP.address, mock.address]);
    // console.log("swap ratio:", await swapamounts[0].toString(), await swapamounts[1].toString());
    // await router.swapExactTokensForTokens(swapamounts[0].toString(), swapamounts[1].toString(), [CAMP.address, mock.address], owner.address, Math.floor(Date.now()) + 10);

    const uniOracleFactory = await ethers.getContractFactory("UniswapPairOracle");
    const scampPairOracle = await uniOracleFactory.deploy(factory.address, SCAMP.address, mock.address, owner.address);
    console.log("scampPairOracle:", scampPairOracle.address);
    await scampPairOracle.setPeriod(1);
    console.log(await scampPairOracle.canUpdate());
    if (await scampPairOracle.canUpdate()) {
        console.log("scamp oracle is updated");
        await scampPairOracle.update();
    }

    const campPairOracle = await uniOracleFactory.deploy(factory.address, CAMP.address, mock.address, owner.address);
    console.log("campPairOracle:", campPairOracle.address);
    await campPairOracle.setPeriod(1);
    if (await campPairOracle.canUpdate()) {
        console.log("camp oracle is updated");
        await campPairOracle.update();
    }

    // const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    // console.log("assetOracle:", assetOracle.address);
    await assetOracle.setAssetOracle([scampPairOracle.address, campPairOracle.address]);
    // console.log(await assetOracle.priceOracle(0));
    // console.log(await assetOracle.priceOracle(1));

    console.log((await assetOracle.getAssetPrice(CAMP.address)).toString());

    // console.log(await Bank._CAMP());
    // console.log(await SCAMP.SCAMPBank());
    await Bank.mintAlgorithmicSCAMP(toBn("5"), toBn("0.1"));
    await SCAMP.setRefreshCooldown(1);
    console.log("imalive");
    await SCAMP.refreshCollateralRatio();

    /////////////////////////////////////////////////////
    // Deploy to Bond
    const ClaimSwapCampUSDTLpDepositoryFactory = await ethers.getContractFactory("ClaimSwapCampUSDTLpDepository");
    const ClaimSwapCampUSDTLpDepository = await ClaimSwapCampUSDTLpDepositoryFactory.deploy();
    console.log("ClaimSwapCampUSDTLpDepository address:", ClaimSwapCampUSDTLpDepository.address);

    // Deploy bond treasury
    const BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    const bondTreasury = await BondTreasuryFactory.deploy();
    console.log("bondTreasury address:", bondTreasury.address);
    await bondTreasury.__initialize(dao.address, CAMP.address);
    const BOND_GENESIS_AMOUNT = toBn("1000000");
    await CAMP.Bond_mint(bondTreasury.address, BOND_GENESIS_AMOUNT);

    // initiailize depository
    console.log(await ClaimSwapCampUSDTLpDepository.CAMP());
    await ClaimSwapCampUSDTLpDepository.__initialize(
        CAMP.address, dao.address, CAMPPair, CAMP.address, mock.address, bondTreasury.address, mock.address, assetOracle.address
    );
    await ClaimSwapCampUSDTLpDepository.initializeBondTerms(
        100, //_controlVariable 상수
        432000, //_vestingTerm in blokcs
        0.8e9, //_minimumPriceRate 할인된가격최저 1e9
        10000, //_maxPayout 1e4 10000=1%
        100, //_fee 100=1%
        toBn("1e6"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
        toBn("1e4") //_initialDebt 초기 빚(다른 곳에서 쓴?)
    );
    // register
    await bondTreasury.register(CAMPPair, ClaimSwapCampUSDTLpDepository.address);
    console.log("register", (await bondTreasury.isReserveToken(CAMPPair)).toString());
    
    console.log("max payout", (await ClaimSwapCampUSDTLpDepository.maxPayout() / 1e18).toString());

    // approve
    // Approve and addLiquidity
    console.log("CAMPPair is alive?", await pairContract_CAMP.symbol());
    let bondAllowance = await pairContract_CAMP.allowance(owner.address, ClaimSwapCampUSDTLpDepository.address);
    if (bondAllowance == 0) {
      await pairContract_CAMP.approve(ClaimSwapCampUSDTLpDepository.address, toBn("10000"));
    }
    console.log("bond allowance:", (await pairContract_CAMP.allowance(owner.address, ClaimSwapCampUSDTLpDepository.address)).toString());
    // deposit
    console.log("bond price:", (await ClaimSwapCampUSDTLpDepository.bondPrice() / 1e6).toString());
    console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());
    // await ClaimSwapCampUSDTLpDepository.deposit(toBn("10"), await ClaimSwapCampUSDTLpDepository.bondPrice(), owner.address);
    console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());
    // await ClaimSwapCampUSDTLpDepository.redeem(owner.address, false);
    console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());

}
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();