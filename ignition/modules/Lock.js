import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GradCertNFTModule", (m) => {
  const deployer = m.getAccount(0); // Use first signer account as owner
  const gradCertNFT = m.contract("GradCertNFT", [deployer]);

  return { gradCertNFT };
});
