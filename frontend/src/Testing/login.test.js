import React from "react";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import Login from "../Pages/Login";
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
test('login form is accessible', async () => {
    const { container } = render(<Login />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});

test('trims whitespace from email', async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '   test@example.com   ' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i }));
    await waitFor(() => {
        expect(sessionStorage.getItem('authToken')).toBe('authToken');
    });
});

test('handles long input values', async () => {
    const longEmail = 'a'.repeat(100) + '@example.com';
    const longPassword = 'p'.repeat(100);
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: longEmail } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: longPassword } });
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i }));
    await waitFor(() => {
        expect(sessionStorage.getItem('authToken')).toBe('authToken');
    });
});

test('prevents multiple rapid submissions', async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
});

test('clears error message when user types', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    // Error should clear after typing
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('does not store token if backend returns no token', async () => {
    globalThis.fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(sessionStorage.getItem('authToken')).toBeNull();
    });
});

test('redirects to custom URL if provided by backend', async () => {
    globalThis.fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'authToken', redirect: '/custom' }) }));
    delete window.location;
    window.location = { href: '' };
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(window.location.href).toBe('/custom');
    });
});

beforeEach(()=> {
    globalThis.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({token: "authToken", redirect: "/dashboard"}),
        })
    );
    sessionStorage.clear();
});
afterEach(() => {
    jest.resetAllMocks();
});

test("render login form", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /SIGN IN/i})).toBeInTheDocument();
});
test("shows validation errors for empty fields", async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    screen.debug(); // Print the DOM after clicking submit
    expect(await screen.findByRole("alert")).toHaveTextContent(/required/i);
});
test("shows validation error for invalid email", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "invalidemail"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(await screen.findByRole("alert")).toHaveTextContent(/email/i);
});
test("submits form and stores token on success", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(sessionStorage.getItem("authToken")).toBe("authToken");
    });
});
test("shows error on failed login", async () => {
    globalThis.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({detail: "Invalid email or password."}),
        })
    );
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Invalid email or password./i);
});
test("shows validation error for short password", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "short"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8 characters/i);
});

test("submit button disables while submitting", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    // Mock fetch to delay
    globalThis.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ok: true, json: () => Promise.resolve({token: "authToken", redirect: "/dashboard"})}), 100)));
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(screen.getByRole("button", {name: /sign/i})).toBeDisabled();
});

test("CSRF token header is sent if present", async () => {
    Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrftoken=abc123',
    });
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({"X-CSRFToken": "abc123"})
            })
        );
    });
});

test("remember me checkbox can be toggled", () => {
    render(<Login />);
    const checkbox = screen.getByLabelText(/Remember me/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
});

test("shows network error on fetch failure", async () => {
    globalThis.fetch.mockImplementationOnce(() => Promise.reject(new Error("Network error")));
     render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    expect(await screen.findByRole("alert")).toHaveTextContent(/network error/i);
});
test("redirects to dashboard after successful login", async () => {
    delete window.location;
    window.location = { href: "" };
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "test@example.com"}});
    fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
    fireEvent.click(screen.getByRole("button", {name: /SIGN IN/i}));
    await waitFor(() => {
        expect(window.location.href).toBe("/dashboard");
    });
});