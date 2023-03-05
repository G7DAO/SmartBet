// SPDX-License-Identifier: UNLICENSED
///@notice This contract is for mock for WETH token.
pragma solidity ^0.8.17;

interface IMockERC1155 {
    function mint(address, uint256, uint256, bytes memory) external;
    function mintBatch(address, uint256[] memory, uint256[] memory) external;
}
