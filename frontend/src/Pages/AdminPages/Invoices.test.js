import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Invoices from "./Invoices";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-admin-sidebar">Sidebar</div>
));

const INVOICES_KEY = "royal_admin_invoices_v1";

describe("Admin Invoices (RW-184)", () => {
  beforeEach(() => {
    localStorage.removeItem(INVOICES_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(INVOICES_KEY);
  });

  test("renders title, sidebar, and Add an invoice button", () => {
    render(<Invoices />);

    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /invoices/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add an invoice/i })).toBeInTheDocument();
  });

  test("renders default invoice rows", () => {
    render(<Invoices />);

    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-0142")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-0141")).toBeInTheDocument();
  });

  test("Add an invoice opens modal and creates a row after submit", async () => {
    const user = userEvent.setup();
    render(<Invoices />);

    await user.click(screen.getByRole("button", { name: /add an invoice/i }));

    expect(screen.getByRole("dialog", { name: /new invoice/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/customer name/i), "New Customer Inc");
    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    expect(screen.queryByRole("dialog", { name: /new invoice/i })).not.toBeInTheDocument();
    expect(screen.getByText("New Customer Inc")).toBeInTheDocument();
  });

  test("Update opens modal and saves field changes", async () => {
    const user = userEvent.setup();
    render(<Invoices />);

    const jordanRow = screen.getByText("Jordan Lee").closest("tr");
    await user.click(within(jordanRow).getByRole("button", { name: /^update$/i }));

    expect(screen.getByRole("dialog", { name: /update invoice/i })).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/^amount$/i);
    await user.clear(amountInput);
    await user.type(amountInput, "500.00");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  test("Delete shows confirmation and removes row when confirmed", async () => {
    const user = userEvent.setup();
    render(<Invoices />);

    const mariaRow = screen.getByText("Maria Santos").closest("tr");
    await user.click(within(mariaRow).getByRole("button", { name: /^delete$/i }));

    expect(screen.getByRole("dialog", { name: /delete invoice/i })).toBeInTheDocument();
    expect(screen.getByText(/do you want to delete this\?/i)).toBeInTheDocument();
    expect(screen.getByText(/INV-2026-0141/)).toBeInTheDocument();

    const dialog = screen.getByRole("dialog", { name: /delete invoice/i });
    await user.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
  });

  test("Delete confirmation can be cancelled", async () => {
    const user = userEvent.setup();
    render(<Invoices />);

    const jordanRow = screen.getByText("Jordan Lee").closest("tr");
    await user.click(within(jordanRow).getByRole("button", { name: /^delete$/i }));

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByText(/do you want to delete this\?/i)).not.toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
  });
});
