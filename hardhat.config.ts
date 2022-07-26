import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-watcher";
import "hardhat-contract-sizer";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "hardhat-klaytn-patch";

import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
    overrides: {
      "contracts/swap/swap/UniswapV2Factory.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/swap/UniswapV2Pair.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/swap/UniswapV2ERC20.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/swap/UniswapV2Router02.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IUniswapV2Pair.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IUniswapV2ERC20.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IUniswapV2Factory.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IUniswapV2Router02.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IERC20.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/interfaces/IWKLAY.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/libraries/SafeMath.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/libraries/Math.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/libraries/TransferHelper.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/libraries/UniswapV2Library.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/libraries/UQ112x112.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      "contracts/swap/WKLAY.sol": {
        version: "0.5.6",
        settings: {
          evmVersion: "constantinople",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    },
  },
  networks: {
    baobab: {
      url: 'https://kaikas.baobab.klaytn.net:8651',
      chainId: 1001,
      accounts: [process.env.PRIVATE_KEY!],
      saveDeployments: true,
      gasPrice: 250000000000,
      // gas: 8500000,
      tags: ["test"]
    },
    cypress: {
      url: 'https://public-node-api.klaytnapi.com/v1/cypress',
      chainId: 8217,
      accounts: [process.env.PRIVATE_KEY!],
      saveDeployments: true,
      gasPrice: 250000000000,
      tags: ["staging"]
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
  },
  typechain: {
    target: "ethers-v5",
    outDir: "typechain/ethers-v5"
  },
  // typechain: {
  //   target: "web3-v1",
  //   outDir: "typechain/web3-v1"
  // },
  watcher: {
    compilation: {
      tasks: ['compile'],
      files: ['./contracts'],
      verbose: true,
    },
    test: {
      tasks: ['compile', 'test'],
      files: ['./contracts', './scripts'],
      verbose: true
    }
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
}

export default config;