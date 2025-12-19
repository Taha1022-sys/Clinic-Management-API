# MediFlow API Documentation

## Overview
This document provides a complete guide to the MediFlow Backend API endpoints for the Clinic Management & Health Tourism System.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Modules Overview

### 1. **Authentication Module** (`/auth`)
- User registration and login
- JWT token generation

### 2. **Users Module** (`/users`)
- User profile management
- User CRUD operations (Admin)

### 3. **Leads Module** (`/leads`)
- **PUBLIC** endpoint for landing page forms
- Lead management (Admin)

### 4. **Appointments Module** (`/appointments`)
- Appointment booking
- Availability checking
- Appointment management

### 5. **Strapi Integration** (Internal Service)
- Fetches Doctor and Treatment data from Strapi CMS
- Used internally by other modules

---

## 🔓 Public Endpoints (No Authentication Required)

### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "Password@123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-1234"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "John",
    "role": "PATIENT"
  }
}
```

---

### POST `/leads`
**PUBLIC** - Submit a lead inquiry from landing page.

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1-555-9876",
  "country": "United States",
  "interestedTreatment": "Hair Transplant",
  "notes": "I would like to know about pricing and recovery time"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "status": "NEW",
  "createdAt": "2025-12-17T10:00:00Z"
}
```

---

## 🔐 Protected Endpoints (Authentication Required)

### GET `/users/profile`
Get current user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "patient@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-1234",
  "role": "PATIENT",
  "isActive": true
}
```

---

### POST `/appointments`
Book a new appointment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "appointmentDate": "2025-12-20T14:30:00Z",
  "strapiDoctorId": 1,
  "notes": "First consultation"
}
```

**Validation Rules:**
- `appointmentDate` must be in the future
- `strapiDoctorId` must exist in Strapi CMS
- Time slot must be available

**Response:**
```json
{
  "id": "uuid",
  "appointmentDate": "2025-12-20T14:30:00Z",
  "status": "PENDING",
  "strapiDoctorId": 1,
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2025-12-17T10:00:00Z"
}
```

---

### GET `/appointments`
Get all appointments.
- **Patients:** Returns only their own appointments
- **Admins:** Returns all appointments in the system

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "appointmentDate": "2025-12-20T14:30:00Z",
    "status": "CONFIRMED",
    "strapiDoctorId": 1,
    "notes": "First consultation",
    "createdAt": "2025-12-17T10:00:00Z"
  }
]
```

---

### GET `/appointments/available-slots`
Get available time slots for a doctor on a specific date.

**Query Parameters:**
- `doctorId` (required): Doctor ID from Strapi
- `date` (required): Date in YYYY-MM-DD format

**Example:**
```
GET /appointments/available-slots?doctorId=1&date=2025-12-20
```

**Response:**
```json
[
  "2025-12-20T09:00:00Z",
  "2025-12-20T10:00:00Z",
  "2025-12-20T11:00:00Z",
  "2025-12-20T14:00:00Z",
  "2025-12-20T15:00:00Z"
]
```

**Note:** Returns hourly slots from 9 AM to 5 PM, excluding booked slots.

---

### GET `/appointments/:id`
Get details of a specific appointment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "appointmentDate": "2025-12-20T14:30:00Z",
  "status": "CONFIRMED",
  "strapiDoctorId": 1,
  "notes": "First consultation",
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### PATCH `/appointments/:id/cancel`
Cancel an appointment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CANCELLED",
  "appointmentDate": "2025-12-20T14:30:00Z"
}
```

---

## 👑 Admin-Only Endpoints

### GET `/leads`
Get all lead inquiries.

**Role Required:** `ADMIN`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+1-555-9876",
    "country": "United States",
    "interestedTreatment": "Hair Transplant",
    "status": "NEW",
    "createdAt": "2025-12-17T10:00:00Z"
  }
]
```

---

### PATCH `/appointments/:id/status`
Update appointment status (PENDING → CONFIRMED → COMPLETED).

**Role Required:** `ADMIN`

**Query Parameters:**
- `status`: One of `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

**Example:**
```
PATCH /appointments/uuid-here/status?status=CONFIRMED
```

**Response:**
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "appointmentDate": "2025-12-20T14:30:00Z"
}
```

---

## 📊 Appointment Status Flow

```
NEW APPOINTMENT
    ↓
PENDING (Default when created)
    ↓
CONFIRMED (Admin confirms)
    ↓
COMPLETED (After appointment happens)
```

**Alternative Flow:**
```
PENDING → CANCELLED (Patient or Admin cancels)
```

---

## 🏥 Strapi CMS Integration

The NestJS backend fetches the following data from Strapi:

### Doctors
- **Endpoint:** `/api/doctors`
- **Fields:** `id`, `name`, `specialty`, `bio`, `yearsOfExperience`, `image`

### Treatments
- **Endpoint:** `/api/treatments`
- **Fields:** `id`, `name`, `description`, `price`, `duration`

### Configuration Required
Add to `.env`:
```env
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token_here
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

### 3. Run Database Migrations
```bash
npm run migration:run
```

### 4. Start the Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 5. Access Swagger Documentation
Navigate to:
```
http://localhost:3000/api
```

---

## 🔑 User Roles

### PATIENT (Default)
- Can register and login
- Can book appointments
- Can view their own appointments
- Can cancel their own appointments

### ADMIN
- All PATIENT permissions
- Can view all appointments
- Can view all leads
- Can update appointment status
- Can manage users

### DOCTOR
- Can view appointments assigned to them (Future implementation)

---

## 📝 Error Responses

All errors follow this format:

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Appointment date must be in the future",
  "error": "Bad Request"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Appointment with ID xyz not found",
  "error": "Not Found"
}
```

**503 Service Unavailable**
```json
{
  "statusCode": 503,
  "message": "Unable to fetch doctors from CMS",
  "error": "Service Unavailable"
}
```

---

## 🧪 Testing with Postman/Insomnia

### 1. Register a User
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password@123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+1-555-0000"
}
```

### 2. Save the Token
Copy the `access_token` from the response.

### 3. Use Token in Subsequent Requests
Add to request headers:
```
Authorization: Bearer <paste_token_here>
```

---

## 🔧 Next Steps for Production

1. **Email Service:** Integrate SendGrid/Mailgun for appointment confirmations
2. **Payment Gateway:** Add Stripe/PayPal for treatment deposits
3. **File Upload:** Implement medical report uploads (S3/Cloudinary)
4. **Real-time Notifications:** Add WebSocket for appointment updates
5. **Doctor Portal:** Separate dashboard for doctors to manage their schedule
6. **Multi-language:** Add i18n support for international patients

---

## 📞 Support

For questions or issues, contact the development team.
