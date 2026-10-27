# Mauli Hospital Management System

Full-stack hospital management system using React, Express, MongoDB and JWT authentication.

## Project structure

- `client/` - React + Vite frontend
- `server/` - Express + MongoDB backend

## Main roles

### Admin / Staff
- Dashboard
- Patient registration and CRUD
- Doctor CRUD
- Appointment creation and management
- Medical record management
- Billing and revenue

### Doctor
- Doctor dashboard
- View only assigned patients
- View own appointments
- Update appointment status
- Create, edit and delete own medical records

### Patient
- Patient dashboard
- View own appointments
- View own medical records
- View own bills

## Run the project

### 1. Backend

Open a terminal in the `server` folder:

```bash
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

Make sure `server/.env` contains a valid MongoDB connection string and JWT secret.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
PORT=5000
```

### 2. Frontend

Open another terminal in the `client` folder:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173/`.

## Important account linking rule

Doctor and patient login accounts are linked to their hospital profiles using the same email address.

- Doctor User email = Doctor profile email
- Patient User email = Patient profile email

When a new doctor or patient account is registered, the backend automatically creates a basic matching profile if one does not already exist.

## Appointment flow

1. Admin creates the patient.
2. Admin creates/selects the doctor.
3. Admin creates an appointment for that patient and doctor.
4. Doctor logs in and sees the appointment automatically.
5. Doctor updates the appointment status and records treatment details.
6. Admin creates the bill.
7. Patient logs in and sees only their own appointments, records and bills.
