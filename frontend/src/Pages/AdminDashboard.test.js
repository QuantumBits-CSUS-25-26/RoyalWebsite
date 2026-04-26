import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "./AdminDashboard";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../Components/AdminSideBar", () => () => (
  <div data-testid="admin-sidebar">AdminSideBar</div>
));

jest.mock("../Components/AdminUpdateBusiness", () => ({ visible, onClose }) =>
  visible ? (
    <div>
      <p>Edit Business Modal</p>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
);

jest.mock("../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

const renderDashboard = () => render(<AdminDashboard />);

const setAdminUser = () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      is_admin: true,
      is_staff: true,
      role: "admin",
    })
  );
};

const setEmployeeUser = () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      is_employee: true,
      role: "employee",
    })
  );
};

const installFetchMock = ({
  businessOk = true,
  totalsOk = true,
  recentOk = true,
  businessData = [
    {
      info_id: 1,
      name: "Royal Auto",
      phone: "123-456-7890",
      address: "123 Main St",
      hours: "9AM - 5PM",
      email: "info@royalauto.com",
    },
  ],
  totalsData = {
    total_customers: 25,
    total_appointments: 10,
    total_messages: 5,
    total_services: 7,
  },
  recentData = [
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
  logoutOk = true,
} = {}) => {
  global.fetch = jest.fn((url, opts = {}) => {
    const method = (opts.method || "GET").toUpperCase();

    if (String(url).includes("/api/business-info/")) {
      if (!businessOk) return Promise.reject(new Error("business failed"));
      return Promise.resolve({
        ok: true,
        json: async () => businessData,
      });
    }

    if (String(url).includes("/api/admin/dashboard-totals/")) {
      if (!totalsOk) return Promise.reject(new Error("totals failed"));
      return Promise.resolve({
        ok: true,
        json: async () => totalsData,
      });
    }

    if (String(url).includes("/api/admin/recent-customers/")) {
      if (!recentOk) return Promise.reject(new Error("recent failed"));
      return Promise.resolve({
        ok: true,
        json: async () => recentData,
      });
    }

    if (String(url).includes("/api/logout/") && method === "POST") {
      if (!logoutOk) return Promise.reject(new Error("logout failed"));
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();

  setAdminUser();
  localStorage.setItem("authToken", "fake-admin-token");

  jest.spyOn(console, "error").mockImplementation(() => {});
  installFetchMock();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.restoreAllMocks();
});

test("renders auth error page when unauthorized", () => {
  localStorage.clear();
  sessionStorage.clear();

  renderDashboard();

  expect(screen.getByTestId("auth-error")).toBeInTheDocument();
  expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
});

test("allows access when token exists even without stored user", async () => {
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem("authToken", "session-token");

  renderDashboard();

  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
});

test("fetches and displays business information", async () => {
  renderDashboard();

  expect(await screen.findByText("Royal Auto")).toBeInTheDocument();
  expect(screen.getByText("123-456-7890")).toBeInTheDocument();
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("9AM - 5PM")).toBeInTheDocument();
  expect(screen.getByText("info@royalauto.com")).toBeInTheDocument();
});

test("displays dashboard totals", async () => {
  renderDashboard();

  expect(await screen.findByText("25")).toBeInTheDocument();
  expect(screen.getByText("10")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("7")).toBeInTheDocument();

  expect(screen.getByText(/Total Customers/i)).toBeInTheDocument();
  expect(screen.getByText(/Total Appointments/i)).toBeInTheDocument();
  expect(screen.getByText(/Total Messages/i)).toBeInTheDocument();
  expect(screen.getByText(/Total Services/i)).toBeInTheDocument();
});

test("displays recent customers", async () => {
  renderDashboard();

  expect(await screen.findByText("John Doe")).toBeInTheDocument();
  expect(screen.getByText("Jane Smith")).toBeInTheDocument();
});

test("shows fallback when no recent customers are returned", async () => {
  installFetchMock({ recentData: [] });

  renderDashboard();

  expect(await screen.findByText(/No recent customers found\./i)).toBeInTheDocument();
});

test("shows business fallback values when business info is missing", async () => {
  installFetchMock({ businessData: [{}] });

  renderDashboard();

  expect(await screen.findByText(/No Name Found/i)).toBeInTheDocument();
  expect(screen.getByText(/No Phone Found/i)).toBeInTheDocument();
  expect(screen.getByText(/No Address Found/i)).toBeInTheDocument();
  expect(screen.getByText(/No Hours Found/i)).toBeInTheDocument();
  expect(screen.getByText(/No Email Found/i)).toBeInTheDocument();
});

test("opens edit modal when Edit is clicked", async () => {
  const user = userEvent.setup();

  renderDashboard();

  const editButton = await screen.findByRole("button", { name: /edit/i });
  await user.click(editButton);

  expect(screen.getByText("Edit Business Modal")).toBeInTheDocument();
});

test("closes edit modal when Close is clicked", async () => {
  const user = userEvent.setup();

  renderDashboard();

  const editButton = await screen.findByRole("button", { name: /edit/i });
  await user.click(editButton);
  expect(screen.getByText("Edit Business Modal")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close/i }));

  await waitFor(() => {
    expect(screen.queryByText("Edit Business Modal")).not.toBeInTheDocument();
  });
});

