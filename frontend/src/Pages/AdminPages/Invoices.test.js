import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Invoices from "./Invoices";

jest.mock("../../Components/AdminSideBar", () => () => <div>Admin Sidebar</div>);

const mockInvoicesResponse = {
  count: 2,
  page: 1,
  page_size: 4,
  results: [
    {
      invoice_id: 1,
      customer: "John Doe",
      vehicle: "Toyota Camry",
      date: "2026-03-21T00:00:00Z",
      services: "Oil Change",
      cost: "89.99",
      status: "pending",
      created_at: "2026-03-21T00:00:00Z",
    },
    {
      invoice_id: 2,
      customer: "Jane Smith",
      vehicle: "Honda Civic",
      date: "2026-03-22T00:00:00Z",
      services: "Brake Inspection",
      cost: "120.00",
      status: "paid",
      created_at: "2026-03-22T00:00:00Z",
    },
  ],
};

describe("Invoices page", () => {
  beforeEach(() => {
    sessionStorage.setItem("authToken", "fake-token");
    window.alert = jest.fn();

    global.fetch = jest.fn((url, options) => {
      if (options?.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      if (url.includes("status=pending")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              page: 1,
              page_size: 4,
              results: [mockInvoicesResponse.results[0]],
            }),
        });
      }

      if (url.includes("status=paid")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              page: 1,
              page_size: 4,
              results: [mockInvoicesResponse.results[1]],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInvoicesResponse),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  test("renders invoices page headings and search inputs", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Sidebar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Invoices")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/search pending invoices/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search paid invoices/i)).toBeInTheDocument();
  });

  test("renders pending and paid invoice data from API", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    await screen.findByText((text) => text.includes("Toyota Camry"));
    await screen.findByText((text) => text.includes("Honda Civic"));
    await screen.findByText((text) => text.includes("Oil Change"));
    await screen.findByText((text) => text.includes("Brake Inspection"));
    await screen.findByText((text) => text.includes("89.99"));
    await screen.findByText((text) => text.includes("120.00"));

    expect(screen.getByText((text) => text.includes("Toyota Camry"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Honda Civic"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Oil Change"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Brake Inspection"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("89.99"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("120.00"))).toBeInTheDocument();
  });

  test("renders invoice costs from API", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText((text) => text.includes("89.99"))).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText((text) => text.includes("120.00"))).toBeInTheDocument();
    });
  });

  test("renders correct status action buttons", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    expect(await screen.findByRole("button", { name: /mark as paid/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /mark as pending/i })).toBeInTheDocument();
  });

  test("clicking status button sends PUT request with updated status", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    await screen.findByText("John Doe");
    const button = await screen.findByRole("button", { name: /mark as paid/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/invoices/1/"),
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "paid" }),
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Invoice status updated.");
  });

  test("clicking status button refetches pending and paid invoices", async () => {
    render(
      <MemoryRouter>
        <Invoices />
      </MemoryRouter>
    );

    await screen.findByText("John Doe");
    const button = await screen.findByRole("button", { name: /mark as paid/i });
    fireEvent.click(button);

    await waitFor(() => {
      const calledUrls = global.fetch.mock.calls.map((call) => call[0]);
      expect(calledUrls.some((url) => url.includes("/api/invoices/1/"))).toBe(true);
    });

    await waitFor(() => {
      const calledUrls = global.fetch.mock.calls.map((call) => call[0]);
      expect(calledUrls.some((url) => url.includes("status=pending"))).toBe(true);
    });

    await waitFor(() => {
      const calledUrls = global.fetch.mock.calls.map((call) => call[0]);
      expect(calledUrls.some((url) => url.includes("status=paid"))).toBe(true);
    });
  });
});