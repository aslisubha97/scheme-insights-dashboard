
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileX2, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CsvUpload: React.FC = () => {
  const { uploadCSV, loading } = useData();
  const [file, setFile] = useState<File | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect non-authenticated users
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Login required to access upload functionality');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (
        fileType === 'text/csv' || 
        fileExt === 'csv' || 
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        fileExt === 'xlsx'
      ) {
        console.log(`File selected: ${selectedFile.name}, type: ${fileType}, extension: ${fileExt}`);
        setFile(selectedFile);
        toast.info(`File "${selectedFile.name}" selected`);
      } else {
        console.log(`Invalid file type: ${fileType}, extension: ${fileExt}`);
        toast.error('Please upload a valid CSV or XLSX file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      console.log(`Uploading file: ${file.name}, type: ${file.type}`);
      await uploadCSV(file);
      navigate('/'); // Redirect to home page after successful upload
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render if not authenticated
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Scheme Data</CardTitle>
        <CardDescription>
          Upload a CSV or XLSX file containing PMKSY and BKSY scheme data
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
              <p className="font-medium">Drop the file here</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="font-medium">Drag & drop a CSV or XLSX file here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">
                Only CSV and XLSX files are supported
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
          {loading ? 'Processing...' : 'Upload & Process File'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CsvUpload;
