
import React from 'react';
import CsvUpload from '@/components/CsvUpload';

const Upload: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Scheme Data</h1>
        <CsvUpload />
      </div>
    </div>
  );
};

export default Upload;
