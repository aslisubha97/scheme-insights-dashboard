
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const Papa = require('papaparse');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'pmksy_user',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  database: process.env.DB_NAME || 'pmksy_bksy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed!'));
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'pmksy_bksy_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Admin role check middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Parse CSV/XLSX file
function parseFile(filePath, fileType) {
  return new Promise((resolve, reject) => {
    if (fileType === 'csv') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('Unsupported file format'));
    }
  });
}

// Validate farmer data
function validateFarmerData(farmer) {
  const requiredFields = [
    'Farmer Registration Number',
    'Name of Beneficiary',
    'Block Name',
    'District Name'
  ];
  
  const missingFields = requiredFields.filter(field => !farmer[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
}

// API Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // In production, you'd get this from the database with hashed passwords
    const users = [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'pmksy', password: 'pmksy', role: 'pmksy' }
    ];
    
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create and sign a JWT token
    const token = jwt.sign(
      { id: username, role: user.role }, 
      process.env.JWT_SECRET || 'pmksy_bksy_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token,
      user: { username: user.username, role: user.role }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const fileType = fileExtension === '.csv' ? 'csv' : 'xlsx';
    
    // Parse the file
    const farmers = await parseFile(filePath, fileType);
    
    if (!farmers || farmers.length === 0) {
      return res.status(400).json({ error: 'The file contains no data' });
    }
    
    // Validate each farmer
    const validationErrors = [];
    farmers.forEach((farmer, index) => {
      const validation = validateFarmerData(farmer);
      if (!validation.valid) {
        validationErrors.push(`Row ${index + 2}: ${validation.error}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors in the uploaded file',
        details: validationErrors
      });
    }
    
    // Start a transaction to replace existing data
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Clear existing data
      await connection.query('TRUNCATE TABLE farmers');
      
      // Prepare batch insert
      const values = farmers.map(farmer => {
        // Convert flat object to array of values matching the DB columns
        // Note: You'll need to map CSV columns to DB columns
        return [
          farmer["Farmer Registration Number"] || null,
          farmer["Name of Beneficiary"] || null,
          farmer["Beneficiary Type"] || null,
          farmer["Farmer Category"] || null,
          farmer["Sex"] || null,
          farmer["Farmer Status"] || null,
          farmer["Epic Number"] || null,
          farmer["Aadhar Number"] || null,
          farmer["Enrollment Number"] || null,
          farmer["District Name"] || null,
          farmer["Block Name"] || null,
          farmer["Gram Panchayet"] || null,
          farmer["Mouza Name"] || null,
          farmer["Police Station"] || null,
          farmer["Post Office"] || null,
          farmer["Sub Division"] || null,
          farmer["Pincode"] || null,
          farmer["Mobile No"] || null,
          farmer["Irrigation Type"] || null,
          farmer["Irrigation Area"] || null,
          farmer["Crop Type"] || null,
          farmer["Crop Spacing"] || null,
          farmer["Is Pump Available"] || null,
          farmer["Pump Type"] || null,
          farmer["Pump Capacity"] || null,
          farmer["Indicative Cost"] || null,
          farmer["Water Source"] || null,
          farmer["Other Water Source"] || null,
          farmer["Registration Date"] || null,
          farmer["Current Status"] || null,
          farmer["DLIC Number"] || null,
          farmer["DLIC Date"] || null,
          farmer["Quotation No"] || null,
          farmer["Quotation Date"] || null,
          farmer["Total Amount"] || null,
          farmer["PMKSY Subsidy"] || null,
          farmer["BKSY Subsidy"] || null,
          farmer["GST Amount"] || null,
          farmer["Farmers Share"] || null,
          farmer["PMKSY Subsidy (Addl. Item)"] || null,
          farmer["BKSY Subsidy (Addl. Item)"] || null,
          farmer["GST Amount (Addl. Item)"] || null,
          farmer["Farmers Share (Addl. Item)"] || null,
          farmer["Total Subsidy"] || null,
          farmer["Total Farmer Share"] || null,
          farmer["Paid By Farmer"] || null,
          farmer["Type of Payment"] || null,
          farmer["Payment Reference"] || null,
          farmer["Payment Date"] || null,
          farmer["Joint Insp. Date"] || null,
          farmer["Quot. Approval Date"] || null,
          farmer["Work Order Date"] || null,
          farmer["Work Order Memo"] || null,
          farmer["Inspection Date"] || null,
          farmer["Installation Date"] || null,
          farmer["Bill No."] || null,
          farmer["Tax Inv. No."] || null,
          farmer["Bill Date"] || null,
          farmer["Approved on"] || null,
          farmer["PMKSY Amount Paid"] || null,
          farmer["PMKSY CGST"] || null,
          farmer["PMKSY SGST"] || null,
          farmer["PMKSY TDS"] || null,
          farmer["PMKSY Released On"] || null,
          farmer["PMKSY Transaction Ref."] || null,
          farmer["PMKSY Transaction Date"] || null,
          farmer["PMKSY Paid By"] || null,
          farmer["BKSY Amount Paid"] || null,
          farmer["BKSY CGST"] || null,
          farmer["BKSY SGST"] || null,
          farmer["BKSY TDS"] || null,
          farmer["BKSY Released On"] || null,
          farmer["BKSY Transaction Ref."] || null,
          farmer["BKSY Transaction Date"] || null,
          farmer["BKSY Paid By"] || null,
          farmer["Doc. Upload Status"] || null
        ];
      });
      
      // Build placeholder string for SQL query (?,?,?...)
      const placeholders = Array(farmers[0] ? Object.keys(farmers[0]).length : 0).fill('?').join(',');
      
      // Insert batch
      await connection.query(
        `INSERT INTO farmers (
          farmer_registration_number, beneficiary_name, beneficiary_type, farmer_category,
          sex, farmer_status, epic_number, aadhar_number, enrollment_number, district_name,
          block_name, gram_panchayet, mouza_name, police_station, post_office, sub_division,
          pincode, mobile_no, irrigation_type, irrigation_area, crop_type, crop_spacing,
          is_pump_available, pump_type, pump_capacity, indicative_cost, water_source,
          other_water_source, registration_date, current_status, dlic_number, dlic_date,
          quotation_no, quotation_date, total_amount, pmksy_subsidy, bksy_subsidy,
          gst_amount, farmers_share, pmksy_subsidy_addl, bksy_subsidy_addl, gst_amount_addl,
          farmers_share_addl, total_subsidy, total_farmer_share, paid_by_farmer, type_of_payment,
          payment_reference, payment_date, joint_insp_date, quot_approval_date, work_order_date,
          work_order_memo, inspection_date, installation_date, bill_no, tax_inv_no, bill_date,
          approved_on, pmksy_amount_paid, pmksy_cgst, pmksy_sgst, pmksy_tds, pmksy_released_on,
          pmksy_transaction_ref, pmksy_transaction_date, pmksy_paid_by, bksy_amount_paid,
          bksy_cgst, bksy_sgst, bksy_tds, bksy_released_on, bksy_transaction_ref,
          bksy_transaction_date, bksy_paid_by, doc_upload_status
        ) VALUES ${values.map(() => `(${placeholders})`).join(',')}`,
        values.flat()
      );
      
      await connection.commit();
      
      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);
      
      res.json({ 
        success: true, 
        message: `Successfully processed ${farmers.length} records` 
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Error processing file', details: error.message });
    
    // Clean up the file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// Get farmer data endpoint
app.get('/api/farmers', authenticateToken, async (req, res) => {
  try {
    const [farmers] = await dbPool.query('SELECT * FROM farmers');
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

// Get block-wise data endpoint
app.get('/api/blocks', authenticateToken, async (req, res) => {
  try {
    const [farmers] = await dbPool.query('SELECT * FROM farmers');
    
    // Process the data similar to your frontend logic
    const blocks = {};
    const districts = new Set();
    let gstSubmittedTotal = 0;
    
    farmers.forEach(farmer => {
      const blockName = farmer.block_name;
      const districtName = farmer.district_name;
      
      if (districtName) {
        districts.add(districtName);
      }
      
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
              commission: 0
            },
            bksy: {
              totalPaid: 0,
              cgst: 0,
              sgst: 0,
              tds: 0,
              commission: 0
            },
            gstSubmitted: 0,
            invoicesDue: 0,
          },
          farmers: [],
        };
      }
      
      // Add farmer to block (don't include sensitive data)
      if (blockName) {
        blocks[blockName].farmers.push(farmer);
        
        // Count total farmers in block
        blocks[blockName].registrationStages.total += 1;
        
        // Determine registration stage
        let stage = 'newRegistration';
        const status = (farmer.current_status || '').toLowerCase();
        
        if (status.includes("install") && status.includes("inspect")) {
          stage = "installAndInspection";
        } else if (status.includes("install")) {
          stage = "install";
        } else if (status.includes("work order")) {
          stage = "workOrder";
        } else if (status.includes("joint inspection")) {
          stage = "jointInspection";
        }
        
        // Update stage count
        blocks[blockName].registrationStages[stage] += 1;
        
        // Process GST data
        if (["workOrder", "install", "installAndInspection"].includes(stage)) {
          const gstAmount = parseFloat(farmer.gst_amount || 0);
          const gstAdditional = parseFloat(farmer.gst_amount_addl || 0);
          const totalGST = gstAmount + gstAdditional;
          
          blocks[blockName].financialData.gstSubmitted += totalGST;
          gstSubmittedTotal += totalGST;
          
          // Track invoices due (no tax invoice number)
          const hasTaxInvoice = farmer.tax_inv_no && farmer.tax_inv_no.trim() !== '';
          if (!hasTaxInvoice) {
            blocks[blockName].financialData.invoicesDue += 1;
          }
        }
        
        // Process financial data
        const pmksyAmountPaid = parseFloat(farmer.pmksy_amount_paid || 0);
        const pmksyCGST = parseFloat(farmer.pmksy_cgst || 0);
        const pmksySGST = parseFloat(farmer.pmksy_sgst || 0);
        const pmksyTDS = parseFloat(farmer.pmksy_tds || 0);
        
        const bksyAmountPaid = parseFloat(farmer.bksy_amount_paid || 0);
        const bksyCGST = parseFloat(farmer.bksy_cgst || 0);
        const bksySGST = parseFloat(farmer.bksy_sgst || 0);
        const bksyTDS = parseFloat(farmer.bksy_tds || 0);
        
        // Add financial data to block totals
        blocks[blockName].financialData.pmksy.totalPaid += pmksyAmountPaid;
        blocks[blockName].financialData.pmksy.cgst += pmksyCGST;
        blocks[blockName].financialData.pmksy.sgst += pmksySGST;
        blocks[blockName].financialData.pmksy.tds += pmksyTDS;
        blocks[blockName].financialData.pmksy.commission = pmksyAmountPaid * 0.22;
        
        blocks[blockName].financialData.bksy.totalPaid += bksyAmountPaid;
        blocks[blockName].financialData.bksy.cgst += bksyCGST;
        blocks[blockName].financialData.bksy.sgst += bksySGST;
        blocks[blockName].financialData.bksy.tds += bksyTDS;
        blocks[blockName].financialData.bksy.commission = bksyAmountPaid * 0.22;
      }
    });
    
    res.json({
      blocks,
      districts: Array.from(districts),
      gstSubmittedTotal
    });
    
  } catch (error) {
    console.error('Error processing block data:', error);
    res.status(500).json({ error: 'Error processing data', details: error.message });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
