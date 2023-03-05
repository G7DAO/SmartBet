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

async function deployDiamond() {
  const { deployerAddr } = await getNamedAccounts();
  const dDiamondCutFacet = await deployWithConfirmation("DiamondCutFacet");
  const dDiamond = await deployWithConfirmation("Diamond", [
    deployerAddr,
    dDiamondCutFacet.address,
  ]);
  const cDiamondCutFacet = await ethers.getContractAt(
    "DiamondCutFacet",
    dDiamond.address
  );
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "SmartBetFacet"];
  // // The `facetCuts` variable is the FacetCut[] that contains the functions to add during diamond deployment

  for (const FacetName of FacetNames) {
    const dFacet = await deployWithConfirmation(FacetName);
    const cFacet = await ethers.getContractAt(FacetName, dFacet.address);
    const selectors = getSelectors(cFacet);
    await withConfirmation(
      cDiamondCutFacet.diamondCut(
        [
          {
            facetAddress: cFacet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors,
          },
        ],
        ethers.constants.AddressZero,
        "0x",
        { gasLimit: 800000 }
      )
    );
  }

  const dGameEngine = await deployWithConfirmation("GameEngine");

  // SET UP NEW FACET ADDED
  const cSmartBetFacet = await ethers.getContractAt(
    "SmartBetFacet",
    dDiamond.address
  );
  await deployWithConfirmation("MockERC1155");
  await withConfirmation(cSmartBetFacet.setGameEngine(dGameEngine.address));

  // TESTING
  await deployWithConfirmation("GameEngineTest");
}

const main = async () => {
  await deployDiamond();
};

main.id = "001_core";
main.skip = () => false;
module.exports = main;
