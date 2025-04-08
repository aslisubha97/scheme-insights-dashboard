import { FarmerData, ProcessedData, BlockData } from "../types";
import Papa from "papaparse";
import * as XLSX from "xlsx";
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

// Helper function to determine registration stage
const determineRegistrationStage = (farmer: FarmerData): string => {
  const status = farmer["Current Status"]?.toLowerCase() || "";
  
  // First check the Current Status field for more accurate stage determination
  if (status.includes("install") && status.includes("inspect")) {
    return "installAndInspection";
  } else if (status.includes("install")) {
    return "install";
  } else if (status.includes("work order")) {
    return "workOrder";
  } else if (status.includes("joint inspection")) {
    return "jointInspection";
  } else if (status.includes("new registration") || status.includes("registration")) {
    return "newRegistration";
  }
  
  // If Current Status doesn't give clear indication, fall back to date fields
  if (farmer["Installation Date"] && farmer["Inspection Date"]) {
    return "installAndInspection";
  } else if (farmer["Installation Date"]) {
    return "install";
  } else if (farmer["Work Order Date"]) {
    return "workOrder";
  } else if (farmer["Joint Insp. Date"]) {
    return "jointInspection";
  } else {
    return "newRegistration";
  }
};

// Process the raw farmer data into a more usable format
export const processData = (farmers: FarmerData[]): ProcessedData => {
  const blocks: Record<string, BlockData> = {};
  const districts = new Set<string>();
  
  // Initialize GST tracking - only using gstSubmittedTotal now
  let gstSubmittedTotal = 0;

  // Initialize data structure
  farmers.forEach((farmer) => {
    const blockName = farmer["Block Name"];
    const districtName = farmer["District Name"];
    
    // Add district to set
    if (districtName) {
      districts.add(districtName);
    }
    
    // Initialize block if it doesn't exist
    if (blockName && !blocks[blockName]) {
      blocks[blockName] = {
        blockName,
        registrationStages: {
          total: 0,
          newRegistration: 0,
          jointInspection: 0,
          workOrder: 0,
          install: 0,
          installAndInspection: 0,
        },
        financialData: {
          pmksy: {
            totalPaid: 0,
            cgst: 0,
            sgst: 0,
            tds: 0,
          },
          bksy: {
            totalPaid: 0,
            cgst: 0,
            sgst: 0,
            tds: 0,
          },
          gstSubmitted: 0,
          invoicesDue: 0,
        },
        farmers: [],
      };
    }

    // Add farmer to block
    if (blockName) {
      blocks[blockName].farmers.push(farmer);
      
      // Count total farmers in block
      blocks[blockName].registrationStages.total += 1;
      
      // Determine stage and increment appropriate counter
      const stage = determineRegistrationStage(farmer);
      blocks[blockName].registrationStages[stage] += 1;
      
      // Process GST data - collect all GST amounts
      if (["workOrder", "install", "installAndInspection"].includes(stage)) {
        const gstAmount = parseFloat(farmer["GST Amount"] || "0");
        const gstAdditional = parseFloat(farmer["GST Amount (Addl. Item)"] || "0");
        const totalGST = gstAmount + gstAdditional;
        
        // All GST amounts are considered "submitted" for the dashboard
        blocks[blockName].financialData.gstSubmitted += totalGST;
        gstSubmittedTotal += totalGST;
        
        // Track invoices due (no tax invoice number)
        const hasTaxInvoice = farmer["Tax Inv. No."] && farmer["Tax Inv. No."].trim() !== "";
        if (!hasTaxInvoice) {
          blocks[blockName].financialData.invoicesDue += 1;
        }
      }
      
      // Process financial data
      const pmksyAmountPaid = parseFloat(farmer["PMKSY Amount Paid"] || "0");
      const pmksyCGST = parseFloat(farmer["PMKSY CGST"] || "0");
      const pmksySGST = parseFloat(farmer["PMKSY SGST"] || "0");
      const pmksyTDS = parseFloat(farmer["PMKSY TDS"] || "0");
      
      const bksyAmountPaid = parseFloat(farmer["BKSY Amount Paid"] || "0");
      const bksyCGST = parseFloat(farmer["BKSY CGST"] || "0");
      const bksySGST = parseFloat(farmer["BKSY SGST"] || "0");
      const bksyTDS = parseFloat(farmer["BKSY TDS"] || "0");
      
      // Add financial data to block totals
      blocks[blockName].financialData.pmksy.totalPaid += pmksyAmountPaid;
      blocks[blockName].financialData.pmksy.cgst += pmksyCGST;
      blocks[blockName].financialData.pmksy.sgst += pmksySGST;
      blocks[blockName].financialData.pmksy.tds += pmksyTDS;
      
      blocks[blockName].financialData.bksy.totalPaid += bksyAmountPaid;
      blocks[blockName].financialData.bksy.cgst += bksyCGST;
      blocks[blockName].financialData.bksy.sgst += bksySGST;
      blocks[blockName].financialData.bksy.tds += bksyTDS;
    }
  });

  // Save to localStorage for persistence
  try {
    localStorage.setItem('pmksy_bksy_data', JSON.stringify({
      blocks,
      allFarmers: farmers,
      districts: Array.from(districts),
      gstSubmittedTotal
    }));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    toast.error('Failed to save data locally. Data might not persist after page refresh.');
  }

  return {
    blocks,
    allFarmers: farmers,
    districts: Array.from(districts),
    gstSubmittedTotal
  };
};

// Field definition for CSV export
interface CSVField {
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

// Function to load data from localStorage
export const loadSavedData = (): ProcessedData | null => {
  try {
    const savedData = localStorage.getItem('pmksy_bksy_data');
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error loading saved data:', error);
    return null;
  }
};
