# 🎯 Quick Start - Strapi Integration

## ⚡ Start Everything Now

```powershell
# Navigate to your project
cd c:\Users\taha\Desktop\cart\clinic-management-system

# Start all services
docker-compose up -d

# Watch Strapi logs (wait until it says "Server listening")
docker-compose logs -f strapi
```

## ⏱️ First Time Setup (5 minutes)

1. **Wait for Strapi** (2-3 minutes first time)
   - Watch logs until you see: `Server listening on http://0.0.0.0:1337`

2. **Create Admin Account**
   - Open: http://localhost:1337/admin
   - Fill in the registration form (appears only once)
   - Remember your credentials!

3. **Done!** You now have:
   - ✅ NestJS Backend → http://localhost:3000
   - ✅ Swagger Docs → http://localhost:3000/api
   - ✅ Strapi CMS → http://localhost:1337/admin
   - ✅ PGAdmin → http://localhost:5050

---

## 📊 What's Running?

| Service | Port | Database |
|---------|------|----------|
| NestJS Backend | 3000 | clinic_management_db |
| Strapi CMS | 1337 | strapi_db |
| PostgreSQL | 5432 | (both above) |
| PGAdmin | 5050 | - |

---

## 🔧 Common Commands

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart Strapi only
docker-compose restart strapi

# View all logs
docker-compose logs -f

# View Strapi logs only
docker-compose logs -f strapi
```

---

## 📖 Full Guides

- **Detailed Strapi Guide**: See [STRAPI_SETUP_GUIDE.md](STRAPI_SETUP_GUIDE.md)
- **API Testing**: See [SWAGGER_TESTING_GUIDE.md](SWAGGER_TESTING_GUIDE.md)

---

## 🆘 Troubleshooting

**Problem**: Strapi won't start
```powershell
# Check logs
docker-compose logs strapi

# Try restarting
docker-compose restart strapi
```

**Problem**: Port already in use
```powershell
# Check what's using the port
netstat -ano | findstr :1337

# Stop containers and try again
docker-compose down
docker-compose up -d
```

**Problem**: Database connection error
```powershell
# Restart PostgreSQL first, then Strapi
docker-compose restart postgres
timeout /t 5
docker-compose restart strapi
```

---

## ✅ Quick Test

After starting, test each service:

1. **NestJS**: http://localhost:3000 (should return "Hello World!")
2. **Swagger**: http://localhost:3000/api (should show API docs)
3. **Strapi**: http://localhost:1337/admin (should show login/register)
4. **PGAdmin**: http://localhost:5050 (login: admin@clinic.com / admin123)

---

**All services running? You're ready to go! 🎉**
