
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { GraduationCap, CheckCircle, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import { useWallet } from "@/context/WalletContext";

const Index = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { isConnected } = useWallet();

  const handleConnectClick = () => {
    setShowConnectModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-academic-light to-white">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-6 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-poppins font-bold text-academic-dark">
                  Issue Tamper-Proof Degree Certificates as NFTs
                </h1>
                <p className="text-xl text-gray-600">
                  Blockchain-secured. Easily Verifiable. Forever yours.
                </p>
                <div className="flex flex-wrap gap-4">
                  {isConnected ? (
                    <div className="space-x-4">
                      <Link to="/admin">
                        <Button className="bg-academic-primary hover:bg-academic-secondary">
                          Issue Certificate
                        </Button>
                      </Link>
                      <Link to="/student">
                        <Button variant="outline">View My Certificates</Button>
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleConnectClick}
                      className="bg-academic-primary hover:bg-academic-secondary"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-72 h-96 bg-white shadow-lg rounded-lg border-2 border-academic-primary p-6 transform rotate-3">
                    <div className="flex justify-center mb-8">
                      <GraduationCap className="w-16 h-16 text-academic-primary" />
                    </div>
                    <div className="border-t-2 border-b-2 border-gray-200 py-4 my-4">
                      <div className="text-center font-poppins font-bold text-lg">CERTIFICATE OF ACHIEVEMENT</div>
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-8">
                      Blockchain Verified & Secured
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-academic-primary rounded-full flex items-center justify-center">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-poppins font-bold text-center mb-16">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 glass-card">
                <div className="w-16 h-16 rounded-full bg-academic-light flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-academic-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-2">University Admin Uploads Degree</h3>
                <p className="text-gray-600">Admin uploads the certificate & student details to create a permanent digital record.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 glass-card">
                <div className="w-16 h-16 rounded-full bg-academic-light flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-academic-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-2">NFT is Minted on Blockchain</h3>
                <p className="text-gray-600">Certificate is converted to an NFT, creating an immutable record on the blockchain.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 glass-card">
                <div className="w-16 h-16 rounded-full bg-academic-light flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-academic-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-2">Student Receives and Shares NFT</h3>
                <p className="text-gray-600">Students can view, share, and allow employers to verify their credentials instantly.</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/verify">
                <Button variant="outline" className="flex items-center gap-2 hover-scale">
                  Verify a Certificate
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-academic-dark text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GraduationCap className="w-6 h-6 mr-2" />
              <span className="font-poppins font-semibold">CertChain</span>
            </div>
            
            <div className="text-sm text-gray-400">
              <div>Smart Contract: 0x1234...5678</div>
              <div>Final Year Project © {new Date().getFullYear()}</div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <ConnectWalletModal 
        isOpen={showConnectModal} 
        onClose={() => setShowConnectModal(false)} 
      />
    </div>
  );
};

export default Index;
