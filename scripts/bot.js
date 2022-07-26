const { ethers } = require("hardhat");
const { toBn } = require("evm-bn");
import {klayswapLPAbi} from "./abi.js"

const main = async () => {
    const [owner] = await ethers.getSigners();
    let i = 0;

    KlaySwap = "0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654"
    kpEKL ="0x08644836b786B69a5082fD4644a3F2D1534B11A8"
    EKL ="0x807C4E063eb0aC21E8EeF7623A6ed50A8EDe58cA"

    const RouterFactory = await ethers.getContractAt(klayswapLPAbi, KlaySwap);
    console.log(await RouterFactory.address) // cypress

    // RouterFactory.createKctPool(EKL, toBn("100"), kpEKL, toBn("100"), 3000)
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