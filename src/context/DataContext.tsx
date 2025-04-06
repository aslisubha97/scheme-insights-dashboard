
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FarmerData, ProcessedData } from '../types';
import { parseCSV, processData } from '../utils/csvParser';
import { toast } from 'sonner';

interface DataContextType {
  rawData: FarmerData[];
  processedData: ProcessedData | null;
  loading: boolean;
  selectedDistrict: string;
  uploadCSV: (file: File) => Promise<void>;
  exportData: (fileName?: string) => void;
  filterByDistrict: (district: string) => void;
}

const initialProcessedData: ProcessedData = {
  blocks: {},
  allFarmers: [],
  districts: []
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [rawData, setRawData] = useState<FarmerData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Upload and process CSV file
  const uploadCSV = async (file: File) => {
    try {
      setLoading(true);
      toast.info('Processing CSV file...');
      
      const parsedData = await parseCSV(file);
      setRawData(parsedData);
      
      const processed = processData(parsedData);
      setProcessedData(processed);
      
      toast.success('CSV file processed successfully!');
      
      // Set first district as default if available
      if (processed.districts.length > 0) {
        setSelectedDistrict(processed.districts[0]);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Error processing CSV file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  // Export data to CSV
  const exportData = (fileName?: string) => {
    const link = document.createElement('a');
    const csv = convertToCSV(rawData);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName || 'exported-data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully!');
  };

  // Helper function to convert data to CSV format
  const convertToCSV = (data: FarmerData[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => {
      return Object.values(row)
        .map(value => `"${value}"`) // Wrap in quotes to handle commas in values
        .join(',');
    }).join('\n');
    
    return headers + '\n' + rows;
  };

  // Filter data by district
  const filterByDistrict = (district: string) => {
    setSelectedDistrict(district);
  };

  return (
    <DataContext.Provider
      value={{
        rawData,
        processedData,
        loading,
        selectedDistrict,
        uploadCSV,
        exportData,
        filterByDistrict,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
