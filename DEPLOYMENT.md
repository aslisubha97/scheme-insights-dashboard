
# Deployment Guide for PMKSY-BKSY Scheme Dashboard

This guide will help you deploy this React application to a cPanel hosting environment.

## Prerequisites

- cPanel hosting account with:
  - File Manager access
  - PHPMyAdmin access
  - Node.js support (check with your hosting provider)

## Step 1: Build the React Application

Before uploading to your cPanel hosting, you need to create a production build of your application:

```bash
# Install dependencies (if you haven't already)
npm install

# Create a production build
npm run build
```

This will create a `dist` folder containing optimized static files ready for deployment.

## Step 2: Database Setup with PHPMyAdmin

If your application needs a database:

1. Log in to cPanel and access PHPMyAdmin
2. Create a new database (e.g., `pmksy_bksy_db`)
3. Create a new user with appropriate permissions
4. Import any initial SQL data if needed

Note: The current implementation uses client-side parsing and state management, so a database may not be necessary unless you want to store uploaded CSV data persistently.

## Step 3: Upload Files to cPanel

### Method 1: Using File Manager

1. Log in to cPanel
2. Open File Manager
3. Navigate to your public_html directory (or a subdirectory if you want to deploy to a specific path)
4. Upload the contents of the `dist` folder (not the folder itself)

### Method 2: Using FTP

1. Use an FTP client (like FileZilla)
2. Connect to your hosting using your cPanel credentials
3. Navigate to public_html directory
4. Upload the contents of the `dist` folder

## Step 4: Configure .htaccess for React Router

Create or edit the .htaccess file in your public_html directory (or wherever you uploaded the files) with the following content:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This configuration is necessary for React Router to work properly with client-side routing.

## Step 5: Testing

Visit your website URL to confirm everything is working properly. If you encounter any issues:

1. Check the browser console for errors
2. Review cPanel error logs
3. Ensure all file permissions are set correctly (typically 644 for files and 755 for directories)

## Additional Notes

- This application is a Single Page Application (SPA) that runs entirely in the browser
- No server-side PHP code is required for the core functionality
- The application processes CSV data in the browser, so large files might affect performance
- Consider implementing a backend API if you need to process very large datasets

## Troubleshooting

- If you see a blank page, check if the .htaccess configuration is working properly
- If assets don't load, check if the paths in the built files match your deployment path
- For database connection issues, verify your connection credentials

