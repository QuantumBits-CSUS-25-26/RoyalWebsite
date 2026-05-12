import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../Components/AdminSideBar";
import {
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { API_BASE_URL } from "../../config";
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";
import "./AdminInvoices.css";

const authHeaders = () => {
  const token =
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // Return yyyy-mm-dd (for date inputs)
  return d.toISOString().slice(0, 10);
};

const formatMoney = (v) => {
  const n = parseFloat(v);
  if (!isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const sumLines = (lines) =>
  lines.reduce((acc, l) => acc + (parseFloat(l.cost) || 0), 0);

const emptyForm = {
  appointment: "",
  status: "pending",
  due_date: "",
  notes: "",
  lines: [],
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [siteServices, setSiteServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const toggleMonthDropdown = () =>
    setMonthDropdownOpen((prevState) => !prevState);
  const toggleYearDropdown = () =>
    setYearDropdownOpen((prevState) => !prevState);

  const fetchAll = useCallback((searchValue = "") => {
    setLoading(true);
    const headers = authHeaders();

    let invoiceUrl = `${API_BASE_URL}/api/invoices/`;

    const params = new URLSearchParams();

    if (searchValue) params.append("search", searchValue);
    if (monthFilter) params.append("month", monthFilter);
    if (yearFilter) params.append("year", yearFilter);

    const queryString = params.toString();
    if (queryString) invoiceUrl += `?${queryString}`;

    const readJsonOrThrow = async (res, label) => {
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          `${label} failed: ${res.status} ${res.statusText} ${data?.detail ? `- ${data.detail}` : ""
          }`
        );
      }

      return data;
    };

    Promise.all([
      fetch(invoiceUrl, { headers }).then((r) => readJsonOrThrow(r, "Invoices")),
      fetch(`${API_BASE_URL}/api/admin/appointments/`, { headers }).then((r) =>
        readJsonOrThrow(r, "Appointments")
      ),
      fetch(`${API_BASE_URL}/api/services/`, { headers }).then((r) =>
        readJsonOrThrow(r, "Services")
      ),
    ])
      .then(([inv, appts, svcs]) => {
        console.log("Invoices response:", inv);
        console.log("Appointments response:", appts);
        console.log("Services response:", svcs);

        setInvoices(Array.isArray(inv) ? inv : inv?.results || []);
        setAppointments(Array.isArray(appts) ? appts : appts?.results || []);
        setSiteServices(Array.isArray(svcs) ? svcs : svcs?.results || []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchAll("");
  }, [monthFilter, yearFilter]);


  const deletingInvoice = useMemo(
    () => invoices.find((i) => i.invoice_id === deletingId),
    [invoices, deletingId],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAll(search);
  };

  // Appointments that don't yet have an invoice (for the Add picker)
  const availableAppointments = useMemo(() => {
    const used = new Set(
      invoices.map((i) => i.appointment?.appointment_id).filter(Boolean),
    );
    return appointments.filter((a) => !used.has(a.appointment_id));
  }, [appointments, invoices]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setAddOpen(true);
  };

  const openEdit = (inv) => {
    setEditingId(inv.invoice_id);
    setForm({
      appointment: inv.appointment?.appointment_id || "",
      status: inv.status || "pending",
      due_date: inv.due_date || "",
      notes: inv.notes || "",
      lines: (inv.lines || []).map((l) => ({
        line_id: l.line_id,
        name: l.name,
        cost: String(l.cost ?? ""),
      })),
    });
    setEditOpen(true);
  };

  const openDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const closeModals = useCallback(() => {
    setAddOpen(false);
    setEditOpen(false);
    setDeleteOpen(false);
    setEditingId(null);
    setDeletingId(null);
    setForm(emptyForm);
  }, []);

  // When an appointment is picked in the Add modal, prefill lines from appointment.
  // Split service_type on commas and resolve each name to a catalog SiteService so
  // we use the default price per service. Fallback to a single line if no match.
  const handlePickAppointment = (apptId) => {
    const appt = appointments.find(
      (a) => String(a.appointment_id) === String(apptId),
    );
    let lines = [];
    if (appt) {
      const names = (appt.service_type || "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length > 0) {
        lines = names.map((nm) => {
          const svc = siteServices.find(
            (s) => (s.name || "").toLowerCase() === nm.toLowerCase(),
          );
          if (svc) {
            return { name: svc.name, cost: svc.cost ? String(svc.cost) : "0" };
          }
          return { name: nm, cost: "0" };
        });
        // If only a single service name and no catalog match, fall back to the
        // appointment's total cost so the invoice at least reflects what was billed.
        if (
          lines.length === 1 &&
          parseFloat(lines[0].cost) === 0 &&
          appt.cost
        ) {
          lines[0].cost = String(appt.cost);
        }
      } else if (appt.cost) {
        lines = [{ name: "Service", cost: String(appt.cost) }];
      }
    }
    setForm((f) => ({ ...f, appointment: apptId, lines }));
  };

  const updateLine = (idx, field, value) => {
    setForm((f) => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], [field]: value };
      return { ...f, lines };
    });
  };

  const removeLine = (idx) => {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  };

  const addLineFromCatalog = (serviceId) => {
    if (!serviceId) return;
    const svc = siteServices.find(
      (s) => String(s.service_id) === String(serviceId),
    );
    if (!svc) return;
    setForm((f) => ({
      ...f,
      lines: [
        ...f.lines,
        { name: svc.name, cost: svc.cost ? String(svc.cost) : "0" },
      ],
    }));
  };

  const addCustomLine = () => {
    setForm((f) => ({ ...f, lines: [...f.lines, { name: "", cost: "0" }] }));
  };

  const buildPayload = () => ({
    appointment: form.appointment ? Number(form.appointment) : undefined,
    status: form.status,
    due_date: form.due_date || null,
    notes: form.notes || "",
    lines: form.lines
      .filter((l) => (l.name || "").trim())
      .map((l) => ({ name: l.name.trim(), cost: parseFloat(l.cost) || 0 })),
  });

  const handleAddSave = () => {
    if (!form.appointment) {
      alert("Please select an appointment");
      return;
    }
    fetch(`${API_BASE_URL}/api/invoices/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(buildPayload()),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok)
          throw new Error(body?.detail || JSON.stringify(body) || "Failed");
        setInvoices((prev) => [body, ...prev]);
        closeModals();
      })
      .catch((err) => alert(`Failed to create invoice: ${err.message}`));
  };

  const handleEditSave = () => {
    if (!editingId) return;
    fetch(`${API_BASE_URL}/api/invoices/${editingId}/`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(buildPayload()),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok)
          throw new Error(body?.detail || JSON.stringify(body) || "Failed");
        setInvoices((prev) =>
          prev.map((i) => (i.invoice_id === body.invoice_id ? body : i)),
        );
        closeModals();
      })
      .catch((err) => alert(`Failed to update invoice: ${err.message}`));
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    fetch(`${API_BASE_URL}/api/invoices/${deletingId}/`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) throw new Error("Delete failed");
        setInvoices((prev) => prev.filter((i) => i.invoice_id !== deletingId));
        closeModals();
      })
      .catch((err) => alert(`Failed to delete: ${err.message}`));
  };

  /* ---------------- Modal body (shared by Add / Edit) ---------------- */
  const renderModalBody = (mode) => (
    <div className="admin-modal-body">
      <label className="admin-modal-label">Customer</label>
      {mode === "add" ? (
        <select
          className="admin-modal-input"
          value={form.appointment}
          onChange={(e) => handlePickAppointment(e.target.value)}
        >
          <option value="">Select appointment…</option>
          {availableAppointments.map((a) => {
            const c = a.vehicle?.customer;
            const label = c
              ? `${a.customer_name} — ${a.service_type || ""} @ ${formatDate(a.scheduled_at)}`
              : `Appointment #${a.appointment_id}`;
            return (
              <option key={a.appointment_id} value={a.appointment_id}>
                {label}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          className="admin-modal-input"
          value={(() => {
            const inv = invoices.find((i) => i.invoice_id === editingId);
            return inv?.customer || "";
          })()}
          readOnly
        />
      )}

      <label className="admin-modal-label">Services</label>
      <input
        className="admin-modal-input"
        value={
          form.lines && form.lines.length > 0
            ? form.lines.map((l) => l.name).join(", ")
            : "No services"
        }
        readOnly
      />

      <label className="admin-modal-label">Status</label>
      <select
        className="admin-modal-input"
        value={form.status}
        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
      >
        <option value="pending">Unpaid</option>
        <option value="paid">Paid</option>
      </select>

      <label className="admin-modal-label">Due date</label>
      <input
        type="date"
        className="admin-modal-input"
        value={form.due_date || ""}
        onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
      />

      <label className="admin-modal-label">Notes</label>
      <textarea
        className="admin-modal-input"
        rows={2}
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
      />

      <label className="admin-modal-label" style={{ marginTop: 8 }}>
        Services / Line items
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {form.lines.length === 0 && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            No line items yet.
          </div>
        )}
        {form.lines.map((l, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              className="admin-modal-input"
              style={{ flex: 2, margin: 0 }}
              placeholder="Service name"
              value={l.name}
              onChange={(e) => updateLine(idx, "name", e.target.value)}
            />
            <input
              className="admin-modal-input"
              style={{ flex: 1, margin: 0 }}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={l.cost}
              onChange={(e) => updateLine(idx, "cost", e.target.value)}
            />
            <button
              type="button"
              className="admin-invoices-btn-danger"
              onClick={() => removeLine(idx)}
              style={{ padding: "6px 10px" }}
            >
              ✕
            </button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <select
            className="admin-modal-input"
            style={{ flex: 2, margin: 0 }}
            value=""
            onChange={(e) => {
              addLineFromCatalog(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">+ Add service from catalog…</option>
            {siteServices.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.name}
                {s.cost ? ` ($${s.cost})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-invoices-btn-secondary"
            onClick={addCustomLine}
          >
            + Custom
          </button>
        </div>

        <div style={{ textAlign: "right", fontWeight: 600, marginTop: 6 }}>
          Total: ${formatMoney(sumLines(form.lines))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-invoices-layout">
      <AdminSideBar />
      <main className="admin-invoices-main">
        <div className="admin-invoices-wrap">
          <header className="admin-invoices-header">
            <div>
              <h1 className="admin-invoices-title">Invoices</h1>
              <p className="admin-invoices-sub">
                Create, update, or remove invoices. Line items let you modify or
                add custom services per invoice.
              </p>
            </div>
            <div className="admin-invoices-top-controls">
              <button
                type="button"
                className="admin-invoices-btn-primary"
                onClick={openAdd}
              >
                Add an invoice
              </button>

              <div className="dropdown">
                <Dropdown isOpen={monthDropdownOpen} toggle={toggleMonthDropdown}>
                  <DropdownToggle
                    caret
                    style={{ backgroundColor: "#2f6dab", color: "white" }}
                  >
                    {monthFilter
                      ? [
                        "",
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ][Number(monthFilter)]
                      : "Month"}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setMonthFilter("")}>
                      All Months
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("1")}>
                      January
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("2")}>
                      February
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("3")}>
                      March
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("4")}>
                      April
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("5")}>
                      May
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("6")}>
                      June
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("7")}>
                      July
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("8")}>
                      August
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("9")}>
                      September
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("10")}>
                      October
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("11")}>
                      November
                    </DropdownItem>
                    <DropdownItem onClick={() => setMonthFilter("12")}>
                      December
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <Dropdown isOpen={yearDropdownOpen} toggle={toggleYearDropdown}>
                  <DropdownToggle
                    caret
                    style={{ backgroundColor: "#2f6dab", color: "white" }}
                  >
                    {yearFilter || "Year"}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => setYearFilter("")}>
                      All Years
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2050")}>
                      2050
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2049")}>
                      2049
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2048")}>
                      2048
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2047")}>
                      2047
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2046")}>
                      2046
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2045")}>
                      2045
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2044")}>
                      2044
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2043")}>
                      2043
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2042")}>
                      2042
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2041")}>
                      2041
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2040")}>
                      2040
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2039")}>
                      2039
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2038")}>
                      2038
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2037")}>
                      2037
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2036")}>
                      2036
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2035")}>
                      2035
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2034")}>
                      2034
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2034")}>
                      2034
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2033")}>
                      2033
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2032")}>
                      2032
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2031")}>
                      2031
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2030")}>
                      2030
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2029")}>
                      2029
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2028")}>
                      2028
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2027")}>
                      2027
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2026")}>
                      2026
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2025")}>
                      2025
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2024")}>
                      2024
                    </DropdownItem>
                    <DropdownItem onClick={() => setYearFilter("2023")}>
                      2023
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </header>

          <div className="admin-invoices-card">
            <div className="invoice-table-content-search">
              <Input
                id="value1"
                name="value1"
                placeholder={"Search Invoices"}
                type="text"
                style={{ width: "70vh", height: "50px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="button" className="btn" style={{ backgroundColor: "#2f6dab", color: "white" }}
                onClick={handleSearch}>
                Search
              </Button>
            </div>
            {loading ? (
              <div
                style={{ padding: 32, textAlign: "center", color: "#6b7280" }}
              >
                Loading invoices…
              </div>
            ) : error ? (
              <div
                style={{ padding: 32, textAlign: "center", color: "#b91c1c" }}
              >
                {error}
              </div>
            ) : (
              <table className="admin-invoices-table">
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Appointment Date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due Date</th>
                    <th scope="col">Services</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: 32,
                          color: "#6b7280",
                        }}
                      >
                        No invoices yet. Click &quot;Add an invoice&quot; to
                        create one.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.invoice_id}>
                        <td>{inv.customer || "—"}</td>
                        <td>
                          {inv.appointment?.vehicle
                            ? `${inv.appointment.vehicle.year || ""} ${inv.appointment.vehicle.make || ""} ${inv.appointment.vehicle.model || ""}`
                            : "—"}
                        </td>
                        <td>{inv.date ? new Date(inv.date).toLocaleDateString() : "—"}</td>                        <td>${formatMoney(inv.amount)}</td>
                        <td>
                          <span
                            className={`admin-invoices-status ${inv.status === "paid" ? "paid" : "unpaid"}`}
                          >
                            {inv.status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td>{inv.due_date || "—"}</td>
                        <td
                          style={{
                            maxWidth: 200,
                            fontSize: 13,
                            color: "#4b5563",
                          }}
                        >
                          {
                            inv.lines && inv.lines.length > 0
                              ? inv.lines.map((l) => l.name).join(", ")
                              : inv.appointment?.service_type
                                ? inv.appointment.service_type
                                : "—"
                          }
                        </td>
                        <td
                          style={{
                            maxWidth: 200,
                            fontSize: 13,
                            color: "#4b5563",
                          }}
                        >
                          {inv.notes || "—"}
                        </td>
                        <td>
                          <div className="admin-invoices-actions-cell">
                            <button
                              type="button"
                              className="admin-invoices-btn-secondary"
                              onClick={() => openEdit(inv)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="admin-invoices-btn-danger"
                              onClick={() => openDelete(inv.invoice_id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {addOpen && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && closeModals()}
        >
          <div className="admin-modal" role="dialog">
            <div className="admin-modal-header">New invoice</div>
            {renderModalBody("add")}
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-modal-btn-cancel"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-save"
                onClick={handleAddSave}
              >
                Create invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && closeModals()}
        >
          <div className="admin-modal" role="dialog">
            <div className="admin-modal-header">Update invoice</div>
            {renderModalBody("edit")}
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-modal-btn-cancel"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-save"
                onClick={handleEditSave}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && deletingInvoice && (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && closeModals()}
        >
          <div className="admin-modal" role="dialog">
            <div className="admin-modal-header">Delete invoice</div>
            <div className="admin-modal-body">
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#374151",
                  lineHeight: 1.5,
                }}
              >
                Do you want to delete this?
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "#6b7280" }}>
                <strong>INV-{deletingInvoice.invoice_id}</strong> —{" "}
                {deletingInvoice.customer || ""}
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-modal-btn-cancel"
                onClick={closeModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-danger-confirm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
