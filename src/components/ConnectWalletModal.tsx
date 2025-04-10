
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { toast } from "@/components/ui/use-toast";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectWalletModal = ({ isOpen, onClose }: ConnectWalletModalProps) => {
  const { connectWallet } = useWallet();

  const handleConnect = async (walletType: string) => {
    try {
      await connectWallet();
      onClose();
      toast({
        title: "Wallet connected!",
        description: "You can now interact with the application",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect wallet",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-poppins font-semibold">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-center">
            Connect your wallet to issue, view, or verify certificates
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button 
            onClick={() => handleConnect('metamask')}
            className="flex items-center justify-center gap-2 py-6 hover-scale"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
              alt="MetaMask" 
              className="w-6 h-6"
            />
            <span>Connect with MetaMask</span>
          </Button>
          
          <Button 
            onClick={() => handleConnect('walletconnect')}
            variant="outline" 
            className="flex items-center justify-center gap-2 py-6 hover-scale"
          >
            <img 
              src="https://1000logos.net/wp-content/uploads/2022/05/WalletConnect-Logo.jpg" 
              alt="WalletConnect" 
              className="w-6 h-6 rounded"
            />
            <span>Connect with WalletConnect</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
