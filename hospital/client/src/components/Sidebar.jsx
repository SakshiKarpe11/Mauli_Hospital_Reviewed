
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  // Get logged-in user
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const role = user?.role;

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">

      {/* =========================
          LOGO
      ========================= */}
      <div className="sidebar-logo">

        <div className="logo-box">
          M
        </div>

        <div>
          <h2>MAULI</h2>
          <p>HOSPITAL</p>
        </div>

      </div>


      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="sidebar-nav">

        {/* Dashboard */}
        {role === "admin" && (
          <Link to="/" className="sidebar-link">
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>
        )}

        {role === "doctor" && (
          <Link
            to="/doctor-dashboard"
            className="sidebar-link"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>
        )}

        {role === "patient" && (
          <Link
            to="/patient-dashboard"
            className="sidebar-link"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>
        )}


        {/* =================================
            ADMIN SIDEBAR
        ================================= */}
        {role === "admin" && (
          <>

            {/* Patient Registration */}
            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>PATIENT REGISTRATION</span>
              </div>

              <Link
                to="/patients"
                className="sidebar-sub-link"
              >
                Patient List
              </Link>

              <Link
                to="/patients"
                className="sidebar-sub-link"
              >
                New Patient
              </Link>

            </div>
            <div className="sidebar-section">
              <div className="section-title">
                <span>▾</span>
                <span>DOCTORS</span>
              </div>

              <Link to="/doctors" className="sidebar-sub-link">
                Doctor List
              </Link>

              <Link to="/doctors" className="sidebar-sub-link">
                Add Doctor
              </Link>
            </div>

            {/* OPD */}
            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>OPD</span>
              </div>

              <Link
                to="/appointments"
                className="sidebar-sub-link"
              >
                OPD List
              </Link>

            </div>
            <div className="sidebar-section">
              <div className="section-title">
                <span>▾</span>
                <span>MEDICAL RECORDS</span>
              </div>

              <Link to="/records" className="sidebar-sub-link">
                Medical Records
              </Link>
            </div>

            {/* IPD */}
            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>IPD</span>
              </div>

              <Link
                to="/patients"
                className="sidebar-sub-link"
              >
                IPD Patients
              </Link>

              <Link
                to="/patients"
                className="sidebar-sub-link"
              >
                New Admission
              </Link>

            </div>


           

            <div className="sidebar-section">
              <div className="section-title">
                <span>▾</span>
                <span>REPORTS & ANALYSIS</span>
              </div>
              <Link to="/reports" className="sidebar-sub-link">
                Reports & Graphs
              </Link>
            </div>

            {/* Billing */}
            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>BILLING</span>
              </div>

              <Link
                to="/billing"
                className="sidebar-sub-link"
              >
                Bills
              </Link>

            </div>

          </>
        )}


        {/* =================================
            DOCTOR SIDEBAR
        ================================= */}
        {role === "doctor" && (
          <>

            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>MY PATIENTS</span>
              </div>

              <Link
                to="/doctor-patients"
                className="sidebar-sub-link"
              >
                Patient List
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>APPOINTMENTS</span>
              </div>

              <Link
                to="/doctor-appointments"
                className="sidebar-sub-link"
              >
                Today's Appointments
              </Link>

              <Link
                to="/doctor-appointments"
                className="sidebar-sub-link"
              >
                All Appointments
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>MEDICAL RECORDS</span>
              </div>

              <Link
                to="/doctor-records"
                className="sidebar-sub-link"
              >
                Patient Records
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>PRESCRIPTIONS</span>
              </div>

              <Link
                to="/doctor-prescriptions"
                className="sidebar-sub-link"
              >
                Prescriptions
              </Link>

            </div>

          </>
        )}


        {/* =================================
            PATIENT SIDEBAR
        ================================= */}
        {role === "patient" && (
          <>

            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>REGISTRATION</span>
              </div>

              <Link
                to="/my-registration"
                className="sidebar-sub-link"
              >
                My Registration
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>APPOINTMENTS</span>
              </div>

              <Link
                to="/my-appointments"
                className="sidebar-sub-link"
              >
                My Appointments
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>MEDICAL RECORDS</span>
              </div>

              <Link
                to="/my-records"
                className="sidebar-sub-link"
              >
                My Records
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>PRESCRIPTIONS</span>
              </div>

              <Link
                to="/my-prescriptions"
                className="sidebar-sub-link"
              >
                My Prescriptions
              </Link>

            </div>


            <div className="sidebar-section">

              <div className="section-title">
                <span>▾</span>
                <span>BILLING</span>
              </div>

              <Link
                to="/my-bills"
                className="sidebar-sub-link"
              >
                My Bills
              </Link>

            </div>

          </>
        )}

      </nav>


      {/* =========================
          LOGOUT
      ========================= */}
      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <span>🚪</span>
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;
