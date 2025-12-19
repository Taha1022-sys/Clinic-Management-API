# 🚀 Strapi CMS Integration Guide

## Overview
Strapi has been integrated into the ClinicHub project as a headless CMS. It runs in a Docker container alongside your NestJS backend and PostgreSQL database.

---

## 📋 What's Been Added

### 1. **Docker Services**
- **Strapi Service**: Running on `http://localhost:1337`
- **Shared PostgreSQL**: Both NestJS and Strapi use the same PostgreSQL container but different databases
  - NestJS: `clinic_management_db`
  - Strapi: `strapi_db`

### 2. **Files Created**
- `init-database.sh` - Automatically creates the `strapi_db` database on first startup
- `.env.strapi` - Strapi environment variables template

---

## 🔧 Setup Instructions

### Step 1: Generate Secure Keys (IMPORTANT for Production)

For **development**, the default keys in docker-compose.yml will work, but for **production**, you MUST generate secure random keys:

```powershell
# Run this command 8 times to generate different keys
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy each generated key into the `.env.strapi` file (or create a `.env` file in the root and add these variables).

### Step 2: Start Docker Services

```powershell
# Stop any running containers first
docker-compose down

# Start all services (PostgreSQL, PGAdmin, NestJS Backend, and Strapi)
docker-compose up -d

# View logs to monitor startup
docker-compose logs -f strapi
```

### Step 3: Wait for Strapi to Initialize

First-time startup takes 2-3 minutes as Strapi:
1. Connects to PostgreSQL
2. Creates database tables
3. Builds the admin panel

Watch the logs until you see:
```
[2025-12-17 ...] info: Server listening on http://0.0.0.0:1337
```

### Step 4: Create Admin User

1. Open your browser and go to: `http://localhost:1337/admin`
2. You'll see the admin registration page (only appears on first run)
3. Create your admin account:
   - **First Name**: Your name
   - **Last Name**: Your surname
   - **Email**: admin@clinichub.com (or your preferred email)
   - **Password**: Create a strong password

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Strapi Admin | http://localhost:1337/admin | Content management dashboard |
| Strapi API | http://localhost:1337/api | REST API for content |
| NestJS Backend | http://localhost:3000 | Your main backend API |
| Swagger Docs | http://localhost:3000/api | API documentation |
| PGAdmin | http://localhost:5050 | Database management |

---

## 📊 Database Architecture

```
PostgreSQL Container (port 5432)
├── clinic_management_db  → NestJS Backend
└── strapi_db             → Strapi CMS
```

Both databases are accessible via PGAdmin:
- **Host**: postgres (within Docker network) or localhost:5432 (from host)
- **Username**: clinic_admin
- **Password**: clinic_secure_password_2024

---

## 🛠️ Common Commands

### Start Everything
```powershell
docker-compose up -d
```

### Stop Everything
```powershell
docker-compose down
```

### View Strapi Logs
```powershell
docker-compose logs -f strapi
```

### Restart Strapi Only
```powershell
docker-compose restart strapi
```

### Reset Strapi (⚠️ Deletes all CMS data)
```powershell
docker-compose down
docker volume rm clinic-management-system_strapi_data
docker-compose up -d strapi
```

### Access Strapi Container Shell
```powershell
docker exec -it clinic_strapi sh
```

---

## 📝 Using Strapi

### Creating Content Types

1. Go to http://localhost:1337/admin
2. Navigate to **Content-Type Builder** in the sidebar
3. Click **Create new collection type**
4. Example: Create a "Doctor" content type with fields:
   - Name (Text)
   - Specialty (Text)
   - Bio (Rich Text)
   - Photo (Media)
5. Save and wait for Strapi to restart

### Creating Content

1. Navigate to **Content Manager**
2. Select your content type (e.g., "Doctor")
3. Click **Create new entry**
4. Fill in the fields and publish

### Accessing via API

By default, Strapi API routes are protected. To make them public:

1. Go to **Settings** → **Users & Permissions plugin** → **Roles**
2. Click **Public**
3. Expand your content type and check the permissions you want to allow (e.g., `find`, `findOne`)
4. Save

Now you can access:
```
GET http://localhost:1337/api/doctors
GET http://localhost:1337/api/doctors/1
```

---

## 🔗 Integration with NestJS

To call Strapi API from your NestJS backend:

```typescript
// In your service
async getDoctorsFromCMS() {
  const response = await fetch('http://strapi:1337/api/doctors');
  return response.json();
}
```

Note: Use `http://strapi:1337` (service name) within Docker network, not `localhost`.

---

## 📚 Next Steps

1. ✅ Start Docker services
2. ✅ Create Strapi admin account
3. ✅ Create your first content type
4. 🔄 Define your CMS data structure based on ClinicHub requirements
5. 🔄 Integrate Strapi content into your NestJS frontend/mobile app

---

## 🆘 Troubleshooting

### Strapi won't start
- Check logs: `docker-compose logs strapi`
- Ensure PostgreSQL is running: `docker-compose ps`
- Verify database was created: Connect via PGAdmin and check for `strapi_db`

### "Database connection error"
- Ensure the `init-database.sh` script ran (check postgres logs)
- Verify database credentials in docker-compose.yml match PostgreSQL service

### "Port 1337 already in use"
- Change the port mapping in docker-compose.yml: `- '1338:1337'`

### Slow startup
- First startup takes 2-3 minutes (normal)
- Subsequent startups are much faster (~30 seconds)

---

## 📖 Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi with PostgreSQL](https://docs.strapi.io/dev-docs/configurations/database#postgres-configuration)

---

**Ready to manage your clinic content! 🎉**
