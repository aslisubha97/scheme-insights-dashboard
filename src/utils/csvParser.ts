
import { FarmerData, ProcessedData, BlockData } from "../types";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Parse CSV file data
export const parseCSV = (file: File): Promise<FarmerData[]> => {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.xlsx')) {
      // Handle XLSX files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as FarmerData[]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    } else {
      // Handle CSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as FarmerData[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    }
  });
};

// Helper function to determine registration stage
const determineRegistrationStage = (farmer: FarmerData): string => {
  const status = farmer["Current Status"]?.toLowerCase() || "";
  
  if (status.includes("inspection") && farmer["Installation Date"] && farmer["Inspection Date"]) {
    return "installAndInspection";
  } else if (status.includes("install") || farmer["Installation Date"]) {
    return "install";
  } else if (status.includes("work order") || farmer["Work Order Date"]) {
    return "workOrder";
  } else if (status.includes("joint inspection") || farmer["Joint Insp. Date"]) {
    return "jointInspection";
  } else {
    return "newRegistration";
  }
};

// Process the raw farmer data into a more usable format
export const processData = (farmers: FarmerData[]): ProcessedData => {
  const blocks: Record<string, BlockData> = {};
  const districts = new Set<string>();
  
  // Initialize GST tracking
  let gstDueTotal = 0;
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
          gstDue: 0,
          gstSubmitted: 0,
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
      
      // Process GST data - only for work order, install, and install & inspection stages
      if (["workOrder", "install", "installAndInspection"].includes(stage)) {
        const gstAmount = parseFloat(farmer["GST Amount"] || "0");
        const gstAdditional = parseFloat(farmer["GST Amount (Addl. Item)"] || "0");
        const totalGST = gstAmount + gstAdditional;
        
        // Check if Tax Invoice Number exists
        if (farmer["Tax Inv. No."]?.trim()) {
          blocks[blockName].financialData.gstSubmitted += totalGST;
          gstSubmittedTotal += totalGST;
        } else {
          blocks[blockName].financialData.gstDue += totalGST;
          gstDueTotal += totalGST;
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
      gstDueTotal,
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
    gstDueTotal,
    gstSubmittedTotal
  };
};

// Export data to CSV
export const exportToCSV = (data: FarmerData[], fileName: string = 'export.csv') => {
  const csv = Papa.unparse(data);
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
