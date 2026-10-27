import { useEffect, useState } from "react";
import API from "../services/api";
import "./Patients.css";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });

  // =========================
  // GET ALL PATIENTS
  // =========================
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/patients");

      // Supports either:
      // response.data = [...]
      // OR response.data.patients = [...]
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.patients || [];

      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load patients. Please check the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load patients when page opens
  useEffect(() => {
    fetchPatients();
  }, []);

  // =========================
  // FORM INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingPatient(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      bloodGroup: "",
      address: "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (patient) => {
    setEditingPatient(patient);

    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      age: patient.age || "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      address: patient.address || "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPatient(null);
  };

  // =========================
  // ADD / UPDATE PATIENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const patientData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: formData.age ? Number(formData.age) : "",
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: formData.address.trim(),
      };

      if (editingPatient) {
        await API.put(
          `/patients/${editingPatient._id}`,
          patientData
        );
      } else {
        await API.post("/patients", patientData);
      }

      await fetchPatients();

      setShowModal(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Error saving patient:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save patient."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE PATIENT
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/patients/${id}`);

      setPatients((previous) =>
        previous.filter((patient) => patient._id !== id)
      );
    } catch (error) {
      console.error("Error deleting patient:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete patient."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredPatients = patients.filter((patient) => {
    const searchText = search.toLowerCase();

    return (
      patient.name?.toLowerCase().includes(searchText) ||
      patient.email?.toLowerCase().includes(searchText) ||
      patient.phone?.toLowerCase().includes(searchText) ||
      patient.bloodGroup?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="patients-page">

      {/* ================= HEADER ================= */}
      <div className="patients-header">

        <div>
          <h1>Patient Management</h1>

          <p>
            Manage patient registration, information and records.
          </p>
        </div>

        <button
          className="add-patient-btn"
          onClick={openAddModal}
        >
          <span>＋</span>
          Add New Patient
        </button>

      </div>


      {/* ================= STAT CARDS ================= */}
      <div className="patient-stat-grid">

        <div className="patient-stat-card">

          <div className="patient-stat-icon blue">
            👥
          </div>

          <div>
            <p>Total Patients</p>
            <h2>{patients.length}</h2>
          </div>

        </div>


        <div className="patient-stat-card">

          <div className="patient-stat-icon green">
            🟢
          </div>

          <div>
            <p>Active Patients</p>
            <h2>{patients.length}</h2>
          </div>

        </div>


        <div className="patient-stat-card">

          <div className="patient-stat-icon purple">
            📋
          </div>

          <div>
            <p>Showing</p>
            <h2>{filteredPatients.length}</h2>
          </div>

        </div>

      </div>


      {/* ================= TABLE PANEL ================= */}
      <div className="patients-panel">

        <div className="patients-panel-header">

          <div>
            <h2>All Patients</h2>

            <p>
              Registered patients in Mauli Hospital
            </p>
          </div>


          <div className="patient-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>


        {/* Error */}
        {error && !showModal && (
          <div className="patients-error">
            {error}
          </div>
        )}


        {/* ================= LOADING ================= */}
        {loading ? (

          <div className="patients-loading">
            <div className="loading-spinner"></div>
            <p>Loading patients...</p>
          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="no-patients">

            <div className="no-patients-icon">
              👥
            </div>

            <h3>No patients found</h3>

            <p>
              {search
                ? "Try a different search."
                : "No patients have been registered yet."}
            </p>

            {!search && (
              <button
                className="add-patient-small"
                onClick={openAddModal}
              >
                + Add First Patient
              </button>
            )}

          </div>

        ) : (

          <div className="patients-table-wrapper">

            <table className="patients-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {filteredPatients.map((patient) => (

                  <tr key={patient._id}>

                    {/* PATIENT */}
                    <td>

                      <div className="patient-info">

                        <div className="patient-avatar">
                          {patient.name
                            ? patient.name
                                .charAt(0)
                                .toUpperCase()
                            : "P"}
                        </div>

                        <div>

                          <strong>
                            {patient.name || "Unknown"}
                          </strong>

                          <span>
                            ID:{" "}
                            {patient._id
                              ? patient._id
                                  .slice(-6)
                                  .toUpperCase()
                              : "N/A"}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* CONTACT */}
                    <td>

                      <div className="contact-info">

                        <span>
                          📞 {patient.phone || "N/A"}
                        </span>

                        <span>
                          ✉️ {patient.email || "N/A"}
                        </span>

                      </div>

                    </td>


                    {/* AGE */}
                    <td>
                      {patient.age || "—"}
                    </td>


                    {/* GENDER */}
                    <td>
                      {patient.gender || "—"}
                    </td>


                    {/* BLOOD GROUP */}
                    <td>

                      {patient.bloodGroup ? (

                        <span className="blood-badge">
                          {patient.bloodGroup}
                        </span>

                      ) : (
                        "—"
                      )}

                    </td>


                    {/* ADDRESS */}
                    <td>
                      <span className="address-text">
                        {patient.address || "—"}
                      </span>
                    </td>


                    {/* ACTIONS */}
                    <td>

                      <div className="patient-actions">

                        <button
                          className="action-btn edit"
                          title="Edit patient"
                          onClick={() =>
                            openEditModal(patient)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          className="action-btn delete"
                          title="Delete patient"
                          onClick={() =>
                            handleDelete(patient._id)
                          }
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= ADD / EDIT MODAL ================= */}
      {showModal && (

        <div className="modal-overlay">

          <div className="patient-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingPatient
                    ? "Edit Patient"
                    : "Add New Patient"}
                </h2>

                <p>
                  {editingPatient
                    ? "Update patient information."
                    : "Enter the patient's information below."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* NAME */}
                <div className="patient-form-group full">

                  <label>
                    Patient Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter patient name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>


                {/* EMAIL */}
                <div className="patient-form-group">

                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="patient@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>


                {/* PHONE */}
                <div className="patient-form-group">

                  <label>
                    Phone Number <span>*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>


                {/* AGE */}
                <div className="patient-form-group">

                  <label>Age</label>

                  <input
                    type="number"
                    name="age"
                    placeholder="Enter age"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                  />

                </div>


                {/* GENDER */}
                <div className="patient-form-group">

                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* BLOOD GROUP */}
                <div className="patient-form-group">

                  <label>Blood Group</label>

                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select blood group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>

                  </select>

                </div>


                {/* ADDRESS */}
                <div className="patient-form-group full">

                  <label>Address</label>

                  <textarea
                    name="address"
                    placeholder="Enter patient address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>

                </div>

              </div>


              {/* MODAL ERROR */}
              {error && (
                <div className="modal-error">
                  {error}
                </div>
              )}


              {/* BUTTONS */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-patient-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPatient
                    ? "Update Patient"
                    : "Add Patient"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Patients;