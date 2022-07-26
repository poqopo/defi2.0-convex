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

    DepositorFactory = await ethers.getContractFactory("EKLDepositor");
    // let EKLDepositor = await DepositorFactory.deploy(VoterProxy.address, kpEKL.address);
    const EKLDepositor = await DepositorFactory.attach("0xbb822Aec12F9F24CAA4B79bbbb18B604B8b0A159");
    console.log("EKLDepositor address is:", await EKLDepositor.address);


    /*================ set Function ==================*/

    // await VoterProxy.setDepositor(EKLDepositor.address)

    // await EKLDepositor.lockEklipse()
    // await EKLDepositor.withdrawexpiredekl()

    // await EKLDepositor.depositEKL(toBn("100"), true)
    // await EKLDepositor.depositEKL(toBn("50"), false)



    

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