import React from "react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, cleanup, within } from "@testing-library/react";
import AdminAppointment from "../Pages/AdminPages/Appointments";

jest.mock("@fullcalendar/react", () => ({
  __esModule: true,
  default: ({ events = [] }) => {
    const R = require("react");
    return R.createElement(
      "div",
      { "data-testid": "fullcalendar" },
      events.map((e) => R.createElement("div", { key: e.id, "data-testid": "event" }, e.title))
    );
  },
}));

describe("Admin Appointments page", () => {
  let fetchSpy;

  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem("authToken", "fake-token");
    jest.spyOn(window, "alert").mockImplementation(() => {});

    fetchSpy = jest.spyOn(global, "fetch").mockImplementation((url, opts) => {
      if (typeof url === "string" && url.includes("/api/admin/appointments/") && (!opts || !opts.method || opts.method === "GET")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              appointment_id: 1,
              service_type: "Oil Change",
              scheduled_at: "2026-04-10T10:00:00",
              finished_at: null,
              status: "upcoming",
            },
          ],
        });
      }
      if (typeof url === "string" && url.includes("/api/admin/customers/")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              customer_id: 1,
              first_name: "John",
              last_name: "Doe",
              email: "john@example.com",
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
        });
      }
      if (typeof url === "string" && url.includes("/api/services/")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ service_id: 21, name: "Oil Change", cost: 29.99 }],
        });
      }
      if (typeof url === "string" && url.includes("/api/appointments/") && opts && opts.method === "POST") {
        const body = JSON.parse(opts.body || "{}");
        return Promise.resolve({
          ok: true,
          json: async () => ({
            appointment_id: 2,
            service_type: body.service_type,
            scheduled_at: body.scheduled_at,
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    jest.restoreAllMocks();
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
  });

  test("renders calendar and New Appointment with events", async () => {
    render(<AdminAppointment />);
    expect(await screen.findByTestId("fullcalendar")).toBeInTheDocument();
    expect(screen.getByText("+ New Appointment")).toBeInTheDocument();
    const events = await screen.findAllByTestId("event");
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]).toHaveTextContent(/Oil Change/i);
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
});
