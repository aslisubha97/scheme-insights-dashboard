
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

## Step 1: Prepare Your Local Project

1. Create a production build of your React application:
   ```bash
   npm run build
   ```
   This will generate optimized files in the `dist` directory.

2. Test your build locally:
   ```bash
   npx serve -s dist
   ```

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

## Step 3: Deploy the Node.js Backend

1. Create a deployment directory on your server:
   ```bash
   mkdir -p /var/www/pmksy-bksy
   ```

2. Upload your project files to the server:
   ```bash
   # Using scp
   scp -r dist/* user@your-server:/var/www/pmksy-bksy/
   scp -r server/* user@your-server:/var/www/pmksy-bksy/server/
   scp package.json user@your-server:/var/www/pmksy-bksy/
   ```
   
   Alternatively, you can use Git to deploy:
   ```bash
   # On your server
   cd /var/www/pmksy-bksy
   git clone your-repository-url .
   npm install --production
   npm run build
   ```

3. Create a `.env` file for environment variables:
   ```bash
   touch /var/www/pmksy-bksy/.env
   ```

4. Add the following to your `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=pmksy_user
   DB_PASSWORD=your_secure_password
   DB_NAME=pmksy_bksy
   PORT=3000
   NODE_ENV=production
   ```

5. Install PM2 to manage your Node.js process:
   ```bash
   npm install -g pm2
   ```

6. Start your application with PM2:
   ```bash
   cd /var/www/pmksy-bksy
   pm2 start server/index.js --name pmksy-api
   ```

7. Set up PM2 to start on server boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Step 4: Configure Nginx as a Reverse Proxy

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

       # Static files
       location / {
           root /var/www/pmksy-bksy/dist;
           try_files $uri $uri/ /index.html;
           index index.html;
       }

       # API endpoints
       location /api/ {
           proxy_pass http://localhost:3000;
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

## Step 5: Set Up HTTPS with Let's Encrypt (Recommended)

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

## Step 6: Maintenance and Monitoring

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
   npm run build
   pm2 restart pmksy-api
   ```

## Troubleshooting

- **Application not loading**: Check Nginx logs at `/var/log/nginx/error.log`
- **API errors**: Check PM2 logs with `pm2 logs pmksy-api`
- **Database connection issues**: Verify database credentials in `.env` file and ensure MySQL is running
- **Permission issues**: Check file permissions with `ls -la` and adjust with `chmod` if needed

## Security Considerations

- Keep your server and dependencies updated regularly
- Use strong passwords for your database and admin accounts
- Implement rate limiting for API endpoints
- Set up a firewall (e.g., UFW) and only allow necessary ports

## Backup Strategy

1. Set up a database backup script:
   ```bash
   mysqldump -u pmksy_user -p pmksy_bksy > /path/to/backups/pmksy_backup_$(date +%Y%m%d).sql
   ```

2. Create a cron job to run backups automatically:
   ```bash
   crontab -e
   # Add this line to run daily at 2 AM:
   0 2 * * * mysqldump -u pmksy_user -p'your_secure_password' pmksy_bksy > /path/to/backups/pmksy_backup_$(date +%Y%m%d).sql
   ```

This deployment guide should provide all the necessary steps to successfully deploy your PMKSY-BKSY Scheme Dashboard application.
