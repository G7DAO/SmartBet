import { one, two, three, four, five, six } from "../assets/dice";

import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useContract, useSigner } from "wagmi";
import { ethers } from "ethers";
import smartBetContract from "../abi/localhost/SmartBetFacet.json";
import diamondContract from "../abi/localhost/Diamond.json";
const initialCombination = [one, two, three, four, five, six];
const initialCombinationInt = [1,2,3,4,5,6]

const Game = () => {
  const [qty, setQty] = useState(1);
  const [number, setNumber] = useState(1);
  const [canPlay, setCanPlay] = useState(false);
  const [turnOf, setTurnOf] = useState(false);
  const [currMove, setCurrMove] = useState(undefined);
  const [winner, setWinner] = useState(undefined);
  const [hasPlayers, setHasPlayers] = useState(false);
  const [finalStep, setFinalStep] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [moveCount, setMoveCount] = useState(0);
  const [numList, setNumList] = useState(initialCombination);
  const [numListInt, setNumListInt] = useState(initialCombinationInt);
  const key = useRef(null);

  const location = useLocation().pathname;

  const { data: signer } = useSigner();
  const contract = useContract({
    address: diamondContract.address,
    abi: smartBetContract.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    console.log("sssss",contract)
    async function getSessionData() {
      const data = await contract.getSessionInfo(getSessionId(location));
      setCanPlay(data.session.canPlay);
      setTurnOf(data.session.players[data.session.turnOf.toNumber()].toLowerCase() == signer._address.toLowerCase());
      setFinalStep(data.session.finalStep);
      setCurrMove(data.currMove);
      setIsActive(data.session.isActive);
      setWinner(data.session.winner);
      setHasPlayers(data.session.players.length >0);
      setMoveCount(data.session.moveCount);
      console.log(data.session);
      // console.log(signer._address);
    }
    getSessionData();
  }, []);

  console.log("local storage",localStorage.getItem("combination").split(","));
  // console.log(ethers.utils.defaultAbiCoder.decode(["uint256[]"],[localStorage.getItem("combination")]))
  const encodeCombination = (combination) => {
    return ethers.utils.defaultAbiCoder.encode(["uint256[]"], [combination]);
  };

  const encodeKey = () => {
    console.log(numListInt)
    const encodedCombination = encodeCombination(numListInt);
    console.log("IMPORTA",encodedCombination,key.current.value)
    localStorage.setItem("combination",numListInt);
    return ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["string", "bytes"],
        [key.current.value, encodedCombination]
      )
    );
  };

  const getSessionId = (location) => {
    const sessionId = location.slice(location.length - 1, location.length);
    return sessionId;
  };
  const shuffle = () => {
    let newArr = [];
    let newNumList = [];
    for (let i = 1; i < 7; i++) {
      let randint = Math.floor(Math.random() * 6);
      newArr.push(initialCombination[randint]);
      newNumList.push(randint+1);
    }
    setNumList(newArr);
    setNumListInt(newNumList);
  }

  const joinSession = (id, hash) => {
    console.log(id, hash);
    contract.joinSession(id, hash);
  };

  const openSession = (id, hash) => {
    console.log(id, hash);
    contract.openSession(id, hash);
  };
  const submitCombination = (id) => {
    console.log("trying challenge", contract);
    const savedCombination = encodeCombination(localStorage.getItem("combination").split(","));
    console.log("trying challenge", savedCombination, id, key.current.value);
    contract.submitCombitation(id,key.current.value,savedCombination)
  }

  const submitMove = (id) => {
    console.log("countssss",moveCount.toNumber())
    const movetype = moveCount.toNumber() > 0 ? 0 : 2
    const callData = {
      moveData: ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [qty, number]
      ),
      moveType: movetype,
      player: ethers.constants.AddressZero,
    };
    console.log(callData,id)
    contract.submitMove(callData,id);
  }
  const submitChallenge = (id) =>{
    const callData = {
      moveData: ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [5, 5]
      ),
      moveType: 1,
      player: ethers.constants.AddressZero,
    };
    contract.submitMove(callData,id);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Navbar />
      <div className="bg-prime-purple px-36 py-16 w-[48rem] h-[36rem] flex flex-col justify-center">
        <h1 className="mb-16 text-xl font-bold text-center">
          {!isActive
            ? "Game Finished!"
            : !canPlay
            ? "Start Game!"
            : finalStep
            ? "Submit Combination!"
            : turnOf
            ? "Your move!"
            : "Oponent's move"}
        </h1>
        {!isActive ? (
          <div className="mb-16 text-xl font-bold text-center">
            Winner is {winner}
          </div>
        ) : (
          <div className="flex flex-row justify-center mb-16">
            {numList.map((item, i) => {
              return (
                <img
                  key={i}
                  src={item}
                  alt="dice-1"
                  className="w-16 h-16 rounded-lg mr-2"
                />
              );
            })}
          </div>
        )}

        {!canPlay && moveCount ==0  ? (
          <div>
            <div className="flex justify-center mb-8">
              <span className="mr-2 font-medium">Secret Key: </span>
              <input
                className="bg-inherit border-b-2 border-black outline-none"
                type="text"
                ref={key}
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <button
                onClick={() => {
                  if(hasPlayers){
                    joinSession(getSessionId(location), encodeKey());
                    // setCanPlay(true);
                  }else {
                    openSession(getSessionId(location), encodeKey());

                  }
                }}
                className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  shuffle();
                }}
                className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
              >
                Shuffle
              </button>
              <p className="mt-8 text-sm text-gray-500">
                Enter your secrect key to start the game!
              </p>
            </div>
          </div>
        ) : !isActive ? (
          <div>
            If you want to learn more about the proposal, follow this link:
            <a
              href="https://snapshot.org/#/bitdao.eth/proposal/0x5e82c6ef374db3e472717d3e79b05f246f9a29de3435adb457ae34afa192b5be"
              className="underline text-blue-700"
            >
              {" "}
              DAO Proposal
            </a>
          </div>
        ) : finalStep ? (
          <div>
            <div className="flex justify-center mb-8">
              <span className="mr-2 font-medium">Secret Key: </span>
              <input
                className="bg-inherit border-b-2 border-black outline-none"
                type="text"
                ref={key}
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <button className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
                onClick={()=>{submitCombination(getSessionId(location))}}>
                Submit Combination
              </button>
            </div>
          </div>
        ) : turnOf ? (
          <div className="flex flex-col">
            <div className="text-center font-medium mb-8">Choose bid: </div>
            <div className="bg-white flex justify-around rounded-md py-2">
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(1)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  1
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(2)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  2
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(3)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  3
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(4)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  4
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(5)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  5
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setQty(6)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  6
                </label>
              </div>
            </div>
            <div className="text-center font-medium mt-4">Of</div>
            <div className="bg-white flex justify-around rounded-md py-2 mt-4">
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setNumber(1)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  1
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setNumber(2)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  2
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setNumber(3)}

                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  3
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setNumber(4)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  4
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onChange={() => setNumber(5)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  5
                </label>
              </div>
              <div className="flex justify-center items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value=""
                  onChange={() => setNumber(6)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-500 rounded"
                />
                <label htmlFor="default-checkbox" className="ml-2 text-sm">
                  6
                </label>
              </div>
            </div>
            <div className="flex justify-center items-center mt-8">
              <button className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
                onClick={() => submitMove(getSessionId(location))}
                >
                Bid
              </button>
              <button className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
                onClick={() => submitChallenge(getSessionId(location))}
                >
                challenge
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div>
              <div className="font-bold">DAO Proposal</div>
              <div className="font-bold">#/10</div>
            </div>
            <div className="mt-4">
              <span className="font-medium">
                Approve the transfer of the following amounts to the Mantle Core
                Multisig:
              </span>{" "}
              [Testnet Opex] 10M $BIT and 14M $USDC — To cover operations during
              an up to 6-month long testnet. The length of the testnet is
              subject to the results of testing and maturity of the new
              implementations (e.g. proof generation and data availability). A
              maximum of $7M will be spent on payroll and G&A costs.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
