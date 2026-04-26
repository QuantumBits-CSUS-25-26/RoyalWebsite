import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServicesManagement from "./ServicesManagement";

jest.mock("../../config", () => ({
  API_BASE_URL: "http://test-api.com",
}));

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="admin-sidebar">Admin Sidebar</div>
));

jest.mock("../../Components/ServicesManagementAdd", () => (props) =>
  props.isOpen ? (
    <div data-testid="add-form">
      Add Form
      <button onClick={props.onClose}>Close Add</button>
      <button onClick={props.onServiceAdded}>Trigger Add Refresh</button>
      <div data-testid="add-services-count">{props.services.length}</div>
    </div>
  ) : null
);

jest.mock("../../Components/ServicesManagementUpdate", () => (props) =>
  props.isOpen ? (
    <div data-testid="update-form">
      Update Form
      <button onClick={props.onClose}>Close Update</button>
      <button onClick={props.onServiceUpdated}>Trigger Update Refresh</button>
      <div data-testid="update-services-count">{props.services.length}</div>
    </div>
  ) : null
);

jest.mock("../../Components/ServicesManagementDelete", () => (props) =>
  props.isOpen ? (
    <div data-testid="delete-form">
      Delete Form
      <button onClick={props.onClose}>Close Delete</button>
      <button onClick={props.onServiceDeleted}>Trigger Delete Refresh</button>
      <div data-testid="delete-services-count">{props.services.length}</div>
    </div>
  ) : null
);

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div data-testid="auth-error">403 - Forbidden</div>
));

let capturedOnDragEnd;

jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children, onDragEnd }) => {
    capturedOnDragEnd = onDragEnd;
    return <div data-testid="drag-context">{children}</div>;
  },
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
        dragHandleProps: { "data-testid": `drag-handle-${draggableId}` },
      },
      { isDragging: false }
    ),
}));

