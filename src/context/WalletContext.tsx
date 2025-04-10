import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkAdminStatus = async (addr: string) => {
    // Replace with actual admin wallet address
    const ADMIN_WALLET = '0x1ea146e99cA78FeAA9D32fDD669E40974C3a2C2D';
    setIsAdmin(addr.toLowerCase() === ADMIN_WALLET.toLowerCase());
  };

  const connectWallet = async () => {
    try {
      // Universal wallet detection
      const ethereum = window.ethereum || (window as unknown as {web3?: {currentProvider?: unknown}}).web3?.currentProvider;
      if (!ethereum) {
        throw new Error('Please install an Ethereum wallet');
      }

      // Initialize provider
      const web3Provider = new ethers.providers.Web3Provider(ethereum);
      
      // Request accounts - works with any EIP-1193 compliant wallet
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      console.log('[Wallet] Received accounts:', accounts);

      if (!accounts || accounts.length === 0) {
        console.error('[Wallet] No accounts found');
        throw new Error('No accounts found');
      }

      setAddress(accounts[0]);
      setProvider(web3Provider);
      await checkAdminStatus(accounts[0]);
      console.log('[Wallet] Set address and provider:', accounts[0], web3Provider);

      // Setup event listeners
      // Clean up previous listeners
      // Clean up and setup listeners
      ethereum.removeAllListeners();
      
      ethereum.on('accountsChanged', async (newAccounts: string[]) => {
        console.log('[Wallet] Accounts changed:', newAccounts);
        if (newAccounts.length > 0) {
          setAddress(newAccounts[0]);
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(newProvider);
          await checkAdminStatus(newAccounts[0]);
          console.log('[Wallet] Updated address and provider:', newAccounts[0], newProvider);
          toast({
            title: 'Account Changed',
            description: `Switched to ${newAccounts[0].slice(0, 6)}...${newAccounts[0].slice(-4)}`,
          });
        } else {
          disconnectWallet();
        }
      });

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive'
      });
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    toast({ title: 'Wallet Disconnected' });
  };

  const signMessage = async (message: string) => {
    if (!provider || !address) {
      throw new Error('Wallet not connected');
    }
    const signer = provider.getSigner();
    return await signer.signMessage(message);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isAdmin,
        connectWallet,
        disconnectWallet,
        signMessage
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export { WalletProvider, useWallet };
