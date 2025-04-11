const { ethers } = require('ethers');

// Contract details
const CONTRACT_ADDRESS = "0x633ED3960A49Ec467403e4260b253dC896Fc2144";
const DEPLOYER_ADDRESS = "0x6a7cbb9edf7cd1b8034ba037618b37b386d83ab7";
const ADMIN_ADDRESS = "0x1ea146e99cA78FeAA9D32fDD669E40974C3a2C2D";

// Base Sepolia RPC URL
const RPC_URL = "https://base-sepolia.g.alchemy.com/v2/jh-v1UKy3FMGggxSC-ygy_8VD4AdwOhL";

async function grantMinterRole() {
  // Connect to network
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
    chainId: 84532,
    name: 'base-sepolia'
  });

  // Get deployer signer (will need private key input)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY environment variable");
  }
  const deployer = new ethers.Wallet(privateKey, provider);

  // Load contract ABI
  const contractArtifact = require('./artifacts/contracts/GradCertNFT.sol/GradCertNFT.json');
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    deployer
  );

  // Calculate MINTER_ROLE hash
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

  console.log(`Granting MINTER_ROLE to ${ADMIN_ADDRESS}...`);
  
  // Grant role
  const tx = await contract.grantRole(MINTER_ROLE, ADMIN_ADDRESS);
  console.log(`Transaction sent: ${tx.hash}`);
  
  await tx.wait();
  console.log(`MINTER_ROLE successfully granted to ${ADMIN_ADDRESS}`);
}

grantMinterRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
