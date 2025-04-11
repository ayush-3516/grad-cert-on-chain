import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import type { Certificate } from "@/components/CertificateCard";

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
              <span className="text-sm font-medium text-gray-500">Token ID:</span>
              <span className="col-span-2 font-mono">{certificate.tokenId}</span>
            </div>
            
            {certificate.metadataURI && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">Metadata URI:</span>
                <span className="col-span-2 font-mono truncate">{certificate.metadataURI}</span>
              </div>
            )}
            
            {certificate.contractAddress && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium text-gray-500">Contract:</span>
                <span className="col-span-2 font-mono truncate">{certificate.contractAddress}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="col-span-2">
                {certificate.isValid ? (
                  <span className="text-green-600">Valid</span>
                ) : (
                  <span className="text-red-600">Revoked</span>
                )}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              className="flex items-center gap-2 bg-academic-primary hover:bg-academic-secondary"
              onClick={() => window.open(certificate.metadataURI, '_blank')}
              disabled={!certificate.metadataURI}
            >
              <ExternalLink size={16} />
              View Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
