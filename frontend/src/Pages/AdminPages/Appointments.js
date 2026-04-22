import React, { useState, useEffect, useMemo } from "react";
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
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOptionModal, setOptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerInput, setCustomerInput] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchAppts = fetch(`${API_BASE_URL}/api/admin/appointments/`, { headers });
    const fetchCustomers = fetch(`${API_BASE_URL}/api/admin/customers/`, { headers });
    const fetchServices = fetch(`${API_BASE_URL}/api/services/`, { headers });

    Promise.all([fetchAppts, fetchCustomers, fetchServices])
      .then(async ([resAppts, resCustomers, resServices]) => {
        if (!resAppts.ok) throw new Error("Failed to load appointments");
        if (!resCustomers.ok) throw new Error("Failed to load customers");
        if (!resServices.ok) throw new Error("Failed to load services");

        const apptsData = await resAppts.json().catch(() => []);
        const customersData = await resCustomers.json().catch(() => []);
        const servicesData = await resServices.json().catch(() => []);

        const normalized = (apptsData || []).map((a) => ({
          ...a,
          id: a.appointment_id,
          date: a.scheduled_at ? a.scheduled_at.split("T")[0] : "",
          time: a.scheduled_at ? a.scheduled_at.split("T")[1]?.slice(0, 5) : "",
        }));

        setAppointments(normalized);
        setCustomers(customersData || []);
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
    if (!newAppointment.datetime || !newAppointment.vehicle) {
      alert("Date/time and Vehicle are required");
      return;
    }
    if (lineItems.length === 0) {
      alert("Add at least one service");
      return;
    }
    for (const ln of lineItems) {
      if (!ln.name.trim()) {
        alert("Every service line needs a name");
        return;
      }
    }

    const token = sessionStorage.getItem("authToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const serviceTypeSummary = lineItems.map((l) => l.name.trim()).join(", ");
    const total = lineItems.reduce((s, l) => s + (parseFloat(l.cost) || 0), 0);

    const payload = {
      vehicle: newAppointment.vehicle,
      service_type: serviceTypeSummary,
      cost: total.toFixed(2),
      scheduled_at: newAppointment.datetime,
      lines: lineItems.map((l) => ({ name: l.name.trim(), cost: parseFloat(l.cost) || 0 })),
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
        setCustomerInput("");
        setLineItems([]);
        setCatalogPick("");
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
  const [lineItems, setLineItems] = useState([]);
  const [catalogPick, setCatalogPick] = useState("");

  const addCatalogLine = () => {
    if (!catalogPick) return;
    const svc = services.find((s) => String(s.service_id) === String(catalogPick));
    if (!svc) return;
    setLineItems((prev) => [...prev, { name: svc.name, cost: svc.cost != null ? String(svc.cost) : "0" }]);
    setCatalogPick("");
  };
  const addCustomLine = () => setLineItems((prev) => [...prev, { name: "", cost: "0" }]);
  const removeLine = (idx) => setLineItems((prev) => prev.filter((_, i) => i !== idx));
  const updateLine = (idx, field, value) =>
    setLineItems((prev) => prev.map((ln, i) => (i === idx ? { ...ln, [field]: value } : ln)));
  const linesTotal = lineItems.reduce((sum, ln) => sum + (parseFloat(ln.cost) || 0), 0);

  /* ---------------- Calendar Events ---------------- */
  const events = useMemo(
    () =>
      appointments.map((item) => ({
        id: item.appointment_id || item.id,
        title: item.service_type || item.name || item.title,
        date: item.scheduled_at ? item.scheduled_at.split("T")[0] : item.date,
        backgroundColor: item.finished_at || item.status === "complete" ? "#22c55e" : "#f97316",
        extendedProps: { ...item },
      })),
    [appointments]
  );

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <section className="admin-dashboard">
      <AdminSideBar />

      <div className="admin-dashboard-content">
        <div className="admin-appointments-header">
          <h1 className="admin-appointments-title">Appointments</h1>

          <button type="button" className="admin-appointments-btn-primary" onClick={() => setShowModal(true)}>
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
                if (showOptionModal) return;
                const data = info.event.extendedProps;
                setTooltip({ ...data, title: info.event.title, x: info.jsEvent.pageX, y: info.jsEvent.pageY });
              }}
              eventClick={(info) => {
                const data = info.event.extendedProps;
                setTooltip({ ...data, title: info.event.title, x: info.jsEvent.pageX, y: info.jsEvent.pageY });
                setOptionModal(true);
              }}
              eventMouseLeave={() => {
                if (showOptionModal) return;
                setTooltip(null);
              }}
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
                    <span>Time:</span> {(() => {
                      const raw = tooltip.scheduled_at;
                      if (!raw) return tooltip.time || "-";
                      const d = new Date(raw);
                      if (isNaN(d.getTime())) return raw;
                      return d.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      });
                    })()}
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
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const apptId = tooltip.appointment_id || tooltip.id;
                      if (!apptId) {
                        alert("No appointment id available");
                        return;
                      }
                      const token = sessionStorage.getItem("authToken");
                      const headers = { "Content-Type": "application/json" };
                      if (token) headers["Authorization"] = `Bearer ${token}`;
                      fetch(`${API_BASE_URL}/api/invoices/`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ appointment: apptId, status: "pending" }),
                      })
                        .then(async (res) => {
                          const body = await res.json().catch(() => null);
                          if (!res.ok) {
                            const detail = body?.detail || body?.appointment?.[0] || JSON.stringify(body) || "Failed";
                            throw new Error(detail);
                          }
                          alert(`Invoice #${body.invoice_id} created`);
                          setOptionModal(false);
                        })
                        .catch((err) => {
                          if (String(err.message).toLowerCase().includes("already exists") ||
                              String(err.message).toLowerCase().includes("unique")) {
                            alert("An invoice already exists for this appointment.");
                          } else {
                            alert(`Failed to create invoice: ${err.message}`);
                          }
                        });
                    }}
                  >
                    Create Invoice
                  </button>
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
                  {/* Customer Autocomplete + Vehicle Select */}
                  {(() => {
                    const selectedCustomer = customers.find(
                      (c) => `${c.first_name} ${c.last_name} (${c.email})` === customerInput
                    );
                    const customerVehicles = selectedCustomer?.vehicles || [];
                    return (
                      <>
                        <input
                          type="text"
                          className="modal-select"
                          list="appt-customer-list"
                          placeholder="Select customer"
                          value={customerInput}
                          onChange={(e) => {
                            setCustomerInput(e.target.value);
                            setNewAppointment((prev) => ({ ...prev, vehicle: "" }));
                          }}
                        />
                        <datalist id="appt-customer-list">
                          {customers.map((c) => (
                            <option
                              key={c.customer_id}
                              value={`${c.first_name} ${c.last_name} (${c.email})`}
                            />
                          ))}
                        </datalist>

                        <select
                          className="modal-select"
                          value={newAppointment.vehicle}
                          onChange={(e) =>
                            setNewAppointment({ ...newAppointment, vehicle: e.target.value })
                          }
                        >
                          <option value="">
                            {!selectedCustomer
                              ? "Select a customer first"
                              : customerVehicles.length === 0
                              ? "No vehicles on file"
                              : "Select vehicle"}
                          </option>
                          {customerVehicles.map((v) => (
                            <option key={v.vehicle_id} value={v.vehicle_id}>
                              {`${v.make} ${v.model} ${v.year} (${v.license_plate})`}
                            </option>
                          ))}
                        </select>
                      </>
                    );
                  })()}

                  {/* Service Line Items */}
                  <div className="appt-lines" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Services</div>

                    {lineItems.length === 0 && (
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                        No services yet. Add from the catalog or create a custom one.
                      </div>
                    )}

                    {lineItems.map((ln, idx) => (
                      <div
                        key={idx}
                        style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}
                      >
                        <input
                          type="text"
                          className="modal-input"
                          placeholder="Service name"
                          value={ln.name}
                          onChange={(e) => updateLine(idx, "name", e.target.value)}
                          style={{ flex: 2, margin: 0 }}
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="modal-input"
                          placeholder="0.00"
                          value={ln.cost}
                          onChange={(e) => updateLine(idx, "cost", e.target.value)}
                          style={{ flex: 1, margin: 0 }}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          title="Remove"
                          style={{
                            background: "transparent",
                            border: "1px solid #ef4444",
                            color: "#ef4444",
                            borderRadius: 6,
                            padding: "4px 8px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <select
                        className="modal-select"
                        value={catalogPick}
                        onChange={(e) => setCatalogPick(e.target.value)}
                        style={{ flex: 2, margin: 0 }}
                      >
                        <option value="">Add service from catalog…</option>
                        {services.map((s) => (
                          <option key={s.service_id} value={s.service_id}>
                            {s.name} {s.cost != null ? `($${s.cost})` : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addCatalogLine}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px" }}
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        onClick={addCustomLine}
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px" }}
                      >
                        + Custom
                      </button>
                    </div>

                    <div style={{ marginTop: 10, textAlign: "right", fontWeight: 600 }}>
                      Total: ${linesTotal.toFixed(2)}
                    </div>
                  </div>

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
                  <button className="btn btn-secondary" onClick={() => { setShowModal(false); setCustomerInput(""); setLineItems([]); setCatalogPick(""); }}>
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
