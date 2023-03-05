import Game from "../pages/Game";
import ActionButton from "./ActionButton";
import { Link } from "react-router-dom";

import { useState, useEffect } from "react";

import smartBetContract from "../abi/localhost/SmartBetFacet.json";
import diamondContract from "../abi/localhost/Diamond.json"

import { useContract, useSigner } from "wagmi";

const Play = () => {
  const [games, setGames] = useState([]);
  const [sessions, setSessions] = useState([]);

  const { data: signer } = useSigner();
  const contract = useContract({
    address: diamondContract.address,
    abi: smartBetContract.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    const fetchData = async () => {
      /*const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const smcontract = new ethers.Contract(
        smartBetContract.address,
        smartBetContract.abi,
        signer
      );
      const games = await smcontract.getAllGamesInfo();
      console.log(games);
      return games;*/
      const games = await contract.getAllGamesInfo();
      const sessions = await contract.getAllSessionsInfo();
      console.log("fetching sessions",sessions)
      setGames(games);
      setSessions(sessions);
    };
    fetchData();
  }, []);

  const formatAddress = (address) => {
    let str1 = address.slice(0, 5);
    let str2 = address.slice(address.length - 5, address.length - 1);
    return str1 + "...." + str2;
  };

  const openSession = (id, hash) => {
    contract.openSession(id, hash);
  };

  return (
    <div>
      <div className="bg-prime-purple px-24 py-20 flex flex-col justify-around w-[48rem]">
        <div className="relative overflow-x-auto mb-10">
          <h2 className="font-medium">Games: </h2>
          <table className="w-full text-xs text-left">
            <thead className="text-black bg-inherit border-b-4 border-white">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions && games.map((game, i) => {
                return (
                  <tr key={i} className="bg-inherit border-b-2 border-white">
                    <td className="px-4 py-2">{formatAddress(game[0])}</td>
                    <td className="px-4 py-2">Basic</td>
                    <td className="px-4 py-2">Role</td>
                    <td className="px-4 py-2">
                      <Link aria-current="page" to={`/session/${sessions.length + 1}`}>
                        <ActionButton label="Open"></ActionButton>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="relative overflow-x-auto">
          <h2 className="font-medium">Sessions: </h2>
          <table className="w-full text-xs text-left">
            <thead className="text-black bg-inherit border-b-4 border-white">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => {
                return (
                  <tr key={i} className="bg-inherit border-b-2 border-white">
                    <td className="px-4 py-2">
                      {formatAddress(session[0][0])}
                    </td>
                    <td className="px-4 py-2">Basic</td>
                    <td className="px-4 py-2">Role</td>
                    <td className="px-4 py-2">
                      <Link aria-current="page" to={`/session/${i + 1}`}>
                        <ActionButton label="Join"></ActionButton>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Play;
