import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUpdateBusiness from "./AdminUpdateBusiness";

jest.mock("../config", () => ({
  API_BASE_URL: "http://test-api"
}));

describe("AdminUpdateBusiness", () => {
  const mockBusinessInfo = {
    info_id: 1,
    name: "Royal Auto",
    phone: "9165551212",
    email: "royal@auto.com",
    hours: "9-5",
    address: "123 Main St"
  };

  const mockSetBusinessInfo = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    Storage.prototype.getItem = jest.fn(() => "fake-token");
  });

  test("loads existing business info into the form", () => {
    render(
      <AdminUpdateBusiness
        visible={true}
        onClose={mockOnClose}
        businessInfo={mockBusinessInfo}
        setBusinessInfo={mockSetBusinessInfo}
      />
    );

    expect(screen.getByLabelText(/business name/i)).toHaveValue("Royal Auto");
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("9165551212");
    expect(screen.getByLabelText(/email/i)).toHaveValue("royal@auto.com");
    expect(screen.getByLabelText(/hours/i)).toHaveValue("9-5");
    expect(screen.getByLabelText(/address/i)).toHaveValue("123 Main St");
  });

  test("updates input values when user types", async () => {
    const user = userEvent.setup();

    render(
      <AdminUpdateBusiness
        visible={true}
        onClose={mockOnClose}
        businessInfo={mockBusinessInfo}
        setBusinessInfo={mockSetBusinessInfo}
      />
    );

    const nameInput = screen.getByLabelText(/business name/i);

    await user.clear(nameInput);
    await user.type(nameInput, "Royal Auto & Body");

    expect(nameInput).toHaveValue("Royal Auto & Body");
  });

  test("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AdminUpdateBusiness
        visible={true}
        onClose={mockOnClose}
        businessInfo={mockBusinessInfo}
        setBusinessInfo={mockSetBusinessInfo}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("sends PUT request and updates parent state on successful save", async () => {
    const user = userEvent.setup();

    const updatedResponse = {
      info_id: 1,
      name: "Updated Royal Auto",
      phone: "9165559999",
      email: "updated@auto.com",
      hours: "8-6",
      address: "999 Updated St"
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedResponse
    });

    render(
      <AdminUpdateBusiness
        visible={true}
        onClose={mockOnClose}
        businessInfo={mockBusinessInfo}
        setBusinessInfo={mockSetBusinessInfo}
      />
    );

    const nameInput = screen.getByLabelText(/business name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Royal Auto");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://test-api/api/business-info/1/",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "Updated Royal Auto",
            phone: "9165551212",
            email: "royal@auto.com",
            hours: "9-5",
            address: "123 Main St"
          })
        })
      );
    });

    expect(mockSetBusinessInfo).toHaveBeenCalledWith(updatedResponse);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not update parent state if request fails", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Update failed" })
    });

    render(
      <AdminUpdateBusiness
        visible={true}
        onClose={mockOnClose}
        businessInfo={mockBusinessInfo}
        setBusinessInfo={mockSetBusinessInfo}
      />
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(mockSetBusinessInfo).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
  test("allows clearing a preloaded field and submits empty value", async () => {
  const user = userEvent.setup();

  const mockBusinessInfo = {
    info_id: 1,
    name: "Royal Auto",
    phone: "9165551212",
    email: "royal@auto.com",
    hours: "9-5",
    address: "123 Main St"
  };

  const mockSetBusinessInfo = jest.fn();
  const mockOnClose = jest.fn();

  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ...mockBusinessInfo, name: "" })
  });

  render(
    <AdminUpdateBusiness
      visible={true}
      onClose={mockOnClose}
      businessInfo={mockBusinessInfo}
      setBusinessInfo={mockSetBusinessInfo}
    />
  );

  const nameInput = screen.getByLabelText(/business name/i);

  await user.clear(nameInput);

  expect(nameInput).toHaveValue("");

  await user.click(screen.getByRole("button", { name: /save changes/i }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/business-info/1/"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          name: "",
          phone: "9165551212",
          email: "royal@auto.com",
          hours: "9-5",
          address: "123 Main St"
        })
      })
    );
  });
});
});