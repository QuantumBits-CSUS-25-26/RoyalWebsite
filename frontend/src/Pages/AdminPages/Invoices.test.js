import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
      status: "pending",
      created_at: "2026-03-21T00:00:00Z",
    },
    {
      invoice_id: 2,
      customer: "Jane Smith",
      vehicle: "Honda Civic",
      date: "2026-03-22T00:00:00Z",
      services: "Brake Inspection",
      status: "paid",
      created_at: "2026-03-22T00:00:00Z",
    },
  ],
};

describe("Invoices page", () => {
  beforeEach(() => {
    sessionStorage.setItem("authToken", "fake-token");

    global.fetch = jest.fn((url) => {
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
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    await screen.findByText((text) => text.includes("Toyota Camry"));
    await screen.findByText((text) => text.includes("Honda Civic"));
    await screen.findByText((text) => text.includes("Oil Change"));
    await screen.findByText((text) => text.includes("Brake Inspection"));


    expect(screen.getByText((text) => text.includes("Toyota Camry"))).toBeInTheDocument();    
    expect(screen.getByText((text) => text.includes("Honda Civic"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Oil Change"))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("Brake Inspection"))).toBeInTheDocument();
  });
});