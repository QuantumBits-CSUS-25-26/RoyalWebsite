import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditEmployeeForm from "./EditEmployee";

describe("EditEmployeeForm", () => {
  const employees = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "(123) 456-7890",
    },
    {
      employee_id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "(222) 333-4444",
    },
  ];

  const setup = (props = {}) => {
    const onClose = jest.fn();
    const onEdit = jest.fn().mockResolvedValue(undefined);

    render(
      <EditEmployeeForm
        visible={true}
        onClose={onClose}
        onEdit={onEdit}
        employee={employees}
        {...props}
      />
    );

    return { onClose, onEdit };
  };

  test("renders nothing when not visible", () => {
    render(
      <EditEmployeeForm
        visible={false}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        employee={employees}
      />
    );

    expect(screen.queryByText(/edit employee/i)).not.toBeInTheDocument();
  });

  test("renders form when visible", () => {
    setup();

    expect(screen.getByText(/edit employee/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("renders employee options using id and employee_id", () => {
    setup();

    expect(screen.getByRole("option", { name: /1 - john doe/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /2 - jane smith/i })).toBeInTheDocument();
  });

  test("shows validation error when no employee is selected", async () => {
    const { onEdit } = setup();

    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(screen.getByText(/please select an employee to edit/i)).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
  });

  test("moves to confirm step after selecting an employee", async () => {
    setup();

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(screen.getByText(/editing employee: john doe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm update/i })).toBeInTheDocument();
  });

  test("prefills selected employee data in confirm step", async () => {
    setup();

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(screen.getByPlaceholderText(/first name/i)).toHaveValue("John");
    expect(screen.getByPlaceholderText(/last name/i)).toHaveValue("Doe");
    expect(screen.getByPlaceholderText(/phone number e\.g\./i)).toHaveValue("(123) 456-7890");
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue("john@example.com");
  });

  test("calls onEdit with updated values and closes on success", async () => {
    const { onEdit, onClose } = setup();

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    const firstName = screen.getByPlaceholderText(/first name/i);
    const lastName = screen.getByPlaceholderText(/last name/i);
    const phone = screen.getByPlaceholderText(/phone number e\.g\./i);
    const email = screen.getByPlaceholderText(/email/i);

    await userEvent.clear(firstName);
    await userEvent.type(firstName, "Johnny");

    await userEvent.clear(lastName);
    await userEvent.type(lastName, "Doeman");

    await userEvent.clear(phone);
    await userEvent.type(phone, "(999) 555-1234");

    await userEvent.clear(email);
    await userEvent.type(email, "johnny@example.com");

    await userEvent.click(screen.getByRole("button", { name: /confirm update/i }));

    expect(onEdit).toHaveBeenCalledWith(1, {
      first_name: "Johnny",
      last_name: "Doeman",
      phone: "(999) 555-1234",
      email: "johnny@example.com",
    });

    expect(onClose).toHaveBeenCalled();
  });

  test("shows error and returns to selection step when onEdit fails", async () => {
  const onEdit = jest.fn().mockRejectedValue(new Error("Edit failed badly"));
  const onClose = jest.fn();

  render(
    <EditEmployeeForm
      visible={true}
      onClose={onClose}
      onEdit={onEdit}
      employee={employees}
    />
  );

  await userEvent.selectOptions(screen.getByRole("combobox"), "1");
  await userEvent.click(screen.getByRole("button", { name: /update/i }));
  await userEvent.click(screen.getByRole("button", { name: /confirm update/i }));

  expect(await screen.findByText(/edit failed badly/i)).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();

  expect(screen.getByRole("combobox")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /confirm update/i })
  ).not.toBeInTheDocument();
  });

  test("uses fallback error message when onEdit rejects without message", async () => {
    const onEdit = jest.fn().mockRejectedValue({});
    const onClose = jest.fn();

    render(
      <EditEmployeeForm
        visible={true}
        onClose={onClose}
        onEdit={onEdit}
        employee={employees}
      />
    );

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm update/i }));

    expect(await screen.findByText(/failed to edit employee/i)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("cancel in selection step closes the modal", async () => {
    const { onClose, onEdit } = setup();

    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onClose).toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  test("cancel in confirm step returns to selection step", async () => {
    const { onClose, onEdit } = setup();

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(screen.getByText(/editing employee: john doe/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.queryByText(/editing employee: john doe/i)).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  test("works when employee prop is not an array", () => {
    render(
      <EditEmployeeForm
        visible={true}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        employee={null}
      />
    );

    expect(screen.getByText(/edit employee/i)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /-- select employee --/i })).toBeInTheDocument();
  });

  test("clears validation error after making a valid selection", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: /update/i }));
    expect(screen.getByText(/please select an employee to edit/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox"), "1");
    await userEvent.click(screen.getByRole("button", { name: /update/i }));

    expect(screen.queryByText(/please select an employee to edit/i)).not.toBeInTheDocument();
    expect(screen.getByText(/editing employee: john doe/i)).toBeInTheDocument();
  });
});