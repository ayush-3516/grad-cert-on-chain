import { 
  ethers,
  Contract,
  type ContractInterface
} from 'ethers';
import GradCertNFTArtifact from '../../artifacts/contracts/GradCertNFT.sol/GradCertNFT.json';

// Contract address on Base Sepolia (chainId 84532)
export const CONTRACT_ADDRESS = "0xCA36cd776d4A438a7894225299052ED9FEA53028";

interface Certificate {
  tokenId: bigint;
  metadataURI: string;
  isValid: boolean;
}

export class EthersContractService {
  private contract: Contract;
  private provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  private signer?: ethers.Signer;
  private static BASE_SEPOLIA_CHAIN_ID = 84532;

  constructor(provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      GradCertNFTArtifact.abi as ContractInterface,
      signer || provider
    );
  }

  async verifyNetwork() {
    try {
      console.debug('[Storage] Starting network verification...');
      const network = await this.provider.getNetwork();
      const currentChainId = network.chainId;
      
      console.debug('[Storage] Network details:', {
        name: network.name,
        chainId: currentChainId,
        ensAddress: network.ensAddress
      });

      console.debug('[Storage] Verifying chain ID:', {
        expected: EthersContractService.BASE_SEPOLIA_CHAIN_ID,
        actual: currentChainId,
        match: Number(currentChainId) === Number(EthersContractService.BASE_SEPOLIA_CHAIN_ID)
      });

      if (Number(currentChainId) !== Number(EthersContractService.BASE_SEPOLIA_CHAIN_ID)) {
        console.error('[Storage] Network verification failed - wrong chain ID');
        throw new Error(`Please connect to Base Sepolia (chainId ${EthersContractService.BASE_SEPOLIA_CHAIN_ID}). Current chain ID: ${currentChainId}`);
      }

      console.debug('[Storage] Network verification successful');
      return true;
    } catch (error) {
      console.error('[Storage] Network verification error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
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

      // Check if caller is contract owner
      const owner = await this.contract.owner();
      const caller = await this.signer.getAddress();
      if (owner !== caller) {
        throw new Error("Caller is not the contract owner");
      }

      const tx = await this.contract.issueDegree(toAddress, metadataURI);
      console.debug('[Storage] Transaction submitted:', tx.hash);
      
      const receipt = await tx.wait();
      console.debug('[Storage] Transaction confirmed in block:', receipt.blockNumber);
      
      // Get the token ID by checking the latest certificate for this address
      const certs = await this.contract.getOwnerCertificates(toAddress);
      if (certs.length > 0) {
        const tokenId = certs[certs.length - 1].tokenId;
        console.debug(`[Storage] Certificate issued with tokenId: ${tokenId}`);
        return tokenId;
      }
      throw new Error("Certificate mint verification failed - no certificates found");
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
      const details = await this.contract.getCertificateDetails(tokenId);
      
      console.debug(`[Storage] Certificate ${tokenId} details:`, details);
      return {
        tokenId: details.tokenId,
        metadataURI: details.metadataURI,
        isValid: details.isValid
      };
    } catch (error) {
      console.error("[Storage] Error getting certificate details:", error);
      throw error;
    }
  }

  async getCertificateOwner(tokenId: bigint): Promise<string> {
    try {
      console.debug(`[Storage] Fetching owner for certificate: ${tokenId}`);
      const owner = await this.contract.getCertificateOwner(tokenId);
      console.debug(`[Storage] Certificate ${tokenId} owner: ${owner}`);
      return owner;
    } catch (error) {
      console.error("[Storage] Error getting certificate owner:", error);
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
