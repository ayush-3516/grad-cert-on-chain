import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/context/WalletContext";
import { uploadCertificateToPinata } from "@/services/contractService";
import { EthersContractService } from "@/services/ethersContractService";
import { toast } from "@/components/ui/use-toast";
import { Check, Upload, AlertCircle } from "lucide-react";
import ConnectWalletModal from "@/components/ConnectWalletModal";

const AdminDashboard = () => {
  const { isConnected, isAdmin, provider: wallet } = useWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNumber: "",
    degreeTitle: "",
    yearOfPassing: new Date().getFullYear().toString(),
    walletAddress: "",
    certificateFile: null as File | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, certificateFile: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[AdminDashboard] Form submission started', formData);
    
    // Validation
    if (!formData.fullName || !formData.registrationNumber || !formData.degreeTitle || 
        !formData.yearOfPassing || !formData.walletAddress || !formData.certificateFile) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload certificate file and metadata to IPFS
      toast({
        title: "Uploading Certificate",
        description: "Uploading certificate to IPFS...",
      });
      
      console.log('[AdminDashboard] Uploading certificate to IPFS...');
      const { metadataUri } = await uploadCertificateToPinata(formData.certificateFile!, {
        studentId: formData.registrationNumber,
        studentName: formData.fullName,
        degree: formData.degreeTitle,
        institution: "Academic Institution",
        issueDate: new Date(),
        yearOfPassing: formData.yearOfPassing
      });

      // 2. Call contract to mint NFT
      toast({
        title: "Minting NFT",
        description: "Issuing certificate NFT...",
      });
      
      console.log('[AdminDashboard] Minting certificate NFT...');
      if (!wallet) {
        throw new Error('Wallet provider not available');
      }

      const contractService = new EthersContractService(wallet, wallet.getSigner());
      const tokenId = await contractService.issueDegree(
        formData.walletAddress,
        metadataUri
      );
      
      console.log('[AdminDashboard] Certificate minted! Token ID:', tokenId);
      
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: `Certificate NFT #${tokenId} successfully issued to ${formData.walletAddress}`,
      });
      
      // Reset form after success
      setFormData({
        fullName: "",
        registrationNumber: "",
        degreeTitle: "",
        yearOfPassing: new Date().getFullYear().toString(),
        walletAddress: "",
        certificateFile: null
      });
    } catch (error) {
      console.error("Error minting certificate:", error);
      let errorMessage = "Failed to mint certificate NFT";
      if (error instanceof Error) {
        if (error.message.includes('user rejected transaction')) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes('Student already has a certificate')) {
          errorMessage = "This student already has a certificate issued to their wallet address";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };
  
  console.log('[AdminDashboard] Render - isConnected:', isConnected, 'isAdmin:', isAdmin);
  
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-academic-light">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-academic-primary mb-4" />
            <h2 className="text-2xl font-poppins font-semibold mb-4">Wallet Connection Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the admin dashboard and issue certificates.
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
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-academic-light">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-poppins font-semibold mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need admin privileges to issue certificates. Please connect with an admin wallet.
            </p>
            <Button onClick={() => setShowConnectModal(true)} className="bg-academic-primary hover:bg-academic-secondary">
              Switch Wallet
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
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-8">
            <h1 className="text-3xl font-poppins font-semibold text-academic-primary mb-2">
              Issue a Degree Certificate
            </h1>
            <p className="text-gray-600 mb-6">
              Fill out the form below to issue a blockchain-based degree certificate NFT.
            </p>
            
            <Separator className="my-6" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    placeholder="Student's full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input 
                    id="registrationNumber" 
                    name="registrationNumber"
                    placeholder="e.g. 2023CS01234"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="degreeTitle">Degree Title</Label>
                  <Input 
                    id="degreeTitle" 
                    name="degreeTitle"
                    placeholder="e.g. Bachelor of Science in Computer Science"
                    value={formData.degreeTitle}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearOfPassing">Year of Passing</Label>
                  <Select 
                    value={formData.yearOfPassing}
                    onValueChange={(value) => handleSelectChange("yearOfPassing", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Student's Wallet Address</Label>
                  <Input 
                    id="walletAddress" 
                    name="walletAddress"
                    placeholder="e.g. 0x123..."
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificateFile">Upload Certificate (PDF)</Label>
                  <div className="flex items-center">
                    <Label 
                      htmlFor="certificateFile" 
                      className="cursor-pointer flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-gray-500">
                        {formData.certificateFile ? formData.certificateFile.name : "Choose file"}
                      </span>
                    </Label>
                    <Input 
                      id="certificateFile" 
                      name="certificateFile"
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-academic-primary hover:bg-academic-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Certificate Issued!
                  </span>
                ) : "Issue Certificate NFT"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
