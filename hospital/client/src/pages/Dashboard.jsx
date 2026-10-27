import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [patientCount, setPatientCount] = useState(0);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [recentPatients, setRecentPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [doctorCount, setDoctorCount] = useState(0);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  // Get total patients from MongoDB
  const fetchPatientCount = async () => {
    try {
      setLoadingPatients(true);

      const response = await API.get("/patients");

      setPatientCount(response.data.length);

      // Get latest 3 patients
      setRecentPatients(response.data.slice(0, 3));

    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  };
  const fetchTodayAppointments = async () => {
    try {
      setLoadingAppointments(true);

      const response = await API.get("/appointments/today");

      setTodayAppointments(response.data);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };
  const fetchDoctorCount = async () => {
    try {
      setLoadingDoctors(true);

      const response = await API.get("/doctors");

      setDoctorCount(response.data.length);

    } catch (error) {
      console.error("Error fetching doctor count:", error);
    } finally {
      setLoadingDoctors(false);
    }
  };
  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);

      const response = await API.get("/billing");

      const totalRevenue = response.data
        .filter((bill) => bill.paymentStatus === "Paid")
        .reduce(
          (total, bill) => total + Number(bill.totalAmount || 0),
          0
        );

      setRevenue(totalRevenue);

    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoadingRevenue(false);
    }
  };
  useEffect(() => {
    fetchPatientCount();
    fetchDoctorCount();
    fetchTodayAppointments();
    fetchRevenue();
  }, []);

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Navbar />

        <main className="dashboard">

          <div className="dashboard-banner">

            <div className="banner-content">

              <p className="banner-greeting">
                Good Morning 👋
              </p>

              <h1>
                Mauli Hospital
              </h1>

              <p>
                Manage patients, appointments and hospital operations
                from one place.
              </p>

            </div>

            <div className="banner-actions">

              <input
                type="text"
                placeholder="Search patient by ID, name..."
                className="patient-search"
              />

              <button className="search-button">
                Search
              </button>

              <button
                className="new-patient-button"
                onClick={() => navigate("/patients")}
              >
                + New Patient
              </button>

              <button
                className="new-patient-button"
                onClick={() => navigate("/reports")}
              >
                Reports & Analysis
              </button>

            </div>

          </div>


          <div className="stats-grid">

            {/* PATIENTS */}
            <div className="stat-card">
              <div className="stat-icon">👥</div>

              <div>
                <p>Total Patients</p>

                <h2>
                  {loadingPatients ? "..." : patientCount}
                </h2>

                <span>
                  Registered patients
                </span>
              </div>
            </div>


            {/* APPOINTMENTS */}
            <div className="stat-card">
              <div className="stat-icon">📅</div>

              <div>
                <p>Appointments</p>
                <h2>
                  {loadingAppointments ? "..." : todayAppointments.length}
                </h2>
                <span>Today's appointments</span>
              </div>
            </div>


            {/* DOCTORS */}
            <div className="stat-card">
              <div className="stat-icon">👨‍⚕️</div>

              <div>
                <p>Doctors</p>

                <h2>
                  {loadingDoctors ? "..." : doctorCount}
                </h2>

                <span>Active doctors</span>
              </div>
            </div>


            {/* REVENUE */}

            <div className="stat-card">
              <div className="stat-icon">💰</div>

              <div>
                <p>Revenue</p>

                <h2>
                  {loadingRevenue
                    ? "..."
                    : `₹${revenue.toLocaleString("en-IN")}`}
                </h2>

                <span>Paid bills</span>
              </div>
            </div>
          </div>

            <div className="dashboard-grid">

              <div className="panel">

                <div className="panel-header">
                  <h2>Recent Patients</h2>

                  <button onClick={() => navigate("/patients")}>
                    View All
                  </button>
                </div>

                {recentPatients.length === 0 ? (
                  <div className="patient-row">
                    <div>
                      <strong>No patients found</strong>
                    </div>
                  </div>
                ) : (
                  recentPatients.map((patient) => (
                    <div className="patient-row" key={patient._id}>
                      <div className="patient-avatar">
                        {patient.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>


                      <div>
                        <strong>{patient.name}</strong>
                        <p>Patient</p>
                      </div>

                      <span>Recent</span>
                    </div>
                  ))
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2>Today's Appointments</h2>

                  <button onClick={() => navigate("/appointments")}>
                    View All
                  </button>
                </div>

                {loadingAppointments ? (
                  <div className="appointment">
                    <div>
                      <p>Loading appointments...</p>
                    </div>
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="appointment">
                    <div>
                      <p>No appointments for today</p>
                    </div>
                  </div>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div
                      className="appointment"
                      key={appointment._id}
                    >
                      <strong>
                        {appointment.appointmentTime}
                      </strong>

                      <div>
                        <p>
                          {appointment.patient?.name || "Unknown Patient"}
                        </p>

                        <span>
                          {appointment.reason || "Appointment"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            
          </div>
        </main>
      </div>
    </div>


  );
}

export default Dashboard;