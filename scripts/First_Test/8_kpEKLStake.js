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

    EKLFactory = await ethers.getContractFactory("MLKE");
    const EKL = await EKLFactory.attach("0x09523685a82d8e96F7FF02575DA94749955eD251");

    
    MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const MockUSDC = await MockUSDCFactory.attach("0x29aF4ed96D4216b02AbE7a056E83802C5E513102");

    MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    const MockUSDT = await MockUSDTFactory.attach("0x96748564751bEF5376B3f632f009BCca21700D12");

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    const kpEKL = await kpEKLTokenFactory.attach("0x381692f513e962Cd5C424ce0797B6D1CB2d7B80b");

    /* ============= Contract Deploy =============== */

    BoosterFactory = await ethers.getContractFactory("Booster");
    const Booster = await BoosterFactory.attach("0xC98103097cf75cA80cdb0a965e6c63673bf62Ace")

    DepositorFactory = await ethers.getContractFactory("EKLDepositor")
    // let EKLDepositor = await DepositorFactory.deploy(VoterProxy.address, kpEKL.address)
    const EKLDepositor = await DepositorFactory.attach("0x65E229a9496ff8513aa6777810957413Ef1C57aB");
    console.log("EKLDepositor address is:", await EKLDepositor.address);

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    // let rFactory = await RewardFactory.deploy(Booster.address);
    const rFactory = await RewardFactory.attach("0x89ef5Dc3677bF49507519C4cC2612777D921af37");
    console.log("rFactory address is:", await rFactory.address);

    kpEKLStakeFactory = await ethers.getContractFactory("BaseRewardPool");
    // let kpEKLStake = await kpEKLStakeFactory.deploy(0, kpEKL.address, MockUSDT.address, owner.address, rFactory.address);
    const kpEKLStake = await kpEKLStakeFactory.attach("0x3CFF664661A6b19CbD70471e98169B6f66399066");
    console.log("kpEKLStake address is:", await kpEKLStake.address);

    /* =============== Function ============= */



    // await kpEKLStake.queueNewRewards(MockUSDT.balanceOf(kpEKLStake.address))
    // console.log("1")
    // await kpEKLStake.stake(toBn("5"))
    // await kpEKLStake.withdraw(toBn("1"), false)
    // console.log(await kpEKLStake.rewardPerToken())
    // console.log(await kpEKLStake.rewardRate())
    // console.log(await kpEKLStake.earned(owner.address))
    // await kpEKLStake.getReward(owner.address, true)

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