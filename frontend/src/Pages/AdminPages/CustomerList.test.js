import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerList from "./CustomerList";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-sidebar" />
));

jest.mock("../../Components/AdminNewCustomer", () => ({ isOpen, onClose }) =>
  isOpen ? (
    <div data-testid="mock-new-customer">
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
);

jest.mock("../../config", () => ({
  API_BASE_URL: "http://test-api",
}));

// --------------- mock data ---------------

const mockCustomers = [
  {
    customer_id: 1,
    first_name: "Alice",
    last_name: "Anderson",
    email: "alice@example.com",
    phone: "5551110000",
    created_at: "2026-01-15T10:00:00Z",
    vehicles: [
      { vehicle_id: 10, make: "Toyota", model: "Camry", year: 2022, license_plate: "ABC123" },
      { vehicle_id: 11, make: "Honda", model: "Civic", year: 2020, license_plate: "XYZ789" },
    ],
    appointments: [
      { appointment_id: 100, service_type: "Oil Change", scheduled_at: "2026-03-01T09:00:00Z", vehicle: { make: "Toyota", model: "Camry" }, cost: "49.99", finished_at: "2026-03-01T10:00:00Z" },
      { appointment_id: 101, service_type: "Brake Repair", scheduled_at: "2026-02-15T14:00:00Z", vehicle: { make: "Honda", model: "Civic" }, cost: "199.99", finished_at: null },
    ],
  },
  {
    customer_id: 2,
    first_name: "Bob",
    last_name: "Baker",
    email: "bob@example.com",
    phone: "5552220000",
    created_at: "2026-02-20T12:00:00Z",
    vehicles: [],
    appointments: [],
  },
  {
    customer_id: 3,
    first_name: "Carol",
    last_name: "Clark",
    email: "carol@example.com",
    phone: "5553330000",
    created_at: "2026-03-10T08:00:00Z",
    vehicles: [
      { vehicle_id: 20, make: "Ford", model: "F-150", year: 2024, license_plate: "TRUCK1" },
    ],
    appointments: [
      { appointment_id: 200, service_type: "Tire Rotation", scheduled_at: "2026-03-05T10:00:00Z", vehicle: { make: "Ford", model: "F-150" }, cost: "29.99", finished_at: "2026-03-05T11:00:00Z" },
      { appointment_id: 201, service_type: "Oil Change", scheduled_at: "2026-02-20T09:00:00Z", vehicle: { make: "Ford", model: "F-150" }, cost: "49.99", finished_at: "2026-02-20T10:00:00Z" },
      { appointment_id: 202, service_type: "Brake Repair", scheduled_at: "2026-01-10T13:00:00Z", vehicle: { make: "Ford", model: "F-150" }, cost: "189.99", finished_at: "2026-01-10T15:00:00Z" },
      { appointment_id: 203, service_type: "Alignment", scheduled_at: "2025-12-05T11:00:00Z", vehicle: { make: "Ford", model: "F-150" }, cost: "79.99", finished_at: "2025-12-05T12:00:00Z" },
    ],
  },
];

const mockServices = [
  { service_id: 1, name: "Oil Change", cost: "49.99" },
  { service_id: 2, name: "Brake Repair", cost: "199.99" },
  { service_id: 3, name: "Tire Rotation", cost: "29.99" },
];

// --------------- helpers ---------------

function setupFetchMock(customersData = mockCustomers, servicesData = mockServices) {
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/admin/customers/")) {
      return Promise.resolve({ ok: true, json: async () => customersData });
    }
    if (url.includes("/api/services/")) {
      return Promise.resolve({ ok: true, json: async () => servicesData });
    }
    return Promise.reject(new Error("Unknown URL"));
  });
}

async function renderAndWait() {
  render(<CustomerList />);
  await waitFor(() => {
    expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
  });
}

function expandCard(name) {
  const heading = screen.getByText(name);
  fireEvent.click(heading.closest(".customer-card-header"));
}

// --------------- tests ---------------

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.setItem("authToken", "fake-token");
  setupFetchMock();
  window.scrollTo = jest.fn();
});

afterEach(() => {
  sessionStorage.clear();
});

// ========== Phase 1: Rendering & Initial Load ==========

