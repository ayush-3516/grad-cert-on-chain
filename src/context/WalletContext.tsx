import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  provider: ethers.providers.Web3Provider | null;
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
    const ADMIN_WALLETS = [
      '0x1ea146e99cA78FeAA9D32fDD669E40974C3a2C2D', // Original admin
      '0x6A7cBB9EdF7cd1b8034BA037618b37B386D83ab7'  // Deployer address
    ];
    setIsAdmin(ADMIN_WALLETS.some(wallet => addr.toLowerCase() === wallet.toLowerCase()));
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        // Prompt user to install MetaMask
        window.open('https://metamask.io/download.html', '_blank');
        throw new Error('MetaMask not detected - please install it');
      }

      // Check if already connected
      const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (existingAccounts.length > 0) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setAddress(existingAccounts[0]);
        setProvider(web3Provider);
        await checkAdminStatus(existingAccounts[0]);
        return;
      }

      // Request connection
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request accounts - works with any EIP-1193 compliant wallet
      const connectedAccounts = await web3Provider.send('eth_requestAccounts', []);
      console.log('[Wallet] Received accounts:', connectedAccounts);

      if (!connectedAccounts || connectedAccounts.length === 0) {
        console.error('[Wallet] No accounts found');
        throw new Error('No accounts found');
      }

      setAddress(connectedAccounts[0]);
      setProvider(web3Provider);
      await checkAdminStatus(connectedAccounts[0]);
      console.log('[Wallet] Set address and provider:', connectedAccounts[0], web3Provider);

      // Setup event listeners
      // Clean up previous listeners
      // Clean up and setup listeners
      window.ethereum.removeAllListeners();
      
      window.ethereum.on('accountsChanged', async (changedAccounts: string[]) => {
        console.log('[Wallet] Accounts changed:', changedAccounts);
        if (changedAccounts.length > 0) {
          setAddress(changedAccounts[0]);
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(newProvider);
          await checkAdminStatus(changedAccounts[0]);
          console.log('[Wallet] Updated address and provider:', changedAccounts[0], newProvider);
          toast({
            title: 'Account Changed',
            description: `Switched to ${changedAccounts[0].slice(0, 6)}...${changedAccounts[0].slice(-4)}`,
          });
        } else {
          disconnectWallet();
        }
      });

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${connectedAccounts[0].slice(0, 6)}...${connectedAccounts[0].slice(-4)}`,
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
        provider,
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
