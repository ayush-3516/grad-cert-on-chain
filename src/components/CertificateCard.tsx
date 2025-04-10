
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText } from "lucide-react";

export interface Certificate {
  id: string;
  name: string;
  degree: string;
  year: string;
  tokenId?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onViewDetails: (certificate: Certificate) => void;
  isStudent?: boolean;
}

const CertificateCard = ({ certificate, onViewDetails, isStudent = false }: CertificateCardProps) => {
  return (
    <Card className="glass-card hover-scale w-full max-w-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-center py-4">
          <div className="w-20 h-20 bg-academic-light rounded-full flex items-center justify-center">
            <GraduationCap size={40} className="text-academic-primary" />
          </div>
        </div>
        <CardTitle className="text-center text-xl text-academic-primary font-poppins">
          {certificate.degree}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-2">
        <div className="text-gray-600">
          <p className="font-medium">{certificate.name}</p>
          <p className="text-sm text-gray-500">Class of {certificate.year}</p>
        </div>
        {certificate.tokenId && (
          <div className="text-xs text-gray-500 mt-2">
            Token ID: {certificate.tokenId.substring(0, 6)}...{certificate.tokenId.substring(certificate.tokenId.length - 4)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-0 pb-4">
        <Button 
          variant="outline" 
          onClick={() => onViewDetails(certificate)}
          className="bg-academic-light text-academic-primary hover:bg-academic-primary hover:text-white transition-colors flex items-center gap-2"
        >
          <FileText size={16} />
          View Certificate
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CertificateCard;
