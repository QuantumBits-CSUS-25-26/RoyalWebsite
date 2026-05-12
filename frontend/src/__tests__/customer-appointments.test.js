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
		React.createElement(
			MemoryRouter,
			null,
			React.createElement(
				UiProvider,
				null,
				React.createElement(MobileNavProvider, null, ui)
			)
		)
	);
}

describe('Customer appointments page', () => {
	beforeEach(() => {
		cleanup();

		global.fetch = jest.fn((url, options) => {
			if (!options) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve([
							{
								service_id: 1,
								name: 'Oil Change',
								is_active: true,
								display_order: 1
							},
							{
								service_id: 2,
								name: 'Brake Inspection',
								is_active: true,
								display_order: 2
							}
						])
				});
			}

			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ id: 1 })
			});
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
		delete global.fetch;
	});

	test('renders appointment steps, header and side nav', async () => {
		renderWithProviders(
			React.createElement(
				React.Fragment,
				null,
				React.createElement(Header),
				React.createElement(SideNavbar),
				React.createElement(Appointments)
			)
		);

		expect(await screen.findByText(/Vehicle Information/i)).toBeInTheDocument();
		expect(screen.getByText(/Service Selection/i)).toBeInTheDocument();
		expect(screen.getByText(/Date and Time/i)).toBeInTheDocument();
		expect(screen.getByText(/Contact Information/i)).toBeInTheDocument();
		expect(screen.getByText(/Royal Auto/i)).toBeInTheDocument();
		expect(screen.getByText(/Schedule/i)).toBeInTheDocument();
		expect(screen.getByText(/Account/i)).toBeInTheDocument();
	});

	test('can fill fields and submitting creates an appointment', async () => {
		renderWithProviders(React.createElement(Appointments));

		const serviceOption = await screen.findByText(/Oil Change/i);
		fireEvent.click(serviceOption);

		fireEvent.change(screen.getByPlaceholderText('e.g. 2020'), {
			target: { value: '2021' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Toyota'), {
			target: { value: 'Honda' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Camry'), {
			target: { value: 'Civic' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. ABC1234'), {
			target: { value: 'ABC-123' }
		});

		const dayButtons = await screen.findAllByRole('button', { name: /^Select /i });
		const selectableDay = dayButtons.find((button) => !button.disabled);
		expect(selectableDay).toBeDefined();
		fireEvent.click(selectableDay);

		expect(await screen.findByText(/Available Times/i)).toBeInTheDocument();
		const timeButtons = await screen.findAllByRole('button');
		const selectableTime = timeButtons.find((button) =>
			/^[0-9]+(?::[0-9]{2})?\s?(AM|PM)$/i.test((button.textContent || '').trim())
		);
		expect(selectableTime).toBeDefined();
		fireEvent.click(selectableTime);

		fireEvent.change(screen.getByPlaceholderText('e.g. John'), {
			target: { value: 'Jane' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Doe'), {
			target: { value: 'Smith' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. john.doe@example.com'), {
			target: { value: 'jane@smith.com' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. 123-456-7890'), {
			target: { value: '555-1212' }
		});

		fireEvent.click(screen.getByLabelText(/Notify by Email/i));
		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		await waitFor(() => {
			const postCall = global.fetch.mock.calls.find(([, options]) => options?.method === 'POST');
			expect(postCall).toBeTruthy();
		});

		const postCall = global.fetch.mock.calls.find(([, options]) => options?.method === 'POST');
		const body = JSON.parse(postCall[1].body);

		expect(body.vehicle.license_plate).toBe('ABC-123');
		expect(body.vehicle.year).toBe('2021');
		expect(body.vehicle.manufacturer).toBe('Honda');
		expect(body.vehicle.model).toBe('Civic');

		expect(body.contact.first_name).toBe('Jane');
		expect(body.contact.last_name).toBe('Smith');
		expect(body.contact.email).toBe('jane@smith.com');
		expect(body.contact.phone).toBe('555-1212');
		expect(body.contact.notify_email).toBe(true);

		expect(body.appointment.date).toBeTruthy();
		expect(body.appointment.time).toBeTruthy();
		expect(body.service_type).toBe('Oil Change');
	});

	test('shows service selection error before license plate validation', async () => {
		renderWithProviders(React.createElement(Appointments));

		const licenseInput = screen.getByPlaceholderText('e.g. ABC1234');
		expect(licenseInput.value).toBe('');

		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		expect(await screen.findByText(/Please select a service\./i)).toBeInTheDocument();
		expect(screen.queryByText(/License plate is required\./i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Invalid license plate format\./i)).not.toBeInTheDocument();
	});

	test('shows contact info error before date and vehicle validation when service is selected', async () => {
		renderWithProviders(React.createElement(Appointments));

		const serviceOption = await screen.findByText(/Oil Change/i);
		fireEvent.click(serviceOption);

		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		expect(
			await screen.findByText(/First name, last name, and email are required\./i)
		).toBeInTheDocument();
		expect(screen.queryByText(/License plate is required\./i)).not.toBeInTheDocument();
	});

	test('shows date and time error before vehicle validation when service and required contact info are provided', async () => {
		renderWithProviders(React.createElement(Appointments));

		const serviceOption = await screen.findByText(/Oil Change/i);
		fireEvent.click(serviceOption);

		fireEvent.change(screen.getByPlaceholderText('e.g. John'), {
			target: { value: 'Jane' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Doe'), {
			target: { value: 'Smith' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. john.doe@example.com'), {
			target: { value: 'jane@smith.com' }
		});

		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		expect(await screen.findByText(/Please select a date and time\./i)).toBeInTheDocument();
		expect(screen.queryByText(/License plate is required\./i)).not.toBeInTheDocument();
	});

	test('shows license plate required after service, contact info, and date/time are provided', async () => {
		renderWithProviders(React.createElement(Appointments));

		const serviceOption = await screen.findByText(/Oil Change/i);
		fireEvent.click(serviceOption);

		fireEvent.change(screen.getByPlaceholderText('e.g. John'), {
			target: { value: 'Jane' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Doe'), {
			target: { value: 'Smith' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. john.doe@example.com'), {
			target: { value: 'jane@smith.com' }
		});

		const dayButtons = await screen.findAllByRole('button', { name: /^Select /i });
		const selectableDay = dayButtons.find((button) => !button.disabled);
		expect(selectableDay).toBeDefined();
		fireEvent.click(selectableDay);

		expect(await screen.findByText(/Available Times/i)).toBeInTheDocument();
		const timeButtons = await screen.findAllByRole('button');
		const selectableTime = timeButtons.find((button) =>
			/^[0-9]+(?::[0-9]{2})?\s?(AM|PM)$/i.test((button.textContent || '').trim())
		);
		expect(selectableTime).toBeDefined();
		fireEvent.click(selectableTime);

		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		expect(await screen.findByText(/License plate is required\./i)).toBeInTheDocument();
		expect(screen.getByText(/Please fix the vehicle information\./i)).toBeInTheDocument();
	});

	test('shows invalid license plate format after earlier requirements are satisfied', async () => {
		renderWithProviders(React.createElement(Appointments));

		const serviceOption = await screen.findByText(/Oil Change/i);
		fireEvent.click(serviceOption);

		fireEvent.change(screen.getByPlaceholderText('e.g. John'), {
			target: { value: 'Jane' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. Doe'), {
			target: { value: 'Smith' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. john.doe@example.com'), {
			target: { value: 'jane@smith.com' }
		});
		fireEvent.change(screen.getByPlaceholderText('e.g. ABC1234'), {
			target: { value: '!@#' }
		});

		const dayButtons = await screen.findAllByRole('button', { name: /^Select /i });
		const selectableDay = dayButtons.find((button) => !button.disabled);
		expect(selectableDay).toBeDefined();
		fireEvent.click(selectableDay);

		expect(await screen.findByText(/Available Times/i)).toBeInTheDocument();
		const timeButtons = await screen.findAllByRole('button');
		const selectableTime = timeButtons.find((button) =>
			/^[0-9]+(?::[0-9]{2})?\s?(AM|PM)$/i.test((button.textContent || '').trim())
		);
		expect(selectableTime).toBeDefined();
		fireEvent.click(selectableTime);

		fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

		expect(await screen.findByText(/Invalid license plate format\./i)).toBeInTheDocument();
		expect(screen.getByText(/Please fix the vehicle information\./i)).toBeInTheDocument();
	});
});