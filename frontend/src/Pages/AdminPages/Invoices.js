import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../Components/AdminSideBar";
import "./AdminInvoices.css";

const STORAGE_KEY = "royal_admin_invoices_v1";

const defaultInvoices = () => [
  {
    id: "inv-1001",
    customerName: "Jordan Lee",
    invoiceNumber: "INV-2026-0142",
    amount: "428.50",
    status: "unpaid",
    dueDate: "2026-03-15",
    notes: "Brake pads and rotors — front",
  },
  {
    id: "inv-1002",
    customerName: "Maria Santos",
    invoiceNumber: "INV-2026-0141",
    amount: "89.99",
    status: "paid",
    dueDate: "2026-02-20",
    notes: "Synthetic oil change",
  },
];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return defaultInvoices();
}

function saveStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const emptyForm = {
  customerName: "",
  invoiceNumber: "",
  amount: "",
  status: "unpaid",
  dueDate: "",
  notes: "",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState(() => loadStored());
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    saveStored(invoices);
  }, [invoices]);

  const deletingInvoice = useMemo(
    () => invoices.find((i) => i.id === deletingId),
    [invoices, deletingId]
  );

  const openAdd = () => {
    setForm({ ...emptyForm, invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` });
    setAddOpen(true);
  };

  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({
      customerName: inv.customerName,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      status: inv.status,
      dueDate: inv.dueDate,
      notes: inv.notes || "",
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

  const handleAddSave = () => {
    if (!form.customerName.trim() || !form.invoiceNumber.trim()) return;
    const id = `inv-${Date.now()}`;
    setInvoices((prev) => [
      {
        id,
        customerName: form.customerName.trim(),
        invoiceNumber: form.invoiceNumber.trim(),
        amount: form.amount.trim() || "0.00",
        status: form.status === "paid" ? "paid" : "unpaid",
        dueDate: form.dueDate || "",
        notes: form.notes.trim(),
      },
      ...prev,
    ]);
    closeModals();
  };

  const handleEditSave = () => {
    if (!editingId || !form.customerName.trim()) return;
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === editingId
          ? {
              ...i,
              customerName: form.customerName.trim(),
              invoiceNumber: form.invoiceNumber.trim(),
              amount: form.amount.trim() || "0.00",
              status: form.status === "paid" ? "paid" : "unpaid",
              dueDate: form.dueDate || "",
              notes: form.notes.trim(),
            }
          : i
      )
    );
    closeModals();
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    setInvoices((prev) => prev.filter((i) => i.id !== deletingId));
    closeModals();
  };

  return (
    <div className="admin-invoices-layout">
      <AdminSideBar />
      <main className="admin-invoices-main">
        <div className="admin-invoices-wrap">
          <header className="admin-invoices-header">
            <div>
              <h1 className="admin-invoices-title">Invoices</h1>
              <p className="admin-invoices-sub">Create, update, or remove invoices. Data is stored in this browser until an API is connected.</p>
            </div>
            <button type="button" className="admin-invoices-btn-primary" onClick={openAdd}>
              Add an invoice
            </button>
          </header>

          <div className="admin-invoices-card">
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
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                      No invoices yet. Click &quot;Add an invoice&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.customerName}</td>
                      <td>{inv.invoiceNumber}</td>
                      <td>${inv.amount}</td>
                      <td>
                        <span className={`admin-invoices-status ${inv.status}`}>
                          {inv.status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td>{inv.dueDate || "—"}</td>
                      <td style={{ maxWidth: 200, fontSize: 13, color: "#4b5563" }}>{inv.notes || "—"}</td>
                      <td>
                        <div className="admin-invoices-actions-cell">
                          <button type="button" className="admin-invoices-btn-secondary" onClick={() => openEdit(inv)}>
                            Update
                          </button>
                          <button type="button" className="admin-invoices-btn-danger" onClick={() => openDelete(inv.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {addOpen && (
        <div className="admin-modal-overlay" role="presentation" onClick={(e) => e.target === e.currentTarget && closeModals()}>
          <div className="admin-modal" role="dialog" aria-labelledby="add-invoice-title">
            <div className="admin-modal-header" id="add-invoice-title">
              New invoice
            </div>
            <div className="admin-modal-body">
              <label className="admin-modal-label" htmlFor="add-customer">Customer name</label>
              <input id="add-customer" className="admin-modal-input" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="add-number">Invoice number</label>
              <input id="add-number" className="admin-modal-input" value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="add-amount">Amount</label>
              <input id="add-amount" className="admin-modal-input" placeholder="e.g. 199.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="add-status">Status</label>
              <select id="add-status" className="admin-modal-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>

              <label className="admin-modal-label" htmlFor="add-due">Due date</label>
              <input id="add-due" type="date" className="admin-modal-input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="add-notes">Notes</label>
              <textarea id="add-notes" className="admin-modal-input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
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
        <div className="admin-modal-overlay" role="presentation" onClick={(e) => e.target === e.currentTarget && closeModals()}>
          <div className="admin-modal" role="dialog" aria-labelledby="edit-invoice-title">
            <div className="admin-modal-header" id="edit-invoice-title">
              Update invoice
            </div>
            <div className="admin-modal-body">
              <label className="admin-modal-label" htmlFor="edit-customer">Customer name</label>
              <input id="edit-customer" className="admin-modal-input" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="edit-number">Invoice number</label>
              <input id="edit-number" className="admin-modal-input" value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="edit-amount">Amount</label>
              <input id="edit-amount" className="admin-modal-input" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="edit-status">Status</label>
              <select id="edit-status" className="admin-modal-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>

              <label className="admin-modal-label" htmlFor="edit-due">Due date</label>
              <input id="edit-due" type="date" className="admin-modal-input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />

              <label className="admin-modal-label" htmlFor="edit-notes">Notes</label>
              <textarea id="edit-notes" className="admin-modal-input" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
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
        <div className="admin-modal-overlay" role="presentation" onClick={(e) => e.target === e.currentTarget && closeModals()}>
          <div className="admin-modal" role="dialog" aria-labelledby="delete-invoice-title">
            <div className="admin-modal-header" id="delete-invoice-title">
              Delete invoice
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: 15, color: "#374151", lineHeight: 1.5 }}>
                Do you want to delete this?
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 14, color: "#6b7280" }}>
                <strong>{deletingInvoice.invoiceNumber}</strong> — {deletingInvoice.customerName}
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-modal-btn-cancel" onClick={closeModals}>
                Cancel
              </button>
              <button type="button" className="admin-modal-btn-danger-confirm" onClick={handleDeleteConfirm}>
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
