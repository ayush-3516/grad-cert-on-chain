
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import CertificateCard from "@/components/CertificateCard";
import type { Certificate } from "@/components/CertificateCard";
import { AlertCircle, Loader2 } from "lucide-react";
import CertificateModal from "@/components/CertificateModal";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import { getOwnedCertificates } from "@/services/contractService";

const StudentPortal = () => {
  const { isConnected, address: walletAddress } = useWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchCertificates();
    }
  }, [isConnected, walletAddress]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      if (!walletAddress) {
        setCertificates([]);
        return;
      }
      
      const ownedCerts = await getOwnedCertificates(walletAddress);
      // Transform contract data to match CertificateCard expected format
      const transformedCerts = ownedCerts.map(cert => ({
        id: cert.tokenId,
        name: cert.name,
        degree: cert.degree,
        year: cert.year,
        institution: cert.institution,
        isValid: cert.isValid,
        tokenId: cert.tokenId,
        contractAddress: cert.contractAddress,
        metadataURI: cert.metadataURI,
        imageUrl: cert.imageUrl
      }));
      setCertificates(transformedCerts);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-academic-light">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-academic-primary mb-4" />
            <h2 className="text-2xl font-poppins font-semibold mb-4">Wallet Connection Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to view your certificates.
            </p>
            <Button onClick={() => setShowConnectModal(true)} className="bg-academic-primary hover:bg-academic-secondary">
              Connect Wallet
            </Button>
          </div>
        </div>
        <ConnectWalletModal 
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-academic-light">
      <Navbar />
      
      <main className="flex-grow px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-semibold text-academic-primary mb-2">
              My Certificates
            </h1>
            <p className="text-gray-600">
              View all your academic certificates issued as NFTs
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-primary"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Certificates Found</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  You don't have any NFT certificates yet. They will appear here when your institution issues them to your wallet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(certificate => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate}
                  onViewDetails={handleViewDetails}
                  isStudent={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <CertificateModal 
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        certificate={selectedCertificate}
      />
    </div>
  );
};

export default StudentPortal;
