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

interface PinataKeyValues {
  studentId: string;
  studentName: string;
  degree: string;
  institution: string;
  issueDate?: string;
  yearOfPassing?: string;
  type?: string;
}

interface PinataMetadata {
  name?: string;
  keyvalues: PinataKeyValues;
}

export const uploadToPinata = async (file: File, metadata: PinataMetadata) => {
  const formData = new FormData();
  
  // Validate file
  if (!file || file.size === 0) {
    throw new Error('Invalid file provided for upload');
  }

  // Prepare metadata
  const pinataMetadata = {
    name: file.name,
    keyvalues: metadata.keyvalues
  };

  // Validate metadata
  if (!pinataMetadata.keyvalues.studentId || !pinataMetadata.keyvalues.studentName) {
    throw new Error('Student ID and Name are required in metadata');
  }

  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

  try {
    console.log('Uploading to Pinata:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      metadata: pinataMetadata
    });

    const response = await pinataClient.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${pinataJwt}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Pinata upload successful:', response.data);
    
    return {
      ipfsHash: response.data.IpfsHash,
      gatewayUrl: `${gatewayUrl}/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", {
      error: error.response?.data || error.message,
      config: error.config,
      metadata: pinataMetadata
    });
    throw error;
  }
};

export const verifyPinataCredentials = async () => {
  try {
    const response = await pinataClient.get('/data/testAuthentication');
    return response.status === 200;
  } catch (error) {
    console.error("Pinata authentication failed:", error.response?.data || error.message);
    return false;
  }
};

export default pinataClient;
