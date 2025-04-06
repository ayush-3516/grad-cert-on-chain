
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { 
  GraduationCap,
  FileText,
  User,
  Check,
  Home
} from "lucide-react";

const Navbar = () => {
  const { walletAddress, isConnected, isAdmin, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="bg-white shadow-md py-4 px-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="text-academic-primary h-8 w-8" />
          <Link to="/" className="font-poppins text-xl font-bold text-academic-primary">
            CertChain
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 font-medium">
          <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-academic-primary">
            <Home size={18} />
            Home
          </Link>
          
          <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-academic-primary">
            <FileText size={18} />
            Issue Certificate
          </Link>
          
          <Link to="/verify" className="flex items-center gap-2 text-gray-700 hover:text-academic-primary">
            <Check size={18} />
            Verify Certificate
          </Link>
          
          <Link to="/student" className="flex items-center gap-2 text-gray-700 hover:text-academic-primary">
            <User size={18} />
            My Certificate
          </Link>
        </div>
        
        <div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-gray-500">
                {walletAddress}
              </span>
              <Button variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} className="bg-academic-primary hover:bg-academic-secondary">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
