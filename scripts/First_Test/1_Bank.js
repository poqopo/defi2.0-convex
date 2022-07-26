const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const BondT = "0xE4A2D6c04405BEbf5284dA87D6e0714FaF20c588"

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy");
    // let VoterProxy = await VoterProxyFactory.deploy();
    const VoterProxy = await VoterProxyFactory.attach("0xA64310D109C707DD42248FACa21fD3fa0c6b3f70");
    console.log("VoterProxy address is:", await VoterProxy.address);

    /*TOken Deploy */

    KUSDFactory = await ethers.getContractFactory("KUSDtoken");
    // let KUSD = await KUSDFactory.deploy("kprotocol USD", "KUSD", owner.address);
    const KUSD = await KUSDFactory.attach("0xBd309075273D8ebe4f09E5748Ef56aEb21bD4b98");
    console.log("KUSD address is:", await KUSD.address);

    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy.address ,"kprotocol token", "KP", owner.address);
    const KP = await KPFactory.attach("0xc8598d3770557fC23aA68566E38586E1c7EED778");
    console.log("KP address is:", await KP.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    // let mock1 = await mockFactory.deploy();
    const mock1 = await mockFactory.attach("0xE08177F3b94Da80e04e911126E5087f8Fe5807ae");
    console.log("mock address is:", await mock1.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    // let mock2 = await mockFactory.deploy();
    const mock2 = await mockFactory.attach("0xB513979f2773d05971Ee729E21cc69e1AD1b9b52");
    console.log("mock address is:", await mock2.address);


    /*Bank Deploy */

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    const assetOracle = await assetOracleFactory.attach("0xaE128B5ea43615Bd40c639C5617492B90B33F0c5");
    console.log("assetOracle:", assetOracle.address);

    const KUSDPoolLibraryFactory = await ethers.getContractFactory("KUSDPoolLibrary");
    // let KUSDPoolLibrary = await KUSDPoolLibraryFactory.deploy();
    const KUSDPoolLibrary = await KUSDPoolLibraryFactory.attach("0xd273b93626FA553b23c28f04eEB666282F9B7507");
    const BankFactory = await ethers.getContractFactory("KUSDBank", {
        libraries: {
            KUSDPoolLibrary: KUSDPoolLibrary.address,
        },
    });
    console.log("KUSDPoolLibrary address is:", await KUSDPoolLibrary.address);
    // let Bank = await BankFactory.deploy(KP.address, KUSD.address, mock.address, assetOracle.address);
    const Bank = await BankFactory.attach("0xA2c050b8c0E297Dd676886B3098C5061293418b7");
    console.log("Bank address is:", Bank.address);

    await mock1.setBalance(Bank.address, toBn("5000000"));

    //approve
    await KP.approve(Bank.address, toBn("10000"));
    await KUSD.approve(Bank.address, toBn("10000"));
    await mock1.approve(Bank.address, toBn("10000"));
    await mock2.approve(Bank.address, toBn("10000"));

    //KP set()
    await KP.updateOperator();
    await KP.setKUSDAddress(KUSD.address);
    await KP.mint(owner.address, "50000000");

    //KUSD set()
    await KUSD.setRedemptionFee(550); // 0.55% Frax랑 동일하게
    await KUSD.setMintingFee(3000) // 3% 오픈시 0%
    await KUSD.setkpAddress(KP.address);
    await KUSD.setBankAddress(Bank.address);
    await KUSD.setOracleAddress(assetOracle.address);

    // ADD LIQUIDITY
    const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
    // const factory = await uniConFactory.deploy(owner.address);
    const factory = uniConFactory.attach("0x09c32E9f420EC292dC477FdbDcb08078cbD1F8eDpairCodeHash:"); // with wKLAY
    console.log("Factory address is:", factory.address);
    const pairCodeHash = await factory.pairCodeHash();
    console.log("pairCodeHash:", pairCodeHash);

    // create KUSD, mock1 pair
    // let KUSDPair = await factory.getPair(KUSD.address, mock1.address);
    // if (KUSDPair == ethers.constants.AddressZero) {
    //     console.log("create KUSD pair");
    //     await factory.createPair(KUSD.address, mock1.address);
    //     KUSDPair = await factory.getPair(KUSD.address, mock1.address);
    // }
    // console.log("KUSD pair:", KUSDPair);

    // create KP, mock1 pair
    let KPPair = await factory.getPair(KP.address, mock1.address);
    if (KPPair == ethers.constants.AddressZero) {
        console.log("create KP pair");
        await factory.createPair(KP.address, mock1.address);
        KPPair = await factory.getPair(KP.address, mock1.address);
    }
    console.log("KP pair:", KPPair);

    const wKLAYFactory = await ethers.getContractFactory("WKLAY");
    // const wKLAY = await wKLAYFactory.deploy();
    const wKLAY = wKLAYFactory.attach("0x47AC1BA3FC552B73D22E26Fde46C6816b99ce4c7");
    console.log("wKLAY address:", wKLAY.address);

    const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
    // const router = await RouterFactory.deploy(factory.address, wKLAY.address);
    const router = RouterFactory.attach("0xfa0398bB3e1Ab03101aD9A36a8D7EF54AF1A0c54");
    console.log("router address:", router.address);

    // Approve and addLiquidity
    const KUSDAllowance = await KUSD.allowance(owner.address, router.address);
    if (KUSDAllowance == 0) {
        await KUSD.approve(router.address, toBn("10000"));
    }
    console.log("KUSDAllowance:", KUSDAllowance.toString());
    const mock1Allowance = await mock1.allowance(owner.address, router.address);
    if (mock1Allowance == 0) {
        await mock1.approve(router.address, toBn("10000"));
    }
    console.log("mock1CollatAllowance:", mock1Allowance.toString());









    /* ============= setFunction ===========*/
    // await assetOracle.setAssetOracle(["0xcB02e69A21788C9655bA135FC2AC11D83f660DF4"])
    console.log(await assetOracle.getAssetPrice(KP.address))
    // console.log("BondT bal :", (await KP.balanceOf(BondT)).toString());
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