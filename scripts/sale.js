const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");
const {IStakedToken} = require("../typechain/ethers-v5");
const { hd_ethers } = require("@nomiclabs/hardhat-ethers");
const {BN} = require("bignumber.js");

const main = async () => {

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    const [owner] = await ethers.getSigners();
    const vaultAddress = "0xAfdd88343096Fee11BdF7babDF22DB013953577D";
    //Deploy to Stake
    const scampFactory = await ethers.getContractFactory('SCAMP');
    // const scampToken = await scampFactory.deploy(owner.address);

    const scampToken = await scampFactory.attach('0x8E7Ab742B0cE5428B8DCb6CF921AF2654754686c')
    console.log(`scampToken : ${scampToken.address}`)

    const campFactory = await ethers.getContractFactory('CAMP');
    // const campToken = await campFactory.deploy(owner.address);
    const campToken = await campFactory.attach('0x4064efE5Be75B199D59C5957643095360aB71c5A')
    // CAMP.Staking_mint(CAMP.address, 100000000).then(console.log(owner.getBalance()));
    console.log(`campToken : ${campToken.address}`)

    const mockFactory = await ethers.getContractFactory('MockUSDC')
    // const mockToken = await mockFactory.deploy();
    const mockToken = await mockFactory.attach('0x5a8e7E54fEC4dc7D73647a9FbA33844eCB9A175B');
    console.log(`mockToken : ${mockToken.address}`)

    const KP_PreSalesFactory = await ethers.getContractFactory('KP_PreSale');
    // const KP_PreSale = await KP_PreSalesFactory.deploy();
    const KP_PreSale = await KP_PreSalesFactory.attach('0x23a9811a4365e7a174DeF6D5068bb2696b04028C');

    console.log(`KP_PreSale : ${KP_PreSale.address}`)
    await KP_PreSale.__initialize(
        campToken.address,
        mockToken.address,
        owner.address,
        1000000e18,
        5000, // 50퍼
        0
    );
    await KP_PreSale.RatioBuyAmount().then((v) => console.log("RatioBuyAmount : ", v.toString()));
    await KP_PreSale.vestingAmount().then((v) => console.log("vestingAmount : ", v.toString()));
    await KP_PreSale.setRatioBuyAmount(1000); // check
    await KP_PreSale.RatioBuyAmount().then((v) => console.log("RatioBuyAmount : ", v.toString()));


    // await KP_PreSale.setPresaletime(10); // check!!
    // console.log(await "blockNumber  : ", hd_ethers.blockNumber);
    // const presaletime = KP_PreSale.presaletime();
    // await presaletime.then((val) => console.log("presaletime : ", val.toString())); // check!! 10 출력 done
    await KP_PreSale.purchaseByKlay(1);
    // await KP_PreSale.addressInfo[owner]().then((val) => console.log("addressInfo : ", val));

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