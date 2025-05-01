import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, GraduationCap, School, User, Calendar, Loader2 } from "lucide-react";
import type { Certificate } from "@/components/CertificateCard";
import { fetchMetadata } from "@/lib/pinataClient";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
}

const CertificateModal = ({ isOpen, onClose, certificate }: CertificateModalProps) => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !certificate?.metadataURI) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMetadata(certificate.metadataURI);
        setMetadata(data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setError("Failed to load certificate details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, certificate?.metadataURI]);

  if (!certificate) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-poppins font-semibold">
            Certificate Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-academic-primary" size={48} />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : metadata ? (
            <>
              <div className="flex justify-center mb-4">
                <a 
                  href={metadata.image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <img 
                    src={metadata.image} 
                    alt="Certificate" 
                    className="w-[300px] h-[300px] object-contain rounded-lg border border-gray-200"
                  />
                </a>
              </div>

              {/* Certificate Details Section */}
              <div className="bg-academic-light/20 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3 text-academic-primary">Certificate Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Student Name:</span>
                      <p className="font-medium">{metadata.name.split("'s")[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Registration Number:</span>
                      <p className="font-medium">
                        {metadata.attributes.find(a => a.trait_type === "Student ID")?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Degree:</span>
                      <p className="font-medium">
                        {metadata.attributes.find(a => a.trait_type === "Degree")?.value || 
                         metadata.description.split("awarded")[0]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <School size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Institution:</span>
                      <p className="font-medium">
                        {metadata.attributes.find(a => a.trait_type === "Institution")?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-500">Year:</span>
                      <p className="font-medium">
                        {metadata.attributes.find(a => a.trait_type === "Year of Passing")?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          
          {metadata && (
            <div className="flex justify-center gap-4 mt-6">
              <Button 
                className="flex items-center gap-2 bg-academic-primary hover:bg-academic-secondary"
                onClick={() => window.open(metadata.external_url || certificate.metadataURI, '_blank')}
              >
                <ExternalLink size={16} />
                View Full Certificate
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
