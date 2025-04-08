
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FarmerData } from "../../types";
import { toast } from "sonner";

// Parse CSV file data
export const parseCSV = (file: File): Promise<FarmerData[]> => {
  return new Promise((resolve, reject) => {
    try {
      if (file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' || 
          (file.type === 'application/octet-stream' && 
           (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')))) {
        // Handle XLSX files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            if (!data) {
              reject(new Error("Failed to read file data"));
              return;
            }
            
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            // Log success for debugging
            console.log(`Successfully parsed XLSX file with ${jsonData.length} records`);
            if (jsonData.length > 0) {
              console.log("Sample headers:", Object.keys(jsonData[0]).join(", ").substring(0, 100) + "...");
            }
            
            resolve(jsonData as FarmerData[]);
          } catch (error) {
            console.error("XLSX parsing error:", error);
            reject(new Error(`XLSX parsing error: ${error instanceof Error ? error.message : String(error)}`));
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(new Error("Failed to read file"));
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Handle CSV files
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`Successfully parsed CSV file with ${results.data.length} records`);
            if (results.data.length > 0) {
              console.log("Sample headers:", Object.keys(results.data[0]).join(", ").substring(0, 100) + "...");
            }
            
            if (results.errors.length > 0) {
              console.warn("CSV parsing had some errors:", results.errors);
              toast.warning(`CSV parsed with ${results.errors.length} warnings. Some data might be incomplete.`);
            }
            
            resolve(results.data as FarmerData[]);
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            reject(new Error(`CSV parsing error: ${error.message}`));
          },
          transformHeader: (header) => {
            // Trim headers to handle extra spaces
            return header.trim();
          }
        });
      }
    } catch (error) {
      console.error("Unexpected error in parseCSV:", error);
      reject(new Error(`File parsing failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
};
