import React from "react";
import { render, screen, within, waitFor, fireEvent } from "@testing-library/react";
import Messages from "../Pages/AdminPages/Messages";

jest.mock("../Components/AdminSideBar", () => () => (
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

describe("RW-218 adminMessages.test.js", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    global.fetch = mockDefaultListFetch();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders unread and read columns after messages load", async () => {
    render(<Messages />);
    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Jordan Lee")).toBeInTheDocument());
    expect(screen.getByRole("region", { name: "Unread" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Read" })).toBeInTheDocument();
  });

  test("mark read moves message to read list", async () => {
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

    const unread = screen.getByRole("region", { name: "Unread" });
    const markRead = within(unread).getByRole("button", {
      name: /mark message from jordan lee as read/i,
    });
    fireEvent.click(markRead);

    await waitFor(() => {
      const read = screen.getByRole("region", { name: "Read" });
      expect(within(read).getByText("Jordan Lee")).toBeInTheDocument();
    });

    const patchCall = global.fetch.mock.calls.find(
      ([, opts]) => opts && opts.method === "PATCH"
    );
    expect(patchCall).toBeTruthy();
  });
});
