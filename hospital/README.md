# Mauli Hospital Management System

A React + Express + MongoDB hospital management system with role-based portals for Admin, Doctor and Patient.

## Main features

### Admin
- Patient registration and CRUD
- Doctor management
- OPD/appointments
- Medical records
- Billing
- Reports & Analysis with graph-style visualizations

### Doctor
- Doctor dashboard
- Assigned patient list
- Own appointments
- Appointment status update
- Patient medical records
- Prescription view

### Patient
- Patient account registration
- My Registration profile
- My appointments
- My medical records
- My prescriptions
- My bills

## Run the project

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

Frontend normally runs at `http://localhost:5173` and backend at `http://localhost:5000`.

## Important

The patient portal intentionally shows only the logged-in patient's data. It does not display every patient's hospital data.

A patient will see an empty appointment/record/billing list until an administrator creates an appointment, a doctor creates a medical record, or an administrator creates a bill for that patient.

Patient accounts are linked to patient profiles by email.

Do not publish `server/.env` because it contains your MongoDB connection credentials and JWT secret.


## Latest additions
- Doctor portal now has a New doctor? Create an account registration option.
- Patient billing includes a UPI QR code, Pay Online link, and Print Bill action.
- Replace `HOSPITAL_UPI_ID` in `client/src/pages/PatientBilling.jsx` with the hospital's real verified UPI ID before accepting payments.
- QR/UPI payment is a payment initiation flow only; the hospital/admin should verify the transaction and update the bill status in the admin billing page.
