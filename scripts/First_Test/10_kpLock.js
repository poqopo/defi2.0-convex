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

    TreasuryFactory = await ethers.getContractFactory("TreasuryFunds");
    // let Treasury = await TreasuryFactory.deploy(owner.address);
    const Treasury = await TreasuryFactory.attach("0xaBa0A2fe85cDaA8da5020FD48e3674FE4c37c5a2");
    console.log("Treasury address is:", await Treasury.address);

    kpLockFactory = await ethers.getContractFactory("KPLockerV2");
    // let kpLock = await kpLockFactory.deploy()
    const kpLock = await kpLockFactory.attach("0xf033Ea129F41Eb4770ceaf514c0B6959Bc996662")
    console.log("kpLock address is:", await kpLock.address);
    
    kpStakingProxyFactory = await ethers.getContractFactory("KPStakingProxyV2");
    // let kpStakingProxy = await kpStakingProxyFactory.deploy(kpLock.address, Booster.address)
    const kpStakingProxy = await kpStakingProxyFactory.attach("0x0f2b048dc2F6D3630591Ff642FEa67d25d9E3b73")
    console.log("kpStakingProxy address is:", await kpStakingProxy.address);

    /* =============== Function ============= */

    // await kpLock.setStakingContract(kpStakingProxy.address);
    // console.log(1)
    // await kpLock.setApprovals()
    // console.log(2)
    // await kpLock.addReward(MockUSDT.address, kpStakingProxy.address, true)
    // console.log(3)
    // await KP.approve(kpLock.address, toBn("1000"))
    // console.log(4)
    // await kpStakingProxy.setApprovals()
    // console.log(5)
    // await MockUSDT.setBalance(kpStakingProxy.address, toBn("10000"))
    // console.log(6)
    // await kpLock.setBoost(1000, 20000, kpStakingProxy.address)


    // await kpLock.lock(owner.address, toBn("100"), 0)
    // await kpStakingProxy.distributeOther(MockUSDT.address)
    console.log(await kpLock.totalSupply())
    console.log(await kpLock.pendingLockOf(owner.address))
    console.log(await kpLock.claimableRewards(owner.address))

    await kpLock.getLockReward(owner.address)
    // await EKL.mint(kpStakingProxy.address, toBn("1000"))
    // await kpEKL.mint("0xdaa13cb99a9cb2b3b952d8eAE537488c4245B981", toBn("10000"))
    // await kpLock.addReward(EKL.address, kpStakingProxy.address, true)
    // await kpLock.addReward(kpEKL.address, kpStakingProxy.address, true)
    // await kpStakingProxy.distribute()

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