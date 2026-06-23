const hre = require("hardhat");

async function main() {
  const voting = await hre.ethers.deployContract("Voting");
  await voting.waitForDeployment();
  console.log("Voting deployed to:", await voting.getAddress());
  console.log("Update REACT_APP_CONTRACT_ADDRESS and VOTING_CONTRACT_ADDRESS with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
