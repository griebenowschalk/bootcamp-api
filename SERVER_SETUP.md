# Server Setup Guide - Bootcamp API

This guide documents the complete server setup process for deploying the Bootcamp API with PM2, Nginx, and SSL.

## Prerequisites

- Ubuntu/Debian server with root access
- Domain or IP address
- Git installed

## 1. Initial Server Setup

### Update system

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install Git (if not already installed)

```bash
sudo apt install git -y
```

## 2. Clone and Setup Application

### Clone repository

```bash
cd ~/apps
git clone <your-repo-url> bootcamp-api
cd bootcamp-api
```

### Install dependencies

```bash
npm install
```

### Build the application

```bash
npm run build
```

### Test locally

```bash
npm start
# Should start on port 3000
# Ctrl+C to stop
```

## 3. PM2 Process Manager Setup

### Install PM2 globally

```bash
sudo npm install -g pm2
```

### Start application with PM2

```bash
pm2 start dist/app.js --name "bootcamp-api"
```

### Save PM2 configuration

```bash
pm2 save
pm2 startup
```

### Verify PM2 is running

```bash
pm2 status
pm2 logs bootcamp-api
```

## 4. Firewall Setup (UFW)

### Install UFW

```bash
sudo apt install ufw -y
```

### Configure UFW

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### Enable UFW

```bash
sudo ufw enable
sudo ufw status
```

## 5. Nginx Setup

### Install Nginx

```bash
sudo apt install nginx -y
```

### Create Nginx configuration

```bash
sudo nano /etc/nginx/sites-available/bootcamp-api
```

### Add this configuration

```nginx
server {
    listen 80;
    server_name YOUR_IP_OR_DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name YOUR_IP_OR_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/bootcamp-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### Test Nginx configuration

```bash
sudo nginx -t
```

### Start Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 6. SSL Certificate Setup (Let's Encrypt)

### Install Certbot

```bash
sudo apt install certbot -y
```

### Stop Nginx temporarily

```bash
sudo systemctl stop nginx
```

### Get SSL certificate

```bash
sudo certbot certonly --standalone -d YOUR_DOMAIN
```

### Start Nginx again

```bash
sudo systemctl start nginx
```

### Test SSL

```bash
curl -v https://YOUR_DOMAIN
```

## 7. Application Configuration

### Update app.ts to bind to all interfaces

```typescript
// In src/app.ts, change:
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
```

### Environment variables

Create `.env` file:

```env
NODE_ENV=production
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEOCODER_PROVIDER=provider
GEOCODER_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=your_resend_email_instance
```

## 8. Testing

### Test HTTP redirect

```bash
curl -I http://YOUR_IP_OR_DOMAIN
# Should return 301 redirect to HTTPS
```

### Test HTTPS

```bash
curl -v https://YOUR_IP_OR_DOMAIN
# Should show SSL handshake and response
```

### Test API endpoints

- `https://YOUR_IP_OR_DOMAIN/docs` - Swagger documentation
- `https://YOUR_IP_OR_DOMAIN/api/v1/bootcamps` - API endpoints

## 9. Maintenance Commands

### PM2 commands

```bash
pm2 status                    # Check status
pm2 restart bootcamp-api      # Restart app
pm2 logs bootcamp-api         # View logs
pm2 monit                     # Monitor dashboard
```

### Nginx commands

```bash
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload config
sudo systemctl restart nginx  # Restart nginx
sudo systemctl status nginx   # Check status
```

### SSL renewal

```bash
sudo certbot renew           # Manual renewal
sudo certbot renew --dry-run # Test renewal
```

### Firewall status

```bash
sudo ufw status              # Check UFW status
sudo ufw allow PORT          # Allow new port
```

## 10. Troubleshooting

### Common issues and solutions

#### Port 3000 not accessible

```bash
sudo ufw allow 3000
pm2 restart bootcamp-api
```

#### SSL certificate issues

```bash
sudo certbot renew
sudo systemctl reload nginx
```

#### Nginx configuration errors

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

#### PM2 app not starting

```bash
pm2 logs bootcamp-api
pm2 delete bootcamp-api
pm2 start dist/app.js --name "bootcamp-api"
```

## 11. Security Considerations

- ✅ UFW firewall enabled
- ✅ Only necessary ports open (22, 80, 443, 3000)
- ✅ SSL/TLS encryption
- ✅ App not directly exposed to internet
- ✅ Nginx as reverse proxy

## 12. Backup and Recovery

### Backup important files

```bash
sudo cp /etc/nginx/sites-available/bootcamp-api ~/backup/
sudo cp /etc/letsencrypt/live/YOUR_DOMAIN/ ~/backup/ssl/
```

### Restore from backup

```bash
sudo cp ~/backup/bootcamp-api /etc/nginx/sites-available/
sudo cp ~/backup/ssl/* /etc/letsencrypt/live/YOUR_DOMAIN/
sudo nginx -t && sudo systemctl reload nginx
```

---

**Note:** Replace `YOUR_IP_OR_DOMAIN` and `YOUR_DOMAIN` with your actual IP address or domain name throughout this guide.

**Last updated:** [Current Date]
**Server IP:** [Your Server IP]
**Domain:** [Your Domain]
