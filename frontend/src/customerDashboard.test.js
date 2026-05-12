import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CustomerDashboard from "./Pages/CustomerDashboard";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("./Components/AppointmentSummary", () => () => (
  <div data-testid="appointment-summary">Appointment Summary Popup</div>
));

jest.mock("./Components/VehicleInfoPopup", () => (props) =>
  props.isOpen ? <div data-testid="vehicle-info-popup">Vehicle Info Popup</div> : null
);

jest.mock("./Components/newVehiclePopup", () => (props) =>
  props.isOpen ? (
    <div data-testid="new-vehicle-popup">
      New Vehicle Popup
      <button onClick={props.onVehicleAdded}>Refresh Vehicles</button>
      <button onClick={props.onClose}>Close</button>
    </div>
  ) : null
);

jest.mock("./Components/AuthErrorPage/AuthErrorPage", () => () => (
  <div>403 - Forbidden</div>
));

describe("CustomerDashboard page", () => {
  const profile = {
    first_name: "Trevor",
    last_name: "Gould",
    email: "something@email.com",
    phone: "9166984779",
  };

  const vehicles = [
    {
      vehicle_id: 2,
      make: "Hyundai",
      model: "Sonata",
      year: 2008,
      license_plate: "234bcd",
      customer_id: 1,
    },
  ];

  const appointments = [
    {
      appointment_id: 1,
      service_type: "Oil Change",
      scheduled_at: "2026-04-08T10:00:00",
      cost: 50,
      vehicle: 2,
    },
  ];

  const recommendations = [
    {
      recommendation_id: 1,
      note: "Brakes are worn",
      customer_id: 1,
      service_id: 2,
      vehicle_id: 2,
    },
  ];

  const mockApiData = ({
    profileOk = true,
    vehiclesOk = true,
    appointmentsOk = true,
    recommendationsOk = true,
    profileData = profile,
    vehiclesData = vehicles,
    appointmentsData = appointments,
    recommendationsData = recommendations,
    logoutOk = true,
  } = {}) => {
    global.fetch = jest.fn((url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({
          ok: profileOk,
          json: () => Promise.resolve(profileData),
        });
      }

      if (url.includes("/api/vehicles/") && method === "GET") {
        return Promise.resolve({
          ok: vehiclesOk,
          json: () => Promise.resolve(vehiclesData),
        });
      }

      if (url.includes("/api/appointments/")) {
        return Promise.resolve({
          ok: appointmentsOk,
          json: () => Promise.resolve(appointmentsData),
        });
      }

      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({
          ok: recommendationsOk,
          json: () => Promise.resolve(recommendationsData),
        });
      }

      if (url.includes("/api/logout/") && method === "POST") {
        if (!logoutOk) {
          return Promise.reject(new Error("Logout failed"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders AuthErrorPage if not authorized", () => {
    render(<CustomerDashboard />);
    expect(screen.getByText(/403 - Forbidden/i)).toBeInTheDocument();
  });

  test("renders forbidden when stored user JSON is invalid and no token exists", () => {
    localStorage.setItem("user", "{bad json");

    render(<CustomerDashboard />);

    expect(screen.getByText(/403 - Forbidden/i)).toBeInTheDocument();
  });

  test("allows access when auth token exists without stored user", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
  });

  test("allows access when stored user has customer role", async () => {
    localStorage.setItem("user", JSON.stringify({ role: "customer" }));
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
  });

  test("allows access when stored user has is_customer true", async () => {
    localStorage.setItem("user", JSON.stringify({ is_customer: true }));
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
  });

  test("allows access when stored user has is_superuser true", async () => {
    localStorage.setItem("user", JSON.stringify({ is_superuser: true }));
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
  });

  test("allows access when stored user roles includes customer", async () => {
    localStorage.setItem("user", JSON.stringify({ roles: ["customer"] }));
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
  });

  test("renders profile, vehicles, appointments, recommendations, and service history", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
    expect(screen.getByText(/something@email.com/i)).toBeInTheDocument();
    expect(screen.getByText(/9166984779/i)).toBeInTheDocument();
    expect(screen.getByText(/Hyundai/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sonata/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Oil Change/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Brakes/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50/i)).toBeInTheDocument();
  });

  test("shows loading states while requests are unresolved", () => {
    sessionStorage.setItem("authToken", "fake-token");
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(<CustomerDashboard />);

    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  test("shows empty states for all tables", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({
      vehiclesData: [],
      appointmentsData: [],
      recommendationsData: [],
    });

    render(<CustomerDashboard />);

    expect(await screen.findByText(/No appointments found/i)).toBeInTheDocument();
    expect(screen.getByText(/No vehicles found/i)).toBeInTheDocument();
    expect(screen.getByText(/No recommended services/i)).toBeInTheDocument();
    expect(screen.getByText(/No service history/i)).toBeInTheDocument();
  });

  test("shows error if vehicles API fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({ vehiclesOk: false });

    render(<CustomerDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Failed to load vehicles/i);
  });

  test("shows error if profile API fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({ profileOk: false });

    render(<CustomerDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Failed to load profile/i);
  });

  test("shows error if appointments API fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({ appointmentsOk: false });

    render(<CustomerDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Failed to load appointments/i);
  });

  test("shows error if recommendations API fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({ recommendationsOk: false });

    render(<CustomerDashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/Failed to load recommendations/i);
  });

  test("shows profile fallback when profile json parsing fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("bad json")),
        });
      }
      if (url.includes("/api/vehicles/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(vehicles) });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(appointments) });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recommendations) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<CustomerDashboard />);

    expect(await screen.findAllByText("-")).not.toHaveLength(0);
  });

  test("shows empty vehicles state when vehicles json parsing fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
      }
      if (url.includes("/api/vehicles/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("bad json")),
        });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(appointments) });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recommendations) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<CustomerDashboard />);

    expect(await screen.findByText(/No vehicles found/i)).toBeInTheDocument();
  });

  test("shows empty appointments and service history when appointments json parsing fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
      }
      if (url.includes("/api/vehicles/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(vehicles) });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("bad json")),
        });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recommendations) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<CustomerDashboard />);

    expect(await screen.findByText(/No appointments found/i)).toBeInTheDocument();
    expect(screen.getByText(/No service history/i)).toBeInTheDocument();
  });

  test("shows empty recommendations when recommendations json parsing fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
      }
      if (url.includes("/api/vehicles/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(vehicles) });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(appointments) });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error("bad json")),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<CustomerDashboard />);

    expect(await screen.findByText(/No recommended services/i)).toBeInTheDocument();
  });

  test("Update Account Info button triggers navigation", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    const btn = await screen.findByRole("button", { name: /update account info/i });
    await user.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/account-update");
  });

  test("Book an Appointment button triggers navigation", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    const btn = await screen.findByRole("button", { name: /book an appointment/i });
    await user.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/appointments");
  });

  test("Appointment Summary button shows popup", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    const btn = await screen.findByRole("button", { name: /appointment summary/i });
    await user.click(btn);

    expect(screen.getByTestId("appointment-summary")).toBeInTheDocument();
  });

  test("View Vehicle Info button shows popup", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    const btn = await screen.findByRole("button", { name: /view vehicle info/i });
    await user.click(btn);

    expect(screen.getByTestId("vehicle-info-popup")).toBeInTheDocument();
  });

  test("New Vehicle button shows popup", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    const btn = await screen.findByRole("button", { name: /new vehicle/i });
    await user.click(btn);

    expect(screen.getByTestId("new-vehicle-popup")).toBeInTheDocument();
  });

  test("refreshes vehicles after vehicle added", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");

    let currentVehicles = [
      {
        vehicle_id: 2,
        make: "Hyundai",
        model: "Sonata",
        year: 2008,
        license_plate: "234bcd",
        customer_id: 1,
      },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
      }
      if (url.includes("/api/vehicles/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(currentVehicles) });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(appointments) });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recommendations) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(<CustomerDashboard />);

    expect(await screen.findByText(/Hyundai/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new vehicle/i }));
    expect(screen.getByTestId("new-vehicle-popup")).toBeInTheDocument();

    currentVehicles = [
      ...currentVehicles,
      {
        vehicle_id: 3,
        make: "Toyota",
        model: "Corolla",
        year: 2012,
        license_plate: "999xyz",
        customer_id: 1,
      },
    ];

    await user.click(screen.getByRole("button", { name: /refresh vehicles/i }));

    expect(await screen.findByText(/Toyota/i)).toBeInTheDocument();
    expect(screen.getByText(/Corolla/i)).toBeInTheDocument();
  });

  test("refresh vehicles helper clears vehicles when refresh response is not ok", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("authToken", "fake-token");

    let vehicleCallCount = 0;

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/customers/me/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(profile) });
      }
      if (url.includes("/api/vehicles/")) {
        vehicleCallCount += 1;
        if (vehicleCallCount === 1) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(vehicles) });
        }
        return Promise.resolve({ ok: false, json: () => Promise.resolve([]) });
      }
      if (url.includes("/api/appointments/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(appointments) });
      }
      if (url.includes("/api/recommendations/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(recommendations) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

  render(<CustomerDashboard />);

  expect(await screen.findByText(/Hyundai/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /new vehicle/i }));
  await user.click(screen.getByRole("button", { name: /refresh vehicles/i }));

  expect(await screen.findByText(/No vehicles found/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hyundai/i)).not.toBeInTheDocument();
  expect(vehicleCallCount).toBeGreaterThanOrEqual(2);
});

  test("renders pagination controls", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    await screen.findByText(/Trevor Gould/i);

    expect(screen.getByText("«")).toBeInTheDocument();
    expect(screen.getByText("»")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  test("renders all action buttons", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData();

    render(<CustomerDashboard />);

    expect(await screen.findByRole("button", { name: /update account info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book an appointment/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /appointment summary/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view vehicle info/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new vehicle/i })).toBeInTheDocument();
  });

  test("does not render a logout button in current dashboard UI", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    sessionStorage.setItem("user", JSON.stringify({ role: "customer" }));
    mockApiData();

    render(<CustomerDashboard />);

    await screen.findByText(/Trevor Gould/i);

    expect(screen.queryByRole("button", { name: /sign-out/i })).not.toBeInTheDocument();
  });

  test("recommendations can resolve vehicle object directly", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({
      recommendationsData: [
        {
          recommendation_id: 1,
          service_id: 2,
          vehicle_id: {
            vehicle_id: 2,
            model: "Sonata",
            license_plate: "234bcd",
          },
        },
      ],
    });

    render(<CustomerDashboard />);

    const recommendedHeader = await screen.findByText(/Recommended Services:/i);
    const recommendedSection = recommendedHeader.closest(".info");

    expect(await within(recommendedSection).findByText(/Sonata/i)).toBeInTheDocument();
    expect(within(recommendedSection).getByText(/234bcd/i)).toBeInTheDocument();
    expect(within(recommendedSection).getByText(/Brakes/i)).toBeInTheDocument();
  });

  test("recommendations show fallback values when vehicle cannot be resolved", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({
      recommendationsData: [
        {
          recommendation_id: 1,
          service_id: 2,
          vehicle_id: 999,
        },
      ],
    });

    render(<CustomerDashboard />);

    const recommendedHeader = await screen.findByText(/Recommended Services:/i);
    const recommendedSection = recommendedHeader.closest(".info");

    await waitFor(() => {
      expect(within(recommendedSection).getAllByText("-").length).toBeGreaterThan(0);
    });
    expect(within(recommendedSection).getByText(/Brakes/i)).toBeInTheDocument();
  });

  test("recommendations show raw service id when service lookup fails", async () => {
    sessionStorage.setItem("authToken", "fake-token");
    mockApiData({
      recommendationsData: [
        {
          recommendation_id: 1,
          service_id: 999,
          vehicle_id: 2,
        },
      ],
    });

    render(<CustomerDashboard />);

    const recommendedHeader = await screen.findByText(/Recommended Services:/i);
    const recommendedSection = recommendedHeader.closest(".info");

    expect(await within(recommendedSection).findByText(/999/i)).toBeInTheDocument();
  });
});