describe("Rendering & Initial Load", () => {
  test("renders loading state initially", () => {
    render(<CustomerList />);
    expect(screen.getByText(/loading customers/i)).toBeInTheDocument();
  });

  test("renders customer cards after fetch", async () => {
    await renderAndWait();

    expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    expect(screen.getByText("Bob Baker")).toBeInTheDocument();
    expect(screen.getByText("Carol Clark")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search customers...")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Newest First")).toBeInTheDocument();
  });

  test("renders error state on fetch failure", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  test("renders 'No customers found' when API returns empty array", async () => {
    setupFetchMock([], mockServices);

    render(<CustomerList />);

    await waitFor(() => {
      expect(screen.getByText("No customers found.")).toBeInTheDocument();
    });
  });

  test("shows Customer Management title", async () => {
    await renderAndWait();
    expect(screen.getByText("Customer Management")).toBeInTheDocument();
  });

  test("includes auth token in fetch headers", async () => {
    await renderAndWait();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api/api/admin/customers/",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });
});

// ========== Phase 2: Search & Sort ==========

describe("Search & Sort", () => {
  test("filters customers by name", async () => {
    await renderAndWait();

    await userEvent.type(screen.getByPlaceholderText("Search customers..."), "alice");

    expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Baker")).not.toBeInTheDocument();
    expect(screen.queryByText("Carol Clark")).not.toBeInTheDocument();
  });

  test("filters customers by email", async () => {
    await renderAndWait();

    await userEvent.type(screen.getByPlaceholderText("Search customers..."), "bob@");

    expect(screen.getByText("Bob Baker")).toBeInTheDocument();
    expect(screen.queryByText("Alice Anderson")).not.toBeInTheDocument();
  });

  test("filters customers by phone", async () => {
    await renderAndWait();

    await userEvent.type(screen.getByPlaceholderText("Search customers..."), "5553330000");

    expect(screen.getByText("Carol Clark")).toBeInTheDocument();
    expect(screen.queryByText("Alice Anderson")).not.toBeInTheDocument();
  });

  test("shows no results message for unmatched search", async () => {
    await renderAndWait();

    await userEvent.type(screen.getByPlaceholderText("Search customers..."), "zzzzzzz");

    expect(screen.getByText("No customers found.")).toBeInTheDocument();
  });

  test("sorts customers by Name A-Z", async () => {
    await renderAndWait();

    fireEvent.change(screen.getByDisplayValue("Newest First"), { target: { value: "name-asc" } });

    const headings = screen.getAllByRole("heading", { level: 5 });
    expect(headings[0]).toHaveTextContent("Alice Anderson");
    expect(headings[1]).toHaveTextContent("Bob Baker");
    expect(headings[2]).toHaveTextContent("Carol Clark");
  });
});

// ========== Phase 3: Card Expand / Collapse ==========

describe("Card Expand / Collapse", () => {
  test("expands card on header click", async () => {
    await renderAndWait();

    expandCard("Alice Anderson");

    // the Vehicles h6 heading appears in the expanded body
    expect(screen.getByRole("heading", { name: "Vehicles" })).toBeInTheDocument();
    expect(screen.getAllByText("▲").length).toBeGreaterThanOrEqual(1);
  });

  test("collapses card on second click", async () => {
    await renderAndWait();

    expandCard("Alice Anderson");
    expect(screen.getByText(/Service History \(2\)/)).toBeInTheDocument();

    expandCard("Alice Anderson");
    expect(screen.queryByText(/Service History \(2\)/)).not.toBeInTheDocument();
  });

  test("shows vehicle table in expanded card", async () => {
    await renderAndWait();

    expandCard("Alice Anderson");

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Camry")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Honda")).toBeInTheDocument();
    expect(screen.getByText("XYZ789")).toBeInTheDocument();
  });

  test("shows 'No vehicles registered' for customer without vehicles", async () => {
    await renderAndWait();

    expandCard("Bob Baker");

    expect(screen.getByText("No vehicles registered.")).toBeInTheDocument();
  });

  test("shows service history with correct count", async () => {
    await renderAndWait();

    expandCard("Carol Clark");

    expect(screen.getByText("Service History (4)")).toBeInTheDocument();
  });
});

// ========== Phase 4: Hover Peek Dropdowns ==========

describe("Hover Peek Dropdowns", () => {
  test("shows Vehicles dropdown only for customers with vehicles", async () => {
    await renderAndWait();

    const dropButtons = screen.getAllByRole("button", { name: "Vehicles" });
    expect(dropButtons).toHaveLength(2);
  });

  test("shows Service History dropdown only for customers with appointments", async () => {
    await renderAndWait();

    const histButtons = screen.getAllByRole("button", { name: "Service History" });
    expect(histButtons).toHaveLength(2);
  });

  test("shows '+N more' when customer has >3 appointments", async () => {
    await renderAndWait();

    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });
});

// ========== Phase 5: Book Appointment Form ==========

