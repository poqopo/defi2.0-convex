const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();

    /* ============= Deploy =============== */

    MockLPFactory = await ethers.getContractFactory("mUSDT");
    // let MockLP = await MockLPFactory.deploy();
    const MockLP = await MockLPFactory.attach("0xfe282a5bf29ccf40Ca5E75F8c9f903d4fd60Ba20");
    console.log("MockLP address is:", await MockLP.address);

    kpLockerFactory = await ethers.getContractFactory("KPLockerV2");
    // let kpLocker = await kpLockerFactory.deploy();
    const kpLocker = await kpLockerFactory.attach("0x870Ad17738C6b38711BFAf5Bc0511F03aee9eC82");
    console.log("kpLocker address is:", await kpLocker.address);

    kpStakingProxyFactory = await ethers.getContractFactory("KPStakingProxyV2");
    // let kpStakingProxy = await kpStakingProxyFactory.deploy(kpLocker.address, owner.address);
    const kpStakingProxy = await kpStakingProxyFactory.attach("0xa3c9dC0854440040F8235B2b71fcAff4C86f7b58");
    console.log("kpStakingProxy address is:", await kpStakingProxy.address);

    /*================ set Function ==================*/

    // await kpLocker.setStakingContract(kpStakingProxy.address)
    // await MockLP.setBalance(owner.address, toBn("10000"))
    // await MockLP.approve(kpLocker.address, toBn("100000"))

    await kpLocker.setStakeLimits(0, 0)

    // await kpLocker.lock(owner.address, toBn("10"), 0)


    console.log(await kpLocker.pendingLockOf(owner.address))
    // await kpLocker.processExpiredLocks(false)


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