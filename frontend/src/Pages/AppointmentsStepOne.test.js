import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppStepOne from "./AppointmentComponents/AppStepOne";

describe("Appointments Step One", () => {
	test("allows filling all vehicle fields and calls onVehicleChange", async () => {
		const onVehicleChange = jest.fn();

		render(
			<MemoryRouter>
				<AppStepOne vehicleInfo={{}} onVehicleChange={onVehicleChange} errors={{}} />
			</MemoryRouter>
		);

		const yearInput = screen.getByPlaceholderText(/e.g. 2020/i);
		const manufacturerInput = screen.getByPlaceholderText(/e.g. Toyota/i);
		const modelInput = screen.getByPlaceholderText(/e.g. Camry/i);
		const plateInput = screen.getByPlaceholderText(/e.g. ABC1234/i);

		// use change events with full values so onVehicleChange receives full value
		fireEvent.change(yearInput, { target: { value: '2021' } });
		fireEvent.change(manufacturerInput, { target: { value: 'Honda' } });
		fireEvent.change(modelInput, { target: { value: 'Civic' } });
		fireEvent.change(plateInput, { target: { value: 'XYZ1234' } });

		const calls = onVehicleChange.mock.calls;

		expect(calls.some(c => c[0] === 'year' && c[1] === '2021')).toBeTruthy();
		expect(calls.some(c => c[0] === 'manufacturer' && c[1] === 'Honda')).toBeTruthy();
		expect(calls.some(c => c[0] === 'model' && c[1] === 'Civic')).toBeTruthy();
		expect(calls.some(c => c[0] === 'license_plate' && c[1] === 'XYZ1234')).toBeTruthy();
	});

	test("renders license plate error when present and hides when not", () => {
		const errorMessage = "Invalid license plate format";

		const { rerender } = render(
			<MemoryRouter>
				<AppStepOne vehicleInfo={{}} onVehicleChange={() => {}} errors={{ license_plate: errorMessage }} />
			</MemoryRouter>
		);

		// error should be visible when passed in errors prop
		expect(screen.getByText(errorMessage)).toBeInTheDocument();

		// rerender with no errors — message should not be present
		rerender(
			<MemoryRouter>
				<AppStepOne vehicleInfo={{}} onVehicleChange={() => {}} errors={{}} />
			</MemoryRouter>
		);

		expect(screen.queryByText(errorMessage)).toBeNull();
	});
});