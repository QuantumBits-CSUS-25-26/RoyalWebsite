import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Management from "./Pages/AdminPages/Management";

jest.mock("./Components/AdminSideBar", () => () => <div data-testid="sidebar" />);

// Mock AddEmployee popup so we can trigger onAdd without relying on its internal UI
jest.mock("./Pages/EmployeeManagmentPopups/AddEmployee", () => {
  return function AddEmployeeMock(props) {
    if (!props.visible) return null;
    return (
      <div>
        <button
          onClick={() =>
            props.onAdd({
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "1234567890",
              role: "employee",
              password: "TestPassword123!",
            })
          }
        >
          Submit Add
        </button>
      </div>
    );
  };
});

jest.mock("./Pages/EmployeeManagmentPopups/RemoveEmployee", () => {
  return function RemoveEmployeeMock(props) {
    if (!props.visible) return null;
    return (
      <div>
        <button onClick={() => props.onRemove(1)}>Confirm Remove</button>
      </div>
    );
  };
});
jest.mock("./Pages/EmployeeManagmentPopups/EditEmployee", () => {
  return function EditEmployeeMock(props) {
    if (!props.visible) return null;
    return (
      <div>
        <button onClick={() => props.onEdit(1)}>Confirm Edit</button>
      </div>
    );
  };
});

beforeEach(() => {
  localStorage.setItem("token", "test-token");

  global.fetch = jest.fn((url, options) => {
  // initial employee fetch
  if (url === "/api/admin/employees/" && (!options || !options.method)) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  }

  // create employee
  if (url === "/api/admin/employees/create/" && options?.method === "POST") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
        }),
    });
  }

  // delete employee
  if (url === "/api/admin/employees/1/delete/" && options?.method === "DELETE") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }

  // edit employee
  if (url === "/api/admin/employees/1/edit/" && options?.method === "PUT") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          first_name: "John",
          last_name: "Smith",
          email: "john.doe@example.com",
          phone: "1234567890",
        }),
    });
  }

  return Promise.reject(new Error(`Unhandled fetch: ${url}`));
});

  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

describe("Management Component", () => {
  const waitForInitialEmployeesFetch = async () => {
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/",
        expect.anything()
      )
    );
  };
  test("renders without crashing", async () => {
    render(<Management />);
    await waitForInitialEmployeesFetch();
    expect(await screen.findByText("Management")).toBeInTheDocument();
  });

  test("handles adding an employee", async () => {
    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/create/",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  test("handles removing an employee", async () => {
  render(<Management />);
  await waitForInitialEmployeesFetch();

  // add employee first
  await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
  await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
  expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

  // open remove popup
  await userEvent.click(screen.getByRole("button", { name: /remove employee/i }));

  // confirm removal (this triggers props.onRemove(1) in your mock)
  await userEvent.click(screen.getByRole("button", { name: /confirm remove/i }));

  // wait for async delete to be called
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/employees/1/delete/",
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

  test("handles editing an employee", async () => {
    render(<Management />);
     await waitForInitialEmployeesFetch();
        // Simulate adding an employee first
    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
    // Mock the PUT response for editing employee
    global.fetch.mockImplementationOnce((url, options) => {
      if (url === "/api/admin/employees/1/edit/" && options?.method === "PUT") { // note the /edit/ endpoint
        return Promise.resolve({ ok: true });
      } else {
        return Promise.reject(new Error(`Unhandled fetch: ${url}`));
      }
    });
    });
});