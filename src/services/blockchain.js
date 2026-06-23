import Web3 from "web3";
import abi from "./voting_abi.json";

export const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "";
export const EXPECTED_CHAIN_ID = (
  process.env.REACT_APP_EXPECTED_CHAIN_ID || "0x539"
).toLowerCase();

export const wrongNetworkMessage = (chainId) =>
  `Wrong network. Please switch MetaMask to the configured Ganache network. Expected ${EXPECTED_CHAIN_ID}, current ${chainId}.`;

export const checkNetwork = async () => {
  if (!window.ethereum) return "MetaMask is not installed.";
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return chainId.toLowerCase() === EXPECTED_CHAIN_ID
    ? null
    : wrongNetworkMessage(chainId);
};

export const validateNetwork = async () => {
  const networkError = await checkNetwork();
  if (networkError) {
    const error = new Error(networkError);
    error.code = "WRONG_NETWORK";
    throw error;
  }
};

export const getContract = () => {
  if (!window.ethereum) throw new Error("Please install MetaMask.");
  if (!contractAddress) {
    throw new Error("Contract address is not configured. Set REACT_APP_CONTRACT_ADDRESS.");
  }
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(abi, contractAddress);
};

export const describeTransactionError = (error) => {
  const code = error?.code ?? error?.cause?.code;
  const message =
    error?.reason || error?.data?.message || error?.cause?.message || error?.message || "Unknown error";

  if (code === 4001 || code === "ACTION_REJECTED") {
    return { type: "rejected", message: "Transaction rejected in MetaMask." };
  }
  if (code === "WRONG_NETWORK" || message.toLowerCase().includes("wrong network")) {
    return { type: "error", message };
  }
  if (message.toLowerCase().includes("revert")) {
    const reason = message.match(/revert(?:ed)?(?: with reason string)?[: '"]+([^'"\n]+)/i)?.[1];
    return { type: "reverted", message: reason ? `Transaction reverted: ${reason}` : message };
  }
  return { type: "error", message };
};
