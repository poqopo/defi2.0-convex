// We import Chai to use its asserting functions here.
const { default: BigNumber } = require("bignumber.js");
// const { default: Caver } = require("caver-js");
const { expect } = require("chai");
const { toBn } = require("evm-bn");

describe("Token contract", function () {
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let SCAMP, CAMP, oracle, mock, Bank, factory, SCAMPPair, wKLAY, router, uniPairOracle;

    before(async function () {
        // Get the ContractFactory and Signers here.
        SCAMPFactory = await ethers.getContractFactory("SCAMP");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        SCAMP = await SCAMPFactory.deploy(owner.address);
        console.log("SCAMP address is:", await SCAMP.address);

        CAMPFactory = await ethers.getContractFactory("CAMP");
        CAMP = await CAMPFactory.deploy(owner.address);
        console.log("CAMP address is:", await CAMP.address);

        mockFactory = await ethers.getContractFactory("MockUSDC");
        mock = await mockFactory.deploy();
        await mock.setBalance(owner.address, toBn("1e18"))
        console.log("mock address is:", await mock.address);

        SCAMPPoolLibraryFactory = await ethers.getContractFactory("SCAMPPoolLibrary");
        SCAMPPoolLibrary = await SCAMPPoolLibraryFactory.deploy();
        console.log("SCAMPPoolLibrary address is:", await SCAMPPoolLibrary.address);

        const wKLAYFactory = await ethers.getContractFactory("WKLAY");
        wKLAY = await wKLAYFactory.deploy();
        console.log("wKLAY address:", wKLAY.address);

        const oracleFactory = await ethers.getContractFactory("AssetOracle");
        oracle = await oracleFactory.deploy();
        console.log("oracle address:", oracle.address);
    });

    describe("bank deployment", async function (){
        it("genesis case", async function() {
            BankFactory = await ethers.getContractFactory("SCAMPBank", {
                libraries: {
                    SCAMPPoolLibrary: SCAMPPoolLibrary.address,
                },
            });
            Bank = await BankFactory.deploy(SCAMP.address, CAMP.address, mock.address, owner.address, oracle.address);
            console.log("Bank address is:", Bank.address);
        });
    });

    describe("swap deployment", async function (){
        it("factory", async function() {
            const uniConFactory = await ethers.getContractFactory("UniswapV2Factory");
            factory = await uniConFactory.deploy(owner.address);
            await factory.createPair(SCAMP.address, mock.address)
            SCAMPPair = await factory.getPair(SCAMP.address, mock.address);
            console.log("SCAMP pair:", SCAMPPair);

            const pairCodeHash = await factory.pairCodeHash();
            console.log("pairCodeHash:", pairCodeHash);
        });

        it("routerv2", async function() {
            const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
            router = await RouterFactory.deploy(factory.address, wKLAY.address);
            console.log("router address:", router.address);
        })

        it("approve and liquidities", async function() {
            await SCAMP.approve(router.address, toBn("1e18"));
            const SCAMPAllowance = await SCAMP.allowance(owner.address, router.address);
            console.log("cubeAllowance:", SCAMPAllowance.toString());
            await mock.approve(router.address, toBn("1e18"));
            const mockAllowance = await mock.allowance(owner.address, router.address);
            console.log("mockCollatAllowance:", mockAllowance.toString());

            console.log((await SCAMP.balanceOf(owner.address)).toString(), (await mock.balanceOf(owner.address)).toString())

            let liquidity = await router.addLiquidity(SCAMP.address, mock.address, 1e6, 1e6, 1e3, 1e3, owner.address, Math.floor(Date.now()) + 100);
            console.log("Liquidity:", liquidity);
        })
    });

    describe("oracle deployment", async function (){
        it("uniswap pair oracle", async function() {
            const uniPairOracleFactory = await ethers.getContractFactory("UniswapPairOracle");
            uniPairOracle = await uniPairOracleFactory.deploy(factory.address, SCAMP.address, mock.address, owner.address);
            console.log("uniPairOracle pair:", uniPairOracle.address);

            const amountOut = await uniPairOracle.consult(SCAMP.address, 1e6);
            console.log("amountOut of oracle:", amountOut.toString());
        });
    });
});