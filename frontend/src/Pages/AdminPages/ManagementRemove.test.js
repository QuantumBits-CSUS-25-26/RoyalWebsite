import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Management from "./Management";

jest.mock("../../Components/AdminSideBar", () => {
  const React = require("react");
  return () => React.createElement("div", { "data-testid": "sidebar" });
});

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => {
  const React = require("react");
  return () => React.createElement("div", { "data-testid": "auth-error" }, "Unauthorized");
});

jest.mock("../EmployeeManagmentPopups/AddEmployee", () => {
  const React = require("react");
  return function AddEmployeeMock(props) {
    if (!props.visible) return null;
    return React.createElement(
      "div",
      null,
      React.createElement(
        "button",
        {
          onClick: () =>
            props.onAdd({
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "1234567890",
              role: "employee",
              password: "TestPassword123!",
            }),
        },
        "Submit Add"
      )
    );
  };
});

jest.mock("../EmployeeManagmentPopups/RemoveEmployee", () => {
  const React = require("react");
  return function RemoveEmployeeMock(props) {
    if (!props.visible) return null;
    return React.createElement(
      "div",
      null,
      React.createElement(
        "button",
        { onClick: () => props.onRemove(1).catch(() => {}) },
        "Confirm Remove"
      )
    );
  };
});

const defaultEmployee = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
};

const mockFetchRouter = ({ initialEmployees = [] , deleteOk = true } = {}) => {
  global.fetch = jest.fn((url, options) => {
    if (url === "/api/admin/employees/" && (!options || !options.method)) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(initialEmployees),
      });
    }

    if (url === "/api/admin/employees/create/" && options?.method === "POST") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(defaultEmployee) });
    }

    if (url === "/api/admin/employees/1/delete/" && options?.method === "DELETE") {
      return Promise.resolve({ ok: deleteOk, json: () => Promise.resolve(deleteOk ? {} : { detail: "Failed to remove employee" }) });
    }

    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();

  localStorage.setItem("authToken", "test-token");
  localStorage.setItem("user", JSON.stringify({ role: "admin" }));

  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test("removes employee from list on successful delete", async () => {
  mockFetchRouter({ initialEmployees: [], deleteOk: true });

  render(<Management />);

  // add an employee so there's something to remove
  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
  await userEvent.click(screen.getByRole("button", { name: /submit add/i }));

  expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

  // open remove modal and confirm
  await userEvent.click(screen.getByRole("button", { name: /remove employee/i }));
  await userEvent.click(screen.getByRole("button", { name: /confirm remove/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/employees/1/delete/",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  await waitFor(() => {
    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
  });
});

test("does not remove employee from UI when delete fails", async () => {
  mockFetchRouter({ initialEmployees: [], deleteOk: false });

  render(<Management />);

  // add employee
  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
  await userEvent.click(screen.getByRole("button", { name: /submit add/i }));

  expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

  // attempt remove
  await userEvent.click(screen.getByRole("button", { name: /remove employee/i }));
  await userEvent.click(screen.getByRole("button", { name: /confirm remove/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/employees/1/delete/",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  // employee should still be present
  expect(screen.getByText(/john doe/i)).toBeInTheDocument();
});
