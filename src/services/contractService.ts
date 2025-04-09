
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BaseSepoliaTestnet } from "@thirdweb-dev/chains";

// Contract address on Base Sepolia
const CONTRACT_ADDRESS = "0xf066CE0844f75E6A3d754C02E746c749DC78253B";

export const getSDK = async (signer?: any) => {
  if (signer) {
    return ThirdwebSDK.fromSigner(signer, BaseSepoliaTestnet.chainId, {
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",
    });
  }
  
  return new ThirdwebSDK(BaseSepoliaTestnet.chainId, {
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",
  });
};

export const getContract = async (signer?: any) => {
  const sdk = await getSDK(signer);
  return await sdk.getContract(CONTRACT_ADDRESS);
};

export const getCertificateData = async (tokenId: string, signer?: any) => {
  try {
    const contract = await getContract(signer);
    const result = await contract.call("getCertificateData", [tokenId]);
    return {
      studentId: result[0],
      documentHash: result[1],
      issueDate: new Date(Number(result[2]) * 1000),
      revoked: result[3]
    };
  } catch (error) {
    console.error("Error getting certificate data:", error);
    throw error;
  }
};

export const uploadToIPFS = async (file: File, metadata: any) => {
  try {
    const sdk = await getSDK();
    const storage = sdk.storage;
    
    // Upload the file first
    const fileUri = await storage.upload(file);
    
    // Add the file URI to the metadata
    const fullMetadata = {
      ...metadata,
      image: fileUri
    };
    
    // Upload the metadata
    const metadataUri = await storage.upload(fullMetadata);
    
    return {
      fileUri,
      metadataUri
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};