test("does not show Edit button for non-admin employee", async () => {
  localStorage.clear();
  localStorage.setItem("authToken", "fake-employee-token");
  setEmployeeUser();

  renderDashboard();

  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
});

test("handles logout successfully", async () => {
  const user = userEvent.setup();

  renderDashboard();
  const signOutButton = await screen.findByRole("button", { name: /sign-out/i });

  await user.click(signOutButton);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/logout/"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-admin-token",
          Accept: "application/json",
        }),
      })
    );
  });

  expect(localStorage.getItem("authToken")).toBeNull();
  expect(sessionStorage.getItem("authToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(sessionStorage.getItem("user")).toBeNull();
  expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
});

test("logout still clears storage and navigates when request fails", async () => {
  const user = userEvent.setup();
  installFetchMock({ logoutOk: false });

  renderDashboard();
  const signOutButton = await screen.findByRole("button", { name: /sign-out/i });

  await user.click(signOutButton);

  await waitFor(() => {
    expect(console.error).toHaveBeenCalled();
  });

  expect(localStorage.getItem("authToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
});

test("handles failed business info fetch gracefully", async () => {
  installFetchMock({ businessOk: false });

  renderDashboard();

  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch business info:",
      expect.any(Error)
    );
  });
});

test("handles failed totals fetch gracefully", async () => {
  installFetchMock({ totalsOk: false });

  renderDashboard();

  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch dashboard totals:",
      expect.any(Error)
    );
  });

  expect(screen.getAllByText("0").length).toBeGreaterThan(0);
});

test("handles failed recent customers fetch gracefully", async () => {
  installFetchMock({ recentOk: false });

  renderDashboard();

  expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch recent customers:",
      expect.any(Error)
    );
  });
});

test("uses customer.name when provided", async () => {
  installFetchMock({
    recentData: [
      {
        id: 1,
        name: "Custom Customer Name",
        created_at: "2025-01-01T10:30:00Z",
      },
    ],
  });

  renderDashboard();

  expect(await screen.findByText("Custom Customer Name")).toBeInTheDocument();
});

test("uses unnamed customer fallback when no name fields exist", async () => {
  installFetchMock({
    recentData: [
      {
        id: 1,
        created_at: "2025-01-01T10:30:00Z",
      },
    ],
  });

  renderDashboard();

  expect(await screen.findByText("Unnamed Customer")).toBeInTheDocument();
});

test("shows Unknown joined date fallback for invalid created_at", async () => {
  installFetchMock({
    recentData: [
      {
        id: 1,
        first_name: "Broken",
        last_name: "Date",
        created_at: "not-a-real-date",
      },
    ],
  });

  renderDashboard();

  expect(await screen.findByText("Broken Date")).toBeInTheDocument();
  expect(screen.getByText("Unknown")).toBeInTheDocument();
});