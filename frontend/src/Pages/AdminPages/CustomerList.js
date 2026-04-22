import AdminSideBar from "../../Components/AdminSideBar";
import AdminNewCustomer from "../../Components/AdminNewCustomer";
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";

const getStoredToken = () =>
  sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const isAuthorized = (user) => {
  if (!user) return false;

  if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) {
    return true;
  }

  if (
    typeof user.role === "string" &&
    ["employee", "admin", "staff", "superuser"].includes(user.role.toLowerCase())
  ) {
    return true;
  }

  if (
    Array.isArray(user.roles) &&
    user.roles.some((r) =>
      ["employee", "admin", "staff", "superuser"].includes(
        String(r).toLowerCase()
      )
    )
  ) {
    return true;
  }

  return false;
};

const DisplayCustomer = ({
  customer,
  services,
  onBookAppointment,
  onRecommendServices,
  onAddVehicle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [bookData, setBookData] = useState({
    vehicle: "",
    service_type: "",
    scheduled_at: "",
  });
  const [recData, setRecData] = useState({
    vehicle: "",
    services: [],
    note: "",
  });
  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    license_plate: "",
  });
  const [bookMsg, setBookMsg] = useState("");
  const [recMsg, setRecMsg] = useState("");
  const [vehicleMsg, setVehicleMsg] = useState("");

  const { first_name, last_name, email, phone, vehicles = [], appointments = [] } = customer;

  const handleBook = async (e) => {
    e.preventDefault();
    setBookMsg("");

    const result = await onBookAppointment(customer.customer_id, bookData);

    if (result.ok) {
      setBookMsg("Appointment booked successfully! Email notification sent.");
      setBookData({ vehicle: "", service_type: "", scheduled_at: "" });
      setShowBookForm(false);
    } else {
      setBookMsg(result.error || "Failed to book appointment.");
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setRecMsg("");

    const result = await onRecommendServices(customer.customer_id, recData);

    if (result.ok) {
      setRecMsg("Recommendations sent! Email notification sent.");
      setRecData({ vehicle: "", services: [], note: "" });
      setShowRecommendForm(false);
    } else {
      setRecMsg(result.error || "Failed to send recommendations.");
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleMsg("");

    const result = await onAddVehicle(customer.customer_id, vehicleData);

    if (result.ok) {
      setVehicleMsg("Vehicle added successfully!");
      setVehicleData({ make: "", model: "", year: "", license_plate: "" });
      setShowVehicleForm(false);
    } else {
      setVehicleMsg(result.error || "Failed to add vehicle.");
    }
  };

  const toggleService = (serviceId) => {
    setRecData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  return (
    <div className={`customer-card ${expanded ? "expanded" : ""}`}>
      <div className="customer-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="customer-card-summary">
          <h5 style={{ color: "#2F6DAB", margin: 0 }}>
            {first_name} {last_name}
          </h5>
          <span className="customer-card-info">
            <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>
              {email}
            </a>
            {phone && (
              <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()}>
                {phone}
              </a>
            )}
          </span>
        </div>

        <div className="customer-card-peek" onClick={(e) => e.stopPropagation()}>
          {vehicles.length > 0 && (
            <div className="dropdown">
              <button className="dropbtn">Vehicles</button>
              <div className="dropdown-content">
                {vehicles.map((v) => (
                  <p key={v.vehicle_id}>
                    {v.year} {v.make} {v.model}
                  </p>
                ))}
              </div>
            </div>
          )}

          {appointments.length > 0 && (
            <div className="dropdown">
              <button className="dropbtn">Service History</button>
              <div className="dropdown-content">
                {appointments.slice(0, 3).map((a) => (
                  <p key={a.appointment_id}>
                    {a.scheduled_at
                      ? new Date(a.scheduled_at).toLocaleDateString()
                      : "—"}{" "}
                    – {a.service_type}
                  </p>
                ))}
                {appointments.length > 3 && (
                  <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                    +{appointments.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <span className="customer-card-chevron">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="customer-card-body">
          <div className="customer-section">
            <h6>Vehicles</h6>
            {vehicles.length > 0 ? (
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Plate</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.vehicle_id}>
                      <td>{v.year}</td>
                      <td>{v.make}</td>
                      <td>{v.model}</td>
                      <td>{v.license_plate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#9ca3af", margin: "4px 0" }}>
                No vehicles registered.
              </p>
            )}

            <button
              className="btn-action btn-add-vehicle"
              onClick={() => {
                setShowVehicleForm(!showVehicleForm);
                setShowBookForm(false);
                setShowRecommendForm(false);
              }}
            >
              + Add Vehicle
            </button>

            {vehicleMsg && <p className="customer-msg success">{vehicleMsg}</p>}

            {showVehicleForm && (
              <form className="customer-inline-form" onSubmit={handleAddVehicle}>
                <input
                  type="text"
                  placeholder="Make (e.g. Toyota)"
                  value={vehicleData.make}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, make: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Camry)"
                  value={vehicleData.model}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, model: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Year (e.g. 2023)"
                  min="1900"
                  max="2099"
                  value={vehicleData.year}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, year: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={vehicleData.license_plate}
                  onChange={(e) =>
                    setVehicleData({
                      ...vehicleData,
                      license_plate: e.target.value,
                    })
                  }
                  required
                />
                <div className="customer-form-actions">
                  <button type="submit" className="btn-action btn-add-vehicle">
                    Save Vehicle
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-cancel"
                    onClick={() => setShowVehicleForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="customer-action-buttons">
            <button
              className="btn-action btn-book"
              onClick={() => {
                setShowBookForm(!showBookForm);
                setShowRecommendForm(false);
              }}
            >
              Book Appointment
            </button>
            <button
              className="btn-action btn-recommend"
              onClick={() => {
                setShowRecommendForm(!showRecommendForm);
                setShowBookForm(false);
              }}
            >
              Recommend Services
            </button>
          </div>

          {bookMsg && <p className="customer-msg success">{bookMsg}</p>}
          {recMsg && <p className="customer-msg success">{recMsg}</p>}

          {showBookForm && (
            <form className="customer-inline-form" onSubmit={handleBook}>
              <select
                value={bookData.vehicle}
                onChange={(e) =>
                  setBookData({ ...bookData, vehicle: e.target.value })
                }
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.year} {v.make} {v.model} ({v.license_plate})
                  </option>
                ))}
              </select>

              <select
                value={bookData.service_type}
                onChange={(e) =>
                  setBookData({ ...bookData, service_type: e.target.value })
                }
                required
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.service_id} value={s.name}>
                    {s.name}
                    {s.cost ? ` ($${s.cost})` : ""}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={bookData.scheduled_at}
                onChange={(e) =>
                  setBookData({ ...bookData, scheduled_at: e.target.value })
                }
                required
              />

              <div className="customer-form-actions">
                <button type="submit" className="btn-action btn-book">
                  Confirm Booking
                </button>
                <button
                  type="button"
                  className="btn-action btn-cancel"
                  onClick={() => setShowBookForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {showRecommendForm && (
            <form className="customer-inline-form" onSubmit={handleRecommend}>
              <select
                value={recData.vehicle}
                onChange={(e) =>
                  setRecData({ ...recData, vehicle: e.target.value })
                }
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.year} {v.make} {v.model} ({v.license_plate})
                  </option>
                ))}
              </select>

              <div className="service-checklist">
                <label style={{ fontWeight: 600, marginBottom: 4 }}>
                  Select Services:
                </label>
                {services.map((s) => (
                  <label key={s.service_id} className="service-check-item">
                    <input
                      type="checkbox"
                      checked={recData.services.includes(s.service_id)}
                      onChange={() => toggleService(s.service_id)}
                    />
                    {s.name}
                    {s.cost ? ` ($${s.cost})` : ""}
                  </label>
                ))}
              </div>

              <textarea
                placeholder="Optional note..."
                value={recData.note}
                onChange={(e) =>
                  setRecData({ ...recData, note: e.target.value })
                }
                rows={2}
              />

              <div className="customer-form-actions">
                <button
                  type="submit"
                  className="btn-action btn-recommend"
                  disabled={recData.services.length === 0}
                >
                  Send Recommendations
                </button>
                <button
                  type="button"
                  className="btn-action btn-cancel"
                  onClick={() => setShowRecommendForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="customer-section">
            <h6>Service History ({appointments.length})</h6>
            {appointments.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No service history.</p>
            ) : (
              <div
                className={`service-history-list ${
                  appointments.length > 10 ? "scrollable" : ""
                }`}
              >
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Vehicle</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.appointment_id}>
                        <td>
                          {a.scheduled_at
                            ? new Date(a.scheduled_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{a.service_type}</td>
                        <td>{a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : "-"}</td>
                        <td>{a.cost ? `$${a.cost}` : "-"}</td>
                        <td>{a.finished_at ? "Completed" : "Upcoming"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerList = () => {
  const storedUser = getStoredUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    const headers = { Accept: "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/customers/`, { headers }),
      fetch(`${API_BASE_URL}/api/services/`, { headers }),
    ])
      .then(async ([resCust, resSvc]) => {
        if (!resCust.ok) throw new Error("Failed to load customers");
        if (!resSvc.ok) throw new Error("Failed to load services");

        const custData = await resCust.json();
        const svcData = await resSvc.json();

        setCustomers(custData || []);
        setServices(svcData || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBookAppointment = async (customerId, bookData) => {
    const token = getStoredToken();
    const headers = { "Content-Type": "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/${customerId}/book-appointment/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(bookData),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          error: data.detail || "Failed to book appointment.",
        };
      }

      const created = await res.json();

      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === customerId
            ? { ...c, appointments: [created, ...(c.appointments || [])] }
            : c
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleRecommendServices = async (customerId, recData) => {
    const token = getStoredToken();
    const headers = { "Content-Type": "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/${customerId}/recommend-services/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(recData),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          error: data.detail || "Failed to send recommendations.",
        };
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleAddVehicle = async (customerId, vehicleData) => {
    const token = getStoredToken();
    const headers = { "Content-Type": "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/${customerId}/vehicles/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(vehicleData),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: false,
          error: data.detail || "Failed to add vehicle.",
        };
      }

      const created = await res.json();

      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === customerId
            ? { ...c, vehicles: [...(c.vehicles || []), created] }
            : c
        )
      );

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const filtered = customers
    .filter((c) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();

      return (
        c.first_name?.toLowerCase().includes(term) ||
        c.last_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "name-asc":
          return `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
        case "name-desc":
          return `${b.first_name} ${b.last_name}`.localeCompare(
            `${a.first_name} ${a.last_name}`
          );
        case "most-appointments":
          return (b.appointments?.length || 0) - (a.appointments?.length || 0);
        case "most-vehicles":
          return (b.vehicles?.length || 0) - (a.vehicles?.length || 0);
        default:
          return 0;
      }
    });

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <section className="admin-dashboard">
      <AdminSideBar />
      <div className="admin-dashboard-content ms-md-5">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Customer Management</span>
        </div>

        <div className="customer-toolbar">
          <input
            className="customer-search-input"
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="customer-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="most-appointments">Most Appointments</option>
            <option value="most-vehicles">Most Vehicles</option>
          </select>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: 8 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 20 }}>Loading customers...</div>
        ) : (
          <div className="customer-list">
            {filtered.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No customers found.</p>
            ) : (
              filtered.map((customer) => (
                <DisplayCustomer
                  key={customer.customer_id}
                  customer={customer}
                  services={services}
                  onBookAppointment={handleBookAppointment}
                  onRecommendServices={handleRecommendServices}
                  onAddVehicle={handleAddVehicle}
                />
              ))
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button
            className="service-management-add-button"
            onClick={() => setIsFormOpen(true)}
          >
            Add New Customer
          </button>
        </div>

        <AdminNewCustomer
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      </div>
    </section>
  );
};

export default CustomerList;