import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServicesManagement from "./ServicesManagement";

// --- Mocks --------------------------------------------------------------

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="admin-sidebar">AdminSideBar</div>
));

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

jest.mock(
  "../../Components/ServicesManagementAdd",
  () =>
    ({ isOpen, onClose }) =>
      isOpen ? (
        <div data-testid="add-modal">
          <p>Add Modal</p>
          <button onClick={onClose}>Close Add</button>
        </div>
      ) : null
);

jest.mock(
  "../../Components/ServicesManagementUpdate",
  () =>
    ({ isOpen, onClose }) =>
      isOpen ? (
        <div data-testid="update-modal">
          <p>Update Modal</p>
          <button onClick={onClose}>Close Update</button>
        </div>
      ) : null
);

jest.mock(
  "../../Components/ServicesManagementDelete",
  () =>
    ({ isOpen, onClose }) =>
      isOpen ? (
        <div data-testid="delete-modal">
          <p>Delete Modal</p>
          <button onClick={onClose}>Close Delete</button>
        </div>
      ) : null
);

// react-beautiful-dnd / hello-pangea/dnd uses non-deterministic IDs and
// requires complex DOM/portal setup. Stub it to render children directly so
// we can assert on the service cards.
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) =>
    children(
      {
        innerRef: () => {},
        droppableProps: {},
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({ children }) =>
    children(
      {
        innerRef: () => {},
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

// --- Helpers ------------------------------------------------------------

const setAdminUser = () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ is_admin: true, role: "admin" })
  );
};

const sampleServices = [
  {
    service_id: 1,
    name: "Oil Change",
    description: "Standard oil change",
    cost: "29.99",
    is_active: true,
    display_order: 0,
  },
  {
    service_id: 2,
    name: "Tire Rotation",
    description: "Rotate all four tires",
    cost: "19.99",
    is_active: true,
    display_order: 1,
  },
  {
    service_id: 3,
    name: "Brake Inspection",
    description: "Old service",
    cost: null,
    is_active: false,
    display_order: 0,
  },
];

const installFetchMock = ({ servicesOk = true, services = sampleServices } = {}) => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes("/api/services/")) {
      if (!servicesOk) return Promise.reject(new Error("services failed"));
      return Promise.resolve({
        ok: true,
        json: async () => services,
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
};

// --- Lifecycle ----------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
  setAdminUser();
  jest.spyOn(console, "error").mockImplementation(() => {});
  installFetchMock();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.restoreAllMocks();
});

// --- Tests --------------------------------------------------------------

test("renders auth error page when no user is stored", () => {
  localStorage.clear();
  sessionStorage.clear();

  render(<ServicesManagement />);

  expect(screen.getByTestId("auth-error")).toBeInTheDocument();
  expect(screen.queryByText(/Services Management/i)).not.toBeInTheDocument();
});

test("renders auth error page when user is not an admin", () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ is_employee: true, role: "employee" })
  );

  render(<ServicesManagement />);

  expect(screen.getByTestId("auth-error")).toBeInTheDocument();
});

test("renders header and sidebar for admin", async () => {
  render(<ServicesManagement />);

  expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
  expect(screen.getByText(/Services Management/i)).toBeInTheDocument();
  expect(screen.getByText("Active Services")).toBeInTheDocument();
  expect(screen.getByText("Inactive Services")).toBeInTheDocument();
});

test("fetches and splits services into active/inactive zones", async () => {
  render(<ServicesManagement />);

  expect(await screen.findByText("Oil Change")).toBeInTheDocument();
  expect(screen.getByText("Tire Rotation")).toBeInTheDocument();
  expect(screen.getByText("Brake Inspection")).toBeInTheDocument();

  expect(screen.getByText("Cost: $29.99")).toBeInTheDocument();
  expect(screen.getByText("Cost: $19.99")).toBeInTheDocument();
  // null cost -> N/A
  expect(screen.getByText("Cost: N/A")).toBeInTheDocument();
});

test("shows empty-zone messages when there are no services", async () => {
  installFetchMock({ services: [] });

  render(<ServicesManagement />);

  expect(
    await screen.findByText(/Drag services here to activate them/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Drag services here to deactivate them/i)
  ).toBeInTheDocument();
});

test("logs error when fetching services fails", async () => {
  installFetchMock({ servicesOk: false });

  render(<ServicesManagement />);

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch services:",
      expect.any(Error)
    );
  });
});

test("opens and closes the Add Service modal", async () => {
  const user = userEvent.setup();
  render(<ServicesManagement />);

  expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /add service/i }));
  expect(await screen.findByTestId("add-modal")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close add/i }));
  await waitFor(() => {
    expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();
  });
});

test("opens and closes the Update Service modal", async () => {
  const user = userEvent.setup();
  render(<ServicesManagement />);

  await user.click(screen.getByRole("button", { name: /update service/i }));
  expect(await screen.findByTestId("update-modal")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close update/i }));
  await waitFor(() => {
    expect(screen.queryByTestId("update-modal")).not.toBeInTheDocument();
  });
});

test("opens and closes the Delete Service modal", async () => {
  const user = userEvent.setup();
  render(<ServicesManagement />);

  await user.click(screen.getByRole("button", { name: /delete service/i }));
  expect(await screen.findByTestId("delete-modal")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close delete/i }));
  await waitFor(() => {
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });
});

test("supports user object nested under 'employee' key", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ employee: { is_admin: true, role: "admin" } })
  );

  render(<ServicesManagement />);

  expect(await screen.findByText(/Services Management/i)).toBeInTheDocument();
  expect(screen.queryByTestId("auth-error")).not.toBeInTheDocument();
});
