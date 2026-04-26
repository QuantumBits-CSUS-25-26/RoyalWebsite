import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Management from "./Management";

jest.mock("../../config", () => ({
  API_BASE_URL: "http://test-api.com",
}));

jest.mock("../../Components/AdminSideBar", () => () => <div data-testid="sidebar" />);

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

jest.mock("../EmployeeManagmentPopups/AddEmployee", () => {
  return function MockAddEmployeeForm({ visible, onAdd }) {
    if (!visible) return null;

    return (
      <div>
        <button
          onClick={() =>
            onAdd({
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              phone: "555-1111",
              role: "employee",
              password: "secret123",
            })
          }
        >
          Submit Add
        </button>
      </div>
    );
  };
});

jest.mock("../EmployeeManagmentPopups/RemoveEmployee", () => {
  return function MockRemoveEmployeeForm({ visible, onRemove, employee }) {
    if (!visible) return null;

    const firstEmployee = employee?.[0];
    const id = firstEmployee?.employee_id ?? firstEmployee?.id;

    return (
      <div data-testid="remove-form">
        <button
          onClick={async () => {
            try {
              await onRemove(id);
            } catch {
              // swallow error like a real modal would
            }
          }}
        >
          Confirm Remove
        </button>
      </div>
    );
  };
});

jest.mock("../EmployeeManagmentPopups/EditEmployee", () => {
  return function MockEditEmployeeForm() {
    return null;
  };
});

describe("Management remove flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem("authToken", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        is_admin: true,
      })
    );
  });

  afterEach(() => {
    delete global.fetch;
  });

  test("removes employee from list on successful delete", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn((url, options = {}) => {
      if (url === "http://test-api.com/api/admin/employees/") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([]),
        });
      }

      if (url === "http://test-api.com/api/admin/employees/create/" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            employee_id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            phone: "555-1111",
            role: "employee",
          }),
        });
      }

      if (
        url === "http://test-api.com/api/admin/employees/1/delete/" &&
        options.method === "DELETE"
      ) {
        return Promise.resolve({
          ok: true,
          status: 204,
          json: jest.fn().mockResolvedValue({}),
        });
      }

      return Promise.resolve({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: "Unexpected request" }),
      });
    });

    render(<Management />);

    expect(await screen.findByText("Management")).toBeInTheDocument();
    expect(screen.getByText(/no employees found\./i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add employee/i }));
    await user.click(screen.getByRole("button", { name: /submit add/i }));

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove employee/i }));
    expect(await screen.findByTestId("remove-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirm remove/i }));

    await waitFor(() => {
      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no employees found\./i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/admin/employees/1/delete/",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      })
    );
  });

  test("does not remove employee from UI when delete fails", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn((url, options = {}) => {
      if (url === "http://test-api.com/api/admin/employees/") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([]),
        });
      }

      if (url === "http://test-api.com/api/admin/employees/create/" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            employee_id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
            phone: "555-1111",
            role: "employee",
          }),
        });
      }

      if (
        url === "http://test-api.com/api/admin/employees/1/delete/" &&
        options.method === "DELETE"
      ) {
        return Promise.resolve({
          ok: false,
          json: jest.fn().mockResolvedValue({
            detail: "Cannot remove employee",
          }),
        });
      }

      return Promise.resolve({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: "Unexpected request" }),
      });
    });

    render(<Management />);

    expect(await screen.findByText("Management")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add employee/i }));
    await user.click(screen.getByRole("button", { name: /submit add/i }));

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove employee/i }));
    await user.click(screen.getByRole("button", { name: /confirm remove/i }));

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });
});