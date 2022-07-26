const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");

const main = async () => {
    const [owner] = await ethers.getSigners();
    
    const KPPairOracle = "0xeDCa184d07518833d6f3afB95327ce3fdB99e089"
    const StablePair = "0x1d47E58c4cbf821aD2C360Ee8818223f885ffe1F"
    const mock1 = "0xE08177F3b94Da80e04e911126E5087f8Fe5807ae"
    const mock2 = "0xB513979f2773d05971Ee729E21cc69e1AD1b9b52"
    // const KP = "0xc8598d3770557fC23aA68566E38586E1c7EED778"
    const controlvar = 100;
    const vestingTerm = 3600;
    const minimumPriceRate = 9*10**8;
    const maxPayout = 1e4;
    const fee = 1e4;
    const maxDebt = toBn("1000000000")

    const booster = "0x3DD469B0E4176B1E82AeA2DA14860894AdD27e0E"

    /* ============= Deploy =============== */

    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy.address ,"kprotocol token", "KP", owner.address);
    const KPtoken = await KPFactory.attach("0xc8598d3770557fC23aA68566E38586E1c7EED778");
    console.log("KP address is:", await KPtoken.address);

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    const assetOracle = await assetOracleFactory.attach("0x46d9BDb7338aE4Ba7864F467B67E6036c9Ff0546");
    console.log("assetOracle:", assetOracle.address);

    // Deploy to Bond
    const USDT_USDC_BondDepositoryFactory = await ethers.getContractFactory("USDT_USDC_BondDepository");
    // const USDT_USDC_BondDepository = await USDT_USDC_BondDepositoryFactory.deploy();
    const USDT_USDC_BondDepository = await USDT_USDC_BondDepositoryFactory.attach("0xEbE6E85AC1734c9B1AC06626fF188B52C3F2806F");
    console.log("USDT_USDC_BondDepository address:", USDT_USDC_BondDepository.address);

    // Deploy bond treasury
    const BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    // const bondTreasury = await BondTreasuryFactory.deploy();
    const bondTreasury = await BondTreasuryFactory.attach("0xDE394ba5751FD2d07A8Dc4dA1b7FE3f4454FcB43");
    console.log("bondTreasury address:", bondTreasury.address);
    // await bondTreasury.__initialize(owner.address, KP);
    // const BOND_GENESIS_AMOUNT = toBn("1000000");
    // await KPtoken.mint(bondTreasury.address, BOND_GENESIS_AMOUNT);
    /* ============= set Function ============*/
    //assetOracleset
    // await assetOracle.setAssetOracle([KPPairOracle]);

    // initiailize depository
    // await USDT_USDC_BondDepository.__initialize(
    //     KP, owner.address, StablePair, mock1, mock2, assetOracle.address
    // );
    // await USDT_USDC_BondDepository.initializeBondTerms(
    //   controlvar, //_controlVariable 상수
    //   vestingTerm, //_vestingTerm in blokcs
    //   minimumPriceRate, //_minimumPriceRate 할인된가격최저 1e9
    //   maxPayout, //_maxPayout 1e4 10000=1%
    //   fee, //_fee 100=1%
    //   maxDebt, //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //     0 //_initialDebt 초기 빚(다른 곳에서 쓴?)
    // );
    // await USDT_USDC_BondDepository.setTreasury(bondTreasury.address);
    // await bondTreasury.register(StablePair, USDT_USDC_BondDepository.address);
    
    // console.log("max payout", (await USDT_USDC_BondDepository.maxPayout() / 1e18).toString());

    /* ============= user Function ============*/


    // console.log((await USDT_USDCLP.balanceOf(owner.address)).toString())
    // console.log((await USDT_USDCLP.balanceOf(BondTreasury.address)).toString())

    const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    let USDT_USDCLP = PairFactory.attach(StablePair);

    const LPAllowance = await USDT_USDCLP.allowance(owner.address, USDT_USDC_BondDepository.address);
    if (LPAllowance == 0) {
        await USDT_USDCLP.approve(USDT_USDC_BondDepository.address, toBn("10000"));
    }
    console.log("LPAllowance:", LPAllowance.toString());

    // await USDT_USDC_BondDepository.deposit(toBn("60"), (await USDT_USDC_BondDepository.bondPrice()).toString(), owner.address)
    // console.log("Sucess!")
    // await USDT_USDC_BondDepository.redeem(owner.address)
    // await bondTreasury.setBooster(booster)
    // await bondTreasury.setApprovals();
    const BTallowance = await USDT_USDCLP.allowance(bondTreasury.address, booster);
    console.log("BTallowance:", BTallowance.toString());
    // console.log("Almost!")
    // await bondTreasury.depositLP(0, toBn("1"));

    // console.log("Success!")
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