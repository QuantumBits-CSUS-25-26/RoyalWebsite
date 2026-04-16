import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import VehicleInfoPopup from '../Components/VehicleInfoPopup.js';
const mockVehicles = [
  { vehicle_id: 1, make: 'Toyota', model: 'Camry', year: 2020, license_plate: 'ABC123' },
  { vehicle_id: 2, make: 'Honda', model: 'Civic', year: 2015, license_plate: 'DANGER' }
];

const mockAppointments = [
  { id: 1, service_type: 'Oil Change', scheduled_at: '2024-01-01T10:00:00', cost: 50, vehicle: { vehicle_id: 1 } },
  { id: 2, service_type: 'Tire Rotation', scheduled_at: '2024-02-01T10:00:00', cost: 30, vehicle: { vehicle_id: 1 } },
  { id: 3, service_type: 'Brake Inspection', scheduled_at: '2024-03-01T10:00:00', cost: 40, vehicle: { vehicle_id: 2 } }
];

describe('VehicleInfoPopup', () => {
  it('renders vehicle info and service history for selected vehicle', () => {
    render(
      <VehicleInfoPopup
        isOpen={true}
        onClose={() => {}}
        vehicles={mockVehicles}
        appointments={mockAppointments}
      />
    );

    //should show info for the first vehicle by default
    const vehicleInfo = screen.getByText('Vehicle Information').closest('div');
    expect(within(vehicleInfo).getByText(/Toyota/)).toBeInTheDocument();
    expect(within(vehicleInfo).getByText(/Camry/)).toBeInTheDocument();
    expect(within(vehicleInfo).getByText(/2020/)).toBeInTheDocument();
    expect(within(vehicleInfo).getByText(/ABC123/)).toBeInTheDocument();

    //should show service history for vehicle 1
    const serviceHistorySection = screen.getByText('Service History').closest('div');
    const lists = within(serviceHistorySection).getAllByRole('list');
    //service history
    const serviceHistoryList = lists[0]; 
    //maintenance checklist
    const checklistList = lists[1]; 
    expect(within(serviceHistoryList).getByText(/Oil Change/)).toBeInTheDocument();
    expect(within(serviceHistoryList).getByText(/Tire Rotation/)).toBeInTheDocument();
    expect(within(serviceHistoryList).queryByText(/Brake Inspection/)).not.toBeInTheDocument();

    //simulate selecting the second vehicle
    fireEvent.change(screen.getByLabelText(/Select Vehicle/i), { target: { value: '2' } });

    //should show info for the second vehicle
    const vehicleInfo2 = screen.getByText('Vehicle Information').closest('div');
    expect(within(vehicleInfo2).getByText(/Honda/)).toBeInTheDocument();
    expect(within(vehicleInfo2).getByText(/Civic/)).toBeInTheDocument();
    expect(within(vehicleInfo2).getByText(/2015/)).toBeInTheDocument();
    expect(within(vehicleInfo2).getByText(/DANGER/)).toBeInTheDocument();

    //should show service history for vehicle 2
    const serviceHistorySection2 = screen.getByText('Service History').closest('div');
    const lists2 = within(serviceHistorySection2).getAllByRole('list');
    const serviceHistoryList2 = lists2[0];
    expect(within(serviceHistoryList2).getByText(/Brake Inspection/)).toBeInTheDocument();
    expect(within(serviceHistoryList2).queryByText(/Oil Change/)).not.toBeInTheDocument();
  });
});