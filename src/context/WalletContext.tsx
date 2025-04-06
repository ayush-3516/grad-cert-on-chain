
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
};

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // This would be replaced with actual wallet integration code (e.g., using ethers.js)
  const connectWallet = async () => {
    try {
      // Mock wallet connection for demo purposes
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 12) + '...';
      
      // In real implementation, this would be:
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // await provider.send("eth_requestAccounts", []);
      // const signer = provider.getSigner();
      // const address = await signer.getAddress();
      
      setWalletAddress(mockAddress);
      
      // For demo, randomly decide if the connected wallet is an admin
      setIsAdmin(Math.random() > 0.5);
      
      toast({
        title: "Wallet connected!",
        description: `Connected to ${mockAddress}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsAdmin(false);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        isAdmin,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContextProvider;
