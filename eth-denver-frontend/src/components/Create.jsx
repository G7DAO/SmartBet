import smartBetContract from "../abi/localhost/SmartBetFacet.json";
import diamondContract from "../abi/localhost/Diamond.json"
import { useContract, useSigner } from "wagmi";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useRef, useState } from "react";
import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_KEY = process.env.REACT_APP_WEB3_STORAGE_APIKEY;

const sampleStrArr = [
  "ASDASDASdasdasdasdasdasdasdadsadsa",
  "ASdasdasdasdasdasdasdadsasdadasdasd",
  "Asdasdadsasdasdasdasdasdasdasdasdads",
]
function makeFileObjects (data) {
  const obj = data
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })

  const files = [
    new File(['contents-of-file-1'], 'plain-utf8.txt'),
    new File([blob], 'proposal.json')
  ]
  return files
}
const storeStrArrToIpfs = async (arr) => {
  const storage = new Web3Storage({ token: WEB3_STORAGE_KEY })
  const file = await makeFileObjects({proposal : arr})
  const cid = await storage.put(file)
  console.log('web3.storage CID:', cid)
  return cid
}
const Create = () => {
  const [cid, setCid] = useState(null);
  const addRecentTransaction = useAddRecentTransaction();
  const { data: signer } = useSigner();

  const contract = useContract({
    address: diamondContract.address,
    abi: smartBetContract.abi,
    signerOrProvider: signer,
  });


  const erc1155Address = useRef(null);
  const validUntil = useRef(null);

  const openGame = async () => {
    const tx = await contract.openGame(
      erc1155Address.current.value,
      validUntil.current.value,
      [0], // default for now
      cid 
    );

    addRecentTransaction({
      hash: tx.hash,
      description: "Create game",
    });
    
  };

  const readProposal = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      // TODO : feed this to open AI
      console.log(text);
      const cid = await storeStrArrToIpfs(sampleStrArr); // TODO : ADD a message box with toast when this is loading. "uploading to ip"
      setCid(cid)
    };
    reader.readAsText(e.target.files[0]);
  };

  return (
    <div className="bg-prime-purple px-36 py-16 w-[48rem]">
      <div className="flex flex-row justify-center mb-10">
        <span className="font-medium mr-2">ERC-1155 Address: </span>
        <input
          className="bg-inherit border-b-2 border-black outline-none"
          type="text"
          ref={erc1155Address}
        />
      </div>
      <div className="flex flex-row justify-center mb-10">
        <span className="font-medium mr-2">Valid until: </span>
        <input
          className="bg-inherit border-b-2 border-black outline-none"
          type="number"
          ref={validUntil}
        />
      </div>
      <div className="flex flex-col justify-center mb-10">
        <label className="ml-1 block mb-2 font-medium" htmlFor="file_input">
          Upload Proposal:
        </label>
        <input
          className="block w-full text-sm text-gray-900 border border-prime-purple rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          aria-describedby="file_input_help"
          id="file_input"
          type="file"
          onChange={(e) => readProposal(e)}
        />
        <p className="mt-1 ml-1 text-sm text-gray-500" id="file_input_help">
          Only accepts .txt files
        </p>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            openGame();
          }}
          className="text-white border-2 border-white py-1 px-2 rounded-lg w-40 hover:text-black hover:bg-white"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default Create;
