const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const StablePair = "0x1d47E58c4cbf821aD2C360Ee8818223f885ffe1F"
    const FakeGauge = "0x9F0C8375a02E9Cfc9E71D74d372A623Ca18EFD17"
    const Booster = "0xC98103097cf75cA80cdb0a965e6c63673bf62Ace"
    const Fakedistro = "0x7e6d10a83CFb603b0325241492Eda23b93B53C89"
    const EKLDepositor = "0x65E229a9496ff8513aa6777810957413Ef1C57aB"
    const kpEKLStake = "0x3CFF664661A6b19CbD70471e98169B6f66399066"
    const kpStake = "0xdaa13cb99a9cb2b3b952d8eAE537488c4245B981"

    /* ============= Deploy =============== */

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    // let VoterProxy = await VoterProxyFactory.deploy()
    const VoterProxy = await VoterProxyFactory.attach("0x09017f1E20F0be9194887291173997766C4620d4");
    console.log("VoterProxy address is:", await VoterProxy.address);


    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy.address ,"kprotocol governance token", "KP", owner.address);
    const KP = await KPFactory.attach("0x29B08932679063D03CdEE28283E3D1ACf10FB0Ea");
    console.log("KP address is:", await KP.address);

    EKLFactory = await ethers.getContractFactory("MLKE");
    // let EKL = await EKLFactory.deploy();
    const EKL = await EKLFactory.attach("0x09523685a82d8e96F7FF02575DA94749955eD251");
    console.log("EKL address is:", await EKL.address);
    

    MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    // let MockUSDC = await MockUSDCFactory.deploy();
    const MockUSDC = await MockUSDCFactory.attach("0x29aF4ed96D4216b02AbE7a056E83802C5E513102");
    console.log("MockUSDC address is:", await MockUSDC.address);

    MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    // let MockUSDT = await MockUSDTFactory.deploy();
    const MockUSDT = await MockUSDTFactory.attach("0x96748564751bEF5376B3f632f009BCca21700D12");
    console.log("MockUSDT address is:", await MockUSDT.address);

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    // let kpEKL = await kpEKLTokenFactory.deploy();
    const kpEKL = await kpEKLTokenFactory.attach("0x381692f513e962Cd5C424ce0797B6D1CB2d7B80b");
    console.log("kpEKL address is:", await kpEKL.address);


    // /* ============ Set Functions ============*/

    // await Booster.setFactories(rFactory.address, sFactory.address, tFactory.address);
    // await Booster.addPool(StablePair, Gauge.address, 1);
    // console.log(await Booster.poolInfo(0))
    // console.log(await Booster.poolInfo(1)
    // await VoterProxy.setOperator(Booster.address)

    /* ============ User Functions ===========*/

    // await MockUSDC.setBalance(owner.address, toBn("10000"))
    // await MockUSDT.setBalance(FakeGauge, toBn("10000"))
    // await MockUSDT.setBalance(Fakedistro, toBn("10000"))

    // await MockUSDC.approve(Booster, toBn("1e18"))

    // await EKL.approve(EKLDepositor, toBn("1e18"))
    // await EKL.mint(owner.address, toBn("1000"))
    // await kpEKL.setOperator(EKLDepositor)
    
    // await kpEKL.approve(kpEKLStake, toBn("1e18"))
    // await MockUSDT.setBalance(kpEKLStake, toBn("100"))

    // await KP.mint(owner.address, toBn("100000"))

    // await KP.approve(kpStake, toBn("1e18"))
    // await EKL.mint(kpStake, toBn("100"))



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