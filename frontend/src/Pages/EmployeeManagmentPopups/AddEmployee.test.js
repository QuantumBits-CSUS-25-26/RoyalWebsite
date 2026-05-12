import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEmployeeForm from "./AddEmployee";

describe("AddEmployeeForm", () => {
  const setup = (props = {}) => {
    const onClose = jest.fn();
    const onAdd = jest.fn();

    render(
      <AddEmployeeForm
        visible={true}
        onClose={onClose}
        onAdd={onAdd}
        {...props}
      />
    );

    return { onClose, onAdd };
  };

  const fillValidForm = async () => {
    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "1234567890"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Password1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Password1"
    );
  };

  test("renders nothing when not visible", () => {
    render(
      <AddEmployeeForm visible={false} onClose={jest.fn()} onAdd={jest.fn()} />
    );

    expect(screen.queryByText(/add new employee/i)).not.toBeInTheDocument();
  });

  test("renders form when visible", () => {
    setup();

    expect(screen.getByText(/add new employee/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
  });

  test("shows error when required fields are missing", async () => {
    const { onAdd, onClose } = setup();

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("shows error for invalid email", async () => {
    const { onAdd } = setup();

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "1234567890"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "invalid-email");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Password1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Password1"
    );

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("shows error when password is too short", async () => {
    const { onAdd } = setup();

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "1234567890"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "short1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "short1"
    );

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(
      screen.getByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("shows error when passwords do not match", async () => {
    const { onAdd } = setup();

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "1234567890"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Password1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Password2"
    );

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("shows error for invalid phone number", async () => {
    const { onAdd } = setup();

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "12345"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Password1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Password1"
    );

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getByText(/phone number must be valid/i)).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("submits successfully with formatted phone number", async () => {
    const { onAdd, onClose } = setup();

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      phone: "(123) 456-7890",
      email: "john@example.com",
      password: "Password1",
    });

    expect(onClose).toHaveBeenCalled();
  });

  test("accepts formatted phone input as long as it has 10 digits", async () => {
    const { onAdd } = setup();

    await userEvent.type(screen.getByPlaceholderText(/first name/i), "John");
    await userEvent.type(screen.getByPlaceholderText(/last name/i), "Doe");
    await userEvent.type(
      screen.getByPlaceholderText(/phone number e\.g\./i),
      "(123) 456-7890"
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText(/^password$/i), "Password1");
    await userEvent.type(
      screen.getByPlaceholderText(/confirm password/i),
      "Password1"
    );

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      phone: "(123) 456-7890",
      email: "john@example.com",
      password: "Password1",
    });
  });

  test("resets fields and closes when cancel is clicked", async () => {
    const { onClose, onAdd } = setup();

    const firstName = screen.getByPlaceholderText(/first name/i);
    const lastName = screen.getByPlaceholderText(/last name/i);
    const phone = screen.getByPlaceholderText(/phone number e\.g\./i);
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/^password$/i);
    const confirmPassword = screen.getByPlaceholderText(/confirm password/i);

    await userEvent.type(firstName, "John");
    await userEvent.type(lastName, "Doe");
    await userEvent.type(phone, "1234567890");
    await userEvent.type(email, "john@example.com");
    await userEvent.type(password, "Password1");
    await userEvent.type(confirmPassword, "Password1");

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();

    expect(firstName).toHaveValue("");
    expect(lastName).toHaveValue("");
    expect(phone).toHaveValue("");
    expect(email).toHaveValue("");
    expect(password).toHaveValue("");
    expect(confirmPassword).toHaveValue("");
  });

  test("clears previous error after successful submit", async () => {
    const { onAdd } = setup();

    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalled();
    expect(screen.queryByText(/please fill all fields/i)).not.toBeInTheDocument();
  });
});