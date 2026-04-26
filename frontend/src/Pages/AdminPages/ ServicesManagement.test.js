import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ServicesManagement from "./ServicesManagement";

jest.mock("../../config", () => ({
  API_BASE_URL: "http://test-api.com",
}));

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="admin-sidebar">Admin Sidebar</div>
));

jest.mock("../../Components/ServicesManagementAdd", () => (props) =>
  props.isOpen ? <div data-testid="add-form">Add Form</div> : null
);

jest.mock("../../Components/ServicesManagementUpdate", () => (props) =>
  props.isOpen ? <div data-testid="update-form">Update Form</div> : null
);

jest.mock("../../Components/ServicesManagementDelete", () => (props) =>
  props.isOpen ? <div data-testid="delete-form">Delete Form</div> : null
);

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

// Lightweight dnd mock so the list renders in tests
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children, droppableId }) =>
    children(
      {
        innerRef: jest.fn(),
        droppableProps: { "data-droppable-id": droppableId },
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({ children, draggableId, index }) =>
    children(
      {
        innerRef: jest.fn(),
        draggableProps: {
          "data-draggable-id": draggableId,
          "data-index": index,
        },
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

describe("ServicesManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem(
      "user",
      JSON.stringify({
        is_admin: true,
      })
    );

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        {
          service_id: 1,
          name: "Service A",
          description: "Desc A",
          cost: "50.00",
          is_active: true,
          display_order: 0,
        },
        {
          service_id: 2,
          name: "Service B",
          description: "Desc B",
          cost: "75.00",
          is_active: false,
          display_order: 1,
        },
      ]),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test("renders services correctly", async () => {
    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
    expect(screen.getByText("Active Services")).toBeInTheDocument();
    expect(screen.getByText("Inactive Services")).toBeInTheDocument();

    expect(await screen.findByText("Service A")).toBeInTheDocument();
    expect(await screen.findByText("Service B")).toBeInTheDocument();

    expect(screen.getByText("Cost: $50.00")).toBeInTheDocument();
    expect(screen.getByText("Cost: $75.00")).toBeInTheDocument();

    expect(screen.getByText("Description: Desc A")).toBeInTheDocument();
    expect(screen.getByText("Description: Desc B")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/services/?all=true"
    );
  });

  test("opens delete form when clicked", async () => {
    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete service/i }));

    expect(await screen.findByTestId("delete-form")).toBeInTheDocument();
  });

  test("opens add form when clicked", async () => {
    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add service/i }));

    expect(await screen.findByTestId("add-form")).toBeInTheDocument();
  });

  test("opens update form when clicked", async () => {
    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update service/i }));

    expect(await screen.findByTestId("update-form")).toBeInTheDocument();
  });

  test("renders auth error page when user is not authorized", () => {
    localStorage.clear();
    sessionStorage.clear();

    render(<ServicesManagement />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    expect(screen.queryByText("Services Management")).not.toBeInTheDocument();
  });

  test("accepts nested employee admin user", async () => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        employee: {
          role: "admin",
        },
      })
    );

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
  });
});