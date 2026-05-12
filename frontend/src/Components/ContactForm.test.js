import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';

jest.mock('../config', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

global.fetch = jest.fn();

describe('ContactForm', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        fetch.mockClear();
        mockOnClose.mockClear();

        window.alert = jest.fn();
    });

    test('renders contact form when open', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([{ phone: '(916) 562-9441', address: '2546 Tower Ave' }]),
        });

        render(<ContactForm isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Comments/ Message')).toBeInTheDocument();

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/business-info/');
        });
    });

    test('shows validation alert when required fields are missing', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([{ phone: '(916) 562-9441', address: '2546 Tower Ave' }]),
        });

        render(<ContactForm isOpen={true} onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalled();
        });

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('submits form successfully with valid input', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ([{ phone: '(916) 562-9441', address: '2546 Tower Ave' }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message_id: 1,
                    first_name: 'John',
                    last_name: 'Doe',
                    phone_number: '9485556324',
                    email: 'example@example.com',
                    message: 'example comment',
                    response: false,
                    current_customer: true,
                    read: false,
                }),
            });

        render(<ContactForm isOpen={true} onClose={mockOnClose} />);

        fireEvent.change(screen.getByPlaceholderText('First Name'), {
            target: { name: 'first_name', value: 'John' },
        });

        fireEvent.change(screen.getByPlaceholderText('Last Name'), {
            target: { name: 'last_name', value: 'Doe' },
        });

        fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
            target: { name: 'phone_number', value: '9485556324' },
        });

        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { name: 'email', value: 'example@example.com' },
        });

        fireEvent.change(screen.getByPlaceholderText('Comments/ Message'), {
            target: { name: 'message', value: 'example comment' },
        });

        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]); // response
        fireEvent.click(checkboxes[1]); // current_customer

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/contact/',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: 'John',
                        last_name: 'Doe',
                        phone_number: '9485556324',
                        email: 'example@example.com',
                        message: 'example comment',
                        response: true,
                        current_customer: true,
                    }),
                })
            );
        });

        expect(window.alert).toHaveBeenCalledWith('Form submitted successfully!');
        expect(mockOnClose).toHaveBeenCalled();
    });
});