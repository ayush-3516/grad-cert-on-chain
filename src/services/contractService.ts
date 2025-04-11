
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

import { uploadToPinata, verifyPinataCredentials } from "@/lib/pinataClient";
import { initEthersContractService } from "./ethersContractService";

interface CertificateMetadata {
  studentId: string;
  studentName: string;
  degree: string;
  institution: string;
  issueDate?: Date;
  yearOfPassing?: string;
  name?: string;
}

export const uploadCertificateToPinata = async (file: File, metadata: CertificateMetadata) => {
  try {
    // 0. Verify Pinata credentials first
    const credentialsValid = await verifyPinataCredentials();
    if (!credentialsValid) {
      throw new Error('Invalid Pinata credentials - please check your API keys and JWT token');
    }

    // 1. Upload the PDF file
    const fileResult = await uploadToPinata(file, {
      name: `${metadata.studentName}_${metadata.studentId}_certificate.pdf`,
      keyvalues: {
        studentId: metadata.studentId,
        studentName: metadata.studentName,
        degree: metadata.degree,
        institution: metadata.institution,
        yearOfPassing: metadata.yearOfPassing,
        issueDate: metadata.issueDate?.toISOString()
      }
    });

    // 2. Create metadata JSON with file reference
    const certificateMetadata = {
      name: `${metadata.studentName}'s Degree Certificate`,
      description: `${metadata.degree} awarded to ${metadata.studentName}`,
      image: fileResult.gatewayUrl,
      attributes: [
        {
          trait_type: "Student ID",
          value: metadata.studentId
        },
        {
          trait_type: "Degree",
          value: metadata.degree
        },
        {
          trait_type: "Institution",
          value: metadata.institution
        },
        {
          trait_type: "Year of Passing",
          value: metadata.yearOfPassing
        }
      ],
      external_url: fileResult.gatewayUrl
    };

    // 3. Upload metadata JSON
    const metadataBlob = new Blob([JSON.stringify(certificateMetadata)], {
      type: 'application/json'
    });
    const metadataFile = new File(
      [metadataBlob],
      `${metadata.studentId}_metadata.json`
    );
    const metadataResult = await uploadToPinata(metadataFile, {
      name: `${metadata.studentId}_metadata.json`,
      keyvalues: {
        studentId: metadata.studentId,
        studentName: metadata.studentName,
        degree: metadata.degree,
        institution: metadata.institution,
        yearOfPassing: metadata.yearOfPassing,
        issueDate: metadata.issueDate?.toISOString(),
        type: "certificate_metadata"
      }
    });

    return {
      fileUri: fileResult.gatewayUrl,
      metadataUri: metadataResult.gatewayUrl,
      ipfsHash: metadataResult.ipfsHash
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

export const issueCertificate = async (
  toAddress: string,
  file: File,
  metadata: CertificateMetadata
) => {
  try {
    // 1. Upload certificate and metadata to Pinata
    const { metadataUri, ipfsHash } = await uploadCertificateToPinata(file, metadata);
    
    // 2. Initialize contract service
    const contractService = await initEthersContractService();
    
    // 3. Mint NFT with the metadata URI
    const tokenId = await contractService.issueDegree(toAddress, metadataUri);
    
    return {
      tokenId: tokenId.toString(),
      ipfsHash,
      metadataUri
    };
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
};
