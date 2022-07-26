const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();

    /* ============= Deploy =============== */

    MockLPFactory = await ethers.getContractFactory("MockLP");
    const MockLP = await MockLPFactory.attach("0xd83b9dfa49d6c6d2a69554576e712e45a8a13e49");

    EKLFactory = await ethers.getContractFactory("MEKL");
    const EKL = await EKLFactory.attach("0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA");

    KPFactory = await ethers.getContractFactory("KPtoken");
    const KP = await KPFactory.attach("0x1F53eb0ac6BAAE27837e6cF17A8215502A030fb7");

    TreasuryFundFactory = await ethers.getContractFactory("TreasuryFunds");
    const TreasuryFund = await TreasuryFundFactory.attach("0xE7659767f8C4167b79c2bF3C361973A4a200d663");
  
    BoosterFactory = await ethers.getContractFactory("Booster");
    const Booster = await BoosterFactory.attach("0x3b34a23c9247221F39B91F6954211BBd13aC1C35")

    m3MoonFactory = await ethers.getContractFactory("m3Moon");
    const m3Moon = await m3MoonFactory.attach("0xd83b9dfa49d6c6d2a69554576e712e45a8a13e49");

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    const kpEKL = await kpEKLTokenFactory.attach("0x8d1113a961eFB709445f655FBc1aEd384aF34B9d");

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    const assetOracle = await assetOracleFactory.attach("0x356d3903800cbD272050F8224a4D084b91000Ec7");
    console.log("assetOracle:", assetOracle.address);

    const mockUSDTFactory = await ethers.getContractFactory("mUSDT");
    // const mockUSDT = await mockUSDTFactory.deploy();
    const mockUSDT = await mockUSDTFactory.attach("0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167");
    console.log("mockUSDT:", mockUSDT.address);

    eklkpekllpFactory = await ethers.getContractFactory("m3Moon");
    const eklkpekllp = await eklkpekllpFactory.attach("0x8a50055ebab31b99d5d6be6ff661926e72d1f4b7");


    /* ================ Oracle Set ================ */

        // ADD LIQUIDITY
    const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
    // const factory = await uniConFactory.deploy(owner.address);
    const factory = uniConFactory.attach("0x3679c3766e70133ee4a7eb76031e49d3d1f2b50c"); // with wKLAY
    console.log("Factory address is:", factory.address);
    // const pairCodeHash = await factory.pairCodeHash();
    // console.log("pairCodeHash:", pairCodeHash);

    //    // create KP, mock pair
    // let KPPair = await factory.getPair(KP.address, mockUSDT.address);
    // if (KPPair == ethers.constants.AddressZero) {
    //     console.log("create KP pair");
    //     await factory.createPair(KP.address, mockUSDT.address);
    //     KPPair = await factory.getPair(KP.address, mockUSDT.address);
    // // }
    // console.log("KP pair:", KPPair);

    // const wKLAYFactory = await ethers.getContractFactory("WKLAY");
    // // const wKLAY = await wKLAYFactory.deploy();
    // const wKLAY = wKLAYFactory.attach("0xe4f05a66ec68b54a58b17c22107b02e0232cc817");
    // console.log("wKLAY address:", wKLAY.address);

    // const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
    // // const router = await RouterFactory.deploy(factory.address, wKLAY.address);
    // const router = RouterFactory.attach("0xef71750c100f7918d6ded239ff1cf09e81dea92d");
    // console.log("router address:", router.address);

    // // // Approve and addLiquidity
    // const KPAllowance = await KP.allowance(owner.address, router.address);
    // if (KPAllowance == 0) {
    //     await KP.approve(router.address, toBn("10000"));
    // }
    // console.log("KPAllowance:", KPAllowance.toString());
    // const mockAllowance = await mockUSDT.allowance(owner.address, router.address);
    // if (mockAllowance == 0) {
    //     await mockUSDT.approve(router.address, toBn("10000"));
    // }
    // console.log("mockCollatAllowance:", mockAllowance.toString());

    const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    let pairContract = PairFactory.attach("0x219ee5d76593f5bd639125b6411a17d309e3ad31");
    // // console.log(await pairContract.factory(), await pairContract.token0(), await pairContract.token1());
    let reserve = await pairContract.getReserves();
    console.log("KP pair", reserve[0].toString(), reserve[1].toString(), reserve[2])
    // if (reserve[0] == 0) {
    //     console.log("add to liquidity to KP pair");
    //     const tx = await router.addLiquidity(KP.address, mockUSDT.address, toBn("100"), toBn("10"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
    //     KPPair = await factory.getPair(KP.address, mockUSDT.address);
    //     pairContract = PairFactory.attach(KPPair);
    //     console.log("KP pair:", KPPair);
    //     reserve = await pairContract.getReserves();
    //     console.log(reserve[0].toString(), reserve[1].toString(), reserve[2])
    // }

    // // swap
    // // const swapamounts = await router.getAmountsOut(1e6, [mock.address, KP.address]);
    // // console.log("swap ratio:", await swapamounts[0].toString(), await swapamounts[1].toString());
    // // await router.swapExactTokensForTokens((swapamounts[0]*100000000000000000).toString(), swapamounts[1].toString(), [KP.address, mock.address], owner.address, Math.floor(Date.now()) + 10);

    // const uniOracleFactory = await ethers.getContractFactory("UniswapPairOracle");
    // // const KPPairOracle = await uniOracleFactory.deploy(factory.address, KP.address, mockUSDT.address, owner.address);
    // const KPPairOracle = uniOracleFactory.attach("0xE2e3752C9ac0627CE3D72A0f7Ee78b97ECB1b919");
    // console.log("KPPairOracle:", KPPairOracle.address);

    // // await KPPairOracle.setPeriod(1000); // 1 = 1초
    // console.log(await KPPairOracle.canUpdate());
    // if (await KPPairOracle.canUpdate()) {
    //     console.log("KP oracle is updated");
    //     await KPPairOracle.update();
    // }
    // console.log(await KPPairOracle.consult(KP.address, toBn("1")))

    // await assetOracle.setAssetOracle([KPPairOracle.address]);

    // console.log((await assetOracle.getAssetPrice(KP.address)).toString());
    

    /* ================ Bond Deploy ================*/


    m3MoonBondDepositoryFactory = await ethers.getContractFactory("m3Moon_BondDepository");
    // let m3MoonBondDepository = await m3MoonBondDepositoryFactory.deploy();
    const m3MoonBondDepository = await m3MoonBondDepositoryFactory.attach("0x3A7545990d9Cc4951A1758609a6bB06A13e1Db4E");
    console.log("m3MoonBondDepository address is:", await m3MoonBondDepository.address);

    BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    // let BondTreasury = await BondTreasuryFactory.deploy();
    const BondTreasury = await BondTreasuryFactory.attach("0x76983d30de93a4561b8be79779ff05E99c29a1C6");
    console.log("BondTreasury address is:", await BondTreasury.address);

    // await BondTreasury.__initialize(TreasuryFund.address, KP.address);
    // await m3MoonBondDepository.__initialize(
    //   KP.address, TreasuryFund.address, m3Moon.address, assetOracle.address);
    // await m3MoonBondDepository.initializeBondTerms(
    //   100, //_controlVariable 상수/
    //   432000, //_vestingTerm in blokcs
    //   0.9e9, //_minimumPriceRate 할인된가격최저 1e9
    //   10000, //_maxPayout 1e4 10000=1%
    //   100, //_fee 100=1%
    //   toBn("1e8"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //   0
    // );
    
    // register

    // console.log("max payout", (await m3MoonBondDepository.maxPayout() / 1e18).toString());
    // console.log(await m3MoonBondDepository.currentDebt())

    // await BondTreasury.register(m3Moon.address, m3MoonBondDepository.address);   
    // await BondTreasury.setBooster(Booster.address)
    // await m3MoonBondDepository.setTreasury(BondTreasury.address)

    // await BondTreasury.setApprovals()
    // console.log("register", (await BondTreasury.isReserveToken(m3Moon.address)).toString());

    // await Booster.mint_KP(BondTreasury.address, toBn("1e6"))
    // await m3Moon.setBalance(owner.address, toBn("1000"))

    // await m3Moon.approve(m3MoonBondDepository.address, toBn("1e18"))
    // await m3MoonBondDepository.deposit(toBn("0.9"), await m3MoonBondDepository.bondPrice(), owner.address);

    // await BondTreasury.depositAll(0)

    /* ================ EKLkpEKLBond Function ==================*/


    const KlaySwapassetOracleFactory = await ethers.getContractFactory("AssetOracleKlaySwap");
    // const KlaySwapassetOracle = await KlaySwapassetOracleFactory.deploy();
    const KlaySwapassetOracle = await KlaySwapassetOracleFactory.attach("0x8A03c9A9F1100E98CAE4FeC00e9f318FF254FD8C");
    console.log("KlaySwapassetOracle:", KlaySwapassetOracle.address);

    // EKLkpEKLBondDepositoryFactory = await ethers.getContractFactory("EKLkpEKLBond");
    // let EKLkpEKLBondDepository = await EKLkpEKLBondDepositoryFactory.deploy();
    // const EKLkpEKLBondDepository = await EKLkpEKLBondDepositoryFactory.attach("0x59C8d9E04F3F23a002E2e937E9d88934Ad62bB21");
    // console.log("EKLkpEKLBondDepository address is:", await EKLkpEKLBondDepository.address);

    // await EKLkpEKLBondDepository.__initialize(
    //   KP.address, TreasuryFund.address, eklkpekllp.address, EKL.address, kpEKL.address, assetOracle.address);
    // await EKLkpEKLBondDepository.initializeBondTerms(
    //   100, //_controlVariable 상수/
    //   432000, //_vestingTerm in blokcs
    //   0.9e9, //_minimumPriceRate 할인된가격최저 1e9
    //   10000, //_maxPayout 1e4 10000=1%
    //   100, //_fee 100=1%
    //   toBn("1e8"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //   0
    // );

    // await BondTreasury.register(eklkpekllp.address, EKLkpEKLBondDepository.address);
    // await EKLkpEKLBondDepository.setTreasury(BondTreasury.address)

    // await KlaySwapassetOracle.setAssetOracle(["0x219ee5d76593f5bd639125b6411a17d309e3ad31"]); //EKL oUSDT Pair
    console.log(await KlaySwapassetOracle.getAssetPrice(EKL.address))
    // console.log((await EKLkpEKLBondDepository.assetPrice()).toString());

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