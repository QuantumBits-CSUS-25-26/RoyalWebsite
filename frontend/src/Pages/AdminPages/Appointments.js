import React, { useState, useEffect } from "react";
import "./Appointments.css";
import AdminSideBar from "../../Components/AdminSideBar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";
import { API_BASE_URL } from "../../config";

const Appointments = () => {
  // determine authorization from stored user object
  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const storedUser = parseStoredUser();

  const isAuthorized = (user) => {
    // if a token exists assume authenticated and allow; stored user may not be saved by login flow
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (!user && token) return true;
    if (!user) return false;
    if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) return true;
    if (user.role && (user.role === "employee" || user.role === "admin")) return true;
    if (Array.isArray(user.roles) && (user.roles.includes("employee") || user.roles.includes("admin"))) return true;
    return false;
  };
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOptionModal, setOptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchAppts = fetch(`${API_BASE_URL}/api/admin/appointments/`, { headers });
    const fetchVehicles = fetch(`${API_BASE_URL}/api/admin/vehicles/`, { headers });
    const fetchServices = fetch(`${API_BASE_URL}/api/services/`, { headers });

    Promise.all([fetchAppts, fetchVehicles, fetchServices])
      .then(async ([resAppts, resVehicles, resServices]) => {
        if (!resAppts.ok) throw new Error("Failed to load appointments");
        if (!resVehicles.ok) throw new Error("Failed to load vehicles");
        if (!resServices.ok) throw new Error("Failed to load services");

        const apptsData = await resAppts.json().catch(() => []);
        const vehiclesData = await resVehicles.json().catch(() => []);
        const servicesData = await resServices.json().catch(() => []);

        const normalized = (apptsData || []).map((a) => ({
          ...a,
          id: a.appointment_id,
          date: a.scheduled_at ? a.scheduled_at.split("T")[0] : "",
          time: a.scheduled_at ? a.scheduled_at.split("T")[1]?.slice(0, 5) : "",
        }));

        setAppointments(normalized);
        setVehicles(vehiclesData || []);
        setServices(servicesData || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load admin data");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- Handlers ---------------- */
  const handleCreate = () => {
    if (!newAppointment.name || !newAppointment.datetime || !newAppointment.vehicle) {
      alert("Service, Date/time and Vehicle are required");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const payload = {
      vehicle: newAppointment.vehicle,
      service_type: newAppointment.name,
      scheduled_at: newAppointment.datetime,
    };

    fetch(`${API_BASE_URL}/api/appointments/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || "Failed to create appointment");
        }
        return res.json();
      })
      .then((created) => {
        const normalized = {
          ...created,
          id: created.appointment_id || Date.now(),
          date: created.scheduled_at ? created.scheduled_at.split("T")[0] : "",
          time: created.scheduled_at ? created.scheduled_at.split("T")[1]?.slice(0, 5) : "",
        };
        setAppointments((prev) => [...prev, normalized]);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to create appointment");
      })
      .finally(() => {
        setShowModal(false);
        setNewAppointment({ name: "", description: "", vehicle: "", datetime: "", paymentStatus: "Pending" });
      });
  };

  const handleUpdate = (appointment) => {
    console.log("Update:", appointment);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    const token = sessionStorage.getItem("authToken");
    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/appointments/${id}/`, { method: "DELETE", headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setAppointments((prev) => prev.filter((a) => (a.appointment_id || a.id) !== id));
        setTooltip(null);
      })
      .catch((err) => console.error(err));
  };

  /* ---------- local form state ---------- */
  const [newAppointment, setNewAppointment] = useState({ name: "", description: "", vehicle: "", datetime: "", paymentStatus: "Pending" });

  /* ---------------- Calendar Events ---------------- */
  const events = appointments.map((item) => ({
    id: item.appointment_id || item.id,
    title: item.service_type || item.name || item.title,
    date: item.scheduled_at ? item.scheduled_at.split("T")[0] : item.date,
    backgroundColor: item.finished_at || item.status === "complete" ? "#22c55e" : "#f97316",
    extendedProps: { ...item },
  }));

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <section className="admin-dashboard">
      <AdminSideBar />

      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Appointments</span>

          <button className="btn-create" onClick={() => setShowModal(true)}>
            + New Appointment
          </button>
        </div>

        <div className="admin-content">
          {error && (
            <div className="form-error" role="alert" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 20 }}>Loading appointments...</div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventMouseEnter={(info) => {
                const data = info.event.extendedProps;
                setTooltip({ ...data, title: info.event.title, x: info.jsEvent.pageX, y: info.jsEvent.pageY });
              }}
              eventClick={(info) => {
                const data = info.event.extendedProps;
                setTooltip({ ...data, title: info.event.title, x: info.jsEvent.pageX, y: info.jsEvent.pageY });
                setOptionModal(true);
              }}
              eventMouseLeave={() => setTooltip(null)}
            />
          )}

          {/* ---------- Option Modal ---------- */}
          {showOptionModal && tooltip && (
            <div className="modal-overlay">
              <div
                style={{
                  position: "absolute",
                  background: "#111827",
                  color: "#fff",
                  padding: "40px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  zIndex: 1000,
                  width: "380px",
                }}
              >
                <h3>Appointment</h3>
                <div className="modal-body mt-5">
                  <div>
                    <span>Customer:</span> {tooltip.customer_name || tooltip.customer || "-"}
                  </div>
                  <div>
                    <span>Phone:</span> {tooltip.vehicle?.customer?.phone || "-"}
                  </div>
                  <div>
                    <span>Vehicle:</span>{" "}
                    {tooltip.vehicle ? `${tooltip.vehicle.make} ${tooltip.vehicle.model} ${tooltip.vehicle.year}` : "-"}
                  </div>
                  <div>
                    <span>Time:</span> {tooltip.scheduled_at || tooltip.time || "-"}
                  </div>
                  <strong>{tooltip.title}</strong>
                  <p style={{ margin: "6px 0" }}>{tooltip.description || tooltip.service_type || ""}</p>

                  <select className="modal-select">
                    <option value="">Select Status</option>
                    {["upcoming", "reschedule", "complete"].map((s, i) => (
                      <option key={i} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => setOptionModal(false)}>
                    Close
                  </button>
                  <button className="btn btn-secondary" onClick={() => setOptionModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Create Modal ---------- */}
          {showModal && (
            <div className="modal-overlay">
              <div
                style={{
                  position: "absolute",
                  background: "#111827",
                  color: "#fff",
                  padding: "40px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  zIndex: 1000,
                  width: "750px",
                }}
              >
                <h3>Create Appointment</h3>
                <div className="modal-body mt-5">
                  {/* Vehicle Select (admin) */}
                  <select
                    className="modal-select"
                    value={newAppointment.vehicle}
                    onChange={(e) => setNewAppointment({ ...newAppointment, vehicle: e.target.value })}
                  >
                    <option value="">Select vehicle (customer)</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {`${v.make} ${v.model} ${v.year} (${v.license_plate}) — ${v.customer?.first_name || ""} ${v.customer?.last_name || ""}`}
                      </option>
                    ))}
                  </select>

                  {/* Service Select */}
                  <select className="modal-select" value={newAppointment.name} onChange={(e) => setNewAppointment({ ...newAppointment, name: e.target.value })}>
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s.service_id} value={s.name}>
                        {s.name} {s.cost ? `($${s.cost})` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Date */}
                  <input
                    type="datetime-local"
                    className="modal-input"
                    aria-label="scheduled-at"
                    value={newAppointment.datetime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, datetime: e.target.value })}
                  />

                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={handleCreate}>
                    Save
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Appointments;
