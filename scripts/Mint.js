const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");
const Klay = require("caver-js/packages/caver-klay");


const main = async () => {
    const [owner] = await ethers.getSigners();

    /* ============= EKL Contract Deploy =============== */
    // const EKL = "0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA"
    const EKL3Moon = "0xd83b9dfa49d6c6d2a69554576e712e45a8a13e49"
    const EKL33MoonGauge = "0xceaaf9f6c8147b2a7cd8bd4e9fa8955b430eb423"
    const postEKL = "0x0e23bee35717987e71fa8445e4dd750ad718ba8a"
    const EKLClaimer = "0xAb7f8facb7db88db80F35c96CD67A9e9d381C7Ee"
    const GaugeController = "0x18428b7826C2588207e39b742c15642B8D9755B4"
    const KlaySwap = "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654"

    EKLFactory = await ethers.getContractFactory("MEKL");
    // let EKL = await EKLFactory.deploy();
    const EKL = await EKLFactory.attach("0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA");
    console.log("EKL address is:", await EKL.address);

    KSPFactory = await ethers.getContractFactory("MEKL");
    // let EKL = await EKLFactory.deploy();
    const KSP = await EKLFactory.attach("0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654");
    console.log("KSP address is:", await KSP.address);

    /* =====================================*/
    

    kpEKLTokenFactory = await ethers.getContractFactory("kpEKLToken");
    // let kpEKL = await kpEKLTokenFactory.deploy();
    const kpEKL = await kpEKLTokenFactory.attach("0x08644836b786B69a5082fD4644a3F2D1534B11A8");
    console.log("kpEKL address is:", await kpEKL.address);

    //Booster에 ekl이랑 m3Moon넣어주기.

    VoterProxyFactory = await ethers.getContractFactory("EklipseVoterProxy")
    // let VoterProxy = await VoterProxyFactory.deploy()
    const VoterProxy = await VoterProxyFactory.attach("0x0e084C4faEbc56292E48B1b1fFC3fb686Dd87c45");
    console.log("VoterProxy address is:", await VoterProxy.address);

    KPFactory = await ethers.getContractFactory("KPtoken");
    // let KP = await KPFactory.deploy(VoterProxy.address ,"Kprotocol Governance token", "KPG", owner.address);
    const KP = await KPFactory.attach("0xF05d180a169418959a017865866F0aBaF7DB7EAd");
    console.log("KP address is:", await KP.address);

    BoosterFactory = await ethers.getContractFactory("Booster");
    // let Booster = await BoosterFactory.deploy(VoterProxy.address, KP.address)
    const Booster = await BoosterFactory.attach("0xC1A05Bea7Ed1f6d21921EE1aEa28Dcf0bD67c071")
    console.log("Booster address is:", await Booster.address);

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    // let tFactory = await TokenFactory.deploy(Booster.address);
    const tFactory = await TokenFactory.attach("0xafCF96Bfaa9fCb970bAB14E5aA3916236ff4dF79");
    console.log("tFactory address is:", await tFactory.address);

    RewardFactory = await ethers.getContractFactory("RewardFactory");
    // let rFactory = await RewardFactory.deploy(Booster.address);
    const rFactory = await RewardFactory.attach("0xB64c4b7dfb0c7076dC3D71b52C13824899806913");
    console.log("rFactory address is:", await rFactory.address);

    const mockUSDTFactory = await ethers.getContractFactory("mUSDT");
    // const mockUSDT = await mockUSDTFactory.deploy();
    const mockUSDT = await mockUSDTFactory.attach("0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167");
    console.log("mockUSDT:", mockUSDT.address);

    DepositorFactory = await ethers.getContractFactory("EKLDepositor");
    // let EKLDepositor = await DepositorFactory.deploy(VoterProxy.address, kpEKL.address);
    const EKLDepositor = await DepositorFactory.attach("0xABe0F9cFf7d77aEd6b6C9107f0584f897cC0942d");
    console.log("EKLDepositor address is:", await EKLDepositor.address);

    kpEKLStakeFactory = await ethers.getContractFactory("BaseRewardPool");
    // let kpEKLStake = await kpEKLStakeFactory.deploy(kpEKL.address, EKL.address, Booster.address, rFactory.address);
    const kpEKLStake = await kpEKLStakeFactory.attach("0x58337263cf52A4906913866242cfdeE16dEe82Bb");
    console.log("kpEKLStake address is:", await kpEKLStake.address);

    kpStakeFactory = await ethers.getContractFactory("kpRewardPool");
    // let kpStake = await kpStakeFactory.deploy(KP.address, EKL.address, EKLDepositor.address, kpEKLStake.address, kpEKL.address, Booster.address, owner.address);
    const kpStake = await kpStakeFactory.attach("0x5042D8158d3c3C7f95374512b726fB2fA82EBa6B");
    console.log("kpStake address is:", await kpStake.address);

    TreasuryFundFactory = await ethers.getContractFactory("TreasuryFunds");
    // let TreasuryFund = await TreasuryFundFactory.deploy(owner.address);
    const TreasuryFund = await TreasuryFundFactory.attach("0xd4C8292dD4262e0b74fca1fAF523F3B962AB791d");
    console.log("TreasuryFund address is:", await TreasuryFund.address);

    kpLockerFactory = await ethers.getContractFactory("KPLockerV2");
    // let kpLocker = await kpLockerFactory.deploy();
    const kpLocker = await kpLockerFactory.attach("0xDc1b8Fe74ED56Fe11AB9ECfD7238aBaA8298f3d9");
    console.log("kpLocker address is:", await kpLocker.address);

    kpStakingProxyFactory = await ethers.getContractFactory("KPStakingProxyV2");
    // let kpStakingProxy = await kpStakingProxyFactory.deploy(kpLocker.address, Booster.address);
    const kpStakingProxy = await kpStakingProxyFactory.attach("0x02712572C2A5d2eA9F6Ec2eB5Ea0adf498657252");
    console.log("kpStakingProxy address is:", await kpStakingProxy.address);

    BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    // let BondTreasury = await BondTreasuryFactory.deploy();
    const BondTreasury = await BondTreasuryFactory.attach("0xc71d938d5Faf4057B7A9cd19b633A1d921Eee26c");
    console.log("BondTreasury address is:", await BondTreasury.address);


    /* =============== kpEKLStake Run =============== */

    // await Booster.mint_KP(TreasuryFund.address, toBn("1e7"))
    // await Booster.mint_KP(BondTreasury.address, toBn("3e7"))
    // await Booster.mint_KP(owner.address, toBn("1e7"))

    // await Booster.mint_KP(owner.address, toBn("4000"))
    // await Booster.mint_KP(BondTreasury.address, toBn("86000"))



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