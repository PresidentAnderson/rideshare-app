# Deployment Guide

This guide covers various deployment options for the RideShare application.

## Quick Start with Docker

The fastest way to get the application running is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd "Ridesharing Application"

# Start all services
docker-compose up --build
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`
- Redis cache (optional)

## Prerequisites for Production

Before deploying to production, ensure you have:

1. **Supabase Project**: Create your own Supabase project
2. **Domain Names**: Frontend and backend domains
3. **SSL Certificates**: For HTTPS
4. **Environment Variables**: Production values
5. **Database Migration**: Run the schema on production database
6. **Third-party Services**: Stripe, Google Maps API keys

## Production Environment Setup

### 1. Supabase Production Setup

1. Create a new Supabase project for production
2. Run the database schema from `database/schema.sql`
3. Configure Row Level Security (RLS) policies
4. Set up Supabase Auth settings
5. Configure email templates and SMTP

### 2. Environment Variables

Update your environment variables for production:

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=5000

# Production Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Secure JWT secret
JWT_SECRET=your_very_secure_jwt_secret_in_production

# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Production URLs
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://admin.your-domain.com

# Production Redis (if using)
REDIS_URL=redis://your-redis-host:6379

# Production SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## Deployment Options

### Option 1: AWS Deployment

#### Using AWS ECS with Fargate

1. **Build and Push Docker Images:**
```bash
# Build images
docker build -t rideshare-backend ./backend
docker build -t rideshare-frontend ./frontend

# Tag for ECR
docker tag rideshare-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-backend:latest
docker tag rideshare-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-frontend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-frontend:latest
```

2. **Create ECS Task Definition:**
```json
{
  "family": "rideshare-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rideshare-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/rideshare-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rideshare-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Set up Application Load Balancer (ALB)**
4. **Configure CloudFront for the frontend**
5. **Set up Route 53 for DNS**

### Option 2: Google Cloud Platform

#### Using Google Cloud Run

1. **Build and Deploy Backend:**
```bash
cd backend
gcloud builds submit --tag gcr.io/your-project/rideshare-backend
gcloud run deploy rideshare-backend \
  --image gcr.io/your-project/rideshare-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

2. **Build and Deploy Frontend:**
```bash
cd frontend
gcloud builds submit --tag gcr.io/your-project/rideshare-frontend
gcloud run deploy rideshare-frontend \
  --image gcr.io/your-project/rideshare-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 3: Digital Ocean App Platform

1. **Create App Spec (app.yaml):**
```yaml
name: rideshare-app
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/rideshare-app
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: SUPABASE_URL
    value: ${SUPABASE_URL}
  http_port: 5000

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/rideshare-app
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_API_URL
    value: ${BACKEND_URL}/api/v1
  http_port: 80
```

2. **Deploy:**
```bash
doctl apps create --spec app.yaml
```

### Option 4: Self-Hosted VPS

#### Using Ubuntu Server

1. **Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

2. **Deploy Application:**
```bash
# Clone repository
git clone <repository-url> /opt/rideshare
cd /opt/rideshare

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit the files with production values

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

3. **Configure Nginx:**
```nginx
# /etc/nginx/sites-available/rideshare
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable Site and SSL:**
```bash
sudo ln -s /etc/nginx/sites-available/rideshare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## Production Docker Compose

Create a production-specific docker-compose file:

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    env_file:
      - ./frontend/.env.production
    restart: always
    depends_on:
      - backend
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: always
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

## Database Migration

Run the database schema on your production Supabase instance:

1. **Access Supabase SQL Editor**
2. **Run the schema from `database/schema.sql`**
3. **Verify all tables and functions are created**
4. **Test the RLS policies**

## Security Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] JWT secret is secure and different from development
- [ ] Supabase RLS policies are enabled and tested
- [ ] SSL certificates are installed and working
- [ ] Database access is restricted
- [ ] API rate limiting is configured
- [ ] CORS is properly configured
- [ ] All default passwords are changed
- [ ] Monitoring and logging are set up
- [ ] Backup strategy is in place

## Monitoring and Logging

### Health Checks
Both services include health check endpoints:
- Backend: `GET /health`
- Frontend: `GET /health`

### Logging
Configure centralized logging:

**For AWS:**
- Use CloudWatch Logs
- Set up log groups for each service
- Configure log retention policies

**For self-hosted:**
- Use ELK stack (Elasticsearch, Logstash, Kibana)
- Or use a service like Papertrail

### Monitoring
Set up monitoring for:
- Application uptime
- Response times
- Error rates
- Database performance
- Server resources (CPU, memory, disk)

## Backup Strategy

1. **Database Backups:**
   - Supabase provides automatic backups
   - Set up additional backup schedules if needed

2. **Application Backups:**
   - Backup uploaded files (if using local storage)
   - Backup environment configuration
   - Version control for code

3. **Redis Backups:**
   - Configure Redis persistence
   - Regular snapshots

## Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement session affinity for Socket.IO
- Use Redis for session storage and caching

### Database Scaling
- Supabase handles database scaling
- Consider read replicas for heavy read workloads
- Implement connection pooling

### CDN and Caching
- Use CloudFront or CloudFlare for static assets
- Implement Redis caching for frequent queries
- Enable browser caching with appropriate headers

## CI/CD Pipeline

Example GitHub Actions workflow:

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Run tests
      run: |
        cd backend && npm ci && npm test
        cd ../frontend && npm ci && npm test
    
    - name: Build and deploy
      run: |
        # Add your deployment commands here
        # e.g., docker build, push to registry, deploy to cloud
```

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check FRONTEND_URL in backend environment
   - Verify CORS configuration

2. **Database Connection Issues:**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Verify RLS policies

3. **Socket.IO Connection Issues:**
   - Check WebSocket support
   - Verify proxy configuration for WebSockets

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify environment variables during build

### Debug Commands

```bash
# Check container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container health
docker ps

# Check service status
curl http://localhost:5000/health
curl http://localhost:3000/health

# Check database connectivity
docker-compose exec backend npm run test:db
```

## Performance Optimization

1. **Frontend Optimization:**
   - Enable Gzip compression
   - Implement code splitting
   - Optimize images and assets
   - Use service workers for caching

2. **Backend Optimization:**
   - Implement request caching
   - Database query optimization
   - Connection pooling
   - Rate limiting

3. **Infrastructure Optimization:**
   - Use CDN for static assets
   - Implement load balancing
   - Auto-scaling configuration
   - Database indexing

This deployment guide covers the most common scenarios. Choose the option that best fits your infrastructure requirements and budget.