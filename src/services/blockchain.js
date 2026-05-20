import Web3 from "web3";
import abi from "./voting_abi.json";


export const contractAddress = "0xC958E8B28dba6B800549ceDBC64172D3FcD4533A";

export const getContract = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask.");
  }
  
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(abi, contractAddress);
};