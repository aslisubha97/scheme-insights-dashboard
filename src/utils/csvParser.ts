
// Re-export all CSV utilities from a single entry point
import { parseCSV } from './csv/parser';
import { exportToCSV } from './csv/export';
import { processData } from './csv/processor';
import { loadSavedData } from './csv/storage';

// Debug helpers
export const debugCSV = {
  validateHeaders: (headers: string[], expectedHeaders: string[]) => {
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));
    
    return {
      isValid: missingHeaders.length === 0,
      missingHeaders,
      extraHeaders
    };
  },
  
  logFileInfo: (file: File) => {
    console.log(`File details: 
      - Name: ${file.name}
      - Type: ${file.type}
      - Size: ${(file.size / 1024).toFixed(2)} KB
      - Last modified: ${new Date(file.lastModified).toLocaleString()}
    `);
  }
};

export {
  parseCSV,
  exportToCSV,
  processData,
  loadSavedData
};
