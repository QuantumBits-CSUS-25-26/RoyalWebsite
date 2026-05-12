import React from "react";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Messages from "./Messages";

jest.mock("../../Components/AdminSideBar", () => () => (
  <div data-testid="mock-admin-sidebar">Sidebar</div>
));

let clipboardWriteTextMock;
let clipboardMock;

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

function paginated(messages, extra = {}) {
  return {
    results: messages,
    count: messages.length,
    has_next: false,
    ...extra,
  };
}

function jsonOk(body) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  };
}

function jsonError(status, body = { detail: "Request failed" }) {
  return {
    ok: false,
    status,
    json: async () => body,
  };
}

function mockDefaultListFetch() {
  return jest.fn().mockImplementation((url) => {
    const u = String(url);
    if (u.includes("read=false")) {
      return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
    }
    if (u.includes("read=true")) {
      return Promise.resolve(jsonOk(paginated(READ_ROWS)));
    }
    return Promise.reject(new Error(`unexpected fetch ${url}`));
  });
}

let observers = [];

beforeAll(() => {
  global.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });
});

beforeEach(() => {
  observers = [];
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("authToken", "test-token");
  global.fetch = mockDefaultListFetch();

  clipboardWriteTextMock = jest.fn().mockResolvedValue(undefined);
  clipboardMock = {
    writeText: clipboardWriteTextMock,
  };

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    get: () => clipboardMock,
  });

  jest.spyOn(window.sessionStorage.__proto__, "setItem");

  Object.defineProperty(document, "execCommand", {
    configurable: true,
    writable: true,
    value: jest.fn(() => true),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("Admin Messages", () => {
  test("renders page title, sidebar, and Unread / Read columns", async () => {
    render(<Messages />);

    expect(screen.getByTestId("mock-admin-sidebar")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /messages/i })
    ).toBeInTheDocument();

    await screen.findByText("Jordan Lee");

    expect(
      screen.getByRole("region", { name: /^Unread$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /^Read$/i })
    ).toBeInTheDocument();
  });

  test("places unread senders in Unread column and read senders in Read column", async () => {
    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    const read = screen.getByRole("region", { name: /^Read$/i });

    expect(within(unread).getByText("Jordan Lee")).toBeInTheDocument();
    expect(within(unread).getByText("Maria Santos")).toBeInTheDocument();
    expect(within(read).getByText("Alex Kim")).toBeInTheDocument();
  });

  test("renders preview, contact info, and flags", async () => {
    render(<Messages />);

    await screen.findByText("Maria Santos");

    const unread = screen.getByRole("region", { name: /^Unread$/i });

    expect(
      within(unread).getByText("Pickup time tomorrow")
    ).toBeInTheDocument();
    expect(within(unread).getByText(/maria@example.com/i)).toBeInTheDocument();
    expect(within(unread).getByText(/555-2222/i)).toBeInTheDocument();
    expect(within(unread).getByText(/Wants callback/i)).toBeInTheDocument();
    expect(within(unread).getByText(/Current customer/i)).toBeInTheDocument();
  });

  test("renders fallback name and blank formatted date safely", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated([])));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(
          jsonOk(
            paginated([
              {
                message_id: 99,
                first_name: "",
                last_name: "",
                email: "noname@example.com",
                phone_number: "",
                message: "No name here",
                response: false,
                current_customer: false,
                read: true,
                created_at: null,
              },
            ])
          )
        );
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("noname@example.com");

    const read = screen.getByRole("region", { name: /^Read$/i });
    expect(within(read).getByText("(No name)")).toBeInTheDocument();
    expect(within(read).getByText("noname@example.com")).toBeInTheDocument();
  });

  test("shows empty state when no unread messages exist", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated([])));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Alex Kim");

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    expect(
      within(unread).getByText("No unread messages.")
    ).toBeInTheDocument();
  });

  test("shows empty search state when nothing matches", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);
      if (u.includes("search=zzz")) {
        return Promise.resolve(jsonOk(paginated([])));
      }
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    await user.type(screen.getByLabelText(/search messages/i), "zzz");

    await waitFor(() => {
      expect(
        screen.getByText(/No unread messages match your search\./i)
      ).toBeInTheDocument();
    });
  });

  test("sort dropdown switches order and persists selection", async () => {
    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const select = screen.getByLabelText(/sort by/i);
    fireEvent.change(select, { target: { value: "name_asc" } });

    expect(sessionStorage.getItem("admin_messages_sort")).toBe("name_asc");
  });

  test("loads persisted sort from sessionStorage", async () => {
    sessionStorage.setItem("admin_messages_sort", "email_asc");

    render(<Messages />);

    const select = screen.getByLabelText(/sort by/i);
    expect(select).toHaveValue("email_asc");
  });

  test("clear search button clears the search field", async () => {
    const user = userEvent.setup();

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const searchInput = screen.getByLabelText(/search messages/i);
    await user.type(searchInput, "jord");

    expect(searchInput).toHaveValue("jord");
    expect(
      screen.getByRole("button", { name: /clear search/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(searchInput).toHaveValue("");
  });

  test("copy email falls back to execCommand when clipboard is unavailable", async () => {
    const user = userEvent.setup();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      get: () => undefined,
    });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });

    await user.click(
      within(unread).getByRole("button", {
        name: /copy email for jordan lee/i,
      })
    );

    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  test("toggle read issues PATCH for unread message", async () => {
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "PATCH") {
        return Promise.resolve(jsonOk({ success: true }));
      }
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });

    fireEvent.click(
      within(unread).getByRole("button", {
        name: /mark message from jordan lee as read/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/admin\/messages\/1\//),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ read: true }),
        })
      );
    });
  });

  test("toggle unread issues PATCH for read message", async () => {
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "PATCH") {
        return Promise.resolve(jsonOk({ success: true }));
      }
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Alex Kim");

    const read = screen.getByRole("region", { name: /^Read$/i });

    fireEvent.click(
      within(read).getByRole("button", {
        name: /mark message from alex kim as unread/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/admin\/messages\/3\//),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ read: false }),
        })
      );
    });
  });

  test("Delete button opens confirm modal and DELETE only fires on confirm", async () => {
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "DELETE") {
        return Promise.resolve({ ok: true, status: 204 });
      }
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    fireEvent.click(
      within(unread).getByRole("button", {
        name: /delete message from jordan lee/i,
      })
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      global.fetch.mock.calls.some(
        ([, opts]) => opts && opts.method === "DELETE"
      )
    ).toBe(false);

    fireEvent.click(
      within(unread).getByRole("button", {
        name: /delete message from jordan lee/i,
      })
    );
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(
        global.fetch.mock.calls.some(
          ([, opts]) => opts && opts.method === "DELETE"
        )
      ).toBe(true);
    });
  });

  test("clicking overlay closes delete modal when not deleting", async () => {
    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    fireEvent.click(
      within(unread).getByRole("button", {
        name: /delete message from jordan lee/i,
      })
    );

    const overlay = screen.getByRole("dialog").parentElement;
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("shows delete error when delete request fails", async () => {
    global.fetch = jest.fn().mockImplementation((url, opts = {}) => {
      if (opts.method === "DELETE") {
        return Promise.resolve(jsonError(403));
      }
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonOk(paginated(UNREAD_ROWS)));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const unread = screen.getByRole("region", { name: /^Unread$/i });
    fireEvent.click(
      within(unread).getByRole("button", {
        name: /delete message from jordan lee/i,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(
      await screen.findByText(/You are not signed in as staff/i)
    ).toBeInTheDocument();
  });

  test("shows inline error when unread fetch fails", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonError(403));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    expect(
      await screen.findByText(/You are not signed in as staff/i)
    ).toBeInTheDocument();
  });

  test("shows generic inline error for non-auth failure", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);
      if (u.includes("read=false")) {
        return Promise.resolve(jsonError(500));
      }
      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated(READ_ROWS)));
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    expect(
      await screen.findByText(/Request failed \(500\)/i)
    ).toBeInTheDocument();
  });

  test("loads more messages when sentinel intersects", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);

      if (u.includes("read=false") && u.includes("page=1")) {
        return Promise.resolve(
          jsonOk(
            paginated(
              [
                {
                  message_id: 10,
                  first_name: "Page",
                  last_name: "One",
                  email: "page1@example.com",
                  phone_number: "",
                  message: "First page",
                  response: false,
                  current_customer: false,
                  read: false,
                  created_at: "2026-04-20T10:00:00Z",
                },
              ],
              { count: 2, has_next: true }
            )
          )
        );
      }

      if (u.includes("read=false") && u.includes("page=2")) {
        return Promise.resolve(
          jsonOk(
            paginated(
              [
                {
                  message_id: 11,
                  first_name: "Page",
                  last_name: "Two",
                  email: "page2@example.com",
                  phone_number: "",
                  message: "Second page",
                  response: false,
                  current_customer: false,
                  read: false,
                  created_at: "2026-04-19T10:00:00Z",
                },
              ],
              { count: 2, has_next: false }
            )
          )
        );
      }

      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated([])));
      }

      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    const unread = await screen.findByRole("region", { name: /^Unread$/i });
    await within(unread).findByText("Page One");

    await act(async () => {
      observers.forEach((observer) => {
        observer.callback([{ isIntersecting: true }]);
      });
    });

    expect(await within(unread).findByText("Page Two")).toBeInTheDocument();
  });

  test("does not load more when has_next is false", async () => {
    render(<Messages />);

    await screen.findByText("Jordan Lee");
    const before = global.fetch.mock.calls.length;

    await act(async () => {
      observers.forEach((observer) => {
        observer.callback([{ isIntersecting: true }]);
      });
    });

    expect(global.fetch.mock.calls.length).toBe(before);
  });

  test("shows loading more indicator during pagination fetch", async () => {
    let resolvePageTwo;

    global.fetch = jest.fn().mockImplementation((url) => {
      const u = String(url);

      if (u.includes("read=false") && u.includes("page=1")) {
        return Promise.resolve(
          jsonOk(
            paginated(
              [
                {
                  message_id: 10,
                  first_name: "Page",
                  last_name: "One",
                  email: "page1@example.com",
                  phone_number: "",
                  message: "First page",
                  response: false,
                  current_customer: false,
                  read: false,
                  created_at: "2026-04-20T10:00:00Z",
                },
              ],
              { count: 2, has_next: true }
            )
          )
        );
      }

      if (u.includes("read=false") && u.includes("page=2")) {
        return new Promise((resolve) => {
          resolvePageTwo = () =>
            resolve(
              jsonOk(
                paginated(
                  [
                    {
                      message_id: 11,
                      first_name: "Page",
                      last_name: "Two",
                      email: "page2@example.com",
                      phone_number: "",
                      message: "Second page",
                      response: false,
                      current_customer: false,
                      read: false,
                      created_at: "2026-04-19T10:00:00Z",
                    },
                  ],
                  { count: 2, has_next: false }
                )
              )
            );
        });
      }

      if (u.includes("read=true")) {
        return Promise.resolve(jsonOk(paginated([])));
      }

      return Promise.reject(new Error(`unexpected fetch ${url}`));
    });

    render(<Messages />);

    const unread = await screen.findByRole("region", { name: /^Unread$/i });
    await within(unread).findByText("Page One");

    await act(async () => {
      observers.forEach((observer) => {
        observer.callback([{ isIntersecting: true }]);
      });
    });

    expect(
      within(unread).getByText(/Loading more\.\.\./i)
    ).toBeInTheDocument();

    await act(async () => {
      resolvePageTwo();
    });

    expect(await within(unread).findByText("Page Two")).toBeInTheDocument();
  });

  test("search input debounces requests", async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<Messages />);

    await screen.findByText("Jordan Lee");

    const initialCalls = global.fetch.mock.calls.length;
    await user.type(screen.getByLabelText(/search messages/i), "jord");

    expect(global.fetch.mock.calls.length).toBe(initialCalls);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });
});