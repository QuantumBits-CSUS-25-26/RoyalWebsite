import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, cleanup, within, waitFor } from "@testing-library/react";
import AdminAppointment from "../Pages/AdminPages/Appointments";

jest.mock("@fullcalendar/react", () => ({
  __esModule: true,
  default: ({ events = [], eventClick }) => {
    const R = require("react");
    return R.createElement(
      "div",
      { "data-testid": "fullcalendar" },
      events.map((e) =>
        R.createElement(
          "button",
          {
            key: e.id,
            type: "button",
            "data-testid": "event",
            onClick: () =>
              eventClick &&
              eventClick({
                event: {
                  title: e.title,
                  extendedProps: e.extendedProps || {},
                },
                jsEvent: { pageX: 100, pageY: 200 },
              }),
          },
          e.title
        )
      )
    );
  },
}));

jest.mock("../Components/AdminSideBar", () => () => <div data-testid="admin-sidebar" />);
jest.mock("../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

describe("Admin Appointments page", () => {
  let fetchSpy;
  let alertSpy;
  let errorSpy;

  const baseAppointment = {
    appointment_id: 1,
    service_type: "Oil Change",
    scheduled_at: "2026-04-10T10:00:00",
    finished_at: null,
    status: "upcoming",
    vehicle: {
      vehicle_id: 11,
      make: "Toyota",
      model: "Camry",
      year: 2015,
      license_plate: "ABC123",
      customer: 1,
    },
    customer_name: "John Doe",
    description: "Standard oil service",
  };

  const mockFetchImplementation = ({
    appointmentsOk = true,
    customersOk = true,
    servicesOk = true,
    appointmentsBody = [baseAppointment],
    customersBody = [
      {
        customer_id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        vehicles: [
          {
            vehicle_id: 11,
            make: "Toyota",
            model: "Camry",
            year: 2015,
            license_plate: "ABC123",
          },
        ],
      },
    ],
    servicesBody = [{ service_id: 21, name: "Oil Change", cost: 29.99 }],
    postAppointmentOk = true,
    postAppointmentBody,
    invoiceOk = true,
    invoiceBody = { invoice_id: 99 },
  } = {}) => {
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation((url, opts = {}) => {
      if (
        typeof url === "string" &&
        url.includes("/api/admin/appointments/") &&
        (!opts.method || opts.method === "GET")
      ) {
        return Promise.resolve({
          ok: appointmentsOk,
          json: async () => appointmentsBody,
        });
      }

      if (typeof url === "string" && url.includes("/api/admin/customers/")) {
        return Promise.resolve({
          ok: customersOk,
          json: async () => customersBody,
        });
      }

      if (typeof url === "string" && url.includes("/api/services/")) {
        return Promise.resolve({
          ok: servicesOk,
          json: async () => servicesBody,
        });
      }

      if (
        typeof url === "string" &&
        url.includes("/api/appointments/") &&
        opts.method === "POST"
      ) {
        const body = JSON.parse(opts.body || "{}");
        return Promise.resolve({
          ok: postAppointmentOk,
          json: async () =>
            postAppointmentBody || {
              appointment_id: 2,
              service_type: body.service_type,
              scheduled_at: body.scheduled_at,
              vehicle: 11,
            },
          text: async () => "Failed to create appointment",
        });
      }

      if (
        typeof url === "string" &&
        url.includes("/api/invoices/") &&
        opts.method === "POST"
      ) {
        return Promise.resolve({
          ok: invoiceOk,
          json: async () => invoiceBody,
          text: async () => "",
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
        text: async () => "",
      });
    });
  };

  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem("authToken", "fake-token");

    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockFetchImplementation();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    jest.restoreAllMocks();
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
  });

  test("renders auth error when no token and no stored user", () => {
    sessionStorage.clear();
    localStorage.clear();

    render(<AdminAppointment />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    expect(screen.queryByTestId("fullcalendar")).not.toBeInTheDocument();
  });

  test("renders loading state initially", () => {
    fetchSpy.mockRestore();
    fetchSpy = jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise(() => {})
    );

    render(<AdminAppointment />);

    expect(screen.getByText(/Loading appointments/i)).toBeInTheDocument();
  });

  test("renders calendar and New Appointment with events", async () => {
    render(<AdminAppointment />);

    expect(await screen.findByTestId("fullcalendar")).toBeInTheDocument();
    expect(screen.getByText("+ New Appointment")).toBeInTheDocument();

    const events = await screen.findAllByTestId("event");
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]).toHaveTextContent(/Oil Change/i);
  });

  test("shows error alert when initial fetch fails", async () => {
    fetchSpy.mockRestore();
    mockFetchImplementation({ appointmentsOk: false });

    render(<AdminAppointment />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Failed to load appointments/i);
    expect(errorSpy).toHaveBeenCalled();
  });

  test("renders completed appointment event too", async () => {
    fetchSpy.mockRestore();
    mockFetchImplementation({
      appointmentsBody: [
        baseAppointment,
        {
          ...baseAppointment,
          appointment_id: 2,
          service_type: "Brake Repair",
          scheduled_at: "2026-04-11T12:30:00",
          finished_at: "2026-04-11T13:30:00",
          status: "complete",
        },
      ],
    });

    render(<AdminAppointment />);

    expect(await screen.findByText(/Oil Change/i)).toBeInTheDocument();
    expect(screen.getByText(/Brake Repair/i)).toBeInTheDocument();
  });

  test("opens create modal and Cancel closes it", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));
    expect(await screen.findByText(/Create Appointment/i)).toBeInTheDocument();

    const modal = screen.getByText(/Create Appointment/i).closest(".modal-overlay");
    await user.click(within(modal).getByRole("button", { name: /Cancel/i }));

    expect(screen.queryByText(/Create Appointment/i)).not.toBeInTheDocument();
  });

  test("shows alert when trying to save without date/time and vehicle", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));
    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    expect(alertSpy).toHaveBeenCalledWith("Date/time and Vehicle are required");
  });

  test("shows alert when no services are added", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));

    const customerInput = screen.getByPlaceholderText(/Select customer/i);
    await user.type(customerInput, "John Doe (john@example.com)");

    const selects = screen
      .getAllByRole("combobox")
      .filter((el) => el.tagName.toLowerCase() === "select");
    await user.selectOptions(selects[0], "11");

    const datetimeInput = screen.getByLabelText("scheduled-at");
    await user.type(datetimeInput, "2026-04-20T09:30");

    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    expect(alertSpy).toHaveBeenCalledWith("Add at least one service");
  });

  test("shows alert when a service line has no name", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));

    const customerInput = screen.getByPlaceholderText(/Select customer/i);
    await user.type(customerInput, "John Doe (john@example.com)");

    const selects = screen
      .getAllByRole("combobox")
      .filter((el) => el.tagName.toLowerCase() === "select");
    await user.selectOptions(selects[0], "11");

    const datetimeInput = screen.getByLabelText("scheduled-at");
    await user.type(datetimeInput, "2026-04-20T09:30");

    await user.click(screen.getByRole("button", { name: /\+ Custom/i }));
    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    expect(alertSpy).toHaveBeenCalledWith("Every service line needs a name");
  });

  test("adds a catalog service line and creates appointment successfully", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));

    const customerInput = screen.getByPlaceholderText(/Select customer/i);
    await user.type(customerInput, "John Doe (john@example.com)");

    const selects = screen
      .getAllByRole("combobox")
      .filter((el) => el.tagName.toLowerCase() === "select");
    await user.selectOptions(selects[0], "11");
    await user.selectOptions(selects[1], "21");
    await user.click(screen.getByRole("button", { name: /\+ Add/i }));

    expect(screen.getByText(/Total: \$29.99/i)).toBeInTheDocument();

    const datetimeInput = screen.getByLabelText("scheduled-at");
    await user.type(datetimeInput, "2026-04-20T09:30");

    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/appointments/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
        })
      );
    });

    expect(await screen.findAllByTestId("event")).toHaveLength(2);
    expect(screen.queryByText(/Create Appointment/i)).not.toBeInTheDocument();
  });

  test("adds and removes a custom service line", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));
    await user.click(screen.getByRole("button", { name: /\+ Custom/i }));

    const serviceNameInputs = screen.getAllByPlaceholderText(/Service name/i);
    const costInputs = screen.getAllByPlaceholderText("0.00");

    await user.type(serviceNameInputs[0], "Detailing");
    await user.clear(costInputs[0]);
    await user.type(costInputs[0], "49.50");

    expect(screen.getByText(/Total: \$49.50/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /✕/i }));
    expect(screen.getByText(/No services yet/i)).toBeInTheDocument();
  });

  test("alerts when create appointment request fails", async () => {
    fetchSpy.mockRestore();
    mockFetchImplementation({ postAppointmentOk: false });

    const user = userEvent.setup();
    render(<AdminAppointment />);
    await screen.findByTestId("fullcalendar");

    await user.click(screen.getByText("+ New Appointment"));

    const customerInput = screen.getByPlaceholderText(/Select customer/i);
    await user.type(customerInput, "John Doe (john@example.com)");

    const selects = screen
      .getAllByRole("combobox")
      .filter((el) => el.tagName.toLowerCase() === "select");
    await user.selectOptions(selects[0], "11");
    await user.selectOptions(selects[1], "21");
    await user.click(screen.getByRole("button", { name: /\+ Add/i }));

    const datetimeInput = screen.getByLabelText("scheduled-at");
    await user.type(datetimeInput, "2026-04-20T09:30");

    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to create appointment");
    });
  });

  test("opens option modal when event is clicked and closes with Close button", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);

    const eventButton = await screen.findByTestId("event");
    await user.click(eventButton);

    expect(
      await screen.findByRole("heading", { name: /^Appointment$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Customer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone:/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle:/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Close$/i }));
    expect(screen.queryByRole("heading", { name: /^Appointment$/i })).not.toBeInTheDocument();
  });

  test("closes option modal with Cancel button", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);

    const eventButton = await screen.findByTestId("event");
    await user.click(eventButton);

    expect(
      await screen.findByRole("heading", { name: /^Appointment$/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(screen.queryByRole("heading", { name: /^Appointment$/i })).not.toBeInTheDocument();
  });

  test("creates invoice successfully from option modal", async () => {
    const user = userEvent.setup();
    render(<AdminAppointment />);

    const eventButton = await screen.findByTestId("event");
    await user.click(eventButton);

    await user.click(screen.getByRole("button", { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/invoices/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
          body: JSON.stringify({ appointment: 1, status: "pending" }),
        })
      );
    });

    expect(alertSpy).toHaveBeenCalledWith("Invoice #99 created");
  });

  test("shows duplicate invoice alert when invoice already exists", async () => {
    fetchSpy.mockRestore();
    mockFetchImplementation({
      invoiceOk: false,
      invoiceBody: { detail: "Invoice already exists" },
    });

    const user = userEvent.setup();
    render(<AdminAppointment />);

    const eventButton = await screen.findByTestId("event");
    await user.click(eventButton);

    await user.click(screen.getByRole("button", { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("An invoice already exists for this appointment.");
    });
  });

  test("shows generic invoice creation error", async () => {
    fetchSpy.mockRestore();
    mockFetchImplementation({
      invoiceOk: false,
      invoiceBody: { detail: "Something bad happened" },
    });

    const user = userEvent.setup();
    render(<AdminAppointment />);

    const eventButton = await screen.findByTestId("event");
    await user.click(eventButton);

    await user.click(screen.getByRole("button", { name: /Create Invoice/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to create invoice: Something bad happened/i)
      );
    });
  });

  test("allows access for stored admin user even if token is in localStorage", async () => {
    sessionStorage.clear();
    localStorage.setItem("authToken", "local-token");
    localStorage.setItem("user", JSON.stringify({ role: "admin" }));

    render(<AdminAppointment />);
    expect(await screen.findByTestId("fullcalendar")).toBeInTheDocument();
  });
});