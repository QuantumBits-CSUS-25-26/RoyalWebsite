import React from 'react';
import '@testing-library/jest-dom';
const { render, screen, cleanup, fireEvent, waitFor } = require('@testing-library/react');
const AdminAppointment = require('../Pages/AdminPages/Appointments').default;

// Stub FullCalendar to a lightweight test component that renders passed events
jest.mock('@fullcalendar/react', () => ({
	__esModule: true,
	default: ({ events = [] }) => {
		const React = require('react');
		return React.createElement(
			'div',
			{ 'data-testid': 'fullcalendar' },
			events.map((e) => React.createElement('div', { key: e.id, 'data-testid': 'event' }, e.title)),
		);
	},
}));



describe('Admin Appointments page', () => {
	let fetchSpy;

	beforeEach(() => {
		cleanup();
		sessionStorage.clear();
		localStorage.clear();

		// add an auth token so component renders instead of AuthErrorPage
		sessionStorage.setItem('authToken', 'fake-token');

		fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((url, opts) => {
			// Admin appointments
			if (typeof url === 'string' && url.includes('/api/admin/appointments/')) {
				return Promise.resolve({ ok: true, json: async () => [{ appointment_id: 1, service_type: 'Oil Change', scheduled_at: '2026-04-10T10:00:00', finished_at: null, status: 'upcoming' }] });
			}
			// Admin vehicles
			if (typeof url === 'string' && url.includes('/api/admin/vehicles/')) {
				return Promise.resolve({ ok: true, json: async () => [{ vehicle_id: 11, make: 'Toyota', model: 'Camry', year: 2015, license_plate: 'ABC123', customer: { first_name: 'John', last_name: 'Doe', phone: '555-1234' } }] });
			}
			// Services
			if (typeof url === 'string' && url.includes('/api/services/')) {
				return Promise.resolve({ ok: true, json: async () => [{ service_id: 21, name: 'Oil Change', cost: 29.99 }] });
			}
			// Create appointment
			if (typeof url === 'string' && url.includes('/api/appointments/') && opts && opts.method === 'POST') {
				const body = JSON.parse(opts.body || '{}');
				return Promise.resolve({ ok: true, json: async () => ({ appointment_id: 2, service_type: body.service_type, scheduled_at: body.scheduled_at }) });
			}

			return Promise.resolve({ ok: true, json: async () => [] });
		});
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		cleanup();
		sessionStorage.clear();
		localStorage.clear();
	});

	test('renders sidebar, calendar and New Appointment button with events', async () => {
		render(React.createElement(AdminAppointment));

		// Wait for calendar stub to appear
		expect(await screen.findByTestId('fullcalendar')).toBeInTheDocument();

		// New Appointment button
		expect(screen.getByText('+ New Appointment')).toBeInTheDocument();

		// Ensure at least one event from mocked appointments is rendered
		const events = await screen.findAllByTestId('event');
		expect(events.length).toBeGreaterThanOrEqual(1);
		expect(events[0]).toHaveTextContent(/Oil Change/i);
	});

	test('create modal opens, fields are fillable and Cancel closes it', async () => {
		render(React.createElement(AdminAppointment));

		// open modal
		fireEvent.click(await screen.findByText('+ New Appointment'));

		const modalHeading = await screen.findByText(/Create Appointment/i);
		expect(modalHeading).toBeInTheDocument();

		// selects and input should be present and fillable (query entire document)
		const selects = screen.getAllByRole('combobox');
		expect(selects.length).toBeGreaterThanOrEqual(2);
		// choose the vehicle option
		fireEvent.change(selects[0], { target: { value: '11' } });
		// choose the service option
		fireEvent.change(selects[1], { target: { value: 'Oil Change' } });

		const datetime = screen.getByLabelText(/scheduled-at/i);
		expect(datetime).toBeInTheDocument();
		fireEvent.change(datetime, { target: { value: '2026-05-01T09:30' } });

		// Cancel should close modal (use accessible button query)
		const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
		fireEvent.click(cancelBtn);
		await waitFor(() => expect(screen.queryByText(/Create Appointment/i)).not.toBeInTheDocument());
	});

	test('Save creates an appointment and calendar updates', async () => {
		render(React.createElement(AdminAppointment));

		// initial events count
		const initialEvents = await screen.findAllByTestId('event');
		const initialCount = initialEvents.length;

		// open modal
		fireEvent.click(screen.getByText('+ New Appointment'));
		await screen.findByText(/Create Appointment/i);

		const selects = screen.getAllByRole('combobox');
		fireEvent.change(selects[0], { target: { value: '11' } });
		fireEvent.change(selects[1], { target: { value: 'Oil Change' } });

		const datetime = screen.getByLabelText(/scheduled-at/i);
		fireEvent.change(datetime, { target: { value: '2026-05-01T09:30' } });

		// click Save
		const saveBtn = screen.getByRole('button', { name: /Save/i });
		fireEvent.click(saveBtn);

		// Wait for modal to close and calendar to show the additional event
		await waitFor(() => expect(screen.queryByText(/Create Appointment/i)).not.toBeInTheDocument());
		const afterEvents = await screen.findAllByTestId('event');
		expect(afterEvents.length).toBeGreaterThan(initialCount);
	});
});


