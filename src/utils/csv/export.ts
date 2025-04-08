
import Papa from "papaparse";
import { FarmerData } from "../../types";

// Field definition for CSV export
export interface CSVField {
  header: string;
  key: keyof FarmerData;
}

// Export data to CSV with optional field selection
export const exportToCSV = (
  data: FarmerData[], 
  fileName: string = 'export.csv',
  fields?: CSVField[]
) => {
  let csvData: any[];
  
  if (fields) {
    // Use the specified fields only
    csvData = data.map(item => {
      const row: Record<string, any> = {};
      fields.forEach(field => {
        row[field.header] = item[field.key];
      });
      return row;
    });
  } else {
    // Use all fields
    csvData = data;
  }
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
