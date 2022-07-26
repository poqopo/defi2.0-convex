const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();

    /* ============= Deploy =============== */

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    const VoterProxy = await VoterProxyFactory.attach("0xb44A9e78CcC30Afa9BC3653E80b0F0FAAD498103");

    KPFactory = await ethers.getContractFactory("KPtoken");
    const KP = await KPFactory.attach("0x3CfE98669D401302d1420C98cb9E66813083E84D");

    EKLFactory = await ethers.getContractFactory("MEKL");
    const EKL = await EKLFactory.attach("0x9F3C49F5e83c43815c8710FdEB54876d6F649B14");

    m3MoonFactory = await ethers.getContractFactory("m3Moon");
    const m3Moon = await m3MoonFactory.attach("0xeCDDa9623c57e4539BE76EEEb0F43Ca73a441438");

    MockLPFactory = await ethers.getContractFactory("MockLP");
    const MockLP = await MockLPFactory.attach("0xd44725E11821534AB6b9a17D80B75d47a907c0e3");

    FakeGaugeFactory = await ethers.getContractFactory("FakeGauge");
    const FakeGauge = await FakeGaugeFactory.attach("0x06b14E4983565Db987a01fD54f4568814d04631f");

    BoosterFactory = await ethers.getContractFactory("Booster");
    // let Booster = await BoosterFactory.deploy(VoterProxy.address, KP.address)
    const Booster = await BoosterFactory.attach("0xCD9C44B0bfA9c32850D9CD58c0584F1354D8efE4")
    console.log("Booster address is:", await Booster.address);

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    // let tFactory = await TokenFactory.deploy(Booster.address);
    const tFactory = await TokenFactory.attach("0x79a1eE925486983684b2Fba93c67e78a30728214");
    console.log("tFactory address is:", await tFactory.address);

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    // let rFactory = await RewardFactory.deploy(Booster.address);
    const rFactory = await RewardFactory.attach("0x82806c80e4694397Cc25812dac6C5B00836Db995");
    console.log("rFactory address is:", await rFactory.address);

    /*================ set Function ==================*/

    // await Booster.setFactories(rFactory.address, tFactory.address);
    // await Booster.addPool(MockLP.address, FakeGauge.address);
    // await VoterProxy.setOperator(Booster.address)

    // console.log(await Booster.poolInfo(0))

  
    // After 4_lockReward

    // await Booster.setFeeInfo(m3Moon.address)
    // console.log("lockfee address is:", await Booster.lockFees());

    await Booster.setFees(2000, 1990, 10, 6000, 2000)


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