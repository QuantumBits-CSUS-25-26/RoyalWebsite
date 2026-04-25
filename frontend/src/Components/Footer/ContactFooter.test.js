import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactFooter from "./ContactFooter";

jest.mock("../../config", () => ({
  API_BASE_URL: "http://localhost:8000",
}));

jest.mock("./ContactFooterAssets/Phone.svg", () => "phone.svg");
jest.mock("./ContactFooterAssets/Calender.svg", () => "calendar.svg");
jest.mock("./ContactFooterAssets/Compass.svg", () => "compass.svg");

jest.mock("../ContactForm", () => ({ isOpen, onClose }) =>
  isOpen ? (
    <div role="dialog" aria-label="Contact form modal">
      <p>Mock Contact Form</p>
      <button onClick={onClose}>Close Form</button>
    </div>
  ) : null
);

describe("ContactFooter", () => {
  const mockBusinessInfo = [
    {
      phone: "(916) 555-1234",
      address: "123 Main Street, Sacramento, CA",
      hours: "Mon-Fri 9AM-5PM",
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockBusinessInfo),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the contact footer title and contact form button", async () => {
    render(<ContactFooter />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("contentinfo", { name: /contact us footer/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /contact us/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /open contact form/i })
    ).toBeInTheDocument();
  });

  test("fetches business info from the API when the component loads", async () => {
    render(<ContactFooter />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/business-info/"
      );
    });
  });

  test("displays phone, address, and hours after business info loads", async () => {
    render(<ContactFooter />);

    expect(await screen.findByText("(916) 555-1234")).toBeInTheDocument();
    expect(
      screen.getByText("123 Main Street, Sacramento, CA")
    ).toBeInTheDocument();
    expect(screen.getByText("Mon-Fri 9AM-5PM")).toBeInTheDocument();
  });

  test("does not show the contact form before the button is clicked", async () => {
    render(<ContactFooter />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("dialog", { name: /contact form modal/i })
    ).not.toBeInTheDocument();
  });

  test("opens the contact form when the Contact Form button is clicked", async () => {
    const user = userEvent.setup();

    render(<ContactFooter />);

    await screen.findByText("(916) 555-1234");

    await user.click(
      screen.getByRole("button", { name: /open contact form/i })
    );

    expect(
      screen.getByRole("dialog", { name: /contact form modal/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Mock Contact Form")).toBeInTheDocument();
  });

  test("closes the contact form when onClose is triggered", async () => {
    const user = userEvent.setup();

    render(<ContactFooter />);

    await screen.findByText("(916) 555-1234");

    await user.click(
      screen.getByRole("button", { name: /open contact form/i })
    );

    expect(
      screen.getByRole("dialog", { name: /contact form modal/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close form/i }));

    expect(
      screen.queryByRole("dialog", { name: /contact form modal/i })
    ).not.toBeInTheDocument();
  });
});