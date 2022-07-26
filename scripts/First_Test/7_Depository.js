const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const StablePair = "0x1d47E58c4cbf821aD2C360Ee8818223f885ffe1F"

    /* ============= Token Deploy =============== */

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    // let VoterProxy = await VoterProxyFactory.deploy()
    const VoterProxy = await VoterProxyFactory.attach("0x18aaC2FfDB7aAC63ac51C7e8e715D1CE322b505A");
    console.log("VoterProxy address is:", await VoterProxy.address);

    KPFactory = await ethers.getContractFactory("KPtoken");
    const KP = await KPFactory.attach("0x29B08932679063D03CdEE28283E3D1ACf10FB0Ea");

    EKLFactory = await ethers.getContractFactory("MLKE");
    const EKL = await EKLFactory.attach("0x09523685a82d8e96F7FF02575DA94749955eD251");

    
    MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const MockUSDC = await MockUSDCFactory.attach("0x29aF4ed96D4216b02AbE7a056E83802C5E513102");

    MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    const MockUSDT = await MockUSDTFactory.attach("0x96748564751bEF5376B3f632f009BCca21700D12");

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    const kpEKL = await kpEKLTokenFactory.attach("0x381692f513e962Cd5C424ce0797B6D1CB2d7B80b");

    /* ============= Contract Deploy =============== */

    FakeDisFactory = await ethers.getContractFactory("Fakedistro");
    const Fakedistro = await FakeDisFactory.attach("0x7e6d10a83CFb603b0325241492Eda23b93B53C89");

    FakeGaugeFactory = await ethers.getContractFactory("FakeGauge");
    const FakeGauge = await FakeDisFactory.attach("0x9F0C8375a02E9Cfc9E71D74d372A623Ca18EFD17");

    BoosterFactory = await ethers.getContractFactory("Booster");
    const Booster = await BoosterFactory.attach("0xC98103097cf75cA80cdb0a965e6c63673bf62Ace")

    DepositorFactory = await ethers.getContractFactory("EKLDepositor")
    // let EKLDepositor = await DepositorFactory.deploy(VoterProxy.address, kpEKL.address)
    const EKLDepositor = await DepositorFactory.attach("0x65E229a9496ff8513aa6777810957413Ef1C57aB");
    console.log("EKLDepositor address is:", await EKLDepositor.address);

    /* =============== Function ============= */


    
    // await Booster.deposit(0, toBn("100"))
    // await Booster.withdraw(0, toBn("50"))
    // await VoterProxy.setDepositor(EKLDepositor.address)
    // console.log(await EKLDepositor.lockIncentive())
    // await EKLDepositor.depositEKL(toBn("10"), false)

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