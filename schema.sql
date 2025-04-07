
-- Database schema for PMKSY-BKSY Portal

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pmksy_bksy_db;

USE pmksy_bksy_db;

-- Create the farmers table to store all CSV/XLSX data
CREATE TABLE IF NOT EXISTS farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_registration_number VARCHAR(50),
  beneficiary_name VARCHAR(100),
  beneficiary_type VARCHAR(50),
  farmer_category VARCHAR(50),
  sex VARCHAR(10),
  farmer_status VARCHAR(50),
  epic_number VARCHAR(50),
  aadhar_number VARCHAR(20),
  enrollment_number VARCHAR(50),
  district_name VARCHAR(100),
  block_name VARCHAR(100),
  gram_panchayet VARCHAR(100),
  mouza_name VARCHAR(100),
  police_station VARCHAR(100),
  post_office VARCHAR(100),
  sub_division VARCHAR(100),
  pincode VARCHAR(10),
  mobile_no VARCHAR(15),
  irrigation_type VARCHAR(50),
  irrigation_area DECIMAL(10,2),
  crop_type VARCHAR(50),
  crop_spacing VARCHAR(50),
  is_pump_available VARCHAR(10),
  pump_type VARCHAR(50),
  pump_capacity VARCHAR(50),
  indicative_cost DECIMAL(10,2),
  water_source VARCHAR(50),
  other_water_source VARCHAR(100),
  registration_date DATE,
  current_status VARCHAR(100),
  dlic_number VARCHAR(50),
  dlic_date DATE,
  quotation_no VARCHAR(50),
  quotation_date DATE,
  total_amount DECIMAL(10,2),
  pmksy_subsidy DECIMAL(10,2),
  bksy_subsidy DECIMAL(10,2),
  gst_amount DECIMAL(10,2),
  farmers_share DECIMAL(10,2),
  pmksy_subsidy_addl DECIMAL(10,2),
  bksy_subsidy_addl DECIMAL(10,2),
  gst_amount_addl DECIMAL(10,2),
  farmers_share_addl DECIMAL(10,2),
  total_subsidy DECIMAL(10,2),
  total_farmer_share DECIMAL(10,2),
  paid_by_farmer DECIMAL(10,2),
  type_of_payment VARCHAR(50),
  payment_reference VARCHAR(100),
  payment_date DATE,
  joint_insp_date DATE,
  quot_approval_date DATE,
  work_order_date DATE,
  work_order_memo VARCHAR(100),
  inspection_date DATE,
  installation_date DATE,
  bill_no VARCHAR(50),
  tax_inv_no VARCHAR(50),
  bill_date DATE,
  approved_on DATE,
  pmksy_amount_paid DECIMAL(10,2),
  pmksy_cgst DECIMAL(10,2),
  pmksy_sgst DECIMAL(10,2),
  pmksy_tds DECIMAL(10,2),
  pmksy_released_on DATE,
  pmksy_transaction_ref VARCHAR(100),
  pmksy_transaction_date DATE,
  pmksy_paid_by VARCHAR(100),
  bksy_amount_paid DECIMAL(10,2),
  bksy_cgst DECIMAL(10,2),
  bksy_sgst DECIMAL(10,2),
  bksy_tds DECIMAL(10,2),
  bksy_released_on DATE,
  bksy_transaction_ref VARCHAR(100),
  bksy_transaction_date DATE,
  bksy_paid_by VARCHAR(100),
  doc_upload_status VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create a user table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Insert default admin user (username: admin, password: admin)
-- In a production environment, use a properly hashed password
INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin')
ON DUPLICATE KEY UPDATE username = 'admin';
