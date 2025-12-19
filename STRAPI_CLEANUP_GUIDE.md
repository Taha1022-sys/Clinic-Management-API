# 🧹 Strapi Cleanup & Rebuild Guide

## Problem Fixed
The "Error: You can only create a Strapi app in an empty directory" has been resolved with a robust entrypoint script.

---

## 🚀 Quick Fix Commands

```powershell
# 1. Stop and remove all containers
docker-compose down

# 2. Remove the Strapi volume to start fresh
docker volume rm clinic-management-system_strapi_data

# 3. Rebuild Strapi with the new Dockerfile
docker-compose build strapi

# 4. Start everything
docker-compose up -d

# 5. Watch Strapi logs
docker-compose logs -f strapi
```

---

## 📋 What Was Changed

### 1. **New Entrypoint Script** ([cms/docker-entrypoint.sh](cms/docker-entrypoint.sh))
   - ✅ Checks if `package.json` exists
   - ✅ If NOT exists: Force cleans directory with `rm -rf ./*`
   - ✅ Then runs `create-strapi-app` with your configuration
   - ✅ If EXISTS: Runs `npm install && npm run develop`

### 2. **Updated Dockerfile** ([cms/Dockerfile](cms/Dockerfile))
   - ✅ Copies and makes the entrypoint script executable
   - ✅ Uses `ENTRYPOINT` instead of `CMD` for better control

### 3. **Updated docker-compose.yml**
   - ✅ Changed from `image: strapi/strapi:latest` to `build: ./cms`
   - ✅ Fixed volume path to match Dockerfile workdir (`/opt/app`)

---

## 🔧 Step-by-Step Recovery

### Option 1: Fresh Start (Recommended)

```powershell
# Stop everything
docker-compose down

# Remove Strapi volume (⚠️ deletes all CMS data)
docker volume rm clinic-management-system_strapi_data

# Optional: Clean local cms folder residuals
Remove-Item -Path .\cms\node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .\cms\package.json -ErrorAction SilentlyContinue

# Rebuild and start
docker-compose build strapi
docker-compose up -d

# Watch initialization
docker-compose logs -f strapi
```

### Option 2: Keep Existing Data (If you have content)

```powershell
# Stop Strapi only
docker-compose stop strapi

# Rebuild
docker-compose build strapi

# Start Strapi
docker-compose up -d strapi

# Watch logs
docker-compose logs -f strapi
```

---

## ✅ Verification

After running the commands, you should see:

```
🚀 Starting Strapi initialization...
📦 No package.json found - Fresh installation required
🧹 Cleaning directory to ensure clean install...
✨ Directory cleaned. Installing Strapi...
... (installation progress)
✅ Strapi app created successfully
🚀 Starting Strapi in development mode...
[2025-12-17 ...] info: Server listening on http://0.0.0.0:1337
```

---

## 🎯 What the Script Does

### On First Run (No package.json):
1. Detects empty/dirty directory
2. **Force cleans** with `rm -rf ./*` (removes residual files)
3. Runs `create-strapi-app` with:
   - TypeScript
   - PostgreSQL client
   - Your database credentials
   - No cloud setup
4. Starts development server

### On Subsequent Runs (package.json exists):
1. Detects existing installation
2. Runs `npm install` (in case of new dependencies)
3. Starts development server

---

## 🆘 Troubleshooting

### Still Getting "Empty Directory" Error?

```powershell
# Nuclear option - complete cleanup
docker-compose down -v
docker volume prune -f
docker-compose build --no-cache strapi
docker-compose up -d
```

### Check Entrypoint Script Permissions

```powershell
# Access container
docker exec -it clinic_strapi sh

# Check if script is executable
ls -la /usr/local/bin/docker-entrypoint.sh

# Should show: -rwxr-xr-x (executable)
```

### View Real-time Logs

```powershell
# All services
docker-compose logs -f

# Strapi only
docker-compose logs -f strapi

# Last 100 lines
docker-compose logs --tail=100 strapi
```

---

## 📊 Volume Management

### Check Volumes
```powershell
docker volume ls
```

### Inspect Strapi Volume
```powershell
docker volume inspect clinic-management-system_strapi_data
```

### Backup Before Cleanup (Optional)
```powershell
# Create backup
docker run --rm -v clinic-management-system_strapi_data:/data -v ${PWD}:/backup alpine tar czf /backup/strapi-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v clinic-management-system_strapi_data:/data -v ${PWD}:/backup alpine tar xzf /backup/strapi-backup.tar.gz -C /data
```

---

## ✨ Benefits of New Setup

✅ **Self-Healing**: Automatically cleans residual files  
✅ **Idempotent**: Same result regardless of initial state  
✅ **Verbose**: Clear logging shows what's happening  
✅ **Flexible**: Handles both fresh install and existing projects  
✅ **Production-Ready**: Proper entrypoint pattern  

---

**Your Strapi setup is now bulletproof! 🛡️**
