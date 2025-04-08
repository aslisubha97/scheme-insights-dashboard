
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FarmerData } from "../../types";
import { toast } from "sonner";

// Parse CSV file data
export const parseCSV = (file: File): Promise<FarmerData[]> => {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Log success for debugging
          console.log(`Successfully parsed XLSX file with ${jsonData.length} records`);
          resolve(jsonData as FarmerData[]);
        } catch (error) {
          console.error("XLSX parsing error:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle CSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Successfully parsed CSV file with ${results.data.length} records`);
          resolve(results.data as FarmerData[]);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          reject(error);
        },
      });
    }
  });
};