describe("Book Appointment Form", () => {
  test("shows booking form when button clicked", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }));

    expect(screen.getByText("Confirm Booking")).toBeInTheDocument();
  });

  test("hides booking form when Cancel clicked", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }));
    expect(screen.getByText("Confirm Booking")).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    const formCancel = cancelButtons.find(btn => btn.closest(".customer-inline-form"));
    fireEvent.click(formCancel);

    expect(screen.queryByText("Confirm Booking")).not.toBeInTheDocument();
  });

  test("submits booking and shows success message", async () => {
    const createdAppointment = {
      appointment_id: 999,
      service_type: "Oil Change",
      scheduled_at: "2026-04-01T10:00:00Z",
      vehicle: { make: "Toyota", model: "Camry" },
      cost: "49.99",
      finished_at: null,
    };

    global.fetch = jest.fn((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => createdAppointment });
      }
      if (url.includes("/api/admin/customers/")) {
        return Promise.resolve({ ok: true, json: async () => mockCustomers });
      }
      if (url.includes("/api/services/")) {
        return Promise.resolve({ ok: true, json: async () => mockServices });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }));

    const bookingForm = screen.getByText("Confirm Booking").closest("form");
    const formSelects = Array.from(bookingForm.querySelectorAll("select"));

    fireEvent.change(formSelects[0], { target: { value: "10" } });
    fireEvent.change(formSelects[1], { target: { value: "Oil Change" } });

    const datetimeInput = bookingForm.querySelector('input[type="datetime-local"]');
    fireEvent.change(datetimeInput, { target: { value: "2026-04-01T10:00" } });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    await waitFor(() => {
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument();
    });

    const postCall = global.fetch.mock.calls.find(
      ([url, opts]) => opts?.method === "POST" && url.includes("/book-appointment/")
    );
    expect(postCall).toBeTruthy();
    expect(postCall[0]).toBe("http://test-api/api/admin/customers/1/book-appointment/");
  });

  test("shows error message on booking failure", async () => {
    global.fetch = jest.fn((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: async () => ({ detail: "Time slot unavailable" }),
        });
      }
      if (url.includes("/api/admin/customers/")) {
        return Promise.resolve({ ok: true, json: async () => mockCustomers });
      }
      if (url.includes("/api/services/")) {
        return Promise.resolve({ ok: true, json: async () => mockServices });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }));

    const bookingForm = screen.getByText("Confirm Booking").closest("form");
    const formSelects = Array.from(bookingForm.querySelectorAll("select"));

    fireEvent.change(formSelects[0], { target: { value: "10" } });
    fireEvent.change(formSelects[1], { target: { value: "Oil Change" } });

    const datetimeInput = bookingForm.querySelector('input[type="datetime-local"]');
    fireEvent.change(datetimeInput, { target: { value: "2026-04-01T10:00" } });

    fireEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

    await waitFor(() => {
      expect(screen.getByText("Time slot unavailable")).toBeInTheDocument();
    });
  });

  test("toggles between Book and Recommend forms", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }));
    expect(screen.getByText("Confirm Booking")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Recommend Services" }));
    expect(screen.queryByText("Confirm Booking")).not.toBeInTheDocument();
    expect(screen.getByText("Send Recommendations")).toBeInTheDocument();
  });
});

// ========== Phase 6: Recommend Services Form ==========

describe("Recommend Services Form", () => {
  test("shows recommend form when button clicked", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Recommend Services" }));

    expect(screen.getByText("Select Services:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Optional note...")).toBeInTheDocument();
  });

  test("allows toggling service checkboxes", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Recommend Services" }));

    const checkbox = screen.getByRole("checkbox", { name: /Oil Change/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("disables submit when no services selected", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Recommend Services" }));

    expect(screen.getByRole("button", { name: "Send Recommendations" })).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /Brake Repair/i }));
    expect(screen.getByRole("button", { name: "Send Recommendations" })).not.toBeDisabled();
  });

  test("submits recommendation and shows success", async () => {
    global.fetch = jest.fn((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      if (url.includes("/api/admin/customers/")) {
        return Promise.resolve({ ok: true, json: async () => mockCustomers });
      }
      if (url.includes("/api/services/")) {
        return Promise.resolve({ ok: true, json: async () => mockServices });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "Recommend Services" }));

    // select vehicle
    const recForm = screen.getByText("Send Recommendations").closest("form");
    const vehicleSelect = recForm.querySelector("select");
    fireEvent.change(vehicleSelect, { target: { value: "10" } });

    // select services
    fireEvent.click(screen.getByRole("checkbox", { name: /Oil Change/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Tire Rotation/i }));

    // add note
    await userEvent.type(screen.getByPlaceholderText("Optional note..."), "Due for service");

    fireEvent.click(screen.getByRole("button", { name: "Send Recommendations" }));

    await waitFor(() => {
      expect(screen.getByText(/recommendations sent/i)).toBeInTheDocument();
    });

    const postCall = global.fetch.mock.calls.find(
      ([url, opts]) => opts?.method === "POST" && url.includes("/recommend-services/")
    );
    expect(postCall).toBeTruthy();
    const body = JSON.parse(postCall[1].body);
    expect(body.services).toEqual(expect.arrayContaining([1, 3]));
    expect(body.note).toBe("Due for service");
  });
});

