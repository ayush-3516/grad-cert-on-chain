
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import CertificateModal from "@/components/CertificateModal";

interface Certificate {
  id: string;
  name: string;
  degree: string;
  year: string;
  regNo?: string;
  tokenId?: string;
  contractAddress?: string;
  isValid?: boolean;
}

const VerifierPortal = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [searchType, setSearchType] = useState("wallet");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Certificate | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((searchType === "wallet" && !walletAddress) || (searchType === "token" && !tokenId)) {
      return;
    }
    
    setIsSearching(true);
    setSearchResult(null);
    setIsVerified(null);
    
    try {
      // In a real implementation:
      // 1. Query blockchain for the NFT based on search criteria
      // 2. Verify ownership and authenticity
      // 3. Fetch and display metadata
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - randomly decide if certificate is found and valid
      const found = Math.random() > 0.3;
      
      if (found) {
        const mockCertificate: Certificate = {
          id: "1",
          name: "John Doe",
          degree: "Bachelor of Science in Computer Science",
          year: "2023",
          regNo: "2023CS1234",
          tokenId: searchType === "token" ? tokenId : "123456789012345678901234567890",
          contractAddress: "0x1234567890123456789012345678901234567890",
          isValid: Math.random() > 0.2 // Randomly determine validity
        };
        
        setSearchResult(mockCertificate);
        setIsVerified(mockCertificate.isValid);
      } else {
        setSearchResult(null);
        setIsVerified(false);
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setIsVerified(false);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleViewDetails = () => {
    if (searchResult) {
      setShowCertificateModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-academic-light">
      <Navbar />
      
      <main className="flex-grow px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-poppins font-semibold text-academic-primary mb-2">
              Verify a Certificate
            </h1>
            <p className="text-gray-600">
              Check the authenticity of a blockchain-issued academic certificate
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Tabs defaultValue="wallet" onValueChange={setSearchType} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="wallet">Search by Wallet Address</TabsTrigger>
                <TabsTrigger value="token">Search by Token ID</TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Student's Wallet Address</Label>
                    <Input 
                      id="walletAddress"
                      placeholder="e.g. 0x123..." 
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Enter the wallet address of the certificate holder
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-academic-primary hover:bg-academic-secondary flex items-center justify-center gap-2"
                    disabled={isSearching || !walletAddress}
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="token">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tokenId">Certificate Token ID</Label>
                    <Input 
                      id="tokenId"
                      placeholder="e.g. 123456789..." 
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Enter the unique token ID of the certificate NFT
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-academic-primary hover:bg-academic-secondary flex items-center justify-center gap-2"
                    disabled={isSearching || !tokenId}
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {isVerified !== null && (
              <>
                <Separator className="my-8" />
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Verification Result</h3>
                  
                  {isVerified ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                      <CheckCircle className="text-green-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Certificate Verified Successfully</h4>
                        <p className="text-green-700 text-sm mb-3">
                          This certificate is valid and has been correctly issued on the blockchain.
                        </p>
                        {searchResult && (
                          <>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{searchResult.name}</span>
                              
                              <span className="text-gray-600">Degree:</span>
                              <span>{searchResult.degree}</span>
                              
                              <span className="text-gray-600">Year:</span>
                              <span>{searchResult.year}</span>
                              
                              {searchResult.regNo && (
                                <>
                                  <span className="text-gray-600">Reg No:</span>
                                  <span>{searchResult.regNo}</span>
                                </>
                              )}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              onClick={handleViewDetails}
                              className="text-academic-primary border-academic-primary hover:bg-academic-light"
                            >
                              View Certificate Details
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
                      <AlertCircle className="text-red-500 w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Certificate Verification Failed</h4>
                        <p className="text-red-700 text-sm">
                          {searchType === "wallet" 
                            ? `No valid certificates found for wallet address ${walletAddress}`
                            : `No valid certificate found with token ID ${tokenId}`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      {searchResult && (
        <CertificateModal 
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          certificate={searchResult}
        />
      )}
    </div>
  );
};

export default VerifierPortal;
