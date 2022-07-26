const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");

const main = async () => {
    const [owner] = await ethers.getSigners();
    const daoAddress = "0x83528941Ab17AAAF21939dc98A5E7c25455cE4D3";

    // Get the ContractFactory and Signers here.
    SCAMPFactory = await ethers.getContractFactory("SCAMP");
    // let SCAMP = await SCAMPFactory.deploy(owner.address);
    const SCAMP = await SCAMPFactory.attach("0xbcb51E0C1fF0Cf95176Ee5EA08b7da3832AD377d");
    console.log("SCAMP address is:", await SCAMP.address);

    CAMPFactory = await ethers.getContractFactory("CAMP");
    // let CAMP = await CAMPFactory.deploy(owner.address);
    const CAMP = await CAMPFactory.attach("0x870D2f6dc98bc3365421DBEe36c97dAf11D1E128");
    console.log("CAMP address is:", await CAMP.address);

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    const assetOracle = await assetOracleFactory.attach("0x3dB66FBD72DEF0Db5d7e725c8Fa3D03810999CE8");
    console.log("assetOracle:", assetOracle.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    // let mock = await mockFactory.deploy();
    const mock = await mockFactory.attach("0x8d4DFc6586F70e6F1F08d3FaA96Afa297A1CA060");
    // await mock.setBalance("0x91Add885cdF83Ba62578eF7de912067f52aB3130", toBn("10000")) // a한테 10000만큼 보냄
    // await mock.setBalance(owner.address, toBn("1000000"))
    console.log("mock address is:", await mock.address);

    SCAMPPoolLibraryFactory = await ethers.getContractFactory("SCAMPPoolLibrary");
    // let SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.deploy();
    const SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.attach("0xdE37c23b4C369967f0EE16d24413179694A7b74a");
    console.log("SCAMPPoolLibrary address is:", await SCAMPPoolLibrary.address);

    BankFactory = await ethers.getContractFactory("SCAMPBank", {
        libraries: {
            SCAMPPoolLibrary: SCAMPPoolLibrary.address,
        },
    });
    // let Bank = await BankFactory.deploy(SCAMP.address, CAMP.address, mock.address, owner.address, assetOracle.address);
    // const Bank = await BankFactory.attach("0x427Da2f75D986e985994d186b5bCE7d00A8db380");
    // console.log("Bank address is:", Bank.address);
    // await mock.setBalance(Bank.address, toBn("2000000"));

    // approve
    // await SCAMP.approve(Bank.address, toBn("10000"));
    // await CAMP.approve(Bank.address, toBn("10000"));

    // Set controller
    // await SCAMP.setController("0x91Add885cdF83Ba62578eF7de912067f52aB3130");
    // await SCAMP.setCAMPAddress(CAMP.address);
    // await SCAMP.setBankAddress(Bank.address);
    // await CAMP.setSCAMPAddress(SCAMP.address);
    // await SCAMP.setMintingFee(3000); //3% 오픈시 0%
    // await SCAMP.setOracleAddress(assetOracle.address);

    // ADD LIQUIDITY
    // const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
    // // const factory = await uniConFactory.deploy(owner.address);
    // const factory = uniConFactory.attach("0x8CBaCAfaF62003E0E2EfcE9994aC5eFAC3FF5EA8"); // with wKLAY
    // console.log("Factory address is:", factory.address);
    // const pairCodeHash = await factory.pairCodeHash();
    // console.log("pairCodeHash:", pairCodeHash);

    // // create SCAMP, mock pair
    // let SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
    // if (SCAMPPair == ethers.constants.AddressZero) {
    //     console.log("create scamp pair");
    //     await factory.createPair(SCAMP.address, mock.address);
    //     SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
    // }
    // console.log("SCAMP pair:", SCAMPPair);

    // // create CAMP, mock pair
    // let CAMPPair = await factory.getPair(CAMP.address, mock.address);
    // if (CAMPPair == ethers.constants.AddressZero) {
    //     console.log("create camp pair");
    //     await factory.createPair(CAMP.address, mock.address);
    //     CAMPPair = await factory.getPair(CAMP.address, mock.address);
    // }
    // console.log("CAMP pair:", CAMPPair);

    // const wKLAYFactory = await ethers.getContractFactory("WKLAY");
    // // const wKLAY = await wKLAYFactory.deploy();
    // const wKLAY = wKLAYFactory.attach("0xbb73258dd2d962A543B37902fe55655A1d136eC1");
    // console.log("wKLAY address:", wKLAY.address);

    // const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
    // // const router = await RouterFactory.deploy(factory.address, wKLAY.address);
    // const router = RouterFactory.attach("0x781808722E5a3628518D4cdd3b9C47CF01b2c3Cb");
    // console.log("router address:", router.address);

    // // Approve and addLiquidity
    // const SCAMPAllowance = await SCAMP.allowance(owner.address, router.address);
    // if (SCAMPAllowance == 0) {
    //     await SCAMP.approve(router.address, toBn("10000"));
    // }
    // console.log("SCAMPAllowance:", SCAMPAllowance.toString());
    // const mockAllowance = await mock.allowance(owner.address, router.address);
    // if (mockAllowance == 0) {
    //     await mock.approve(router.address, toBn("10000"));
    // }
    // console.log("mockCollatAllowance:", mockAllowance.toString());

    // const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    // let pairContract = PairFactory.attach(SCAMPPair);
    // // console.log(await pairContract.factory(), await pairContract.token0(), await pairContract.token1());
    // let reserve = await pairContract.getReserves();
    // console.log("SCAMP pair", reserve[0].toString(), reserve[1].toString(), reserve[2])
    // if (reserve[0] == 0) {
    //     console.log("add to liquidity to scamp pair");
    //     const tx = await router.addLiquidity(SCAMP.address, mock.address, toBn("100"), toBn("100"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
    //     SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
    //     pairContract = PairFactory.attach(SCAMPPair);
    //     console.log("SCAMP pair:", SCAMPPair);
    //     reserve = await pairContract.getReserves();
    //     console.log(reserve[0].toString(), reserve[1].toString(), reserve[2])
    // }

    // let pairContract_CAMP = PairFactory.attach(CAMPPair);
    // let reserve_CAMP = await pairContract_CAMP.getReserves();
    // console.log("CAMP pair", reserve_CAMP[0].toString(), reserve_CAMP[1].toString(), reserve_CAMP[2])
    // if (reserve_CAMP[0] == 0) {
    //     console.log("add to liquidity to camp pair");
    //     await CAMP.approve(router.address, toBn("10000000"));
    //     await router.addLiquidity(CAMP.address, mock.address, toBn("10000"), toBn("1000"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
    //     CAMPPair = await factory.getPair(CAMP.address, mock.address);
    //     pairContract_CAMP = PairFactory.attach(CAMPPair);
    //     console.log("CAMP pair:", CAMPPair);
    //     reserve_CAMP = await pairContract_CAMP.getReserves();
    //     console.log(reserve_CAMP[0].toString(), reserve_CAMP[1].toString(), reserve_CAMP[2])
    // }

    // swap
    // const swapamounts = await router.getAmountsOut(1e6, [mock.address, SCAMP.address]);
    // console.log("swap ratio:", await swapamounts[0].toString(), await swapamounts[1].toString());
    // await router.swapExactTokensForTokens((swapamounts[0]*100000000000000000).toString(), swapamounts[1].toString(), [SCAMP.address, mock.address], owner.address, Math.floor(Date.now()) + 10);

    const uniOracleFactory = await ethers.getContractFactory("UniswapPairOracle");
    // const scampPairOracle = await uniOracleFactory.deploy(factory.address, SCAMP.address, mock.address, owner.address);
    const scampPairOracle = uniOracleFactory.attach("0x24FED6B2FA9080519ea6DEf8DB0B0ad495C7a5F7");
    console.log("scampPairOracle:", scampPairOracle.address);
    await scampPairOracle.setPeriod(100000); // 1 = 1초
    console.log(await scampPairOracle.canUpdate());
    if (await scampPairOracle.canUpdate()) {
        console.log("scamp oracle is updated");
        await scampPairOracle.update();
    }

    // const campPairOracle = await uniOracleFactory.deploy(factory.address, CAMP.address, mock.address, owner.address);
    const campPairOracle = uniOracleFactory.attach("0x9C41e45701bE7f96422B75A4D83b8874C83F445d");
    console.log("campPairOracle:", campPairOracle.address);
    await campPairOracle.setPeriod(1);
    if (await campPairOracle.canUpdate()) {
        console.log("camp oracle is updated");
        await campPairOracle.update();
    }

    // await assetOracle.setAssetOracle([scampPairOracle.address, campPairOracle.address]);
    // console.log(await assetOracle.priceOracle(0));
    // console.log(await assetOracle.priceOracle(1));
    // console.log("camp address", await CAMP.SCAMPAddress());
    // console.log("camp address", await SCAMP.CAMP_address());
    // console.log(SCAMP.address);
    // console.log((await assetOracle.getAssetPrice(SCAMP.address)).toString());
    // await Bank.mintAlgorithmicSCAMP(toBn("5"), toBn("0.1"));

    // await SCAMP.setSCAMPStep(2500);
    // await SCAMP.setRefreshCooldown(1);
    // await SCAMP.refreshCollateralRatio();
    let scamp_info = await SCAMP.SCAMP_info();
    console.log(scamp_info[0].toString(), scamp_info[1].toString(), scamp_info[2].toString(), scamp_info[3].toString());

    //   /////////////////////////////////////////////////////
    // Deploy to Bond : CAMP
    // const ClaimSwapCampUSDTLpDepositoryFactory = await ethers.getContractFactory("ClaimSwapCampUSDTLpDepository");
    // // const ClaimSwapCampUSDTLpDepository = await ClaimSwapCampUSDTLpDepositoryFactory.deploy();
    // const ClaimSwapCampUSDTLpDepository = ClaimSwapCampUSDTLpDepositoryFactory.attach("0x946Dad84E6d604ba70294fCFf7A49B06bf0D0659");
    // console.log("ClaimSwapCampUSDTLpDepository address:", ClaimSwapCampUSDTLpDepository.address);

    // // Deploy bond treasury
    // const BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    // // const bondTreasury = await BondTreasuryFactory.deploy();
    // const bondTreasury = BondTreasuryFactory.attach("0xa8604E038C9A02D1dad0ecA7fC07e6A0bc9C2f30");
    // console.log("bondTreasury address:", bondTreasury.address);
    // await ClaimSwapCampUSDTLpDepository.setTreasury(bondTreasury.address);

    // // initialize - bond mint
    // // await bondTreasury.__initialize(daoAddress, CAMP.address);
    // const BOND_GENESIS_AMOUNT = toBn("1000000");
    // // await CAMP.Bond_mint(bondTreasury.address, BOND_GENESIS_AMOUNT);
    // console.log("camp bond mint", (await CAMP.balanceOf(bondTreasury.address) / 1e18).toString());

    // // initiailize depository
    // // await ClaimSwapCampUSDTLpDepository.__initialize(
    // //     CAMP.address, daoAddress, CAMPPair, CAMP.address, mock.address, mock.address, assetOracle.address
    // // );
    // console.log("totaldebt", (await ClaimSwapCampUSDTLpDepository.totalDebt() / 1e18).toString());
    // // await ClaimSwapCampUSDTLpDepository.initializeBondTerms(
    // //     100, //_controlVariable 상수 본딩 할인율에 얼마나 가중치를 둘건지
    // //     1500, //432000, //_vestingTerm in blokcs
    // //     0.8e9, //_minimumPriceRate 할인된가격최저 1e9
    // //     10000, //_maxPayout 1e4 10000=1% 본딩으로 팔 수 있는 물량 대비
    // //     100, //_fee 100=1%
    // //     toBn("1e6"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    // //     toBn("1e4") //_initialDebt 초기 빚(다른 곳에서 쓴?)
    // // );

    // console.log("register", (await bondTreasury.isReserveToken(CAMPPair)));
    // // register
    // // await bondTreasury.register(CAMPPair, ClaimSwapCampUSDTLpDepository.address);

    // console.log("max payout", (await ClaimSwapCampUSDTLpDepository.maxPayout() / 1e18).toString());
    // console.log("pricepaid", (await ClaimSwapCampUSDTLpDepository.bondInfo(owner.address).pricePaid));

    // // approve
    // // Approve and addLiquidity
    // console.log("CAMPPair is alive?", await pairContract_CAMP.symbol());
    // let bondAllowance = await pairContract_CAMP.allowance(owner.address, ClaimSwapCampUSDTLpDepository.address);
    // if (bondAllowance == 0) {
    //     await pairContract_CAMP.approve(ClaimSwapCampUSDTLpDepository.address, toBn("10000"));
    // }
    // console.log("bond allowance:", (await pairContract_CAMP.allowance(owner.address, ClaimSwapCampUSDTLpDepository.address)).toString());
    // // deposit
    // console.log("bond price:", (await ClaimSwapCampUSDTLpDepository.bondPrice() / 1e6).toString());
    // console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());
    // await ClaimSwapCampUSDTLpDepository.deposit(toBn("0.1"), await ClaimSwapCampUSDTLpDepository.bondPrice(), owner.address);
    // console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());
    // // await ClaimSwapCampUSDTLpDepository.redeem(owner.address, false);
    // console.log("CAMP, LP balance:", (await CAMP.balanceOf(owner.address)).toString(), (await pairContract_CAMP.balanceOf(owner.address)).toString());

    // await ClaimSwapCampUSDTLpDepository.setBondTerms("0", 60);

    // // Deploy to Bond : SCAMP
    // const ClaimSwapSCampUSDTLpDepositoryFactory = await ethers.getContractFactory("ClaimSwapSCampUSDTLpDepository");
    // // const ClaimSwapSCampUSDTLpDepository = await ClaimSwapSCampUSDTLpDepositoryFactory.deploy();
    // const ClaimSwapSCampUSDTLpDepository = ClaimSwapSCampUSDTLpDepositoryFactory.attach("0x40D21487A039d7d7aD4Acd86d3Bc7561EB03626d");
    // console.log("ClaimSwapSCampUSDTLpDepository address:", ClaimSwapSCampUSDTLpDepository.address);
    // await ClaimSwapSCampUSDTLpDepository.setTreasury(bondTreasury.address);

    // // Deploy bond treasury
    // // const bondTreasury_SCAMP = await BondTreasuryFactory.deploy();
    // // const bondTreasury_SCAMP = BondTreasuryFactory.attach("0xdc859778faC057E33224E06cf9070eafD053c351");
    // // console.log("bondTreasury_SCAMP address:", bondTreasury_SCAMP.address);

    // // initialize - bond mint
    // // await bondTreasury_SCAMP.__initialize(daoAddress, SCAMP.address);
    // // await SCAMP.Bond_mint(bondTreasury_SCAMP.address, BOND_GENESIS_AMOUNT);
    // // await SCAMP.approve(owner.address, BOND_GENESIS_AMOUNT);
    // // await SCAMP.transferFrom(owner.address, bondTreasury_SCAMP, BOND_GENESIS_AMOUNT);
    // console.log("scamp bond mint", (await SCAMP.balanceOf(bondTreasury.address) / 1e18).toString());

    // // initiailize depository
    // // await ClaimSwapSCampUSDTLpDepository.__initialize(
    // //     CAMP.address, // _CAMP
    // //     daoAddress, // _DAO
    // //     SCAMPPair, // _principle
    // //     SCAMP.address, // _Token0address
    // //     mock.address, // _Token1address
    // //     mock.address, // _usdt_address
    // //     assetOracle.address // _oracle
    // // );

    // console.log("totaldebt", (await ClaimSwapSCampUSDTLpDepository.totalDebt() / 1e18).toString());
    // // await ClaimSwapSCampUSDTLpDepository.initializeBondTerms(
    // //     100, //_controlVariable 상수
    // //     1500, //_vestingTerm in blokcs
    // //     0.8e9, //_minimumPriceRate 할인된가격최저 1e9
    // //     10000, //_maxPayout 1e4 10000=1%
    // //     100, //_fee 100=1%
    // //     toBn("1e6"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    // //     toBn("1e4") //_initialDebt 초기 빚(다른 곳에서 쓴?)
    // // );

    // console.log("register", (await bondTreasury.isReserveToken(SCAMPPair)));
    // // register
    // // await bondTreasury.unregisterDepositor(ClaimSwapSCampUSDTLpDepository.address);
    // // await bondTreasury.register(SCAMPPair, ClaimSwapSCampUSDTLpDepository.address);

    // console.log("max payout", (await ClaimSwapSCampUSDTLpDepository.maxPayout() / 1e18).toString());
    // console.log("pricepaid", (await ClaimSwapSCampUSDTLpDepository.bondInfo(owner.address).pricePaid));

    // // approve
    // // Approve and addLiquidity
    // bondAllowance = await pairContract.allowance(owner.address, ClaimSwapSCampUSDTLpDepository.address);
    // if (bondAllowance == 0) {
    //     await pairContract.approve(ClaimSwapSCampUSDTLpDepository.address, toBn("10000"));
    // }
    // console.log("bond allowance:", (await pairContract_CAMP.allowance(owner.address, ClaimSwapSCampUSDTLpDepository.address)).toString());
    // // deposit
    // console.log("bond price:", (await ClaimSwapSCampUSDTLpDepository.bondPrice() / 1e6).toString());
    // console.log("SCAMP, LP balance:", (await SCAMP.balanceOf(owner.address)).toString(), (await pairContract.balanceOf(owner.address)).toString());
    // await ClaimSwapSCampUSDTLpDepository.deposit(toBn("1"), await ClaimSwapSCampUSDTLpDepository.bondPrice(), owner.address);
    // console.log("SCAMP, LP balance:", (await SCAMP.balanceOf(owner.address)).toString(), (await pairContract.balanceOf(owner.address)).toString());
    // // await ClaimSwapSCampUSDTLpDepository.redeem(owner.address, false);
    // console.log("SCAMP, LP balance:", (await SCAMP.balanceOf(owner.address)).toString(), (await pairContract.balanceOf(owner.address)).toString());

    // await ClaimSwapCampUSDTLpDepository.setBondTerms("0", 432000);
    // await ClaimSwapSCampUSDTLpDepository.setBondTerms("0", 432000);
};

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