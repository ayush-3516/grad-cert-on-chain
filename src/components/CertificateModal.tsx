
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

interface Certificate {
  id: string;
  name: string;
  degree: string;
  year: string;
  regNo?: string;
  tokenId?: string;
  contractAddress?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

const CertificateModal = ({ isOpen, onClose, certificate }: CertificateModalProps) => {
  if (!certificate) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-poppins font-semibold">
            Certificate Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-academic-light rounded-full flex items-center justify-center">
              <FileText size={30} className="text-academic-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <span className="col-span-2 font-medium">{certificate.name}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm font-medium text-gray-500">Degree:</span>
              <span className="col-span-2">{certificate.degree}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm font-medium text-gray-500">Year:</span>
              <span className="col-span-2">{certificate.year}</span>
            </div>
            
            {certificate.regNo && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">Reg No:</span>
                <span className="col-span-2">{certificate.regNo}</span>
              </div>
            )}
            
            {certificate.tokenId && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">Token ID:</span>
                <span className="col-span-2 text-sm font-mono">{certificate.tokenId}</span>
              </div>
            )}
            
            {certificate.contractAddress && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">Contract:</span>
                <span className="col-span-2 text-sm font-mono truncate">
                  {certificate.contractAddress}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-6">
            <Button className="flex items-center gap-2 bg-academic-primary hover:bg-academic-secondary">
              <ExternalLink size={16} />
              View PDF Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
