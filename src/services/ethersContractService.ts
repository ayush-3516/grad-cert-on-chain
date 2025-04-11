import { 
  ethers,
  Contract,
  type ContractInterface
} from 'ethers';
import GradCertNFTArtifact from '../../artifacts/contracts/GradCertNFT.sol/GradCertNFT.json';

// Contract address on Base Sepolia (chainId 84532)
const CONTRACT_ADDRESS = "0x633ED3960A49Ec467403e4260b253dC896Fc2144";

interface Certificate {
  tokenId: bigint;
  metadataURI: string;
  isValid: boolean;
}

export class EthersContractService {
  private contract: Contract;
  private provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider, signer?: ethers.Signer) {
    // Base Sepolia chain ID
    const BASE_SEPOLIA_CHAIN_ID = 84532;
    
    if (provider.network?.chainId !== BASE_SEPOLIA_CHAIN_ID) {
      throw new Error(`Please connect to Base Sepolia (chainId ${BASE_SEPOLIA_CHAIN_ID})`);
    }
    
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      GradCertNFTArtifact.abi as ContractInterface,
      signer || provider
    );
  }

  async getOwnerCertificates(ownerAddress: string): Promise<Certificate[]> {
    try {
      console.debug(`[Storage] Fetching certificates for owner: ${ownerAddress}`);
      const certs = await this.contract.getOwnerCertificates(ownerAddress);
      
      const result = certs.map((cert: {tokenId: bigint, metadataURI: string, isValid: boolean}) => ({
        tokenId: cert.tokenId,
        metadataURI: cert.metadataURI,
        isValid: cert.isValid
      }));

      console.debug(`[Storage] Retrieved ${result.length} certificates for owner ${ownerAddress}`);
      console.debug('[Storage] Certificate details:', result);
      return result;
    } catch (error) {
      console.error("[Storage] Error getting owned certificates:", error);
      throw error;
    }
  }

  async isValidCertificate(tokenId: bigint): Promise<boolean> {
    try {
      console.debug(`[Storage] Checking validity for certificate: ${tokenId}`);
      const isValid = await this.contract.isValidCertificate(tokenId);
      console.debug(`[Storage] Certificate ${tokenId} validity: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error("[Storage] Error checking certificate validity:", error);
      throw error;
    }
  }

  async issueDegree(toAddress: string, metadataURI: string): Promise<bigint> {
    if (!this.signer) {
      throw new Error("Signer required for this operation");
    }

    try {
      console.debug(`[Storage] Issuing certificate to: ${toAddress}, metadata: ${metadataURI}`);
      
      // First check if student already has a certificate
      const hasCert = await this.contract.hasCertificate(toAddress);
      if (hasCert) {
        throw new Error("Student already has a certificate");
      }

      // Check if caller has minter role
      const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
      const hasRole = await this.contract.hasRole(MINTER_ROLE, await this.signer.getAddress());
      if (!hasRole) {
        throw new Error("Caller does not have minter role");
      }

      const tx = await this.contract.issueDegree(toAddress, metadataURI);
      console.debug('[Storage] Transaction submitted:', tx.hash);
      
      await tx.wait();
      console.debug('[Storage] Transaction confirmed');
      
      // Get the tokenId from the emitted event
      const filter = this.contract.filters.CertificateIssued(toAddress);
      const events = await this.contract.queryFilter(filter, 'latest');
      if (events.length > 0) {
        const tokenId = events[0].args.tokenId;
        console.debug(`[Storage] Certificate issued with tokenId: ${tokenId}`);
        return tokenId;
      }
      throw new Error("Certificate issued but event not found");
    } catch (error) {
      console.error("[Storage] Error issuing degree:", error);
      throw error;
    }
  }

  async revokeCertificate(tokenId: bigint): Promise<void> {
    if (!this.signer) {
      throw new Error("Signer required for this operation");
    }

    try {
      console.debug(`[Storage] Revoking certificate: ${tokenId}`);
      const tx = await this.contract.revokeCertificate(tokenId);
      console.debug('[Storage] Revocation transaction submitted:', tx.hash);
      
      await tx.wait();
      console.debug(`[Storage] Certificate ${tokenId} successfully revoked`);
    } catch (error) {
      console.error("[Storage] Error revoking certificate:", error);
      throw error;
    }
  }

  async getCertificateDetails(tokenId: bigint): Promise<Certificate> {
    try {
      console.debug(`[Storage] Fetching details for certificate: ${tokenId}`);
      const [metadataURI, isValid] = await Promise.all([
        this.contract.tokenURI(tokenId),
        this.contract.isValidCertificate(tokenId)
      ]);
      
      const details = {
        tokenId,
        metadataURI,
        isValid
      };
      
      console.debug(`[Storage] Certificate ${tokenId} details:`, details);
      return details;
    } catch (error) {
      console.error("[Storage] Error getting certificate details:", error);
      throw error;
    }
  }
}

// Helper function to initialize the service
export const initEthersContractService = async (): Promise<EthersContractService> => {
    // Use window.ethereum if available (MetaMask)
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    return new EthersContractService(provider, signer);
  }
  
  // Fallback to default provider - using Base Sepolia
  const provider = new ethers.providers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/jh-v1UKy3FMGggxSC-ygy_8VD4AdwOhL', {
    chainId: 84532,
    name: 'base-sepolia'
  });
  return new EthersContractService(provider);
};
