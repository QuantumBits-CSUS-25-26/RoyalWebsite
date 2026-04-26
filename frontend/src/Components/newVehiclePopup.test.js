import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewVehiclePopUp from "./NewVehiclePopUp";

jest.mock("../config", () => ({
  API_BASE_URL: "http://test-api.com",
}));

describe("NewVehiclePopUp", () => {
  const mockOnClose = jest.fn();
  const mockOnVehicleAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    sessionStorage.clear();
    sessionStorage.setItem("authToken", "test-token");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders modal fields and buttons when open", () => {
    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    expect(screen.getByText("Add New Vehicle")).toBeInTheDocument();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license plate/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vehicle/i })).toBeInTheDocument();
  });

  test("updates input values when user types", () => {
    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Toyota" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "Camry" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2020" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "ABC123" },
    });

    expect(screen.getByLabelText(/make/i)).toHaveValue("Toyota");
    expect(screen.getByLabelText(/model/i)).toHaveValue("Camry");
    expect(screen.getByLabelText(/year/i)).toHaveValue(2020);
    expect(screen.getByLabelText(/license plate/i)).toHaveValue("ABC123");
  });

  test("calls onClose when Cancel button is clicked", () => {
    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("successfully submits new vehicle and calls callbacks", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Honda" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "Civic" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2021" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "XYZ789" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/vehicles/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          make: "Honda",
          model: "Civic",
          year: "2021",
          license_plate: "XYZ789",
        }),
      }
    );

    await waitFor(() => {
      expect(mockOnVehicleAdded).toHaveBeenCalledTimes(1);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("shows Adding text and disables submit button while request is pending", async () => {
    let resolveFetch;

    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Ford" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "Focus" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2018" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "FOR123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    await waitFor(() => {
      expect(mockOnVehicleAdded).toHaveBeenCalledTimes(1);
    });
  });

  test("shows API error detail when request fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: "Vehicle already exists.",
      }),
    });

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Toyota" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "RAV4" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2022" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "BAD123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Vehicle already exists.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows default failure message when API error has no detail", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Nissan" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "Altima" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2019" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "ALT123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Failed to add vehicle.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows default failure message when API error response is not JSON", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    });

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Mazda" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "CX-5" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2023" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "MAZ123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Failed to add vehicle.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows network error when fetch throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failed"));

    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );

    fireEvent.change(screen.getByLabelText(/make/i), {
      target: { value: "Kia" },
    });

    fireEvent.change(screen.getByLabelText(/model/i), {
      target: { value: "Soul" },
    });

    fireEvent.change(screen.getByLabelText(/year/i), {
      target: { value: "2020" },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: "KIA123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Network error.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});