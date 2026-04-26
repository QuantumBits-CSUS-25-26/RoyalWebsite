
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactInfoS4 from '../Components/ContactInfoS4';
import renderer from 'react-test-renderer';

describe('ContactInfoS4', () => {
	const defaultProps = {
		contactInfo: {
			fname: 'John',
			lname: 'Doe',
			email: 'john.doe@example.com',
			phone: '123-456-7890',
			notifPref: { email: true, text: false },
		},
		onFieldChange: jest.fn(),
		onNotifChange: jest.fn(),
		onSubmit: jest.fn((e) => e.preventDefault()),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders all input fields and buttons', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		expect(screen.getByPlaceholderText('e.g. John')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('e.g. Doe')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('e.g. john.doe@example.com')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('e.g. 123-456-7890')).toBeInTheDocument();
		expect(screen.getByLabelText(/Notify by Email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Notify by Text Message/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
	});

	it('shows correct values from contactInfo', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		expect(screen.getByPlaceholderText('e.g. John')).toHaveValue('John');
		expect(screen.getByPlaceholderText('e.g. Doe')).toHaveValue('Doe');
		expect(screen.getByPlaceholderText('e.g. john.doe@example.com')).toHaveValue('john.doe@example.com');
		expect(screen.getByPlaceholderText('e.g. 123-456-7890')).toHaveValue('123-456-7890');
		expect(screen.getByLabelText(/Notify by Email/i)).toBeChecked();
		expect(screen.getByLabelText(/Notify by Text Message/i)).not.toBeChecked();
	});

	it('calls onFieldChange when typing in fields', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'Jane' } });
		expect(defaultProps.onFieldChange).toHaveBeenCalled();
		fireEvent.change(screen.getByPlaceholderText('e.g. Doe'), { target: { value: 'Smith' } });
		expect(defaultProps.onFieldChange).toHaveBeenCalled();
		fireEvent.change(screen.getByPlaceholderText('e.g. john.doe@example.com'), { target: { value: 'jane@example.com' } });
		expect(defaultProps.onFieldChange).toHaveBeenCalled();
		fireEvent.change(screen.getByPlaceholderText('e.g. 123-456-7890'), { target: { value: '555-555-5555' } });
		expect(defaultProps.onFieldChange).toHaveBeenCalled();
	});

	it('calls onNotifChange when toggling notification checkboxes', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		fireEvent.click(screen.getByLabelText(/Notify by Email/i));
		expect(defaultProps.onNotifChange).toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText(/Notify by Text Message/i));
		expect(defaultProps.onNotifChange).toHaveBeenCalled();
	});

	it('calls onSubmit when submitting the form', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: /submit/i }));
		expect(defaultProps.onSubmit).toHaveBeenCalled();
	});

	it('associates labels with inputs for accessibility', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		expect(screen.getByLabelText('First Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
	});

	it('handles missing contactInfo gracefully', () => {
		render(<ContactInfoS4 />);
		expect(screen.getByPlaceholderText('e.g. John')).toHaveValue('');
		expect(screen.getByPlaceholderText('e.g. Doe')).toHaveValue('');
		expect(screen.getByPlaceholderText('e.g. john.doe@example.com')).toHaveValue('');
		expect(screen.getByPlaceholderText('e.g. 123-456-7890')).toHaveValue('');
		expect(screen.getByLabelText(/Notify by Email/i)).not.toBeChecked();
		expect(screen.getByLabelText(/Notify by Text Message/i)).not.toBeChecked();
	});

	it('handles missing notifPref gracefully', () => {
		const props = {
			...defaultProps,
			contactInfo: { ...defaultProps.contactInfo, notifPref: undefined },
		};
		render(<ContactInfoS4 {...props} />);
		expect(screen.getByLabelText(/Notify by Email/i)).not.toBeChecked();
		expect(screen.getByLabelText(/Notify by Text Message/i)).not.toBeChecked();
	});
	
	it('prevents default on form submit', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		const form = screen.getByRole('button', { name: /submit/i }).closest('form');
		// Simulate submit event
		fireEvent.submit(form);
		expect(defaultProps.onSubmit).toHaveBeenCalled();
	});

    it('calls onFieldChange with correct event when typing in fields', () => {
        render(<ContactInfoS4 {...defaultProps} />);
        const input = screen.getByPlaceholderText('e.g. John');
        fireEvent.change(input, { target: { name: 'fname', value: 'Jane' } });
        expect(defaultProps.onFieldChange).toHaveBeenCalled();
        const event = defaultProps.onFieldChange.mock.calls[0][0];
        expect(event.target.name).toBe('fname');
    });

	it('passes correct event details to onNotifChange', () => {
		render(<ContactInfoS4 {...defaultProps} />);
		const checkbox = screen.getByLabelText(/Notify by Email/i);
		fireEvent.click(checkbox);
		const event = defaultProps.onNotifChange.mock.calls[0][0];
		expect(event.target.name).toBe('email');
		expect(typeof event.target.checked).toBe('boolean');
	});

	it('matches snapshot', () => {
		const tree = renderer.create(<ContactInfoS4 {...defaultProps} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
