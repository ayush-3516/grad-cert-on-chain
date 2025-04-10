import axios from 'axios';

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecret = import.meta.env.VITE_PINATA_API_SECRET;
const pinataJwt = import.meta.env.VITE_PINATA_JWT;
const gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY;

if (!pinataApiKey || !pinataSecret || !pinataJwt) {
  throw new Error('Pinata credentials must be defined in environment variables');
}

const pinataClient = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${pinataJwt}`
  }
});

interface PinataMetadata {
  studentId: string;
  studentName: string;
  degree: string;
  institution: string;
  issueDate?: string;
}

export const uploadToPinata = async (file: File, metadata: PinataMetadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({
    name: file.name,
    keyvalues: metadata
  }));

  try {
    const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      ipfsHash: response.data.IpfsHash,
      gatewayUrl: `${gatewayUrl}/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

export default pinataClient;
