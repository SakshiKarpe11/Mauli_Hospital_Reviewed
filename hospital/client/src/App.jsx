import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorMedicalRecords from "./pages/DoctorMedicalRecords";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import PatientAppointments from "./pages/PatientAppointments";
import PatientRecords from "./pages/PatientRecords";
import PatientBilling from "./pages/PatientBilling";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import PatientRegistration from "./pages/PatientRegistration";
import PatientRegister from "./pages/PatientRegister";
import DoctorRegister from "./pages/DoctorRegister";
import Reports from "./pages/Reports";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import MedicalRecords from "./pages/MedicalRecords";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
                <Route path="/patient-register" element={<PatientRegister />} />
                <Route path="/doctor-register" element={<DoctorRegister />} />

                {/* ADMIN */}
                <Route path="/" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute allowedRoles={["admin"]}><Patients /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><Appointments /></ProtectedRoute>} />
                <Route path="/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><Doctors /></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute allowedRoles={["admin"]}><MedicalRecords /></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute allowedRoles={["admin"]}><Billing /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />

                {/* DOCTOR */}
                <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor-patients" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>} />
                <Route path="/doctor-appointments" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>} />
                <Route path="/doctor-records" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorMedicalRecords /></ProtectedRoute>} />
                <Route path="/doctor-prescriptions" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorMedicalRecords /></ProtectedRoute>} />
                <Route path="/doctor-medical-records" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorMedicalRecords /></ProtectedRoute>} />

                {/* PATIENT */}
                <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/my-registration" element={<ProtectedRoute allowedRoles={["patient"]}><PatientRegistration /></ProtectedRoute>} />
                <Route path="/my-appointments" element={<ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>} />
                <Route path="/my-records" element={<ProtectedRoute allowedRoles={["patient"]}><PatientRecords /></ProtectedRoute>} />
                <Route path="/my-prescriptions" element={<ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptions /></ProtectedRoute>} />
                <Route path="/my-bills" element={<ProtectedRoute allowedRoles={["patient"]}><PatientBilling /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
