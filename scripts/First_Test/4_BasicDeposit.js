const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const StablePair = "0x1d47E58c4cbf821aD2C360Ee8818223f885ffe1F"

    /* ============= Deploy =============== */

    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy ,"kprotocol governance token", "KP");
    const KP = await KPFactory.attach("0xc8598d3770557fC23aA68566E38586E1c7EED778");
    console.log("KP address is:", await KP.address);

    BTFactory = await ethers.getContractFactory("BondTreasury");
    // let BondTreasury = await BTFactory.deploy();
    // await BondTreasury.__initialize(owner.address, KP.address);
    const BondTreasury = await BTFactory.attach("0xDE394ba5751FD2d07A8Dc4dA1b7FE3f4454FcB43");
    console.log("BondTreasury address is:", await BondTreasury.address);
    

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy");
    // let VoterProxy = await VoterProxyFactory.deploy();
    const VoterProxy = await VoterProxyFactory.attach("0xA64310D109C707DD42248FACa21fD3fa0c6b3f70");
    console.log("VoterProxy address is:", await VoterProxy.address);

    BoosterFactory = await ethers.getContractFactory("Booster");
    // let Booster = await BoosterFactory.deploy(VoterProxy.address, KP.address);
    const Booster = await BoosterFactory.attach("0x3DD469B0E4176B1E82AeA2DA14860894AdD27e0E");
    console.log("Booster address is:", await Booster.address);

    //EKL Gauge

    GaugeFactory = await ethers.getContractFactory("FakeGauge");
    // let Gauge = await GaugeFactory.deploy(StablePair);
    const Gauge = await GaugeFactory.attach("0x1260D6d173b0257A6f513390a6A26fb384bC77B3");
    console.log("Gauge address is:", await Gauge.address);

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    // let tFactory = await TokenFactory.deploy(Booster.address);
    const tFactory = await TokenFactory.attach("0x9288D759eFA8DDDDB370459f196378E92FE583d3");
    console.log("tFactory address is:", await tFactory.address);

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    // let rFactory = await RewardFactory.deploy(Booster.address);
    const rFactory = await RewardFactory.attach("0x46792F2f39992C7F2bb84e39b510b8fFE5Cd9807");
    console.log("rFactory address is:", await rFactory.address);
    
    StashFactory = await ethers.getContractFactory("StashFactory");
    // let sFactory = await StashFactory.deploy(Booster.address, rFactory.address);
    const sFactory = await StashFactory.attach("0x0092daC3EFc528D48C9512514b5d547b937fEc5A");
    console.log("sFactory address is:", await sFactory.address);

    // /* ============ Set Functions ============*/

    // await Booster.setFactories(rFactory.address, sFactory.address, tFactory.address);
    // await Booster.addPool(StablePair, Gauge.address, 1);
    // console.log(await Booster.poolInfo(0))
    // console.log(await Booster.poolInfo(1)
    // await VoterProxy.setOperator(Booster.address)



    /* ============ User Functions ===========*/

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