require("hardhat");
const { utils } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { parseUnits, formatUnits } = require("ethers").utils;
const { getSelectors, FacetCutAction } = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  // log,
} = require("../utils/deploy");

async function testMantleListener() {
  const { deployerAddr } = await getNamedAccounts();
  await deployWithConfirmation("MockERC1155");
  const cMockERC1155 = await ethers.getContract("MockERC1155");
  console.log(await cMockERC1155.balanceOf(deployerAddr, 0));
  const receipt = await withConfirmation(cMockERC1155.mint(deployerAddr, 0, 1, "0x"));
}

const main = async () => {
  await testMantleListener();
};

main.id = "002_script";
main.skip = () => true;
module.exports = main;
