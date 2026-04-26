import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Invoices from "./Invoices";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-admin-sidebar">Sidebar</div>
));

describe("Admin Invoices page", () => {
  let invoicesState;
  let appointmentsState;

  beforeEach(() => {
    sessionStorage.setItem("authToken", "test-token");
    invoicesState = [
      {
        invoice_id: 101,
        appointment: { appointment_id: 1 },
        customer: "Jordan Lee",
        amount: "428.50",
        status: "pending",
        due_date: null,
        notes: "",
        lines: [],
      },
      {
        invoice_id: 102,
        appointment: { appointment_id: 2 },
        customer: "Maria Santos",
        amount: "89.99",
        status: "paid",
        due_date: null,
        notes: "",
        lines: [],
      },
    ];
    appointmentsState = [
      {
        appointment_id: 1,
        service_type: "Brake Pads",
        scheduled_at: "2026-04-14T09:30:00Z",
        cost: "428.50",
        vehicle: { customer: { first_name: "Jordan", last_name: "Lee" } },
      },
      {
        appointment_id: 2,
        service_type: "Oil Change",
        scheduled_at: "2026-04-10T11:00:00Z",
        cost: "89.99",
        vehicle: { customer: { first_name: "Maria", last_name: "Santos" } },
      },
      {
        appointment_id: 3,
        service_type: "Tire Rotation",
        scheduled_at: "2026-04-20T10:00:00Z",
        cost: "65.00",
        vehicle: { customer: { first_name: "Pat", last_name: "Rivera" } },
      },
    ];

    jest.spyOn(global, "fetch").mockImplementation(async (url, opts = {}) => {
      const method = (opts.method || "GET").toUpperCase();
      const u = String(url);

      if (u.includes("/api/invoices/") && method === "GET") {
        return { ok: true, json: async () => ({ results: invoicesState, count: invoicesState.length }) };
      }
      if (u.includes("/api/admin/appointments/") && method === "GET") {
        return { ok: true, json: async () => appointmentsState };
      }
      if (u.includes("/api/services/") && method === "GET") {
        return {
          ok: true,
          json: async () => [{ service_id: 21, name: "Oil Change", cost: 29.99 }],
        };
      }
      if (u.includes("/api/invoices/") && method === "POST") {
        const body = JSON.parse(opts.body || "{}");
        const appt = appointmentsState.find((a) => a.appointment_id === body.appointment);
        const row = {
          invoice_id: 103,
          appointment: appt,
          customer: appt?.vehicle?.customer
            ? `${appt.vehicle.customer.first_name} ${appt.vehicle.customer.last_name}`
            : "Customer",
          amount: "65.00",
          status: body.status || "pending",
          due_date: body.due_date || null,
          notes: body.notes || "",
          lines: body.lines || [],
        };
        invoicesState = [row, ...invoicesState];
        return { ok: true, json: async () => row };
      }
      if (u.includes("/api/invoices/101/") && method === "PUT") {
        const body = JSON.parse(opts.body || "{}");
        invoicesState = invoicesState.map((i) =>
          i.invoice_id === 101 ? { ...i, status: body.status, amount: body.lines?.length ? "500.00" : i.amount } : i
        );
        return { ok: true, json: async () => invoicesState.find((i) => i.invoice_id === 101) };
      }
      if (u.includes("/api/invoices/102/") && method === "DELETE") {
        invoicesState = invoicesState.filter((i) => i.invoice_id !== 102);
        return { ok: true, status: 204 };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  test("loads invoices from API", async () => {
    render(<Invoices />);
    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    expect(await screen.findByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("INV-101")).toBeInTheDocument();
  });

  test("creates invoice after selecting appointment", async () => {
    const user = userEvent.setup();
    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));
    await screen.findByText("New invoice");
    const dialog = screen.getByText("New invoice").closest('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const combos = within(dialog).getAllByRole("combobox");
    await user.selectOptions(combos[0], "3");
    await user.click(within(dialog).getByRole("button", { name: /create invoice/i }));

    await waitFor(() => {
      expect(screen.getByText("Pat Rivera")).toBeInTheDocument();
    });
    expect(screen.getByText("INV-103")).toBeInTheDocument();
  });

  test("delete confirm removes row", async () => {
    const user = userEvent.setup();
    render(<Invoices />);
    await screen.findByText("Maria Santos");
    const row = screen.getByText("Maria Santos").closest("tr");
    await user.click(within(row).getByRole("button", { name: /^delete$/i }));

    const dialogs = screen.getAllByRole("dialog");
    const delDlg = dialogs.find((d) => within(d).queryByText(/delete invoice/i));
    expect(delDlg).toBeTruthy();
    await user.click(within(delDlg).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument());
  });
});
