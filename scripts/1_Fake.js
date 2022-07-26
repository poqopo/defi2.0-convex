const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();

    const EKLDepositor = "0xbb822Aec12F9F24CAA4B79bbbb18B604B8b0A159"
    const kpEKLStake = "0x6A31C5936b7c526e32E4Fe733cFBcaAf1e0aD7E8"

    /* ============= Deploy =============== */


    EKLFactory = await ethers.getContractFactory("MEKL");
    // let EKL = await EKLFactory.deploy();
    const EKL = await EKLFactory.attach("0x9F3C49F5e83c43815c8710FdEB54876d6F649B14");
    console.log("EKL address is:", await EKL.address);
    
    m3MoonFactory = await ethers.getContractFactory("m3Moon");
    // let m3Moon = await m3MoonFactory.deploy();
    const m3Moon = await m3MoonFactory.attach("0xeCDDa9623c57e4539BE76EEEb0F43Ca73a441438");
    console.log("m3Moon address is:", await m3Moon.address);

    mpostEKLFactory = await ethers.getContractFactory("mpostEKL");
    // let mpostEKL = await mpostEKLFactory.deploy();
    const mpostEKL = await mpostEKLFactory.attach("0x0228CC95f101871Cc1Ca94F6C248F2840D176f90");
    console.log("mpostEKL address is:", await mpostEKL.address);

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    // let kpEKL = await kpEKLTokenFactory.deploy();
    const kpEKL = await kpEKLTokenFactory.attach("0x4612f95b014814467BDB069422dAE5A427092520");
    console.log("kpEKL address is:", await kpEKL.address);

    MockLPFactory = await ethers.getContractFactory("MockLP");
    // let MockLP = await MockLPFactory.deploy();
    const MockLP = await MockLPFactory.attach("0xd44725E11821534AB6b9a17D80B75d47a907c0e3");
    console.log("MockLP address is:", await MockLP.address);

    FakeGaugeFactory = await ethers.getContractFactory("FakeGauge");
    // let FakeGauge = await FakeGaugeFactory.deploy(m3Moon.address);
    const FakeGauge = await FakeGaugeFactory.attach("0x06b14E4983565Db987a01fD54f4568814d04631f");
    console.log("FakeGauge address is:", await FakeGauge.address);

    FakeVoteEscrowFactory = await ethers.getContractFactory("FakeVoteEscrow");
    // let FakeVoteEscrow = await FakeVoteEscrowFactory.deploy(EKL.address, m3Moon.address);
    const FakeVoteEscrow = await FakeVoteEscrowFactory.attach("0x7c271c85e31F28935C7F90a25d84C822391D9433");
    console.log("FakeVoteEscrow address is:", await FakeVoteEscrow.address);

    FakeClaimFactory = await ethers.getContractFactory("FakeClaim");
    // let FakeClaim = await FakeClaimFactory.deploy(EKL.address, mpostEKL.address);
    const FakeClaim = await FakeClaimFactory.attach("0x380F3993203C9474Be468B0D1BEf4929d0F064A8");
    console.log("FakeClaim address is:", await FakeClaim.address);

    // FakeGaugeControllerFactory = await ethers.getContractFactory("FakeVote")
    // // let FakeVote = await FakeGaugeControllerFactory.deploy();
    // // const FakeVote = await FakeGaugeControllerFactory.attach("0x380F3993203C9474Be468B0D1BEf4929d0F064A8");
    // console.log("FakeVote address is:", await FakeVote.address);

    //Booster에 ekl이랑 m3Moon넣어주기.

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    // let VoterProxy = await VoterProxyFactory.deploy()
    const VoterProxy = await VoterProxyFactory.attach("0xb44A9e78CcC30Afa9BC3653E80b0F0FAAD498103");
    console.log("VoterProxy address is:", await VoterProxy.address);


    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy.address ,"kprotocol governance token", "KP", owner.address);
    const KP = await KPFactory.attach("0x3CfE98669D401302d1420C98cb9E66813083E84D");
    console.log("KP address is:", await KP.address);



    /*==============set Function ==============*/
    //3_EKLDepositor
    // await kpEKL.setOperator(EKLDepositor)
    // await EKL.mint(EKLDepositor, toBn("1000"))

    // await EKL.mint(owner.address, toBn("1000"))
    // await EKL.approve(EKLDepositor, toBn("1e18"))

    //4_kpEKLStake&kpStake
    // await kpEKL.mint(owner.address, toBn("1000"))
    // await kpEKL.approve(kpEKLStake, toBn("1e18"))

    //For market reward

    // await EKL.mint(FakeClaim.address, toBn("1000"))
    // await mpostEKL.setBalance(FakeClaim.address, toBn("1000"))
    // await m3Moon.setBalance(FakeVoteEscrow.address, toBn("1000"))

    //For kpEKLStake get Reward
    await KP.updateOperator()


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