describe("ServicesManagement", () => {
  const defaultServices = [
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
  ];

  const setAuthorizedAdmin = (user = { is_admin: true }) => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  const mockFetchServices = ({
    ok = true,
    data = defaultServices,
    reject = false,
  } = {}) => {
    if (reject) {
      global.fetch = jest.fn().mockRejectedValue(new Error("fetch failed"));
      return;
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok,
      json: jest.fn().mockResolvedValue(data),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    setAuthorizedAdmin();
    mockFetchServices();
    capturedOnDragEnd = undefined;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
    localStorage.clear();
    sessionStorage.clear();
  });

    test("renders services correctly", async () => {
        render(<ServicesManagement />);

        expect(await screen.findByText("Services Management")).toBeInTheDocument();
        expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
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

    test("renders empty-state text for inactive services when none exist", async () => {
    mockFetchServices({
      data: [
        {
          service_id: 1,
          name: "Only Active",
          description: "Desc",
          cost: "20.00",
          is_active: true,
          display_order: 0,
        },
      ],
    });

    render(<ServicesManagement />);

    expect(await screen.findByText("Only Active")).toBeInTheDocument();
    expect(
      screen.getByText(/Drag services here to deactivate them/i)
    ).toBeInTheDocument();
  });

  test("renders empty-state text for active services when none exist", async () => {
    mockFetchServices({
      data: [
        {
          service_id: 2,
          name: "Only Inactive",
          description: "Desc",
          cost: "20.00",
          is_active: false,
          display_order: 0,
        },
      ],
    });

    render(<ServicesManagement />);

    expect(await screen.findByText("Only Inactive")).toBeInTheDocument();
    expect(
      screen.getByText(/Drag services here to activate them/i)
    ).toBeInTheDocument();
  });

  test("sorts active and inactive services by display_order", async () => {
    mockFetchServices({
      data: [
        {
          service_id: 10,
          name: "Active Second",
          description: "Desc",
          cost: "20.00",
          is_active: true,
          display_order: 1,
        },
        {
          service_id: 11,
          name: "Active First",
          description: "Desc",
          cost: "25.00",
          is_active: true,
          display_order: 0,
        },
        {
          service_id: 12,
          name: "Inactive Second",
          description: "Desc",
          cost: "30.00",
          is_active: false,
          display_order: 1,
        },
        {
          service_id: 13,
          name: "Inactive First",
          description: "Desc",
          cost: "35.00",
          is_active: false,
          display_order: 0,
        },
      ],
    });

    render(<ServicesManagement />);

    await screen.findByText("Active First");

    const headings = screen.getAllByRole("heading", { level: 5 });
    const headingTexts = headings.map((h) => h.textContent);

    expect(headingTexts).toEqual([
      "Active First",
      "Active Second",
      "Inactive First",
      "Inactive Second",
    ]);
  });

  test("opens and closes delete form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");

    await user.click(screen.getByRole("button", { name: /delete service/i }));
    expect(await screen.findByTestId("delete-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close delete/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("delete-form")).not.toBeInTheDocument();
    });
  });

  test("opens and closes add form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");

    await user.click(screen.getByRole("button", { name: /add service/i }));
    expect(await screen.findByTestId("add-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close add/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("add-form")).not.toBeInTheDocument();
    });
  });

  test("opens and closes update form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");

    await user.click(screen.getByRole("button", { name: /update service/i }));
    expect(await screen.findByTestId("update-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close update/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("update-form")).not.toBeInTheDocument();
    });
  });

  test("passes all services to add form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    await user.click(screen.getByRole("button", { name: /add service/i }));

    expect(await screen.findByTestId("add-services-count")).toHaveTextContent("2");
  });

  test("passes all services to update form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    await user.click(screen.getByRole("button", { name: /update service/i }));

    expect(await screen.findByTestId("update-services-count")).toHaveTextContent("2");
  });

  test("passes all services to delete form", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    await user.click(screen.getByRole("button", { name: /delete service/i }));

    expect(await screen.findByTestId("delete-services-count")).toHaveTextContent("2");
  });

  test("re-fetches services after add callback", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /add service/i }));
    await user.click(screen.getByRole("button", { name: /trigger add refresh/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test("re-fetches services after update callback", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /update service/i }));
    await user.click(screen.getByRole("button", { name: /trigger update refresh/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test("re-fetches services after delete callback", async () => {
    const user = userEvent.setup();
    render(<ServicesManagement />);

    await screen.findByText("Services Management");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /delete service/i }));
    await user.click(screen.getByRole("button", { name: /trigger delete refresh/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test("renders auth error page when user is not authorized", () => {
    localStorage.clear();
    sessionStorage.clear();

    render(<ServicesManagement />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    expect(screen.queryByText("Services Management")).not.toBeInTheDocument();
  });

  test("renders auth error page when stored user JSON is invalid", () => {
    localStorage.clear();
    localStorage.setItem("user", "{bad json");

    render(<ServicesManagement />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
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

  test("accepts role admin user", async () => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        role: "admin",
      })
    );

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
  });

  test("accepts is_superuser user", async () => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        is_superuser: true,
      })
    );

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
  });

  test("accepts roles array containing admin", async () => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        roles: ["admin"],
      })
    );

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
  });

  test("rejects non-admin role", () => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        role: "employee",
      })
    );

    render(<ServicesManagement />);

    expect(screen.getByTestId("auth-error")).toBeInTheDocument();
  });

  test("does not render services when fetch response is not ok", async () => {
    mockFetchServices({ ok: false });

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();
    expect(screen.queryByText("Service A")).not.toBeInTheDocument();
    expect(screen.queryByText("Service B")).not.toBeInTheDocument();
  });

  test("logs error when fetching services throws", async () => {
    mockFetchServices({ reject: true });

    render(<ServicesManagement />);

    expect(await screen.findByText("Services Management")).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch services:",
        expect.any(Error)
      );
    });
  });

  test("onDragEnd does nothing when there is no destination", async () => {
    render(<ServicesManagement />);

    await screen.findByText("Service A");

    capturedOnDragEnd({
        source: { droppableId: "active", index: 0 },
        destination: null,
    });

    expect(screen.getByText("Service A")).toBeInTheDocument();
    expect(screen.getByText("Service B")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("reorders services within active list and persists display order", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
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
          service_id: 3,
          name: "Service C",
          description: "Desc C",
          cost: "60.00",
          is_active: true,
          display_order: 1,
        },
        {
          service_id: 2,
          name: "Service B",
          description: "Desc B",
          cost: "75.00",
          is_active: false,
          display_order: 0,
        },
      ]),
    })
    .mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

  render(<ServicesManagement />);

  await screen.findByText("Service A");
  await screen.findByText("Service C");

  capturedOnDragEnd({
    source: { droppableId: "active", index: 0 },
    destination: { droppableId: "active", index: 1 },
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/services/3/",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: 0, is_active: true }),
      })
    );
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/services/1/",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: 1, is_active: true }),
      })
    );
  });
});

test("moves service from active to inactive and persists updates", async () => {
  render(<ServicesManagement />);

  await screen.findByText("Service A");
  await screen.findByText("Service B");

  capturedOnDragEnd({
    source: { droppableId: "active", index: 0 },
    destination: { droppableId: "inactive", index: 1 },
  });

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/services/1/",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: 1, is_active: false }),
      })
    );
  });
});

test("moves service from inactive to active and persists updates", async () => {
  render(<ServicesManagement />);

  await screen.findByText("Service A");
  await screen.findByText("Service B");

  await act(async () => {
    capturedOnDragEnd({
      source: { droppableId: "inactive", index: 0 },
      destination: { droppableId: "active", index: 1 },
    });
  });

  await waitFor(() => {
    const putCalls = global.fetch.mock.calls.filter(
      ([, options]) => options?.method === "PUT"
    );

    expect(putCalls.length).toBeGreaterThanOrEqual(2);

    expect(
      putCalls.some(
        ([url]) => url === "http://test-api.com/api/services/2/"
      )
    ).toBe(true);

    expect(
      putCalls.some(
        ([url]) => url === "http://test-api.com/api/services/1/"
      )
    ).toBe(true);
  });
});

test("logs error when persistService update fails", async () => {
  global.fetch = jest.fn((url, options) => {
    if (!options) {
      return Promise.resolve({
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
            display_order: 0,
          },
        ]),
      });
    }

    return Promise.reject(new Error("update failed"));
  });

  render(<ServicesManagement />);

  await screen.findByText("Service A");

  capturedOnDragEnd({
    source: { droppableId: "inactive", index: 0 },
    destination: { droppableId: "active", index: 1 },
  });

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "Failed to update service:",
      expect.any(Error)
    );
  });
});


});