import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminNewCustomer from "./AdminNewCustomer";

describe("AdminNewCustomer", () => {
  const setup = (props = {}) => {
    const onClose = jest.fn();
    const onAddCustomer = jest.fn().mockResolvedValue(undefined);

    render(
      <AdminNewCustomer
        isOpen={true}
        onClose={onClose}
        onAddCustomer={onAddCustomer}
        {...props}
      />
    );

    return { onClose, onAddCustomer };
  };

  const fillValidForm = async () => {
    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "1234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john.smith@email.com");
  };

  test("renders nothing when isOpen is false", () => {
    render(
      <AdminNewCustomer
        isOpen={false}
        onClose={jest.fn()}
        onAddCustomer={jest.fn()}
      />
    );

    expect(screen.queryByText(/add new customer/i)).not.toBeInTheDocument();
  });

  test("renders form when isOpen is true", () => {
    setup();

    expect(screen.getByText(/add new customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add customer/i })
    ).toBeInTheDocument();
  });

  test("shows validation placeholders when submitting empty form", async () => {
    const { onAddCustomer, onClose } = setup();

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a first name\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/please enter a last name\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/please enter a phone number\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/please enter an email address\./i)
    ).toBeInTheDocument();

    expect(onAddCustomer).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("shows validation for invalid first name", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John123");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "1234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(
        /name can only contain letters, spaces, hyphens, and apostrophes/i
      )
    ).toBeInTheDocument();
  });

  test("shows validation for invalid last name", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith123");
    await userEvent.type(screen.getByLabelText(/phone number/i), "1234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(
        /name can only contain letters, spaces, hyphens, and apostrophes/i
      )
    ).toBeInTheDocument();
  });

  test("shows validation for invalid email", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "1234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "bad-email");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a valid email address\./i)
    ).toBeInTheDocument();
  });

  test("shows validation for 7 digit phone number without area code", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "1234567");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please include area code/i)
    ).toBeInTheDocument();
  });

  test("shows validation for invalid phone number", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "12");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a valid phone number\./i)
    ).toBeInTheDocument();
  });

  test("rejects phone number with misplaced plus sign", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "123+4567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a valid phone number\./i)
    ).toBeInTheDocument();
  });

  test("rejects phone number with multiple plus signs", async () => {
    setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "++1234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a valid phone number\./i)
    ).toBeInTheDocument();
  });

  test("accepts valid 10 digit US phone number", async () => {
    const { onAddCustomer, onClose } = setup();

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    await waitFor(() => {
      expect(onAddCustomer).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phoneNumber: "1234567890",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("accepts valid +1 US phone number", async () => {
    const { onAddCustomer } = setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "+11234567890");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    await waitFor(() => {
      expect(onAddCustomer).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Smith",
        email: "john@email.com",
        phoneNumber: "+11234567890",
      });
    });
  });

  test("accepts valid international phone number", async () => {
    const { onAddCustomer } = setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "John");
    await userEvent.type(screen.getByLabelText(/last name/i), "Smith");
    await userEvent.type(screen.getByLabelText(/phone number/i), "+442071838750");
    await userEvent.type(screen.getByLabelText(/email/i), "john@email.com");

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    await waitFor(() => {
      expect(onAddCustomer).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Smith",
        email: "john@email.com",
        phoneNumber: "+442071838750",
      });
    });
  });

  test("trims first name, last name, email, and phone before submit", async () => {
    const { onAddCustomer } = setup();

    await userEvent.type(screen.getByLabelText(/first name/i), "  John  ");
    await userEvent.type(screen.getByLabelText(/last name/i), "  Smith  ");
    await userEvent.type(screen.getByLabelText(/phone number/i), " 1234567890 ");
    await userEvent.type(
      screen.getByLabelText(/email/i),
      "  john.smith@email.com  "
    );

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    await waitFor(() => {
      expect(onAddCustomer).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phoneNumber: "1234567890",
      });
    });
  });

  test("disables submit button and shows loading text while submitting", async () => {
    let resolvePromise;
    const onAddCustomer = jest.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(
      <AdminNewCustomer
        isOpen={true}
        onClose={jest.fn()}
        onAddCustomer={onAddCustomer}
      />
    );

    await fillValidForm();

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByRole("button", { name: /adding\.\.\./i })
    ).toBeDisabled();

    resolvePromise();

    await waitFor(() => {
      expect(onAddCustomer).toHaveBeenCalled();
    });
  });

  test("shows submit error and stays open when onAddCustomer fails", async () => {
    const onAddCustomer = jest
      .fn()
      .mockRejectedValue(new Error("Failed to add customer."));
    const onClose = jest.fn();

    render(
      <AdminNewCustomer
        isOpen={true}
        onClose={onClose}
        onAddCustomer={onAddCustomer}
      />
    );

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /failed to add customer\./i
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  test("clears field validation error when user types again", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByPlaceholderText(/please enter a first name\./i)
    ).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/first name/i);
    await userEvent.type(firstNameInput, "J");

    expect(
      screen.queryByPlaceholderText(/please enter a first name\./i)
    ).not.toBeInTheDocument();
    expect(firstNameInput).toHaveValue("J");
  });

  test("clears submit error when user types again", async () => {
    const onAddCustomer = jest
      .fn()
      .mockRejectedValue(new Error("Server failure"));
    render(
      <AdminNewCustomer
        isOpen={true}
        onClose={jest.fn()}
        onAddCustomer={onAddCustomer}
      />
    );

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /add customer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/server failure/i);

    await userEvent.type(screen.getByLabelText(/first name/i), "a");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("clicking overlay closes modal", async () => {
    const { onClose } = setup();

    const overlay = document.querySelector(".services-management-add-overlay");

    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: overlay },
      { keys: "[/MouseLeft]", target: overlay },
    ]);

    expect(onClose).toHaveBeenCalled();
  });

  test("mousedown outside and mouseup inside does not close modal", async () => {
    const { onClose } = setup();

    const overlay = document.querySelector(".services-management-add-overlay");
    const modal = document.querySelector(".services-management-add");

    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: overlay },
      { keys: "[/MouseLeft]", target: modal },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });

  test("mousedown inside and mouseup outside does not close modal", async () => {
    const { onClose } = setup();

    const overlay = document.querySelector(".services-management-add-overlay");
    const modal = document.querySelector(".services-management-add");

    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: modal },
      { keys: "[/MouseLeft]", target: overlay },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });

  test("clicking inside modal does not close it", async () => {
    const { onClose } = setup();

    const modal = document.querySelector(".services-management-add");

    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: modal },
      { keys: "[/MouseLeft]", target: modal },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });
});