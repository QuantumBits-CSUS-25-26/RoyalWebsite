import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "./AdminDashboard";


jest.mock("../Components/AdminSideBar", () => () => <div>Mock Sidebar</div>);

jest.mock("../images/customer_Icon.png", () => "customer.png");
jest.mock("../images/appointment_Icon.png", () => "appointment.png");
jest.mock("../images/message_Icon.png", () => "message.png");
jest.mock("../images/services_Icon.png", () => "services.png");
jest.mock("../images/sign_in_Icon.png", () => "signin.png");

jest.mock("../config", () => ({
  API_BASE_URL: "http://test-api"
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("fetches and displays business information", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          info_id: 1,
          name: "Royal Auto",
          phone: "9165551212",
          email: "royal@auto.com",
          hours: "9-5",
          address: "123 Main St"
        }
      ]
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Royal Auto")).toBeInTheDocument();
    });

    expect(screen.getByText("9165551212")).toBeInTheDocument();
    expect(screen.getByText("royal@auto.com")).toBeInTheDocument();
    expect(screen.getByText("9-5")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  test("opens edit modal when Edit is clicked", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      json: async () => [
        {
          info_id: 1,
          name: "Royal Auto",
          phone: "9165551212",
          email: "royal@auto.com",
          hours: "9-5",
          address: "123 Main St"
        }
      ]
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Royal Auto")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByText(/edit business information/i)).toBeInTheDocument();
  });
});