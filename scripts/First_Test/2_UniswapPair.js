const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();

    KUSDFactory = await ethers.getContractFactory("KUSDtoken");
    // let KUSD = await KUSDFactory.deploy("kprotocol USD token", "KUSD");
    const KUSD = await KUSDFactory.attach("0xBd309075273D8ebe4f09E5748Ef56aEb21bD4b98");
    console.log("KUSDtoken address is:", await KUSD.address);

    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy ,"kprotocol governance token", "KP");
    const KP = await KPFactory.attach("0xc8598d3770557fC23aA68566E38586E1c7EED778");
    console.log("KPtoken address is:", await KP.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    // let mock = await mockFactory.deploy();
    const mock = await mockFactory.attach("0xE08177F3b94Da80e04e911126E5087f8Fe5807ae");
    console.log("mock address is:", await mock.address);
    // await mock.setBalance(owner.address, toBn("1000000"))

    // let mock1 = await mockFactory.deploy();
    const mock1 = await mockFactory.attach("0xB513979f2773d05971Ee729E21cc69e1AD1b9b52");
    console.log("mock1 address is:", await mock1.address);
    // await mock1.setBalance(owner.address, toBn("1000000"))

    /* ========= Deploy Factory ======== */

    const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
    // const factory = await uniConFactory.deploy(owner.address);
    const factory = uniConFactory.attach("0x929BAa175D690a82168928b1b897894B283255dF"); // with wKLAY
    console.log("Factory address is:", factory.address);
    // const pairCodeHash = await factory.pairCodeHash();
    // console.log("pairCodeHash:", pairCodeHash); //Need to fix paircode

    // create mock Stable pair

    let StablePair = await factory.getPair(mock.address, mock1.address);
    if (StablePair == ethers.constants.AddressZero) {
        console.log("create Stable pair");
        await factory.createPair(mock.address, mock1.address);
        StablePair = await factory.getPair(mock.address, mock1.address);
    }
    console.log("Stable Pair:", StablePair);

    const wKLAYFactory = await ethers.getContractFactory("WKLAY");
    // const wKLAY = await wKLAYFactory.deploy();
    const wKLAY = wKLAYFactory.attach("0x8E51AD1C7867996EDe26eE70fcB7EfDa036B8AB1");
    console.log("wKLAY address:", wKLAY.address);

    const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
    // const router = await RouterFactory.deploy(factory.address, wKLAY.address);
    const router = RouterFactory.attach("0x29381Af066618404dDC534D69b7dA5b4EBc3EFf0");
    console.log("router address:", router.address);


    // /* ========== Approve and addLiquidity =========*/

    const mockAllowance = await mock.allowance(owner.address, router.address);
    if (mockAllowance == 0) {
        await mock.approve(router.address, toBn("10000"));
    }
    console.log("mockCollatAllowance:", mockAllowance.toString());

    const mock1Allowance = await mock1.allowance(owner.address, router.address);
    if (mock1Allowance == 0) {
        await mock1.approve(router.address, toBn("10000"));
    }
    console.log("mockCollatAllowance:", mock1Allowance.toString());

    const KPAllowance = await KP.allowance(owner.address, router.address);
    if (KPAllowance == 0) {
        await KP.approve(router.address, toBn("10000"));
    }
    console.log("mockCollatAllowance:", mock1Allowance.toString());

    // Make Stable Pair
    const PairFactory = await ethers.getContractFactory("UniswapV2Pair");
    let pairContract = PairFactory.attach(StablePair);
    console.log(await pairContract.factory(), await pairContract.token0(), await pairContract.token1());
    let reserve = await pairContract.getReserves();
    console.log("mock pair", reserve[0].toString(), reserve[1].toString(), reserve[2])
    if (reserve[0] == 0) {
        console.log("add to liquidity to mock pair");
        const tx = await router.addLiquidity(mock1.address, mock.address, toBn("100"), toBn("100"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
        console.log("Stable pair:", StablePair);
        reserve = await pairContract.getReserves();
        console.log(reserve[0].toString(), reserve[1].toString(), reserve[2])
    }

    // Make KP Pair 

    let KPPair = await factory.getPair(KP.address, mock.address);
    if (KPPair == ethers.constants.AddressZero) {
        console.log("create KP pair");
        await factory.createPair(KP.address, mock.address);
        KPPair = await factory.getPair(KP.address, mock.address);
    }
    console.log("KP pair:", KPPair);

    let pairContract_KP = PairFactory.attach(KPPair);
    let reserve_KP = await pairContract_KP.getReserves();
    console.log("KP pair", reserve_KP[0].toString(), reserve_KP[1].toString(), reserve_KP[2])
    if (reserve_KP[0] == 0) {
        console.log("add to liquidity to KP pair");
        await router.addLiquidity(KP.address, mock.address, toBn("10000"), toBn("1000"), 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
        console.log("KP pair:", KPPair);
        reserve_KP = await pairContract_KP.getReserves();
        console.log(reserve_KP[0].toString(), reserve_KP[1].toString(), reserve_KP[2])
    }

    const uniOracleFactory = await ethers.getContractFactory("UniswapPairOracle");
    // const StablePairOracle = await uniOracleFactory.deploy(factory.address, mock1.address, mock.address, owner.address);
    const StablePairOracle = uniOracleFactory.attach("0x4Da99816269d148dc92C4f45f88b36C29A7d6056");
    console.log("StablePairOracle:", StablePairOracle.address);
    await StablePairOracle.setPeriod(10000); // 1 = 1초
    console.log(await StablePairOracle.canUpdate());
    if (await StablePairOracle.canUpdate()) {
        console.log("KUSD oracle is updated");
        await StablePairOracle.update();
    }

    // const KPPairOracle = await uniOracleFactory.deploy(factory.address, KP.address, mock.address, owner.address);
    const KPPairOracle = uniOracleFactory.attach("0xeDCa184d07518833d6f3afB95327ce3fdB99e089");
    console.log("KPPairOracle:", KPPairOracle.address);
    await KPPairOracle.setPeriod(10000);
    if (await KPPairOracle.canUpdate()) {
        console.log("KP oracle is updated");
        await KPPairOracle.update();
    }


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