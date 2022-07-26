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

    FakeVoteEscrowFactory = await ethers.getContractFactory("FakeVoteEscrow");
    const FakeVoteEscrow = await FakeVoteEscrowFactory.attach("0x7c271c85e31F28935C7F90a25d84C822391D9433");

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    const kpEKL = await kpEKLTokenFactory.attach("0x4612f95b014814467BDB069422dAE5A427092520");

    BoosterFactory = await ethers.getContractFactory("Booster");
    const Booster = await BoosterFactory.attach("0xCD9C44B0bfA9c32850D9CD58c0584F1354D8efE4")

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    const rFactory = await RewardFactory.attach("0x82806c80e4694397Cc25812dac6C5B00836Db995");

    DepositorFactory = await ethers.getContractFactory("EKLDepositor");
    const EKLDepositor = await DepositorFactory.attach("0xbb822Aec12F9F24CAA4B79bbbb18B604B8b0A159");

    kpEKLStakeFactory = await ethers.getContractFactory("BaseRewardPool");
    // let kpEKLStake = await kpEKLStakeFactory.deploy(kpEKL.address, EKL.address, Booster.address, rFactory.address);
    const kpEKLStake = await kpEKLStakeFactory.attach("0x6A31C5936b7c526e32E4Fe733cFBcaAf1e0aD7E8");
    console.log("kpEKLStake address is:", await kpEKLStake.address);

    kpStakeFactory = await ethers.getContractFactory("kpRewardPool");
    // let kpStake = await kpStakeFactory.deploy(KP.address, EKL.address, EKLDepositor.address, kpEKLStake.address, kpEKL.address, Booster.address, owner.address);
    const kpStake = await kpStakeFactory.attach("0xb6a90199c935dBd0A08c22e539a4Be8EBAC5ef2E");
    console.log("kpStake address is:", await kpStake.address);


    /*================ set Function ==================*/
    // await Booster.setRewardContracts(kpEKLStake.address, kpStake.address)
    // await Booster.setFeeInfo(m3Moon.address)

    //After 5_Locker - Booster setTreasury
    // await Booster.earmarkRewards(0)
    // await Booster.earmarkFees()

    //kpEKLStake&withDraw
    // await kpEKL.approve(kpEKLStake.address, toBn("1000"))
    // await kpEKLStake.stake(toBn("1"))
    console.log(await kpEKLStake.earned(owner.address))
    console.log(await kpEKLStake.rewardToken())
    console.log(await Booster.lockRewards())
    // console.log(1)

    await kpEKLStake.getReward(owner.address, false)

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