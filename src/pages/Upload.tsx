
import React from 'react';
import CsvUpload from '@/components/CsvUpload';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

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
        
        <CsvUpload />
      </div>
    </div>
  );
};

export default Upload;
