
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileX2, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';

const CsvUpload: React.FC = () => {
  const { uploadCSV, loading } = useData();
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file');
        return;
      }
      
      setFile(selectedFile);
      toast.info(`File "${selectedFile.name}" selected`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      await uploadCSV(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Scheme Data</CardTitle>
        <CardDescription>
          Upload a CSV file containing PMKSY and BKSY scheme data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="flex flex-col items-center">
              <FileCheck2 className="h-10 w-10 text-green-500 mb-2" />
              <p className="font-medium text-lg">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-primary mb-2" />
              <p className="font-medium">Drop the CSV file here</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="font-medium">Drag & drop a CSV file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">
                Only CSV files are supported
              </p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <FileCheck2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">File ready to upload</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <FileX2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="bg-scheme-pmksy hover:bg-scheme-pmksy/90"
        >
          {loading ? 'Processing...' : 'Upload & Process CSV'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CsvUpload;
