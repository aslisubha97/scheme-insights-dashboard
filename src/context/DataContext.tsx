
import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseCSV, processData, loadSavedData } from '@/utils/csvParser';
import { FarmerData, ProcessedData } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface DataContextType {
  processedData: ProcessedData | null;
  isLoading: boolean;
  uploadCSV: (file: File) => Promise<void>;
  loading: boolean;
  selectedDistrict: string;
  filterByDistrict: (district: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Define the API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || window.API_URL || '';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    // Load saved data on component mount
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // First try to fetch from API
        try {
          if (isAuthenticated && token) {
            console.log("Attempting to fetch data from API with token");
            const response = await fetch(`${API_BASE_URL}/api/blocks`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const apiData = await response.json();
              console.log("Successfully fetched data from API", apiData);
              setProcessedData(apiData);
              // Save to localStorage as backup
              localStorage.setItem('pmksy_bksy_data', JSON.stringify(apiData));
              setIsLoading(false);
              return;
            } else {
              console.error("API returned error status:", response.status);
              throw new Error(`API returned error status: ${response.status}`);
            }
          }
        } catch (apiError) {
          console.error('Failed to fetch data from API:', apiError);
          // Continue to fallback
        }
        
        // If API fails, try loading from localStorage
        const savedData = loadSavedData();
        if (savedData) {
          console.log("Using saved data from localStorage");
          setProcessedData(savedData);
        } else {
          console.log("No saved data found in localStorage");
        }
      } catch (error) {
        console.error('All data fetch attempts failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token]);

  const uploadCSV = async (file: File) => {
    setLoading(true);
    try {
      // Handle API upload if authenticated
      if (isAuthenticated && token) {
        try {
          console.log("Attempting to upload file to API", file.name, file.type);
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            console.error("Upload failed with status:", response.status, errorData);
            throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
          }
          
          const result = await response.json();
          toast.success(result.message || 'File uploaded successfully');
          
          // Fetch updated data after successful upload
          const dataResponse = await fetch(`${API_BASE_URL}/api/blocks`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (dataResponse.ok) {
            const apiData = await dataResponse.json();
            setProcessedData(apiData);
            localStorage.setItem('pmksy_bksy_data', JSON.stringify(apiData));
            return;
          } else {
            throw new Error(`Failed to fetch updated data after upload: ${dataResponse.status}`);
          }
        } catch (apiError) {
          console.error("API upload failed:", apiError);
          throw apiError;
        }
      }
      
      // Fallback to client-side processing if not authenticated or API call fails
      console.log("Falling back to client-side processing");
      const parsedData = await parseCSV(file);
      if (parsedData && parsedData.length > 0) {
        const processed = processData(parsedData);
        setProcessedData(processed);
        // Store processed data in localStorage
        localStorage.setItem('pmksy_bksy_data', JSON.stringify(processed));
        toast.success(`Successfully processed ${parsedData.length} records locally`);
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
