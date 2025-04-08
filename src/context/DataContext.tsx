
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
    // Load saved data on component mount
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // First try to fetch from API
        const response = await fetch('/api/blocks');
        
        if (response.ok) {
          const apiData = await response.json();
          setProcessedData(apiData);
          // Save to localStorage as backup
          localStorage.setItem('pmksy_bksy_data', JSON.stringify(apiData));
        } else {
          // If API fails, try loading from localStorage
          const savedData = loadSavedData();
          if (savedData) {
            setProcessedData(savedData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Try loading from localStorage as fallback
        const savedData = loadSavedData();
        if (savedData) {
          setProcessedData(savedData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const uploadCSV = async (file: File) => {
    setLoading(true);
    try {
      // Use the server API endpoint for upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const result = await response.json();
      toast.success(result.message || 'File uploaded successfully');
      
      // Fetch updated data after successful upload
      const dataResponse = await fetch('/api/blocks');
      if (dataResponse.ok) {
        const apiData = await dataResponse.json();
        setProcessedData(apiData);
        // Save to localStorage as backup
        localStorage.setItem('pmksy_bksy_data', JSON.stringify(apiData));
        return;
      }
      
      // If API data fetch fails, fallback to client-side processing
      const parsedData = await parseCSV(file);
      if (parsedData && parsedData.length > 0) {
        const processed = processData(parsedData);
        setProcessedData(processed);
        toast.success(`Successfully processed ${parsedData.length} records`);
      } else {
        toast.error('No data found in the uploaded file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process the file');
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
