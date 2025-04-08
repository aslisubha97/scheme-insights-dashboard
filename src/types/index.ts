
// Define the type for farmer data from CSV
export interface FarmerData {
  'Farmer Registration Number': string;
  'Name of Beneficiary': string;
  'Beneficiary Type': string;
  'Farmer Category': string;
  'Sex': string;
  'Farmer Status': string;
  'Epic Number': string;
  'Aadhar Number': string;
  'Enrollment Number': string;
  'District Name': string;
  'Block Name': string;
  'Gram Panchayet': string;
  'Mouza Name': string;
  'Police Station': string;
  'Post Office': string;
  'Sub Division': string;
  'Pincode': string;
  'Mobile No': string;
  'Irrigation Type': string;
  'Irrigation Area': string;
  'Crop Type': string;
  'Crop Spacing': string;
  'Is Pump Available': string;
  'Pump Type': string;
  'Pump Capacity': string;
  'Indicative Cost': string;
  'Water Source': string;
  'Other Water Source': string;
  'Registration Date': string;
  'Current Status': string;
  'DLIC Number': string;
  'DLIC Date': string;
  'Quotation No': string;
  'Quotation Date': string;
  'Total Amount': string;
  'PMKSY Subsidy': string;
  'BKSY Subsidy': string;
  'GST Amount': string;
  'Farmers Share': string;
  'PMKSY Subsidy (Addl. Item)': string;
  'BKSY Subsidy (Addl. Item)': string;
  'GST Amount (Addl. Item)': string;
  'Farmers Share (Addl. Item)': string;
  'Total Subsidy': string;
  'Total Farmer Share': string;
  'Paid By Farmer': string;
  'Type of Payment': string;
  'Payment Reference': string;
  'Payment Date': string;
  'Joint Insp. Date': string;
  'Quot. Approval Date': string;
  'Work Order Date': string;
  'Work Order Memo': string;
  'Inspection Date': string;
  'Installation Date': string;
  'Bill No.': string;
  'Tax Inv. No.': string;
  'Bill Date': string;
  'Approved on': string;
  'PMKSY Amount Paid': string;
  'PMKSY CGST': string;
  'PMKSY SGST': string;
  'PMKSY TDS': string;
  'PMKSY Released On': string;
  'PMKSY Transaction Ref.': string;
  'PMKSY Transaction Date': string;
  'PMKSY Paid By': string;
  'BKSY Amount Paid': string;
  'BKSY CGST': string;
  'BKSY SGST': string;
  'BKSY TDS': string;
  'BKSY Released On': string;
  'BKSY Transaction Ref.': string;
  'BKSY Transaction Date': string;
  'BKSY Paid By': string;
  'Doc. Upload Status': string;
}

// Type for registration stage counts
export interface RegistrationStages {
  total: number;
  newRegistration: number;
  jointInspection: number;
  workOrder: number;
  install: number;
  installAndInspection: number;
}

// Type for block-wise data
export interface BlockData {
  blockName: string;
  registrationStages: RegistrationStages;
  financialData: {
    pmksy: {
      totalPaid: number;
      cgst: number;
      sgst: number;
      tds: number;
      commission?: number;
    };
    bksy: {
      totalPaid: number;
      cgst: number;
      sgst: number;
      tds: number;
      commission?: number;
    };
    gstSubmitted: number;
    invoicesDue: number;
  };
  farmers: FarmerData[];
}

// Type for processed data
export interface ProcessedData {
  blocks: Record<string, BlockData>;
  allFarmers: FarmerData[];
  districts: string[];
  gstSubmittedTotal?: number;
}

// User types for authentication
export interface User {
  username: string;
  role: 'admin' | 'pmksy';
  password?: string; // Only used in the backend, not stored in frontend
}
