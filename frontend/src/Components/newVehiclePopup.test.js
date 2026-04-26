import React from "react";
import "@testing-library/jest-dom";
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
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("authToken", "test-token");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  function renderModal() {
    render(
      <NewVehiclePopUp
        isOpen={true}
        onClose={mockOnClose}
        onVehicleAdded={mockOnVehicleAdded}
      />
    );
  }

  function fillVehicleForm({
    make = "Toyota",
    model = "Camry",
    year = "2020",
    licensePlate = "ABC123",
  } = {}) {
    fireEvent.change(screen.getByLabelText(/^make$/i), {
      target: { value: make },
    });

    fireEvent.change(screen.getByLabelText(/^model$/i), {
      target: { value: model },
    });

    fireEvent.change(screen.getByLabelText(/^year$/i), {
      target: { value: year },
    });

    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: licensePlate },
    });
  }

  test("renders modal fields and buttons when open", () => {
    renderModal();

    expect(screen.getByText("Add New Vehicle")).toBeInTheDocument();
    expect(screen.getByLabelText(/^make$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^model$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^year$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license plate/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vehicle/i })).toBeInTheDocument();
  });

  test("updates input values when user types", () => {
    renderModal();

    fillVehicleForm({
      make: "Toyota",
      model: "Camry",
      year: "2020",
      licensePlate: "ABC123",
    });

    expect(screen.getByLabelText(/^make$/i)).toHaveValue("Toyota");
    expect(screen.getByLabelText(/^model$/i)).toHaveValue("Camry");
    expect(screen.getByLabelText(/^year$/i)).toHaveValue(2020);
    expect(screen.getByLabelText(/license plate/i)).toHaveValue("ABC123");
  });

  test("calls onClose when Cancel button is clicked", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("successfully submits new vehicle and calls callbacks", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    renderModal();

    fillVehicleForm({
      make: "Honda",
      model: "Civic",
      year: "2021",
      licensePlate: "XYZ789",
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
          year: 2021,
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

    renderModal();

    fillVehicleForm({
      make: "Ford",
      model: "Focus",
      year: "2018",
      licensePlate: "FOR123",
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

    renderModal();

    fillVehicleForm({
      make: "Toyota",
      model: "RAV4",
      year: "2022",
      licensePlate: "BAD123",
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

    renderModal();

    fillVehicleForm({
      make: "Nissan",
      model: "Altima",
      year: "2019",
      licensePlate: "ALT123",
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

    renderModal();

    fillVehicleForm({
      make: "Mazda",
      model: "CX-5",
      year: "2023",
      licensePlate: "MAZ123",
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Failed to add vehicle.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows network error when fetch throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failed"));

    renderModal();

    fillVehicleForm({
      make: "Kia",
      model: "Soul",
      year: "2020",
      licensePlate: "KIA123",
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(await screen.findByText("Network error.")).toBeInTheDocument();

    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("shows not logged in error and does not call fetch when auth token is missing", async () => {
    localStorage.clear();

    renderModal();

    fillVehicleForm({
      make: "Honda",
      model: "Accord",
      year: "2022",
      licensePlate: "NOAUTH1",
    });

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));

    expect(
      await screen.findByText("You are not logged in. Please log in again.")
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnVehicleAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});