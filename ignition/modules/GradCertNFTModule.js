import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GradCertNFTModule", (m) => {
  const gradCertNFT = m.contract("GradCertNFT", [m.getAccount(0)]);

  return { gradCertNFT };
});
