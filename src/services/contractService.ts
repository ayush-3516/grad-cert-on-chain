
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Signer } from "ethers";

// Contract address on Base (chainId 84532)
const CONTRACT_ADDRESS = "0x633ED3960A49Ec467403e4260b253dC896Fc2144";

export const getSDK = async (signer?: Signer) => {
  if (signer) {
    return ThirdwebSDK.fromSigner(signer, 84532, {
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",
    });
  }
  
  return new ThirdwebSDK(84532, {
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "",
  });
};

export const getContract = async (signer?: Signer) => {
  const sdk = await getSDK(signer);
  return await sdk.getContractFromAbi(
    CONTRACT_ADDRESS,
    [
      {
        "inputs": [
          {"internalType": "address", "name": "initialOwner", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "string", "name": "metadataURI", "type": "string"}
        ],
        "name": "issueDegree",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "isValidCertificate",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "getOwnerCertificates",
        "outputs": [
          {
            "components": [
              {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
              {"internalType": "string", "name": "metadataURI", "type": "string"},
              {"internalType": "bool", "name": "isValid", "type": "bool"}
            ],
            "internalType": "struct GradCertNFT.Certificate[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  );
};

interface ContractCertificate {
  tokenId: bigint;
  metadataURI: string;
  isValid: boolean;
}

export const getOwnedCertificates = async (walletAddress: string, signer?: Signer) => {
  try {
    const contract = await getContract(signer);
    const certs = await contract.call("getOwnerCertificates", [walletAddress]) as ContractCertificate[];
    
    return certs.map((cert) => ({
      tokenId: cert.tokenId.toString(),
      contractAddress: CONTRACT_ADDRESS,
      studentId: "N/A", // Not available in contract
      documentHash: "N/A", // Not available in contract 
      issueDate: new Date(), // Using current date as placeholder
      revoked: !cert.isValid
    }));
  } catch (error) {
    console.error("Error getting owned certificates:", error);
    throw error;
  }
};

import { uploadToPinata } from "@/lib/pinataClient";

interface CertificateMetadata {
  studentId: string;
  studentName: string;
  degree: string;
  institution: string;
  issueDate?: Date;
}

export const uploadCertificateToPinata = async (file: File, metadata: CertificateMetadata) => {
  try {
    // Upload file to Pinata
    const fileResult = await uploadToPinata(file, {
      studentId: metadata.studentId,
      studentName: metadata.studentName,
      degree: metadata.degree,
      institution: metadata.institution,
      issueDate: metadata.issueDate?.toISOString()
    });

    // Prepare metadata with file URL
    const fullMetadata = {
      ...metadata,
      file_url: fileResult.gatewayUrl
    };

    // Create metadata JSON blob
    const metadataBlob = new Blob([JSON.stringify(fullMetadata)], {
      type: 'application/json'
    });

    // Upload metadata to Pinata
    const metadataFile = new File(
      [metadataBlob],
      `${file.name.replace(/\.[^/.]+$/, '')}.json`
    );
    const metadataResult = await uploadToPinata(metadataFile, {
      studentId: fullMetadata.studentId,
      studentName: fullMetadata.studentName,
      degree: fullMetadata.degree,
      institution: fullMetadata.institution,
      issueDate: fullMetadata.issueDate?.toISOString()
    });

    return {
      fileUri: fileResult.gatewayUrl,
      metadataUri: metadataResult.gatewayUrl
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};
