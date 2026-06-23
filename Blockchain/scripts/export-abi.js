const fs = require("fs");
const path = require("path");

const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Voting.sol", "Voting.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const output = `${JSON.stringify(artifact.abi, null, 2)}\n`;

for (const relativePath of [
  path.join("..", "..", "src", "services", "voting_abi.json"),
  path.join("..", "..", "FastAPI", "voting_abi.json"),
]) {
  fs.writeFileSync(path.join(__dirname, relativePath), output);
}

console.log("Exported current Voting ABI to frontend and backend.");
