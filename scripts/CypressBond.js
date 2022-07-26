const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");


const main = async () => {
    const [owner] = await ethers.getSigners();
    const ekllp = "0x219ee5d76593f5bd639125b6411a17d309e3ad31"
    const ekl = "0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA"
    const kplp = "0x8a187220fd9dfc4fafe1e206385ea55659147602"
    /* ============= Deploy =============== */

    KPFactory = await ethers.getContractFactory("KPtoken");
    const KP = await KPFactory.attach("0xF05d180a169418959a017865866F0aBaF7DB7EAd");

    TreasuryFundFactory = await ethers.getContractFactory("TreasuryFunds");
    const TreasuryFund = await TreasuryFundFactory.attach("0xd4C8292dD4262e0b74fca1fAF523F3B962AB791d");
  
    BoosterFactory = await ethers.getContractFactory("Booster");
    const Booster = await BoosterFactory.attach("0xC1A05Bea7Ed1f6d21921EE1aEa28Dcf0bD67c071")

    m3MoonFactory = await ethers.getContractFactory("m3Moon");
    const m3Moon = await m3MoonFactory.attach("0xd83b9dfa49d6c6d2a69554576e712e45a8a13e49");

    const mockUSDTFactory = await ethers.getContractFactory("mUSDT");
    // const mockUSDT = await mockUSDTFactory.deploy();
    const mockUSDT = await mockUSDTFactory.attach("0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167");
    console.log("mockUSDT:", mockUSDT.address);

    const EKLkpEKLPair = await mockUSDTFactory.attach("0x5e9bb1fad0a26ac60e19c1b9370fdf7037ac7d95");

    /* ================ Bond Deploy ================*/

    BondTreasuryFactory = await ethers.getContractFactory("BondTreasury");
    // let BondTreasury = await BondTreasuryFactory.deploy();
    const BondTreasury = await BondTreasuryFactory.attach("0xc71d938d5Faf4057B7A9cd19b633A1d921Eee26c");
    console.log("BondTreasury address is:", await BondTreasury.address);

    KPUSDTBondDepositoryFactory = await ethers.getContractFactory("KPUSDTBond");
    // let KPUSDTBondDepository = await KPUSDTBondDepositoryFactory.deploy();
    const KPUSDTBondDepository = await KPUSDTBondDepositoryFactory.attach("0x86929978fFF53F72Fc4cf0e2FC64f4f16EE652A3");
    console.log("KPUSDTBondDepository address is:", await KPUSDTBondDepository.address);

    // await BondTreasury.__initialize(TreasuryFund.address, KP.address);
    // await KPUSDTBondDepository.__initialize(
    //   KP.address, TreasuryFund.address, kplp, kplp);
    // await KPUSDTBondDepository.initializeBondTerms(
    //   100, //_controlVariable 상수/
    //   432000, //_vestingTerm in blokcs
    //   0.9e9, //_minimumPriceRate 할인된가격최저 1e9
    //   10000, //_maxPayout 1e4 10000=1%
    //   100, //_fee 100=1%
    //   toBn("1e8"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //   0
    // );
    
    // register

    // await BondTreasury.register(kplp, KPUSDTBondDepository.address);    
    // await BondTreasury.setBooster(Booster.address)
    // await KPUSDTBondDepository.setTreasury(BondTreasury.address)

    // await BondTreasury.setApprovals()
    // console.log("register", (await BondTreasury.isReserveToken(kplp)).toString());


    // console.log((await KPUSDTBondDepository.bondPrice()).toString());
    // console.log((await KPUSDTBondDepository.assetPrice()).toString());
    // console.log((await KPUSDTBondDepository.debtRatio()).toString());
    // console.log((await KPUSDTBondDepository.payoutFor(toBn("10"))).toString());

    // await kpPair.approve(KPUSDTBondDepository.address, toBn("1e18"))
    // await KPUSDTBondDepository.deposit(toBn("10"), await KPUSDTBondDepository.bondPrice(), owner.address);
    // await KPUSDTBondDepository.redeem(owner.address);

    // await BondTreasury.depositAll(0)

    /* ================ 3Moon BondDepository ==================*/

    EKLkpEKLDepositoryFactory = await ethers.getContractFactory("EKLkpEKLBond");
    // let EKLkpEKLDepository = await EKLkpEKLDepositoryFactory.deploy();
    const EKLkpEKLDepository = await EKLkpEKLDepositoryFactory.attach("0xa914415d5AAEB893154d65204eC5e242BA480B31");
    console.log("EKLkpEKLDepository address is:", await EKLkpEKLDepository.address);

    // await EKLkpEKLDepository.__initialize(
    //   KP.address, TreasuryFund.address, EKLkpEKLPair, ekllp, kplp);
    // await EKLkpEKLDepository.initializeBondTerms(
    //   100, //_controlVariable 상수/
    //   432000, //_vestingTerm in blokcs
    //   0.9e9, //_minimumPriceRate 할인된가격최저 1e9
    //   10000, //_maxPayout 1e4 10000=1%
    //   100, //_fee 100=1%
    //   toBn("1e8"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //   0
    // );
    
    // register

    // await BondTreasury.register(EKLkpEKLPair.address, EKLkpEKLDepository.address);    
    // await EKLkpEKLDepository.setTreasury(BondTreasury.address)

    // await BondTreasury.setApprovals()
    // console.log("register", (await BondTreasury.isReserveToken(EKLkpEKLPair.address)).toString());


    // console.log((await EKLkpEKLDepository.bondPrice()).toString());
    // console.log((await EKLkpEKLDepository.assetPrice()).toString());
    // // console.log((await EKLkpEKLDepository.debtRatio()).toString());
    // // console.log((await EKLkpEKLDepository.payoutFor(toBn("10"))).toString());

    // await EKLkpEKLPair.approve(EKLkpEKLDepository.address, toBn("1e18"))

    // await EKLkpEKLDepository.deposit(toBn("10"), await EKLkpEKLDepository.bondPrice(), owner.address);
    // await EKLkpEKLDepository.redeem(owner.address);


    /* ================= 3Moon Depository =================== */

    EKL3MoonDepositoryFactory = await ethers.getContractFactory("Eklipse_3Moon_BondDepository");
    // let EKL3MoonDepository = await EKL3MoonDepositoryFactory.deploy();
    const EKL3MoonDepository = await EKL3MoonDepositoryFactory.attach("0x0b1E366479BC9F1Ec8717908457B3f21792b90FF");
    console.log("EKL3MoonDepository address is:", await EKL3MoonDepository.address);

    // await EKL3MoonDepository.__initialize(
    //   KP.address, TreasuryFund.address, m3Moon.address, kplp);
    // await EKL3MoonDepository.initializeBondTerms(
    //   100, //_controlVariable 상수/
    //   432000, //_vestingTerm in blokcs
    //   0.9e9, //_minimumPriceRate 할인된가격최저 1e9
    //   10000, //_maxPayout 1e4 10000=1%
    //   100, //_fee 100=1%
    //   toBn("1e8"), //_maxDebt 10e18 bond에서 만들 빚의 최대값
    //   0
    // );
    
    // register

    // await BondTreasury.register(m3Moon.address, EKL3MoonDepository.address);    
    // await EKL3MoonDepository.setTreasury(BondTreasury.address)

    // await BondTreasury.setApprovals()
    // console.log("register", (await BondTreasury.isReserveToken(m3Moon.address)).toString());


    console.log((await EKL3MoonDepository.bondPrice()).toString());
    console.log((await EKL3MoonDepository.priceRate()).toString());
    console.log((await EKL3MoonDepository.debtRatio()).toString());
    // // console.log((await EKL3MoonDepository.payoutFor(toBn("10"))).toString());

    // await m3Moon.approve(EKL3MoonDepository.address, toBn("1e18"))
    // console.log(await Booster.poolInfo(0))

    // await EKL3MoonDepository.deposit(toBn("10"), await EKL3MoonDepository.bondPrice(), owner.address);
    // await EKL3MoonDepository.redeem(owner.address);

    // await BondTreasury.depositAll(0)
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