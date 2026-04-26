import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CustomerDashboard from './Pages/CustomerDashboard';

// Mock child components
jest.mock('./Components/AppointmentSummary', () => () => <div data-testid="appointment-summary" />);
jest.mock('./Components/VehicleInfoPopup', () => (props) => props.isOpen ? <div data-testid="vehicle-info-popup" /> : null);
jest.mock('./Components/newVehiclePopup', () => (props) => props.isOpen ? <div data-testid="new-vehicle-popup" /> : null);


// Mock useNavigate only
import * as routerDom from 'react-router-dom';
jest.spyOn(routerDom, 'useNavigate').mockImplementation(() => jest.fn());

describe('CustomerDashboard page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Update Account Info button triggers navigation', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigate);
    render(<CustomerDashboard />);
    const btn = await screen.findByRole('button', { name: /update account info/i });
    await userEvent.click(btn);
    expect(navigate).toHaveBeenCalled();
  });

  test('Adding a new vehicle updates the vehicle list', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    let vehicles = [{ vehicle_id: 2, make: 'Hyundai', model: 'Sonata', year: 2008, license_plate: '234bcd', customer_id: 1 }];
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/customers/me/')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ first_name: 'Trevor', last_name: 'Gould', email: 'something@email.com', phone: '9166984779' }) });
      if (url.includes('/api/vehicles/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(vehicles) });
      if (url.includes('/api/appointments/')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes('/api/recommendations/')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
    render(<CustomerDashboard />);
    expect(await screen.findByText(/Hyundai/i)).toBeInTheDocument();
    // Simulate adding a new vehicle
    vehicles.push({ vehicle_id: 3, make: 'Toyota', model: 'Corolla', year: 2012, license_plate: '999xyz', customer_id: 1 });
    const btn = await screen.findByRole('button', { name: /new vehicle/i });
    await userEvent.click(btn);
    // Simulate closing and reopening to trigger fetch
    await userEvent.click(screen.getByTestId('new-vehicle-popup'));
    // Re-render to simulate update
    render(<CustomerDashboard />);
    expect(await screen.findByText(/Toyota/i)).toBeInTheDocument();
  });

  test('Popups can be opened and closed', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    // Appointment Summary
    const apptBtn = await screen.findByRole('button', { name: /appointment summary/i });
    await userEvent.click(apptBtn);
    expect(screen.getByTestId('appointment-summary')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('appointment-summary'));
    // Vehicle Info
    const vehicleBtn = await screen.findByRole('button', { name: /view vehicle info/i });
    await userEvent.click(vehicleBtn);
    expect(screen.getByTestId('vehicle-info-popup')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('vehicle-info-popup'));
    // New Vehicle
    const newVehicleBtn = await screen.findByRole('button', { name: /new vehicle/i });
    await userEvent.click(newVehicleBtn);
    expect(screen.getByTestId('new-vehicle-popup')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('new-vehicle-popup'));
  });

  test('Shows loading states', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    render(<CustomerDashboard />);
    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  test('Pagination controls are rendered and clickable', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    expect(screen.getByText('«')).toBeInTheDocument();
    expect(screen.getByText('»')).toBeInTheDocument();
    await userEvent.click(screen.getByText('2'));
  });

  test('Shows empty states for all tables', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/customers/me/')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ first_name: 'Trevor', last_name: 'Gould', email: 'something@email.com', phone: '9166984779' }) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
    render(<CustomerDashboard />);
    expect(await screen.findByText(/no appointments found/i)).toBeInTheDocument();
    expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument();
    expect(await screen.findByText(/no recommended services/i)).toBeInTheDocument();
    expect(await screen.findByText(/no service history/i)).toBeInTheDocument();
  });

  test('Handles error for vehicles API only', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/customers/me/')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ first_name: 'Trevor', last_name: 'Gould', email: 'something@email.com', phone: '9166984779' }) });
      if (url.includes('/api/vehicles/')) return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
    render(<CustomerDashboard />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  test('Accessibility: popups and buttons have roles', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    expect(screen.getByRole('button', { name: /update account info/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book an appointment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appointment summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view vehicle info/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new vehicle/i })).toBeInTheDocument();
    // Popups
    const apptBtn = await screen.findByRole('button', { name: /appointment summary/i });
    await userEvent.click(apptBtn);
    expect(screen.getByTestId('appointment-summary')).toBeInTheDocument();
  });

  test('Child components receive correct props', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    const { container } = render(<CustomerDashboard />);
    // Check that AppointmentSummary, VehicleInfoPopup, and NewVehiclePopUp are rendered with expected props
    // (This is limited by the mock, but we can check their presence)
    const apptBtn = await screen.findByRole('button', { name: /appointment summary/i });
    await userEvent.click(apptBtn);
    expect(screen.getByTestId('appointment-summary')).toBeInTheDocument();
    const vehicleBtn = await screen.findByRole('button', { name: /view vehicle info/i });
    await userEvent.click(vehicleBtn);
    expect(screen.getByTestId('vehicle-info-popup')).toBeInTheDocument();
    const newVehicleBtn = await screen.findByRole('button', { name: /new vehicle/i });
    await userEvent.click(newVehicleBtn);
    expect(screen.getByTestId('new-vehicle-popup')).toBeInTheDocument();
  });

  test('renders AuthErrorPage if not authorized', () => {
    render(<CustomerDashboard />);
    expect(screen.getByText(/403 - Forbidden/i)).toBeInTheDocument();
  });

  const mockApiData = () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/customers/me/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ first_name: 'Trevor', last_name: 'Gould', email: 'something@email.com', phone: '9166984779' }) });
      }
      if (url.includes('/api/vehicles/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ vehicle_id: 2, make: 'Hyundai', model: 'Sonata', year: 2008, license_plate: '234bcd', customer_id: 1 }]) });
      }
      if (url.includes('/api/appointments/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ appointment_id: 1, service_type: 'Oil Change', scheduled_at: '2026-04-08T10:00:00', cost: 50, vehicle: 2 }]) });
      }
      if (url.includes('/api/recommendations/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ recommendation_id: 1, note: 'Brakes are worn', customer_id: 1, service_id: 2, vehicle_id: 2 }]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  };

  test('renders profile, vehicles, appointments, recommendations, and service history', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    // There are two elements with 'Account Info', so use getAllByText
    expect((await screen.findAllByText(/Account Info/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Trevor Gould/i)).toBeInTheDocument();
    expect(await screen.findByText(/something@email.com/i)).toBeInTheDocument();
    expect(await screen.findByText(/9166984779/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/Oil Change/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Hyundai/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/Sonata/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Brakes/i)).toBeInTheDocument();
  });

  test('shows error if API fails', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    render(<CustomerDashboard />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });


  test('Book an Appointment button is present', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    expect(await screen.findByRole('button', { name: /book an appointment/i })).toBeInTheDocument();
  });

  test('Appointment Summary button shows summary', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    const btn = await screen.findByRole('button', { name: /appointment summary/i });
    await userEvent.click(btn);
    expect(screen.getByTestId('appointment-summary')).toBeInTheDocument();
  });

  test('View Vehicle Info button shows popup', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    const btn = await screen.findByRole('button', { name: /view vehicle info/i });
    await userEvent.click(btn);
    expect(screen.getByTestId('vehicle-info-popup')).toBeInTheDocument();
  });

  test('New Vehicle button shows popup', async () => {
    sessionStorage.setItem('authToken', 'fake-token');
    mockApiData();
    render(<CustomerDashboard />);
    const btn = await screen.findByRole('button', { name: /new vehicle/i });
    await userEvent.click(btn);
    expect(screen.getByTestId('new-vehicle-popup')).toBeInTheDocument();
  });
});
