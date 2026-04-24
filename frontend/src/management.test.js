import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Management from "./Pages/AdminPages/Management";

jest.mock("./Components/AdminSideBar", () => () => <div data-testid="sidebar" />);

jest.mock("./Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">Unauthorized</div>
));

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
        <button onClick={() => props.onRemove(1).catch(() => {})}>
          Confirm Remove
        </button>
      </div>
    );
  };
});

jest.mock("./Pages/EmployeeManagmentPopups/EditEmployee", () => {
  return function EditEmployeeMock(props) {
    if (!props.visible) return null;
    return (
      <div>
        <button
          onClick={() =>
            props
              .onEdit(1, {
                first_name: "John",
                last_name: "Smith",
                email: "john.doe@example.com",
                phone: "1234567890",
              })
              .catch(() => {})
          }
        >
          Confirm Edit
        </button>
      </div>
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

const editedEmployee = {
  id: 1,
  first_name: "John",
  last_name: "Smith",
  email: "john.doe@example.com",
  phone: "1234567890",
};

const mockFetchRouter = ({
  initialEmployees = [],
  initialFetchOk = true,
  createOk = true,
  deleteOk = true,
  editOk = true,
  initialFetchBody,
  createBody,
  deleteBody,
  editBody,
} = {}) => {
  global.fetch = jest.fn((url, options) => {
    if (url === "/api/admin/employees/" && (!options || !options.method)) {
      return Promise.resolve({
        ok: initialFetchOk,
        json: () =>
          Promise.resolve(
            initialFetchBody ??
              (initialFetchOk ? initialEmployees : { detail: "Failed to fetch employees" })
          ),
      });
    }

    if (url === "/api/admin/employees/create/" && options?.method === "POST") {
      return Promise.resolve({
        ok: createOk,
        json: () =>
          Promise.resolve(
            createBody ?? (createOk ? defaultEmployee : { detail: "Failed to add employee" })
          ),
      });
    }

    if (url === "/api/admin/employees/1/delete/" && options?.method === "DELETE") {
      return Promise.resolve({
        ok: deleteOk,
        json: () =>
          Promise.resolve(
            deleteBody ?? (deleteOk ? {} : { detail: "Failed to remove employee" })
          ),
      });
    }

    if (url === "/api/admin/employees/1/edit/" && options?.method === "PUT") {
      return Promise.resolve({
        ok: editOk,
        json: () =>
          Promise.resolve(
            editBody ?? (editOk ? editedEmployee : { detail: "Failed to edit employee" })
          ),
      });
    }

    return Promise.reject(new Error(`Unhandled fetch: ${url}`));
  });
};

const waitForInitialEmployeesFetch = async () => {
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/employees/",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();

  localStorage.setItem("token", "test-token");
  localStorage.setItem("user", JSON.stringify({ role: "admin" }));

  mockFetchRouter();
  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe("Management Component", () => {
  test("renders without crashing", async () => {
    render(<Management />);
    await waitForInitialEmployeesFetch();

    expect(await screen.findByText("Management")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("renders employees fetched from API", async () => {
    mockFetchRouter({
      initialEmployees: [
        {
          id: 2,
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@example.com",
          phone: "1112223333",
        },
      ],
    });

    render(<Management />);

    expect(await screen.findByText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/1112223333/i)).toBeInTheDocument();
  });

  test("supports wrapped employees response shape", async () => {
    mockFetchRouter({
      initialFetchBody: {
        employees: [
          {
            id: 3,
            first_name: "Wrapped",
            last_name: "Employee",
            email: "wrapped@example.com",
            phone: "9998887777",
          },
        ],
      },
    });

    render(<Management />);

    expect(await screen.findByText(/wrapped employee/i)).toBeInTheDocument();
  });

  test("supports wrapped results response shape", async () => {
    mockFetchRouter({
      initialFetchBody: {
        results: [
          {
            id: 4,
            first_name: "Result",
            last_name: "Employee",
            email: "result@example.com",
            phone: "4445556666",
          },
        ],
      },
    });

    render(<Management />);

    expect(await screen.findByText(/result employee/i)).toBeInTheDocument();
  });

  test("uses employee.name when provided", async () => {
    mockFetchRouter({
      initialEmployees: [
        {
          id: 5,
          name: "Custom Display Name",
          email: "custom@example.com",
          phone: "1010101010",
        },
      ],
    });

    render(<Management />);

    expect(await screen.findByText(/custom display name/i)).toBeInTheDocument();
  });

  test("renders auth error page for unauthorized user", () => {
    localStorage.clear();
    sessionStorage.clear();

    render(<Management />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    expect(screen.queryByText("Management")).not.toBeInTheDocument();
  });

  test("allows access when authToken exists without stored user", async () => {
    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem("token", "test-token");
    sessionStorage.setItem("authToken", "session-auth-token");

    mockFetchRouter();

    render(<Management />);

    expect(await screen.findByText("Management")).toBeInTheDocument();
  });

  test("handles failed initial employee fetch gracefully", async () => {
    mockFetchRouter({
      initialFetchOk: false,
    });

    render(<Management />);

    expect(await screen.findByText("Management")).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
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
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone: "1234567890",
            role: "employee",
            password: "TestPassword123!",
          }),
        })
      );
    });
  });

  test("alerts when adding employee fails", async () => {
    mockFetchRouter({ createOk: false });

    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/error adding employee/i)
      );
    });
  });

  test("handles removing an employee and updates UI", async () => {
    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm remove/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/1/delete/",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
    });
  });

  test("does not remove employee from UI when delete fails", async () => {
    mockFetchRouter({ deleteOk: false });

    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm remove/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/1/delete/",
        expect.objectContaining({ method: "DELETE" })
      );
    });

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  test("handles editing an employee and updates UI", async () => {
    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /edit employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm edit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/1/edit/",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({
            first_name: "John",
            last_name: "Smith",
            email: "john.doe@example.com",
            phone: "1234567890",
          }),
        })
      );
    });

    expect(await screen.findByText(/john smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
  });

  test("does not update employee in UI when edit fails", async () => {
    mockFetchRouter({ editOk: false });

    render(<Management />);
    await waitForInitialEmployeesFetch();

    await userEvent.click(screen.getByRole("button", { name: /add employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /submit add/i }));
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /edit employee/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm edit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/employees/1/edit/",
        expect.objectContaining({ method: "PUT" })
      );
    });

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/john smith/i)).not.toBeInTheDocument();
  });
});