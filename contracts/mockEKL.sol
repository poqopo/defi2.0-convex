// SPDX-License-Identifier: MIT
pragma solidity =0.7.5;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MEKL is ERC20, Ownable {
    constructor() ERC20("mEKL", "mEKL") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}