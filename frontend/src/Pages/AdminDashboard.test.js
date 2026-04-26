import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

jest.mock("../Components/AdminSideBar", () => () => <div>AdminSideBar</div>);

jest.mock("../Components/AdminUpdateBusiness", () => ({ visible, onClose }) =>
  visible ? (
    <div>
      <p>Edit Business Modal</p>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
);

beforeEach(() => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      is_admin: true,
      is_staff: true,
      role: "admin",
    })
  );

  localStorage.setItem("authToken", "fake-admin-token");

  global.fetch = jest.fn((url) => {
    if (url.includes("/api/business-info/")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            info_id: 1,
            name: "Royal Auto",
            phone: "123-456-7890",
            address: "123 Main St",
            hours: "9AM - 5PM",
            email: "info@royalauto.com",
          },
        ],
      });
    }

    if (url.includes("/api/admin/dashboard-totals/")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          total_customers: 25,
          total_appointments: 10,
          total_messages: 5,
          total_services: 7,
        }),
      });
    }

    if (url.includes("/api/admin/recent-customers/")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 1,
            first_name: "John",
            last_name: "Doe",
            created_at: "2025-01-01T10:30:00Z",
          },
          {
            id: 2,
            first_name: "Jane",
            last_name: "Smith",
            created_at: "2025-01-02T11:00:00Z",
          },
        ],
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

test("fetches and displays business information", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText("Royal Auto")).toBeInTheDocument();
  expect(screen.getByText("123-456-7890")).toBeInTheDocument();
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("9AM - 5PM")).toBeInTheDocument();
  expect(screen.getByText("info@royalauto.com")).toBeInTheDocument();
});

test("opens edit modal when Edit is clicked", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );

  const editButton = await screen.findByRole("button", { name: /edit/i });
  await userEvent.click(editButton);

  expect(screen.getByText("Edit Business Modal")).toBeInTheDocument();
});

test("displays recent customers", async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText("John Doe")).toBeInTheDocument();
  expect(screen.getByText("Jane Smith")).toBeInTheDocument();
});