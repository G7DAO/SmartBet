const { expect } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const { defaultFixture } = require("./_fixture");
const {
  loadFixture,
  diamondName,
  getSelectors,
  FacetCutAction,
} = require("../utils/helpers");
const { parseUnits } = require("ethers/lib/utils");
const { withConfirmation } = require("../utils/deploy");

describe("SmartBet Facet", async () => {
  let cSmartBetFacet;
  let sig1;
  let sig2;
  let sig3;
  let cMockERC1155;
  let cGameEngineTest;
  before(async () => {
    const fixture = await loadFixture(defaultFixture);
    cSmartBetFacet = fixture.cSmartBetFacet;
    sig1 = fixture.sig1;
    sig2 = fixture.sig2;
    sig3 = fixture.sig3;
    cMockERC1155 = fixture.cMockERC1155;
    cGameEngineTest = fixture.cGameEngineTest;
  });
  it("ONE TEST : Simulate sample game", async () => {
    // OWNER CREATES A GAME
    await cSmartBetFacet.openGame(
      cMockERC1155.address,
      10000000000,
      [0],
      "hola"
    );
    // PLAYERS PLAY

    console.log(await cSmartBetFacet.getAllGamesInfo());

    const comb1InBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]"],
      [[1, 4, 4, 5, 3, 2]]
    );
    const comb2InBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]"],
      [[2, 2, 3, 5, 2, 3]]
    );

    const fakeCombInBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]"],
      [[2, 2, 3, 5, 5]]
    );

    const combination1 = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string", "bytes"], ["mykey", comb2InBytes])
    );
    const combination2 = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string", "bytes"], ["yourkey", comb1InBytes])
    );

    // OPEN A SESSION
    await cSmartBetFacet.connect(sig2).openSession(1, combination1);
    // JOIN A SESSION
    await cSmartBetFacet.connect(sig3).joinSession(1, combination2);
    // START WITH MOVE
    await cSmartBetFacet.connect(sig2).submitMove(
      {
        moveData: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [2, 2]
        ),
        moveType: 2,
        player: ethers.constants.AddressZero,
      },
      1
    );
    // PERFORM SECOND MOVE
    await cSmartBetFacet.connect(sig3).submitMove(
      {
        moveData: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [3, 2]
        ),
        moveType: 0,
        player: ethers.constants.AddressZero,
      },
      1
    );
    await cSmartBetFacet.connect(sig2).submitMove(
      {
        moveData: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [4, 3]
        ),
        moveType: 1,
        player: ethers.constants.AddressZero,
      },
      1
    );

    // check balance before game ends
    const balance1 = await cMockERC1155.balanceOf(sig2.address, 0);
    const balance2 = await cMockERC1155.balanceOf(sig3.address, 0);

    console.log("old balances : ", balance1, balance2);
    // console.log("print combination : ", comb1InBytes);

    await cSmartBetFacet
      .connect(sig3)
      .submitCombitation(1, "yourkey", comb1InBytes);
    await cSmartBetFacet
      .connect(sig2)
      .submitCombitation(1, "mykey", comb2InBytes);

    // // check balance before game ends
    // const newBalance1 = await cMockERC1155.balanceOf(sig2.address, 0);
    // const newBalance2 = await cMockERC1155.balanceOf(sig3.address, 0);

    // console.log("new balances : ", newBalance1, newBalance2);

    // const session = await cSmartBetFacet.getSessionInfo(1);
    // console.log(session);
  });
  it("GameEngine Test", async () => {
    const moveData = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [1, 2]
    );
    const comb1InBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]"],
      [[1, 4, 4, 5, 3, 2]]
    );
    const comb2InBytes = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]"],
      [[1, 4, 2, 5, 3, 2]]
    );
    console.log(comb1InBytes);
    const list = await cGameEngineTest.getList(comb1InBytes);
    console.log(list);
    const move = {
      moveData: moveData,
      moveType: 1,
      player: ethers.constants.AddressZero,
    };
    const output = await cGameEngineTest.checkIsValidMove(move);
    console.log(output);

    const input1 = {
      combinationData: comb1InBytes,
      player: sig2.address,
    };
    const input2 = {
      combinationData: comb2InBytes,
      player: sig3.address,
    };

    const test = await cGameEngineTest.getWinner(
      [input1, input2],
      {
        moveData: ethers.utils.defaultAbiCoder.encode(
          ["uint256", "uint256"],
          [3, 2]
        ),
        moveType: 0,
        player: ethers.constants.AddressZero,
      },
      sig2.address
    );
    console.log(sig2.address);
    console.log(sig3.address);
    console.log(test);
  });
});
