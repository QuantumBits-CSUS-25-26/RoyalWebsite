import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Messages from "./Messages";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-admin-sidebar">Sidebar</div>
));

const MESSAGES_KEY = "royal_admin_messages_v1";

describe("Admin Messages (RW-193)", () => {
  beforeEach(() => {
    localStorage.removeItem(MESSAGES_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(MESSAGES_KEY);
  });

  test("renders page title, sidebar, and Unread / Read columns", () => {
    render(<Messages />);

    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Unread$/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Read$/i })).toBeInTheDocument();
  });

  test("default seed shows unread senders in Unread column and read senders in Read column", () => {
    render(<Messages />);

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    const read = screen.getByRole("region", { name: /^Read$/i });

    expect(within(unread).getByText("Jordan Lee")).toBeInTheDocument();
    expect(within(unread).getByText("Maria Santos")).toBeInTheDocument();
    expect(within(read).getByText("Alex Kim")).toBeInTheDocument();
    expect(within(read).getByText("Pat Rivera")).toBeInTheDocument();
  });

  test("Mark read moves a message from Unread to Read", async () => {
    const user = userEvent.setup();
    render(<Messages />);

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    expect(within(unread).getByText("Jordan Lee")).toBeInTheDocument();

    const markReadButtons = within(unread).getAllByRole("button", { name: /mark read/i });
    await user.click(markReadButtons[0]);

    const read = screen.getByRole("region", { name: /^Read$/i });
    expect(within(read).getByText("Jordan Lee")).toBeInTheDocument();
    expect(within(read).getByRole("button", { name: /mark unread/i })).toBeInTheDocument();
  });

  test("Mark unread moves a message back to Unread", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      MESSAGES_KEY,
      JSON.stringify([
        {
          id: "x1",
          from: "Test User",
          subject: "Hello",
          body: "Body text",
          createdAt: new Date().toISOString(),
          read: true,
        },
      ])
    );

    render(<Messages />);

    const read = screen.getByRole("region", { name: /^Read$/i });
    await user.click(within(read).getByRole("button", { name: /mark unread/i }));

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    expect(within(unread).getByText("Test User")).toBeInTheDocument();
  });

  test("column headers show correct mark button counts for default seed", () => {
    render(<Messages />);

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    const read = screen.getByRole("region", { name: /^Read$/i });

    expect(within(unread).getAllByRole("button", { name: /mark read/i })).toHaveLength(2);
    expect(within(read).getAllByRole("button", { name: /mark unread/i })).toHaveLength(2);
  });
});
