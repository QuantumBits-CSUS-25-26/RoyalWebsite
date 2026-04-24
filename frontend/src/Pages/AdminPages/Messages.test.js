import React from "react";
import { render, screen, within, waitFor, fireEvent } from "@testing-library/react";
import Messages from "./Messages";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-admin-sidebar">Sidebar</div>
));

const SAMPLE = [
  {
    message_id: 1,
    first_name: "Jordan",
    last_name: "Lee",
    phone_number: "555-1111",
    email: "jordan@example.com",
    message: "Question about brake estimate",
    response: false,
    current_customer: false,
    read: false,
    created_at: "2026-04-20T12:00:00Z",
  },
  {
    message_id: 2,
    first_name: "Maria",
    last_name: "Santos",
    phone_number: "555-2222",
    email: "maria@example.com",
    message: "Pickup time tomorrow",
    response: true,
    current_customer: true,
    read: false,
    created_at: "2026-04-19T08:00:00Z",
  },
  {
    message_id: 3,
    first_name: "Alex",
    last_name: "Kim",
    phone_number: "555-3333",
    email: "alex@example.com",
    message: "Thanks for the oil change",
    response: false,
    current_customer: true,
    read: true,
    created_at: "2026-04-18T10:00:00Z",
  },
];

const UNREAD_ROWS = SAMPLE.filter((m) => !m.read);
const READ_ROWS = SAMPLE.filter((m) => m.read);

function paginated(messages) {
  return { results: messages, count: messages.length, has_next: false };
}

function jsonOk(body) {
  return { ok: true, status: 200, json: async () => body };
}

/** Two columns each GET `/api/admin/messages/?read=true|false` with paginated `{ results }`. */
function mockDefaultListFetch() {
  return jest.fn().mockImplementation((url) => {
    const u = String(url);
    if (u.includes("read=false")) return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
    if (u.includes("read=true")) return Promise.resolve(jsonOk(paginated(READ_ROWS)));
    return Promise.reject(new Error(`unexpected fetch ${url}`));
  });
}

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Admin Messages (RW-193)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    global.fetch = mockDefaultListFetch();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders page title, sidebar, and Unread / Read columns", async () => {
    render(<Messages />);

    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /messages/i })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("region", { name: /^Unread$/i })).toBeInTheDocument()
    );
    expect(screen.getByRole("region", { name: /^Read$/i })).toBeInTheDocument();
  });

  test("places unread senders in Unread column and read senders in Read column", async () => {
    render(<Messages />);

    await waitFor(() => screen.getByText("Jordan Lee"));

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    const read = screen.getByRole("region", { name: /^Read$/i });

    expect(within(unread).getByText("Jordan Lee")).toBeInTheDocument();
    expect(within(unread).getByText("Maria Santos")).toBeInTheDocument();
    expect(within(read).getByText("Alex Kim")).toBeInTheDocument();
  });

  test("Mark read issues a PATCH and moves the message", async () => {
    let readRows = [...READ_ROWS];
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "PATCH") {
        readRows = [{ ...SAMPLE[0], read: true }, SAMPLE[2]];
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      }
      const u = String(url);
      if (u.includes("read=false")) return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      if (u.includes("read=true")) return Promise.resolve(jsonOk(paginated(readRows)));
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);
    await waitFor(() => screen.getByText("Jordan Lee"));

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    const markJordan = within(unread).getByRole("button", {
      name: /mark message from jordan lee as read/i,
    });
    fireEvent.click(markJordan);

    await waitFor(() => {
      const read = screen.getByRole("region", { name: /^Read$/i });
      expect(within(read).getByText(/Jordan Lee|Maria Santos/)).toBeInTheDocument();
    });

    const patchCall = global.fetch.mock.calls.find(
      ([url, opts]) => opts && opts.method === "PATCH"
    );
    expect(patchCall).toBeTruthy();
    expect(patchCall[0]).toMatch(/\/api\/admin\/messages\/\d+\//);
  });

  test("Delete button opens confirm modal and DELETE only fires on confirm", async () => {
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "DELETE") {
        return Promise.resolve({ ok: true, status: 204, json: async () => ({}) });
      }
      const u = String(url);
      if (u.includes("read=false")) return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      if (u.includes("read=true")) return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);
    await waitFor(() => screen.getByText("Jordan Lee"));

    const deleteButtons = screen.getAllByRole("button", { name: /delete message from/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();

    // Cancel should NOT issue a DELETE
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(
      global.fetch.mock.calls.some(([, opts]) => opts && opts.method === "DELETE")
    ).toBe(false);

    // Reopen and confirm
    fireEvent.click(screen.getAllByRole("button", { name: /delete message from/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(
        global.fetch.mock.calls.some(([, opts]) => opts && opts.method === "DELETE")
      ).toBe(true);
    });
  });

  test("sort dropdown switches order and persists selection", async () => {
    render(<Messages />);
    await waitFor(() => screen.getByText("Jordan Lee"));

    const select = screen.getByLabelText(/sort by/i);
    fireEvent.change(select, { target: { value: "name_asc" } });

    expect(sessionStorage.getItem("admin_messages_sort")).toBe("name_asc");
  });
});
