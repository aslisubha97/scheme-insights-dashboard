
import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseCSV, processData, loadSavedData } from '@/utils/csvParser';
import { FarmerData, ProcessedData } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  processedData: ProcessedData | null;
  isLoading: boolean;
  uploadCSV: (file: File) => Promise<void>;
  loading: boolean;
  selectedDistrict: string;
  filterByDistrict: (district: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load saved data on component mount
    const savedData = loadSavedData();
    if (savedData) {
      setProcessedData(savedData);
    }
    setIsLoading(false);
  }, []);

  const uploadCSV = async (file: File) => {
    setLoading(true);
    try {
      const parsedData = await parseCSV(file);
      if (parsedData && parsedData.length > 0) {
        const processed = processData(parsedData);
        setProcessedData(processed);
        toast.success(`Successfully processed ${parsedData.length} records`);
      } else {
        toast.error('No data found in the uploaded file');
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to process the file');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filterByDistrict = (district: string) => {
    setSelectedDistrict(district);
  };

  return (
    <DataContext.Provider 
      value={{ 
        processedData, 
        isLoading, 
        uploadCSV, 
        loading,
        selectedDistrict,
        filterByDistrict
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