// ========== Phase 7: Add Vehicle Form ==========

describe("Add Vehicle Form", () => {
  test("shows add vehicle form when button clicked", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "+ Add Vehicle" }));

    expect(screen.getByPlaceholderText("Make (e.g. Toyota)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Model (e.g. Camry)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Year (e.g. 2023)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("License Plate")).toBeInTheDocument();
  });

  test("hides form on Cancel", async () => {
    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "+ Add Vehicle" }));
    expect(screen.getByPlaceholderText("Make (e.g. Toyota)")).toBeInTheDocument();

    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    const formCancel = cancelButtons.find(btn => btn.closest(".customer-inline-form"));
    fireEvent.click(formCancel);

    expect(screen.queryByPlaceholderText("Make (e.g. Toyota)")).not.toBeInTheDocument();
  });

  test("submits vehicle and updates table", async () => {
    const createdVehicle = {
      vehicle_id: 99,
      make: "Tesla",
      model: "Model 3",
      year: 2025,
      license_plate: "ELEC01",
    };

    global.fetch = jest.fn((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => createdVehicle });
      }
      if (url.includes("/api/admin/customers/")) {
        return Promise.resolve({ ok: true, json: async () => mockCustomers });
      }
      if (url.includes("/api/services/")) {
        return Promise.resolve({ ok: true, json: async () => mockServices });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "+ Add Vehicle" }));

    await userEvent.type(screen.getByPlaceholderText("Make (e.g. Toyota)"), "Tesla");
    await userEvent.type(screen.getByPlaceholderText("Model (e.g. Camry)"), "Model 3");
    await userEvent.type(screen.getByPlaceholderText("Year (e.g. 2023)"), "2025");
    await userEvent.type(screen.getByPlaceholderText("License Plate"), "ELEC01");

    fireEvent.click(screen.getByRole("button", { name: "Save Vehicle" }));

    await waitFor(() => {
      expect(screen.getByText(/vehicle added successfully/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("ELEC01")).toBeInTheDocument();
    });

    const postCall = global.fetch.mock.calls.find(
      ([url, opts]) => opts?.method === "POST" && url.includes("/vehicles/")
    );
    expect(postCall).toBeTruthy();
    expect(postCall[0]).toBe("http://test-api/api/admin/customers/1/vehicles/");
  });

  test("shows error message on add vehicle failure", async () => {
    global.fetch = jest.fn((url, opts) => {
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: async () => ({ detail: "Duplicate plate" }),
        });
      }
      if (url.includes("/api/admin/customers/")) {
        return Promise.resolve({ ok: true, json: async () => mockCustomers });
      }
      if (url.includes("/api/services/")) {
        return Promise.resolve({ ok: true, json: async () => mockServices });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    await renderAndWait();
    expandCard("Alice Anderson");

    fireEvent.click(screen.getByRole("button", { name: "+ Add Vehicle" }));

    await userEvent.type(screen.getByPlaceholderText("Make (e.g. Toyota)"), "Tesla");
    await userEvent.type(screen.getByPlaceholderText("Model (e.g. Camry)"), "Model 3");
    await userEvent.type(screen.getByPlaceholderText("Year (e.g. 2023)"), "2025");
    await userEvent.type(screen.getByPlaceholderText("License Plate"), "ELEC01");

    fireEvent.click(screen.getByRole("button", { name: "Save Vehicle" }));

    await waitFor(() => {
      expect(screen.getByText("Duplicate plate")).toBeInTheDocument();
    });
  });
});

// ========== Phase 8: Add New Customer Modal ==========

describe("Add New Customer Modal", () => {
  test("opens modal when button clicked", async () => {
    await renderAndWait();

    fireEvent.click(screen.getByRole("button", { name: "Add New Customer" }));

    expect(screen.getByTestId("mock-new-customer")).toBeInTheDocument();
  });

  test("closes modal via onClose", async () => {
    await renderAndWait();

    fireEvent.click(screen.getByRole("button", { name: "Add New Customer" }));
    expect(screen.getByTestId("mock-new-customer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByTestId("mock-new-customer")).not.toBeInTheDocument();
  });
});
