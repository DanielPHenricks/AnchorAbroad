# Deployment Guide

## Production Feature Flag

The application now supports a production mode feature flag that automatically connects to the deployed backend.

### Environment Variables

#### Development (default)
```bash
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:8000
```

#### Production
```bash
REACT_APP_ENV=production
REACT_APP_API_URL=http://44.203.101.226:8000
```

### Local Development

For local development, the app will automatically use `localhost:8000`:

```bash
cd frontend
npm start
```

### Running in Production Mode Locally

To test production mode on your local machine:

```bash
cd frontend
REACT_APP_ENV=production npm start
```

This will connect your local frontend to the deployed backend at `44.203.101.226:8000`.

### Deploying with Docker Compose

#### Development Mode (default)
```bash
docker-compose up -d
```

#### Production Mode
```bash
REACT_APP_ENV=production REACT_APP_API_URL=http://44.203.101.226:8000 docker-compose up -d
```

Or create a `.env` file in the project root:
```bash
REACT_APP_ENV=production
REACT_APP_API_URL=http://44.203.101.226:8000
```

Then run:
```bash
docker-compose up -d
```

### On the SSH Instance

To deploy in production mode on your AWS instance:

```bash
cd /home/ubuntu/app
git pull

# Set production environment variables
export REACT_APP_ENV=production
export REACT_APP_API_URL=http://44.203.101.226:8000

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Or use the convenient alias:
```bash
cd /home/ubuntu/app
git pull
export REACT_APP_ENV=production
export REACT_APP_API_URL=http://44.203.101.226:8000
drebuild
```

### CORS Configuration

The backend has been configured to allow requests from:
- `http://localhost:3000` (development)
- `http://44.203.101.226:3000` (production)

If you deploy to a different IP address, update the following files:
1. `/backend/backend/settings.py` - Update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`
2. `/frontend/src/services/api.js` - Update the fallback URL in `getApiBaseUrl()`

### Checking Current Configuration

To verify which backend URL the frontend is using, check the browser console when the app loads. The API service will use the URL based on the `REACT_APP_ENV` variable.

### Troubleshooting

#### CORS Errors
If you see CORS errors:
1. Verify the backend `ALLOWED_HOSTS` includes your IP: `backend/backend/settings.py:28`
2. Check `CORS_ALLOWED_ORIGINS` includes your frontend URL: `backend/backend/settings.py:139-142`
3. Restart the backend after making changes

#### Wrong Backend URL
If the frontend is connecting to the wrong backend:
1. Check environment variables: `echo $REACT_APP_ENV`
2. Rebuild the frontend: `docker-compose build frontend`
3. Verify the environment is passed to the container in `docker-compose.yml`
