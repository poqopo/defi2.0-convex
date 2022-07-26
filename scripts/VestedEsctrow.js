const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");

const main = async() => {
  const [owner] = await ethers.getSigners();
  const kpstake = "0x5042D8158d3c3C7f95374512b726fB2fA82EBa6B"
  const address_sj = "0x07aEb3a3967DE4006c42DbCF0Fb4375777D1243F"
  const address_jh = "0xB8Ad342BF27fD8e9e559511757e16Ff6E3d47feD"
  const address_jt = "0xEf7688008817e65d252314Acd696Ea03C69770b2"

  KPFactory = await ethers.getContractFactory("KPtoken");
  // let KP = await KPFactory.deploy(VoterProxy.address ,"Kprotocol Governance token", "KPG", owner.address);
  const KP = await KPFactory.attach("0xF05d180a169418959a017865866F0aBaF7DB7EAd");
  console.log("KP address is:", await KP.address);

  const teamFactory = await ethers.getContractFactory('VestedEscrow')
  // const team = await teamFactory.deploy(KP.address, 1656601200, 1719759600, kpstake, owner.address);
  const team = await teamFactory.attach('0x974B2E6FB5e5f148D615F3d1A988591c8DFf9dfb');
  console.log("team address is:", await team.address);

  // await KP.approve(team.address, toBn("1e8"))

  // await team.addTokens(toBn("1e7"))
  // await team.fund([address_sj, address_jh, address_jt], [toBn("4e6"), toBn("3.4e6"), toBn("2.6e6")])

  console.log(await team.lockedOf(address_sj))
  console.log(await team.lockedOf(address_jh))
  console.log(await team.lockedOf(address_jt))

  // await team.claim(owner.address)

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