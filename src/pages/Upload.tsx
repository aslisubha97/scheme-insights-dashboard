
import React from 'react';
import CsvUpload from '@/components/CsvUpload';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Upload: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Upload Scheme Data</h1>
        
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-800">Important Notes for Uploading</h3>
                <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
                  <li>Ensure your CSV or XLSX file has the correct column headers</li>
                  <li>Required fields: Farmer Registration Number, Name of Beneficiary, Block Name, District Name</li>
                  <li>Maximum file size: 10MB</li>
                  <li>If upload fails, check your internet connection or try a smaller file</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Info className="text-blue-500 h-5 w-5 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-blue-800">Expected File Format</h3>
                <p className="text-sm text-blue-700 mt-1 mb-2">
                  Your file should contain these column headers (exact matching is required):
                </p>
                <div className="bg-white rounded p-2 overflow-x-auto text-xs text-blue-800">
                  <code>
                    Farmer Registration Number, Name of Beneficiary, Beneficiary Type, Farmer Category, Sex, Farmer Status, 
                    Epic Number, Aadhar Number, Enrollment Number, District Name, Block Name, Gram Panchayet, Mouza Name...
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CsvUpload />
      </div>
    </div>
  );
};

export default Upload;
