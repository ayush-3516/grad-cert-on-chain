import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

import { createThirdwebClient } from "thirdweb";
import { useConnect } from "thirdweb/react";
import { createWallet, injectedProvider, Wallet } from "thirdweb/wallets";

const client = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID });

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
};


const WalletContext = createContext<WalletContextType | undefined>(undefined);


interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    const saved = localStorage.getItem('walletAddress');
    return saved ? saved : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved === 'true';
  });

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else {
      localStorage.removeItem('walletAddress');
    }
    localStorage.setItem('isAdmin', String(isAdmin));
  }, [walletAddress, isAdmin]);

  // This would be replaced with actual wallet integration code (e.g., using ethers.js)
  const connectWallet = async () => {
    try {
      console.log('[WalletContext] Attempting to connect wallet...');
      const wallet = createWallet("io.rabby"); // pass the wallet id
      await wallet.connect({
        client,
      });
      // Mock wallet connection for demo purposes
      const mockAddress = wallet.getAccount().address;
      console.log('[WalletContext] Wallet connected successfully:', mockAddress);

      // In real implementation, this would be:
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // await provider.send("eth_requestAccounts", []);
      // const signer = provider.getSigner();
      // const address = await signer.getAddress();

      setWalletAddress(mockAddress);

      // Check against hardcoded admin addresses
      const adminAddresses = [
        "0x1ea146e99cA78FeAA9D32fDD669E40974C3a2C2D" // User's address
      ].map(addr => addr.toLowerCase());
      
      const lowerAddress = mockAddress.toLowerCase();
      console.log('[WalletContext] Checking admin status for:', lowerAddress);
      console.log('[WalletContext] Admin addresses:', adminAddresses);
      
      const adminStatus = adminAddresses.includes(lowerAddress);
      console.log('[WalletContext] Admin status:', adminStatus);
      setIsAdmin(adminStatus);

      toast({
        title: "Wallet connected!",
        description: `Connected to ${mockAddress}`,
      });
    } catch (error) {
      console.error('[WalletContext] Error connecting wallet:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = async () => {
    console.log('[WalletContext] Disconnecting wallet...');
    setWalletAddress(null);
    setIsAdmin(false);
    console.log('[WalletContext] Wallet disconnected');
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
    const wallet = createWallet("io.rabby"); // pass the wallet id
    await wallet.disconnect();
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
