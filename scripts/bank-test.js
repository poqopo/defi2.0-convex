const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");

const main = async () => {
    const [owner] = await ethers.getSigners();
    const daoAddress = "0x83528941Ab17AAAF21939dc98A5E7c25455cE4D3";

    // Get the ContractFactory and Signers here.
    SCAMPFactory = await ethers.getContractFactory("SCAMP");
    // let SCAMP = await SCAMPFactory.deploy(owner.address);
    const SCAMP = await SCAMPFactory.attach("0xbcb51E0C1fF0Cf95176Ee5EA08b7da3832AD377d");
    console.log("SCAMP address is:", await SCAMP.address);

    CAMPFactory = await ethers.getContractFactory("CAMP");
    // let CAMP = await CAMPFactory.deploy(owner.address);
    const CAMP = await CAMPFactory.attach("0x870D2f6dc98bc3365421DBEe36c97dAf11D1E128");
    console.log("CAMP address is:", await CAMP.address);

    const assetOracleFactory = await ethers.getContractFactory("AssetOracle");
    // const assetOracle = await assetOracleFactory.deploy();
    const assetOracle = await assetOracleFactory.attach("0x3dB66FBD72DEF0Db5d7e725c8Fa3D03810999CE8");
    console.log("assetOracle:", assetOracle.address);

    mockFactory = await ethers.getContractFactory("MockUSDC");
    // let mock = await mockFactory.deploy();
    const mock = await mockFactory.attach("0x8d4DFc6586F70e6F1F08d3FaA96Afa297A1CA060");
    // await mock.setBalance("0x91Add885cdF83Ba62578eF7de912067f52aB3130", toBn("10000"))
    // await mock.setBalance(owner.address, toBn("1000000"))
    console.log("mock address is:", await mock.address);

    SCAMPPoolLibraryFactory = await ethers.getContractFactory("SCAMPPoolLibrary");
    // let SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.deploy();
    const SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.attach("0xdE37c23b4C369967f0EE16d24413179694A7b74a");
    console.log("SCAMPPoolLibrary address is:", await SCAMPPoolLibrary.address);

    BankFactory = await ethers.getContractFactory("SCAMPBank", {
        libraries: {
            SCAMPPoolLibrary: SCAMPPoolLibrary.address,
        },
    });
    // let Bank = await BankFactory.deploy(SCAMP.address, CAMP.address, mock.address, owner.address, assetOracle.address);
    const Bank = await BankFactory.attach("0x427Da2f75D986e985994d186b5bCE7d00A8db380");
    console.log("Bank address is:", Bank.address);
    await mock.setBalance(Bank.address, toBn("1000"));
    console.log(await SCAMP.SCAMPBank());
    // await Bank.redeemFractionalSCAMP(toBn("1"), toBn("0.1"), toBn("0.1"));

    // approve
    // await SCAMP.approve(Bank.address, toBn("10000"));
    // await CAMP.approve(Bank.address, toBn("10000"));

    // Set controller
    // await SCAMP.setController("0x91Add885cdF83Ba62578eF7de912067f52aB3130");
    // await SCAMP.setCAMPAddress(CAMP.address);
    // await SCAMP.setBankAddress(Bank.address);
    // await CAMP.setSCAMPAddress(SCAMP.address);
    // await SCAMP.setMintingFee(3000);
    // await SCAMP.setOracleAddress(assetOracle.address);
    // console.log(await SCAMP.SCAMPBank());
  };
  
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