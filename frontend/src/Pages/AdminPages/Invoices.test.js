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
  let servicesState;
  let fetchSpy;
  let alertSpy;

  const setupDefaultState = () => {
    appointmentsState = [
      {
        appointment_id: 1,
        service_type: "Brake Pads",
        scheduled_at: "2026-04-14T09:30:00Z",
        cost: "428.50",
        vehicle: {
          year: 2020,
          make: "Toyota",
          model: "Camry",
          customer: { first_name: "Jordan", last_name: "Lee" },
        },
      },
      {
        appointment_id: 2,
        service_type: "Oil Change",
        scheduled_at: "2026-04-10T11:00:00Z",
        cost: "89.99",
        vehicle: {
          year: 2018,
          make: "Honda",
          model: "Civic",
          customer: { first_name: "Maria", last_name: "Santos" },
        },
      },
      {
        appointment_id: 3,
        service_type: "Tire Rotation",
        scheduled_at: "2026-04-20T10:00:00Z",
        cost: "65.00",
        vehicle: {
          year: 2021,
          make: "Ford",
          model: "Escape",
          customer: { first_name: "Pat", last_name: "Rivera" },
        },
      },
      {
        appointment_id: 4,
        service_type: "Oil Change, Tire Rotation",
        scheduled_at: "2026-04-25T10:00:00Z",
        cost: "94.99",
        vehicle: {
          year: 2022,
          make: "Nissan",
          model: "Altima",
          customer: { first_name: "Chris", last_name: "Nolan" },
        },
      },
    ];

    invoicesState = [
      {
        invoice_id: 101,
        appointment: appointmentsState[0],
        customer: "Jordan Lee",
        vehicle: "Toyota Camry",
        date: "2026-04-14T09:30:00Z",
        amount: "428.50",
        status: "pending",
        due_date: null,
        notes: "",
        lines: [{ line_id: 1, name: "Brake Pads", cost: "428.50" }],
      },
      {
        invoice_id: 102,
        appointment: appointmentsState[1],
        customer: "Maria Santos",
        vehicle: "Honda Civic",
        date: "2026-04-10T11:00:00Z",
        amount: "89.99",
        status: "paid",
        due_date: null,
        notes: "",
        lines: [],
      },
    ];

    servicesState = [
      { service_id: 21, name: "Oil Change", cost: 29.99 },
      { service_id: 22, name: "Tire Rotation", cost: 65.0 },
      { service_id: 23, name: "Brake Pads", cost: 428.5 },
    ];
  };

  const installFetchMock = ({
    invoicesGetOk = true,
    appointmentsGetOk = true,
    servicesGetOk = true,
    createOk = true,
    updateOk = true,
    deleteOk = true,
    invoicesResponseShape = "results",
  } = {}) => {
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(async (url, opts = {}) => {
        const method = (opts.method || "GET").toUpperCase();
        const u = String(url);

        if (u.includes("/api/invoices/") && method === "GET") {
          if (!invoicesGetOk) {
            return {
              ok: false,
              status: 500,
              statusText: "Server Error",
              json: async () => ({ detail: "Failed to load" }),
            };
          }

          if (invoicesResponseShape === "array") {
            return { ok: true, json: async () => invoicesState };
          }

          return {
            ok: true,
            json: async () => ({
              results: invoicesState,
              count: invoicesState.length,
            }),
          };
        }

        if (u.includes("/api/admin/appointments/") && method === "GET") {
          if (!appointmentsGetOk) {
            return {
              ok: false,
              status: 500,
              statusText: "Server Error",
              json: async () => ({ detail: "Failed to load appointments" }),
            };
          }

          return { ok: true, json: async () => appointmentsState };
        }

        if (u.includes("/api/services/") && method === "GET") {
          if (!servicesGetOk) {
            return {
              ok: false,
              status: 500,
              statusText: "Server Error",
              json: async () => ({ detail: "Failed to load services" }),
            };
          }

          return { ok: true, json: async () => servicesState };
        }

        if (u.includes("/api/invoices/") && method === "POST") {
          if (!createOk) {
            return {
              ok: false,
              json: async () => ({ detail: "Create failed" }),
            };
          }

          const body = JSON.parse(opts.body || "{}");
          const appt = appointmentsState.find(
            (a) => a.appointment_id === body.appointment
          );

          const amount =
            body.lines && body.lines.length > 0
              ? body.lines
                .reduce((sum, l) => sum + (parseFloat(l.cost) || 0), 0)
                .toFixed(2)
              : String(appt?.cost || "0.00");

          const row = {
            invoice_id: 103,
            appointment: appt,
            customer: appt?.vehicle?.customer
              ? `${appt.vehicle.customer.first_name} ${appt.vehicle.customer.last_name}`
              : "Customer",
            vehicle: appt?.vehicle
              ? `${appt.vehicle.make} ${appt.vehicle.model}`
              : "",
            date: appt?.scheduled_at,
            amount,
            status: body.status || "pending",
            due_date: body.due_date || null,
            notes: body.notes || "",
            lines: body.lines || [],
          };

          invoicesState = [row, ...invoicesState];
          return { ok: true, json: async () => row };
        }

        if (u.includes("/api/invoices/101/") && method === "PUT") {
          if (!updateOk) {
            return {
              ok: false,
              json: async () => ({ detail: "Update failed" }),
            };
          }

          const body = JSON.parse(opts.body || "{}");
          const oldInvoice = invoicesState.find((i) => i.invoice_id === 101);

          const updated = {
            ...oldInvoice,
            status: body.status,
            due_date: body.due_date,
            notes: body.notes,
            lines: body.lines || [],
            amount: body.lines?.length
              ? body.lines
                .reduce((sum, l) => sum + (parseFloat(l.cost) || 0), 0)
                .toFixed(2)
              : oldInvoice.amount,
          };

          invoicesState = invoicesState.map((i) =>
            i.invoice_id === 101 ? updated : i
          );

          return { ok: true, json: async () => updated };
        }

        if (u.includes("/api/invoices/102/") && method === "DELETE") {
          if (!deleteOk) {
            return { ok: false, status: 500 };
          }

          invoicesState = invoicesState.filter((i) => i.invoice_id !== 102);
          return { ok: true, status: 204 };
        }

        return { ok: true, json: async () => ({}) };
      });
  };

  beforeEach(() => {
    sessionStorage.setItem("authToken", "test-token");
    setupDefaultState();
    installFetchMock();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  test("shows loading state before data loads", () => {
    fetchSpy.mockRestore();
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockImplementation(() => new Promise(() => { }));

    render(<Invoices />);

    expect(screen.getByText(/Loading invoices/i)).toBeInTheDocument();
  });

  test("loads invoices from API", async () => {
    render(<Invoices />);

    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();

    expect(await screen.findByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();

    expect(screen.getByText("2020 Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText("2018 Honda Civic")).toBeInTheDocument();

    expect(screen.getByText("$428.50")).toBeInTheDocument();
    expect(screen.getByText("Brake Pads")).toBeInTheDocument();
    expect(screen.getByText("Oil Change")).toBeInTheDocument();
  });

  test("supports invoices API returning a raw array", async () => {
    fetchSpy.mockRestore();
    installFetchMock({ invoicesResponseShape: "array" });

    render(<Invoices />);

    expect(await screen.findByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("2020 Toyota Camry")).toBeInTheDocument();
  });

  test("shows error state when initial fetch fails", async () => {
    fetchSpy.mockRestore();
    installFetchMock({ invoicesGetOk: false });

    render(<Invoices />);

    expect(await screen.findByText(/Invoices failed/i)).toBeInTheDocument();
  });

  test("shows empty state when no invoices exist", async () => {
    invoicesState = [];

    render(<Invoices />);

    expect(
      await screen.findByText(
        /No invoices yet\. Click "Add an invoice" to create one\./i
      )
    ).toBeInTheDocument();
  });

  test("opens add modal and cancel closes it", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/New invoice/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("alerts if trying to create invoice without selecting an appointment", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /create invoice/i })
    );

    expect(alertSpy).toHaveBeenCalledWith("Please select an appointment");
  });

  test("creates invoice after selecting appointment", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    const combos = within(dialog).getAllByRole("combobox");

    await user.selectOptions(combos[0], "3");
    await user.click(
      within(dialog).getByRole("button", { name: /create invoice/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Pat Rivera")).toBeInTheDocument();
    });

    expect(screen.getByText("2021 Ford Escape")).toBeInTheDocument();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/invoices/"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  test("prefills line items from appointment and catalog matches", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    const combos = within(dialog).getAllByRole("combobox");

    await user.selectOptions(combos[0], "4");

    const serviceInputs = within(dialog).getAllByDisplayValue("Oil Change");
    expect(serviceInputs.length).toBeGreaterThan(0); expect(
      within(dialog).getByDisplayValue("Tire Rotation")
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/Total: \$94.99/i)).toBeInTheDocument();
  });

  test("adds a custom line and removes it", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", { name: /\+ custom/i })
    );

    const serviceNameInput = within(dialog).getByPlaceholderText(/Service name/i);
    const costInput = within(dialog).getByPlaceholderText("0.00");

    await user.type(serviceNameInput, "Shop Supplies");
    await user.clear(costInput);
    await user.type(costInput, "12.50");

    expect(within(dialog).getByText(/Total: \$12.50/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /✕/i }));

    expect(within(dialog).getByText(/No line items yet\./i)).toBeInTheDocument();
  });

  test("adds a line from catalog in add modal", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    const combos = within(dialog).getAllByRole("combobox");

    await user.selectOptions(combos[2], "21");

    const serviceInputs = within(dialog).getAllByDisplayValue("Oil Change");
    expect(serviceInputs.length).toBeGreaterThan(0); expect(within(dialog).getByText(/Total: \$29.99/i)).toBeInTheDocument();
  });

  test("alerts when create invoice request fails", async () => {
    fetchSpy.mockRestore();
    installFetchMock({ createOk: false });

    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    const combos = within(dialog).getAllByRole("combobox");

    await user.selectOptions(combos[0], "3");
    await user.click(
      within(dialog).getByRole("button", { name: /create invoice/i })
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to create invoice/i)
      );
    });
  });

  test("opens edit modal and cancel closes it", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    const row = screen.getByText("Jordan Lee").closest("tr");
    await user.click(within(row).getByRole("button", { name: /update/i }));

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/Update invoice/i)).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Jordan Lee")).toBeInTheDocument();
    const serviceInputs = within(dialog).getAllByDisplayValue("Brake Pads");
    expect(serviceInputs.length).toBeGreaterThan(0);
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("updates an invoice status, notes, due date, and lines", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    const row = screen.getByText("Jordan Lee").closest("tr");
    await user.click(within(row).getByRole("button", { name: /update/i }));

    const dialog = await screen.findByRole("dialog");
    const combos = within(dialog).getAllByRole("combobox");

    await user.selectOptions(combos[0], "paid");

    const dateField = dialog.querySelector('input[type="date"]');
    await user.type(dateField, "2026-05-01");

    const notes = dialog.querySelector("textarea");
    await user.type(notes, "Paid in full");

    await user.click(
      within(dialog).getByRole("button", { name: /\+ custom/i })
    );

    const serviceNameInputs = within(dialog).getAllByPlaceholderText(/Service name/i);
    const costInputs = within(dialog).getAllByPlaceholderText("0.00");

    // grab the EMPTY one (new line)
    const serviceNameInput = serviceNameInputs.find((el) => el.value === "");
    const costInput = costInputs.find((el) => el.value === "0");

    await user.clear(serviceNameInput);
    await user.type(serviceNameInput, "Labor");

    await user.clear(costInput);
    await user.type(costInput, "500");

    await user.click(
      within(dialog).getByRole("button", { name: /save changes/i })
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Paid/i).length).toBeGreaterThan(0);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/invoices/101/"),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );

    expect(screen.getByText("$928.50")).toBeInTheDocument();
    expect(screen.getByText(/Labor/)).toBeInTheDocument();
  });

  test("alerts when update request fails", async () => {
    fetchSpy.mockRestore();
    installFetchMock({ updateOk: false });

    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    const row = screen.getByText("Jordan Lee").closest("tr");
    await user.click(within(row).getByRole("button", { name: /update/i }));

    const dialog = await screen.findByRole("dialog");

    await user.click(
      within(dialog).getByRole("button", { name: /save changes/i })
    );

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to update invoice/i)
      );
    });
  });

  test("delete modal cancel closes without removing row", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Maria Santos");

    const row = screen.getByText("Maria Santos").closest("tr");
    await user.click(within(row).getByRole("button", { name: /^delete$/i }));

    const dialogs = screen.getAllByRole("dialog");
    const delDlg = dialogs.find((d) =>
      within(d).queryByText(/delete invoice/i)
    );

    expect(delDlg).toBeTruthy();

    await user.click(within(delDlg).getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  test("delete confirm removes row", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Maria Santos");

    const row = screen.getByText("Maria Santos").closest("tr");
    await user.click(within(row).getByRole("button", { name: /^delete$/i }));

    const dialogs = screen.getAllByRole("dialog");
    const delDlg = dialogs.find((d) =>
      within(d).queryByText(/delete invoice/i)
    );

    expect(delDlg).toBeTruthy();

    await user.click(within(delDlg).getByRole("button", { name: /^delete$/i }));

    await waitFor(() =>
      expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument()
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/invoices/102/"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  test("alerts when delete fails", async () => {
    fetchSpy.mockRestore();
    installFetchMock({ deleteOk: false });

    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Maria Santos");

    const row = screen.getByText("Maria Santos").closest("tr");
    await user.click(within(row).getByRole("button", { name: /^delete$/i }));

    const dialogs = screen.getAllByRole("dialog");
    const delDlg = dialogs.find((d) =>
      within(d).queryByText(/delete invoice/i)
    );

    await user.click(within(delDlg).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to delete/i)
      );
    });

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  test("overlay click closes add modal", async () => {
    const user = userEvent.setup();

    render(<Invoices />);
    await screen.findByText("Jordan Lee");

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    const dialog = await screen.findByRole("dialog");
    const overlay = dialog.parentElement;

    await user.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});