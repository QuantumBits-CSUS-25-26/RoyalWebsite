import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CustomerUpdate from "./Pages/CustomerUpdate";
import axios from "axios";

jest.mock("axios");

jest.mock("./Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div>403 - Forbidden</div>
));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("CustomerUpdate page", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();

    axios.get.mockResolvedValue({
      data: {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
      },
    });
  });

  test("renders AuthErrorPage if not authorized", async () => {
    render(<CustomerUpdate />);
    expect(await screen.findByText(/403 - Forbidden/i)).toBeInTheDocument();
  });

  test("renders CustomerUpdate page when authToken present", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    render(<CustomerUpdate />);
    expect(await screen.findByText(/Update Account Information/i)).toBeInTheDocument();
  });

  test("shows error for invalid email format", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const email = container.querySelector('input[name="email"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(email);
    await userEvent.type(email, "invalid-email");
    await userEvent.click(updateButton);

    expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
  });

  test("shows error for invalid phone number format", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const phone = container.querySelector('input[name="phoneNumber"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(phone);
    await userEvent.type(phone, "12345");
    await userEvent.click(updateButton);

    expect(await screen.findByText(/Invalid phone number/i)).toBeInTheDocument();
  });

  test("shows error if passwords do not match", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const password = container.querySelector('input[name="password"]');
    const confirmPassword = container.querySelector('input[name="confirmPassword"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.type(password, "password123");
    await userEvent.type(confirmPassword, "differentpass");
    await userEvent.click(updateButton);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test("shows error if password is too short", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const password = container.querySelector('input[name="password"]');
    const confirmPassword = container.querySelector('input[name="confirmPassword"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.type(password, "short");
    await userEvent.type(confirmPassword, "short");
    await userEvent.click(updateButton);

    expect(await screen.findByText(/Password must be 8\+ chars/i)).toBeInTheDocument();
  });

  test("form fields are pre-filled with current user data", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    expect(container.querySelector('input[name="firstName"]')).toHaveValue("John");
    expect(container.querySelector('input[name="lastName"]')).toHaveValue("Doe");
    expect(container.querySelector('input[name="email"]')).toHaveValue("john.doe@example.com");
    expect(container.querySelector('input[name="phoneNumber"]')).toHaveValue("123-456-7890");
  });

  test("does not call axios.put if validation fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const firstName = container.querySelector('input[name="firstName"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(firstName);
    await userEvent.click(updateButton);

    expect(axios.put).not.toHaveBeenCalled();
  });

  test("calls axios.put with correct data", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    axios.put.mockResolvedValueOnce({
      data: {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        phone: "5555555555",
      },
    });

    const { container } = render(<CustomerUpdate />);
    await screen.findByText(/Update Account Information/i);

    const firstName = container.querySelector('input[name="firstName"]');
    const lastName = container.querySelector('input[name="lastName"]');
    const email = container.querySelector('input[name="email"]');
    const phone = container.querySelector('input[name="phoneNumber"]');
    const password = container.querySelector('input[name="password"]');
    const confirmPassword = container.querySelector('input[name="confirmPassword"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(firstName);
    await userEvent.type(firstName, "Jane");
    await userEvent.clear(lastName);
    await userEvent.type(lastName, "Smith");
    await userEvent.clear(email);
    await userEvent.type(email, "jane.smith@example.com");
    await userEvent.clear(phone);
    await userEvent.type(phone, "5555555555");
    await userEvent.type(password, "password123");
    await userEvent.type(confirmPassword, "password123");
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/api/customers/me/"),
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          phone: "5555555555",
          password: "password123",
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
    });
  });

  test("shows validation errors for invalid input", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    const { container } = render(<CustomerUpdate />);

    await screen.findByText(/Update Account Information/i);

    const firstName = container.querySelector('input[name="firstName"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(firstName);
    await userEvent.click(updateButton);

    expect(await screen.findByText(/First name required/i)).toBeInTheDocument();
  });

  test("submits form and navigates to dashboard on success", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    axios.put.mockResolvedValueOnce({
      data: {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        phone: "5555555555",
      },
    });

    const { container } = render(<CustomerUpdate />);
    await screen.findByText(/Update Account Information/i);

    const firstName = container.querySelector('input[name="firstName"]');
    const lastName = container.querySelector('input[name="lastName"]');
    const email = container.querySelector('input[name="email"]');
    const phone = container.querySelector('input[name="phoneNumber"]');
    const password = container.querySelector('input[name="password"]');
    const confirmPassword = container.querySelector('input[name="confirmPassword"]');
    const updateButton = screen.getByRole("button", { name: /update/i });

    await userEvent.clear(firstName);
    await userEvent.type(firstName, "Jane");
    await userEvent.clear(lastName);
    await userEvent.type(lastName, "Smith");
    await userEvent.clear(email);
    await userEvent.type(email, "jane.smith@example.com");
    await userEvent.clear(phone);
    await userEvent.type(phone, "5555555555");
    await userEvent.type(password, "password123");
    await userEvent.type(confirmPassword, "password123");
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error alert on failed update", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    axios.put.mockRejectedValueOnce(new Error("fail"));
    window.alert = jest.fn();

    render(<CustomerUpdate />);
    await screen.findByText(/Update Account Information/i);

    const updateButton = screen.getByRole("button", { name: /update/i });
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Update failed");
    });
  });
});