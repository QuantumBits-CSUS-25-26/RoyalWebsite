import React from 'react';
import '@testing-library/jest-dom';
const { render, screen, cleanup, fireEvent, waitFor } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
const Appointments = require('../Pages/Appointments').default;
const Header = require('../Components/Header').default;
const SideNavbar = require('../Components/SideNavbar').default;
const { UiProvider } = require('../Components/ServicePopUp/UiContext');
const { MobileNavProvider } = require('../Components/MobileNavContext');

function renderWithProviders(ui) {
	return render(
		React.createElement(MemoryRouter, null,
			React.createElement(UiProvider, null,
				React.createElement(MobileNavProvider, null, ui)
			)
		)
	);
}

describe('Customer appointments page', () => {
	beforeEach(() => {
		cleanup();
		// mock fetch for the create appointment call
		global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) }));
	});

	afterEach(() => {
		jest.resetAllMocks();
		delete global.fetch;
	});

	test('renders appointment steps, header and side nav', async () => {
		renderWithProviders(React.createElement(React.Fragment, null,
			React.createElement(Header),
			React.createElement(SideNavbar),
			React.createElement(Appointments)
		));

		expect(await screen.findByText(/Vehicle Information/i)).toBeInTheDocument();
		expect(await screen.findByText(/Date and Time/i)).toBeInTheDocument();
		expect(await screen.findByText(/Contact Information/i)).toBeInTheDocument();
		expect(screen.getByText(/Royal Auto/i)).toBeInTheDocument();
		expect(screen.getByText(/Schedule/i)).toBeInTheDocument();
		expect(screen.getByText(/Account/i)).toBeInTheDocument();
	});

	test('can fill fields and submitting creates an appointment', async () => {
		renderWithProviders(React.createElement(React.Fragment, null,
			React.createElement(Appointments)
		));

		// fill vehicle fields
		fireEvent.change(screen.getByPlaceholderText(/e.g. 2020/i), { target: { value: '2021' } });
		fireEvent.change(screen.getByPlaceholderText(/e.g. Toyota/i), { target: { value: 'Honda' } });
		fireEvent.change(screen.getByPlaceholderText(/e.g. Camry/i), { target: { value: 'Civic' } });
		fireEvent.change(screen.getByPlaceholderText(/e.g. ABC1234/i), { target: { value: 'ABC-123' } });

		// pick the first enabled calendar day (buttons are labeled like "Select Mon Apr 12 2026")
		const dayButtons = await screen.findAllByRole('button', { name: /^Select /i });
		const selectable = dayButtons.find((b) => !b.disabled);
		expect(selectable).toBeDefined();
		fireEvent.click(selectable);

		// wait for Available Times to render and click the first time slot (query by button label like 8AM)
		await screen.findByText(/Available Times/i);
		const timeButtons = await screen.findAllByRole('button', { name: /^[0-9]+(AM|PM)$/i });
		if (timeButtons.length > 0) fireEvent.click(timeButtons[0]);

		// fill contact info
		fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'Jane' } });
		fireEvent.change(screen.getByPlaceholderText(/e.g. Doe/i), { target: { value: 'Smith' } });
		fireEvent.change(screen.getByPlaceholderText(/john.doe@example.com/i), { target: { value: 'jane@smith.com' } });
		fireEvent.change(screen.getByPlaceholderText(/e.g. 123-456-7890/i), { target: { value: '555-1212' } });

		// enable email notifications
		const emailCheckbox = screen.getByLabelText(/Notify by Email/i);
		fireEvent.click(emailCheckbox);

		// submit form
		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		await waitFor(() => expect(global.fetch).toHaveBeenCalled());

		const calledWith = global.fetch.mock.calls[0];
		const body = JSON.parse(calledWith[1].body);
		expect(body.vehicle.license_plate).toBe('ABC-123');
		expect(body.contact.first_name).toBe('Jane');
		expect(body.contact.email).toBe('jane@smith.com');
		expect(body.service_type).toBeTruthy();
	});

	test('shows license plate validation errors', async () => {
		renderWithProviders(React.createElement(Appointments));

		const licenseInput = screen.getByPlaceholderText(/e.g. ABC1234/i);

		// ensure empty -> shows required error
		expect(licenseInput.value).toBe('');
		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
		expect(await screen.findByText(/License plate is required\./i)).toBeInTheDocument();

		// invalid format -> shows invalid format error
		fireEvent.change(licenseInput, { target: { value: '!@#' } });
		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
		expect(await screen.findByText(/Invalid license plate format\./i)).toBeInTheDocument();
	});
});
