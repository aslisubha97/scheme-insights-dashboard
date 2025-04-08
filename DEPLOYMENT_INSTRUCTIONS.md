
# Deployment Instructions for PMKSY-BKSY Scheme Dashboard

This guide provides step-by-step instructions for deploying this React application with a Node.js backend and MySQL database.

## Prerequisites

Before deploying, ensure you have:

- A web hosting service that supports Node.js applications
- Access to a MySQL database server
- Domain name (optional, but recommended)
- SSH access to your hosting server
- Git installed on your local machine
- Node.js (v14 or higher) and npm installed

## Step 1: Clone and Prepare the Repository

1. Clone the repository to your local machine:
   ```bash
   git clone <your-repository-url>
   cd pmksy-bksy-dashboard
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. Create a production build of the React application:
   ```bash
   npm run build
   ```
   This will generate optimized files in the `dist` directory.

## Step 2: Set Up MySQL Database

1. Log in to your MySQL server:
   ```bash
   mysql -u yourusername -p
   ```

2. Create a new database:
   ```sql
   CREATE DATABASE pmksy_bksy;
   ```

3. Create a user and grant privileges:
   ```sql
   CREATE USER 'pmksy_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON pmksy_bksy.* TO 'pmksy_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Import the schema:
   ```bash
   mysql -u pmksy_user -p pmksy_bksy < schema.sql
   ```

## Step 3: Configure the Server Environment

1. Create a `.env` file in the `server` directory by copying the `.env.example`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit the `.env` file and update with your database credentials and other settings:
   ```
   DB_HOST=localhost
   DB_USER=pmksy_user
   DB_PASSWORD=your_secure_password
   DB_NAME=pmksy_bksy
   PORT=3001
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   ```

## Step 4: Deploy to Hosting Server

### Option A: Deploy to a VPS or Dedicated Server

1. Create a deployment directory on your server:
   ```bash
   mkdir -p /var/www/pmksy-bksy
   ```

2. Upload your project files to the server:
   ```bash
   # Using scp
   scp -r dist/* user@your-server:/var/www/pmksy-bksy/
   scp -r server/* user@your-server:/var/www/pmksy-bksy/server/
   scp schema.sql user@your-server:/var/www/pmksy-bksy/
   ```
   
   Alternatively, you can use Git to deploy:
   ```bash
   # On your server
   cd /var/www/pmksy-bksy
   git clone your-repository-url .
   npm install --production
   cd server
   npm install --production
   cd ..
   npm run build
   ```

3. Create the uploads directory for file storage:
   ```bash
   mkdir -p /var/www/pmksy-bksy/uploads
   chmod 755 /var/www/pmksy-bksy/uploads
   ```

4. Install PM2 to manage your Node.js process:
   ```bash
   npm install -g pm2
   ```

5. Start your application with PM2:
   ```bash
   cd /var/www/pmksy-bksy
   pm2 start server/index.js --name pmksy-api
   ```

6. Set up PM2 to start on server boot:
   ```bash
   pm2 startup
   pm2 save
   ```

### Option B: Deploy to cPanel with Node.js Support

1. Log in to your cPanel account.

2. Navigate to the "Setup Node.js App" section.

3. Click "Create Application" and fill in the following details:
   - Node.js version: Select the latest available (minimum v14)
   - Application mode: Production
   - Application root: Create a directory like `pmksy_dashboard`
   - Application URL: Your domain or subdomain
   - Application startup file: `server/index.js`
   - Save the configuration.

4. Upload your files to the directory specified in Application root using File Manager or FTP.

5. In the "Setup Node.js App" section, click on your application, then:
   - Click "Run NPM Install" to install dependencies
   - Click "Restart" to start your application

## Step 5: Configure Nginx as a Reverse Proxy (for VPS/Dedicated Server)

1. Install Nginx if not already installed:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create a new Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/pmksy-bksy
   ```

3. Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Create a symbolic link to enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pmksy-bksy /etc/nginx/sites-enabled/
   ```

5. Test the Nginx configuration:
   ```bash
   sudo nginx -t
   ```

6. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## Step 6: Set Up HTTPS with Let's Encrypt (Recommended)

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain and install an SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. Follow the prompts to complete the process.

4. Certbot will automatically configure Nginx to use HTTPS.

## Step 7: Set Up Authentication

The application comes with two default user accounts:

1. Admin User:
   - Username: admin
   - Password: admin
   - Role: Admin (can view commission data)

2. PMKSY User:
   - Username: pmksy
   - Password: pmksy
   - Role: Regular user (cannot view commission data)

For production, you should modify these credentials in the server/index.js file for better security.

## Step 8: Uploading Data

1. Log in to the application using the admin or pmksy user credentials.
2. Navigate to the Upload page.
3. Select a CSV or XLSX file containing farmer data.
4. Click Upload to process the data.
5. The application will validate the file, replace any existing data, and redirect to the dashboard.

## Step 9: Maintenance and Monitoring

1. Monitor your application logs:
   ```bash
   pm2 logs pmksy-api
   ```

2. Set up log rotation:
   ```bash
   sudo pm2 install pm2-logrotate
   ```

3. Update your application:
   ```bash
   cd /var/www/pmksy-bksy
   git pull
   npm install --production
   cd server
   npm install --production
   cd ..
   npm run build
   pm2 restart pmksy-api
   ```

## Troubleshooting

- **Application not loading**: Check Nginx logs at `/var/log/nginx/error.log`
- **API errors**: Check PM2 logs with `pm2 logs pmksy-api`
- **Database connection issues**: Verify database credentials in `.env` file and ensure MySQL is running
- **Permission issues**: Check file permissions with `ls -la` and adjust with `chmod` if needed
- **File upload problems**: 
  - Ensure the `/uploads` directory exists and is writable
  - Check file size limits in `server/index.js` (default is 10MB)
  - Verify that accepted file types are CSV and XLSX

## Security Considerations

- Change the default admin and pmksy passwords immediately after deployment
- Set a strong JWT_SECRET in the .env file
- Use HTTPS for all production deployments
- Implement firewall rules to only expose necessary ports
- Consider using stronger password hashing in the production environment
- Regularly update all dependencies with `npm audit fix`

## Backup Strategy

1. Database backups:
   ```bash
   # Create a backup script
   echo '#!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   mysqldump -u pmksy_user -p"your_password" pmksy_bksy > /path/to/backups/pmksy_backup_$TIMESTAMP.sql
   gzip /path/to/backups/pmksy_backup_$TIMESTAMP.sql
   find /path/to/backups/ -name "*.gz" -mtime +30 -delete' > /path/to/backup_script.sh
   
   chmod +x /path/to/backup_script.sh
   ```

2. Create a cron job for regular backups:
   ```bash
   crontab -e
   # Add this line to run daily at 2 AM:
   0 2 * * * /path/to/backup_script.sh
   ```

3. Application backups:
   ```bash
   # Create a tar archive of the application
   tar -czvf /path/to/backups/pmksy_app_backup_$(date +"%Y%m%d").tar.gz /var/www/pmksy-bksy
   ```

## Mobile Responsiveness

The application has been tested and optimized for both desktop and mobile views. Key mobile optimizations include:

- Responsive layout adapting to different screen sizes
- Mobile-friendly navigation with a collapsible sidebar
- Company logo display in the mobile header
- Touch-friendly UI elements and appropriate spacing
- Full functionality available across all device sizes

This deployment guide should provide all the necessary steps to successfully deploy your PMKSY-BKSY Scheme Dashboard application on a production server.
