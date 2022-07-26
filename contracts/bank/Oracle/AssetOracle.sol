// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "./IUniswapPairOracle.sol";


contract AssetOracle is Ownable {
    using SafeMath for uint256;

    address[] public priceOracle;
    uint256 private constant PRICE_PRECISION = 1e18;

    event AssetOracleUpdated(uint indexed idx, address indexed newOracle);

    constructor() {}

    function getAssetPrice(address asset) external view returns (uint256) {
        for (uint i = 0; i < priceOracle.length; i++) {
            uint256 price = uint256(IUniswapPairOracle(priceOracle[i]).consult(asset, PRICE_PRECISION));
            if (price > 0) {
                return price;
            }
        }
        revert("CANNOT GET ASSET PRICE");
    }

    function setAssetOracle(address[] memory _oracle) public onlyOwner {
        for (uint256 i = 0; i < _oracle.length; i++) {
            priceOracle.push(_oracle[i]);
            emit AssetOracleUpdated(i, _oracle[i]);
        }
    }
}