
# Deployment Guide for PMKSY-BKSY Scheme Dashboard

This guide will help you deploy this React application to a cPanel hosting environment with MySQL database setup.

## Prerequisites

- cPanel hosting account with:
  - File Manager access
  - PHP support (7.2 or later recommended)
  - PHPMyAdmin access
  - MySQL database
  - Node.js support (for building the React application)

## Step 1: Build the React Application

Before uploading to your cPanel hosting, you need to create a production build of your application:

```bash
# Install dependencies
npm install

# Create a production build
npm run build
```

This will create a `dist` folder containing optimized static files ready for deployment.

## Step 2: Database Setup with PHPMyAdmin

1. Log in to cPanel and access PHPMyAdmin
2. Create a new database (e.g., `pmksy_bksy_db`)
3. Create a new MySQL user and assign it to the database with appropriate permissions
4. Import the `schema.sql` file provided with this project to set up the required tables

## Step 3: Configure API Endpoints

1. Edit the `api/db-config.php` file and update the MySQL credentials:
   ```php
   $host = 'localhost'; 
   $db_name = 'your_database_name'; // Update this
   $username = 'your_db_username';  // Update this
   $password = 'your_db_password';  // Update this
   ```

2. Upload the PHP files from the `api` folder to your cPanel:
   - `db-config.php`
   - `login.php`
   - `upload-data.php`

## Step 4: Upload Files to cPanel

### Method 1: Using File Manager

1. Log in to cPanel
2. Open File Manager
3. Navigate to your public_html directory (or a subdirectory if you want to deploy to a specific path)
4. Upload the contents of the `dist` folder (not the folder itself)
5. Upload the `api` directory containing the PHP files

### Method 2: Using FTP

1. Use an FTP client (like FileZilla)
2. Connect to your hosting using your cPanel credentials
3. Navigate to public_html directory
4. Upload the contents of the `dist` folder
5. Upload the `api` directory containing the PHP files

## Step 5: Configure .htaccess for React Router

Create or edit the .htaccess file in your public_html directory (or wherever you uploaded the files) with the following content:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite API calls
  RewriteRule ^api/ - [L]
  
  # Don't rewrite files or directories that exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>
```

This configuration ensures that API calls go to the PHP files while React Router handles client-side routing.

## Step 6: Update API Endpoints (if needed)

If you're not deploying to the root of your domain (e.g., deploying to a subdomain or subfolder), you'll need to update the API endpoint URLs in the React application. Look for `api/` references in the code and update them accordingly.

## Step 7: Upload Logo

Upload your logo image file to the `public` directory and ensure it's named `logo.png`. If you use a different filename, update the reference in the Sidebar component.

## Step 8: Testing

1. Visit your website URL to confirm everything is working properly
2. Try logging in with the default credentials:
   - Username: admin
   - Password: admin
3. Test file upload functionality with both CSV and XLSX files
4. Verify that data persists after page refreshes

## Troubleshooting

- **Blank Page**: Check if the .htaccess configuration is working properly
- **API Error**: Check PHP error logs in cPanel and verify database credentials
- **File Upload Issues**: Verify PHP file upload limits in php.ini (max_file_size, post_max_size)
- **Database Connection Errors**: Verify database credentials and check if the user has proper permissions
- **CORS Issues**: If accessing the API from a different domain, you may need to update CORS headers in the PHP files

## Security Considerations

- Change the default admin password immediately after deployment
- Use proper password hashing in production (update the login.php file)
- Set proper file permissions (typically 644 for files and 755 for directories)
- Consider implementing rate limiting for login attempts
- Use HTTPS to encrypt data in transit
