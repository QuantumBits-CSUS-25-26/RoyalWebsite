import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Pages/Login";

describe("Login", () => {
  let originalLocation;

  const setupLocationMock = () => {
    originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };
  };

  const restoreLocationMock = () => {
    window.location = originalLocation;
  };

  beforeEach(() => {
    setupLocationMock();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "authToken",
            redirect: "/dashboard",
            user: { id: 1, name: "Test User" },
          }),
      })
    );

    sessionStorage.clear();
    localStorage.clear();

    Object.defineProperty(document, "cookie", {
      writable: true,
      configurable: true,
      value: "",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    restoreLocationMock();
  });

test("renders login form", () => {
  render(<Login />);

  expect(screen.getByText(/royal auto/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 3, name: /^login$/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toBeInTheDocument();
});

  test("shows validation error when email is empty", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/email is required/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows validation error when password is empty", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/password is required/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows validation error for invalid email", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/enter a valid email/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows validation error for short password", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8 characters/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("submits form and stores token in sessionStorage by default", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem("authToken")).toBe("authToken");
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(window.location.href).toBe("/dashboard");
    });
  });

  test("trims whitespace from email before submitting", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "   test@example.com   " },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/login/",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        })
      );
    });
  });

  test("stores token in localStorage when remember me is checked", async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBe("authToken");
      expect(sessionStorage.getItem("authToken")).toBeNull();
    });
  });

  test("checkbox can be toggled", () => {
    render(<Login />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("clears previous auth storage before saving new login", async () => {
    sessionStorage.setItem("authToken", "old-session-token");
    localStorage.setItem("authToken", "old-local-token");
    sessionStorage.setItem("user", JSON.stringify({ old: true }));
    localStorage.setItem("user", JSON.stringify({ old: true }));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem("authToken")).toBe("authToken");
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(sessionStorage.getItem("user")).toBe(JSON.stringify({ id: 1, name: "Test User" }));
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  test("redirects to custom URL if backend provides redirect", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "authToken",
            redirect: "/custom",
          }),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/custom");
    });
  });

  test("redirects to /customer-dashboard on mount if session authToken already exists", () => {
    sessionStorage.setItem("authToken", "existing-token");

    render(<Login />);

    expect(window.location.href).toBe("/customer-dashboard");
  });

  test("redirects to /customer-dashboard on mount if local authToken already exists", () => {
    localStorage.setItem("authToken", "existing-token");

    render(<Login />);

    expect(window.location.href).toBe("/customer-dashboard");
  });

  test("shows backend error for 401 response", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            detail: "Invalid email or password.",
          }),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid email or password/i);
  });

  test("shows backend error for 400 response", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: "Bad request.",
          }),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/bad request/i);
  });

  test("shows generic server error for non-400/401 failures", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/server error/i);
  });

  test("shows network error when fetch rejects", async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error("Network failure")));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /network error\. check connection and try again/i
    );
  });

  test("clears error message when user types in email field", async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("clears error message when user types in password field", async () => {
    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("disables submit button while submitting", async () => {
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  token: "authToken",
                  redirect: "/dashboard",
                }),
            });
          }, 50);
        })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  test("sends CSRF token header when csrftoken cookie exists", async () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      configurable: true,
      value: "csrftoken=abc123",
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/login/",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRFToken": "abc123",
          }),
        })
      );
    });
  });

  test("does not send CSRF token header when cookie is absent", async () => {
    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/login/",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
      );
    });
  });

  test("handles long input values", async () => {
    const longEmail = `${"a".repeat(100)}@example.com`;
    const longPassword = "p".repeat(100);

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: longEmail },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: longPassword },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem("authToken")).toBe("authToken");
    });
  });

  test("does not store token when backend returns success without token", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            redirect: "/custom-no-token",
          }),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(window.location.href).toBe("/custom-no-token");
    });
  });
});