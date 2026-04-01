/**
 * Deploy SEAL implementation + ERC1967 proxy (same layout as Foundry script/Deploy.s.sol).
 *
 * Requires contracts/.env:
 *   PRIVATE_KEY=0x...   (deployer)
 *   SEPOLIA_RPC_URL=https://...
 *
 * Usage: npx hardhat run scripts/deploy-sepolia.js --network sepolia
 */
const hre = require("hardhat");
const { parseEther, formatEther } = require("ethers");
const erc1967ProxyArtifact = require("@openzeppelin/contracts/build/contracts/ERC1967Proxy.json");

async function main() {
  const minStake = parseEther("0.01");
  const disputeBond = parseEther("0.005");
  const disputePeriod = 86400n; // 1 days

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const SEAL = await hre.ethers.getContractFactory("SEAL");
  const implementation = await SEAL.deploy();
  await implementation.waitForDeployment();
  const implAddress = await implementation.getAddress();
  console.log("SEAL implementation:", implAddress);

  const initData = SEAL.interface.encodeFunctionData("initialize", [
    minStake,
    disputeBond,
    disputePeriod,
  ]);

  const ERC1967Proxy = await hre.ethers.getContractFactory(
    erc1967ProxyArtifact.abi,
    erc1967ProxyArtifact.bytecode,
    deployer
  );
  const proxy = await ERC1967Proxy.deploy(implAddress, initData);
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("SEAL proxy (use this):", proxyAddress);

  const seal = SEAL.attach(proxyAddress);
  console.log("Owner:", await seal.owner());
  console.log("Min stake:", formatEther(await seal.minStake()), "ETH");
  console.log("Dispute bond:", formatEther(await seal.disputeBond()), "ETH");

  console.log("\nSet in frontend/.env and backend/.env:");
  console.log(`  NEXT_PUBLIC_SEAL_CONTRACT_ADDRESS=${proxyAddress}`);
  console.log(`  CONTRACT_ADDRESS=${proxyAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
