
import { FarmerData, ProcessedData, BlockData } from "../../types";
import { toast } from "sonner";
import { determineRegistrationStage } from "./helpers";

// Process the raw farmer data into a more usable format
export const processData = (farmers: FarmerData[]): ProcessedData => {
  const blocks: Record<string, BlockData> = {};
  const districts = new Set<string>();

  console.log("Processing data for", farmers.length, "farmers");
  
  // Initialize GST tracking - only using gstSubmittedTotal now
  let gstSubmittedTotal = 0;
  
  // Validate farmers array
  if (!Array.isArray(farmers) || farmers.length === 0) {
    toast.error('No valid data found to process');
    return { blocks: {}, districts: [], allFarmers: [], gstSubmittedTotal: 0 };
  }

  // Debug: check if farmers have the expected properties
  const firstFarmer = farmers[0];
  console.log("Sample farmer data:", Object.keys(firstFarmer).join(", ").substring(0, 100) + "...");

  // Initialize data structure
  farmers.forEach((farmer) => {
    const blockName = farmer["Block Name"];
    const districtName = farmer["District Name"];
    
    // Add district to set if it exists
    if (districtName) {
      districts.add(districtName);
    }
    
    // Skip entries without block name
    if (!blockName) {
      return;
    }
    
    // Initialize block if it doesn't exist
    if (!blocks[blockName]) {
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
  });

  console.log(`Processed data: ${Object.keys(blocks).length} blocks, ${Array.from(districts).length} districts`);

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
