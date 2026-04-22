import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../Components/AdminSideBar";
import { API_BASE_URL } from "../../config";
import "./AdminInvoices.css";

const authHeaders = () => {
  const token = sessionStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
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

  const fetchAll = useCallback(() => {
    setLoading(true);
    const headers = authHeaders();
    Promise.all([
      fetch(`${API_BASE_URL}/api/invoices/`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/admin/appointments/`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/services/`, { headers }).then((r) => r.json()),
    ])
      .then(([inv, appts, svcs]) => {
        setInvoices(Array.isArray(inv) ? inv : inv?.results || []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setSiteServices(Array.isArray(svcs) ? svcs : []);
        setError(null);
      })
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const deletingInvoice = useMemo(
    () => invoices.find((i) => i.invoice_id === deletingId),
    [invoices, deletingId]
  );

  // Appointments that don't yet have an invoice (for the Add picker)
  const availableAppointments = useMemo(() => {
    const used = new Set(invoices.map((i) => i.appointment?.appointment_id).filter(Boolean));
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
    const appt = appointments.find((a) => String(a.appointment_id) === String(apptId));
    let lines = [];
    if (appt) {
      const names = (appt.service_type || "")
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length > 0) {
        lines = names.map((nm) => {
          const svc = siteServices.find(
            (s) => (s.name || "").toLowerCase() === nm.toLowerCase()
          );
          if (svc) {
            return { name: svc.name, cost: svc.cost ? String(svc.cost) : "0" };
          }
          return { name: nm, cost: "0" };
        });
        // If only a single service name and no catalog match, fall back to the
        // appointment's total cost so the invoice at least reflects what was billed.
        if (lines.length === 1 && parseFloat(lines[0].cost) === 0 && appt.cost) {
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
    const svc = siteServices.find((s) => String(s.service_id) === String(serviceId));
    if (!svc) return;
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { name: svc.name, cost: svc.cost ? String(svc.cost) : "0" }],
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
        if (!res.ok) throw new Error(body?.detail || JSON.stringify(body) || "Failed");
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
        if (!res.ok) throw new Error(body?.detail || JSON.stringify(body) || "Failed");
        setInvoices((prev) =>
          prev.map((i) => (i.invoice_id === body.invoice_id ? body : i))
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
              ? `${c.first_name} ${c.last_name} — ${a.service_type || ""} @ ${formatDate(a.scheduled_at)}`
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
          value={
            (() => {
              const inv = invoices.find((i) => i.invoice_id === editingId);
              return inv?.customer || "";
            })()
          }
          readOnly
        />
      )}

      <label className="admin-modal-label">Invoice #</label>
      <input
        className="admin-modal-input"
        value={editingId ? `INV-${editingId}` : "(assigned on save)"}
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
          <div style={{ fontSize: 13, color: "#6b7280" }}>No line items yet.</div>
        )}
        {form.lines.map((l, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                Create, update, or remove invoices. Line items let you modify or add custom services per invoice.
              </p>
            </div>
            <button type="button" className="admin-invoices-btn-primary" onClick={openAdd}>
              Add an invoice
            </button>
          </header>

          <div className="admin-invoices-card">
            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
                Loading invoices…
              </div>
            ) : error ? (
              <div style={{ padding: 32, textAlign: "center", color: "#b91c1c" }}>{error}</div>
            ) : (
              <table className="admin-invoices-table">
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Invoice #</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#6b7280" }}>
                        No invoices yet. Click &quot;Add an invoice&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.invoice_id}>
                        <td>{inv.customer || "—"}</td>
                        <td>INV-{inv.invoice_id}</td>
                        <td>${formatMoney(inv.amount)}</td>
                        <td>
                          <span className={`admin-invoices-status ${inv.status === "paid" ? "paid" : "unpaid"}`}>
                            {inv.status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td>{inv.due_date || "—"}</td>
                        <td style={{ maxWidth: 200, fontSize: 13, color: "#4b5563" }}>
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
              <button type="button" className="admin-modal-btn-cancel" onClick={closeModals}>
                Cancel
              </button>
              <button type="button" className="admin-modal-btn-save" onClick={handleAddSave}>
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
              <button type="button" className="admin-modal-btn-cancel" onClick={closeModals}>
                Cancel
              </button>
              <button type="button" className="admin-modal-btn-save" onClick={handleEditSave}>
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
              <p style={{ margin: 0, fontSize: 15, color: "#374151", lineHeight: 1.5 }}>
                Do you want to delete this?
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "#6b7280" }}>
                <strong>INV-{deletingInvoice.invoice_id}</strong> — {deletingInvoice.customer || ""}
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-btn-cancel" onClick={closeModals}>
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