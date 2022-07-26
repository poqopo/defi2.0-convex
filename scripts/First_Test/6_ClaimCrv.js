const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const StablePair = "0x1d47E58c4cbf821aD2C360Ee8818223f885ffe1F"

    /* ============= Token Deploy =============== */

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    const VoterProxy = await VoterProxyFactory.attach("0x09017f1E20F0be9194887291173997766C4620d4");

    KPFactory = await ethers.getContractFactory("KPtoken");
    const KP = await KPFactory.attach("0x29B08932679063D03CdEE28283E3D1ACf10FB0Ea");

    EKLFactory = await ethers.getContractFactory("MLKE");
    const EKL = await EKLFactory.attach("0xADbC5fe6E80E606E640832656E3A7D8AE0dd1CA1");
    
    MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const MockUSDC = await MockUSDCFactory.attach("0x29aF4ed96D4216b02AbE7a056E83802C5E513102");

    MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    const MockUSDT = await MockUSDTFactory.attach("0x96748564751bEF5376B3f632f009BCca21700D12");

    /* ============= Contract Deploy =============== */

    FakeDisFactory = await ethers.getContractFactory("Fakedistro");
    // let Fakedistro = await FakeDisFactory.deploy(MockUSDT.address)
    const Fakedistro = await FakeDisFactory.attach("0x7e6d10a83CFb603b0325241492Eda23b93B53C89");
    console.log("Fakedistro address is:", await Fakedistro.address);

    FakeGaugeFactory = await ethers.getContractFactory("FakeGauge");
    // let FakeGauge = await FakeGaugeFactory.deploy(MockUSDC.address, MockUSDT.address)
    const FakeGauge = await FakeDisFactory.attach("0x9F0C8375a02E9Cfc9E71D74d372A623Ca18EFD17");
    console.log("FakeGauge address is:", await FakeGauge.address);

    BoosterFactory = await ethers.getContractFactory("Booster");
    // let Booster = await BoosterFactory.deploy(VoterProxy.address, KP.address)
    const Booster = await BoosterFactory.attach("0xC98103097cf75cA80cdb0a965e6c63673bf62Ace")
    console.log("Booster address is:", await Booster.address);

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    // let tFactory = await TokenFactory.deploy(Booster.address);
    const tFactory = await TokenFactory.attach("0xA73A86DB1c417CD90f6763134D90BE37ad5E107A");
    console.log("tFactory address is:", await tFactory.address);

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    // let rFactory = await RewardFactory.deploy(Booster.address);
    const rFactory = await RewardFactory.attach("0x89ef5Dc3677bF49507519C4cC2612777D921af37");
    console.log("rFactory address is:", await rFactory.address);
    
    StashFactory = await ethers.getContractFactory("StashFactory");
    // let sFactory = await StashFactory.deploy(Booster.address, rFactory.address);
    const sFactory = await StashFactory.attach("0x2CEd84D5aC5E08B6d1D2eB82E0030a7568178Ea4");
    console.log("sFactory address is:", await sFactory.address);

    /* =============== Function ============= */


    // await Booster.setFactories(rFactory.address, sFactory.address, tFactory.address);
    // await Booster.addPool(MockUSDC.address, FakeGauge.address, 1)
    // await VoterProxy.setOperator(Booster.address)

    console.log(await Booster.poolInfo(0))
    // await Booster.setRewardContracts(owner.address, owner.address)
    // await Booster.earmarkFees()
    await Booster.earmarkRewards(0)

    /* ========= Deposit&Withdraw ========= */

    // await Booster.deposit(0, toBn("100"))
    // await Booster.withdraw(0, toBn("50"))


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