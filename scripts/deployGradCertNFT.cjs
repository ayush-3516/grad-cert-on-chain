const hre = require("hardhat");

async function main() {
  const GradCertNFT = await hre.ethers.getContractFactory("GradCertNFT");
  const gradCertNFT = await GradCertNFT.deploy();

  await gradCertNFT.waitForDeployment();

  console.log("GradCertNFT deployed to:", await gradCertNFT.getAddress());
  return await gradCertNFT.getAddress();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
