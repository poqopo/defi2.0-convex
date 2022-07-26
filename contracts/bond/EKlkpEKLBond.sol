// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "./EKLkpEKLBondDepository.sol";
import "./interface/IClaimSwapZap.sol";
import "./interface/IClaimSwapPair.sol";

contract EKLkpEKLBond is EKLkpEKLBondDepository {
    uint256 public constant REVISION = 1;

    function getRevision() internal pure override returns (uint256) {
        return REVISION;
    }

    function NAME() external pure override returns (string memory) {
        return "KlaySwap EKL-kpEKL LP Depository";
    }
}
