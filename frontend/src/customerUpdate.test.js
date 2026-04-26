import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CustomerUpdate from './Pages/CustomerUpdate';
import axios from 'axios';
jest.mock('axios');

describe('CustomerUpdate page', () => {
    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders AuthErrorPage if not authorized', async () => {
        // No authToken and no user
        render(<CustomerUpdate />);
        expect(await screen.findByText(/403 - Forbidden/i)).toBeInTheDocument();
    });

    test('shows error for invalid email format', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        await userEvent.clear(screen.getByLabelText('Email'));
        await userEvent.type(screen.getByLabelText('Email'), 'invalid-email');
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
    });

    test('shows error for invalid phone number format', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        await userEvent.clear(screen.getByLabelText('Phone Number'));
        await userEvent.type(screen.getByLabelText('Phone Number'), '12345');
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(await screen.findByText(/Invalid phone number/i)).toBeInTheDocument();
    });

    test('shows error if passwords do not match', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        await userEvent.type(screen.getByLabelText('New Password'), 'password123');
        await userEvent.type(screen.getByLabelText('Confirm New Password'), 'differentpass');
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    test('shows error if password is too short', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        await userEvent.type(screen.getByLabelText('New Password'), 'short');
        await userEvent.type(screen.getByLabelText('Confirm New Password'), 'short');
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(await screen.findByText(/Password must be 8\+ chars/i)).toBeInTheDocument();
    });

    test('form fields are pre-filled with current user data', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        expect(screen.getByLabelText('First Name')).toHaveValue('John');
        expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Phone Number')).toHaveValue('123-456-7890');
    });

    test('does not call axios.put if validation fails', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        await userEvent.clear(screen.getByLabelText('First Name'));
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(axios.put).not.toHaveBeenCalled();
    });

    test('calls axios.put with correct data', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        axios.put.mockResolvedValueOnce({ data: { success: true } });
        window.alert = jest.fn();
        render(<CustomerUpdate />);
        await userEvent.clear(screen.getByLabelText('First Name'));
        await userEvent.type(screen.getByLabelText('First Name'), 'Jane');
        await userEvent.clear(screen.getByLabelText('Last Name'));
        await userEvent.type(screen.getByLabelText('Last Name'), 'Smith');
        await userEvent.clear(screen.getByLabelText('Email'));
        await userEvent.type(screen.getByLabelText('Email'), 'jane.smith@example.com');
        await userEvent.clear(screen.getByLabelText('Phone Number'));
        await userEvent.type(screen.getByLabelText('Phone Number'), '555-555-5555');
        await userEvent.clear(screen.getByLabelText('New Password'));
        await userEvent.type(screen.getByLabelText('New Password'), 'password123');
        await userEvent.clear(screen.getByLabelText('Confirm New Password'));
        await userEvent.type(screen.getByLabelText('Confirm New Password'), 'password123');
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/api/customers/update/'),
                expect.objectContaining({
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    phoneNumber: '555-555-5555',
                    password: 'password123',
                    confirmPassword: 'password123',
                })
            );
        });
    });
    test('renders CustomerUpdate page when authToken present', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        expect(await screen.findByText(/Update Account Information/i)).toBeInTheDocument();
    });

    test('shows validation errors for invalid input', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        render(<CustomerUpdate />);
        // Clear first name
        await userEvent.clear(screen.getByLabelText(/First Name/i));
        await userEvent.click(screen.getByRole('button', { name: /update/i }));
        expect(await screen.findByText(/First name required/i)).toBeInTheDocument();
    });

    test('submits form and shows success alert', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        axios.put.mockResolvedValueOnce({ data: { success: true } });
        window.alert = jest.fn();
        render(<CustomerUpdate />);

        // Fill out form with valid data
        await userEvent.clear(screen.getByLabelText(/First Name/i));
        await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
        await userEvent.clear(screen.getByLabelText(/Last Name/i));
        await userEvent.type(screen.getByLabelText(/Last Name/i), 'Smith');
        await userEvent.clear(screen.getByLabelText(/Email/i));
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane.smith@example.com');
        await userEvent.clear(screen.getByLabelText(/Phone Number/i));
        await userEvent.type(screen.getByLabelText(/Phone Number/i), '555-555-5555');
        await userEvent.clear(screen.getByLabelText('New Password'));
        await userEvent.type(screen.getByLabelText('New Password'), 'password123');
        await userEvent.clear(screen.getByLabelText('Confirm New Password'));
        await userEvent.type(screen.getByLabelText('Confirm New Password'), 'password123');

        await userEvent.click(screen.getByRole('button', { name: /update/i }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Update successful!');
        });
    });

    test('shows error alert on failed update', async () => {
        sessionStorage.setItem('authToken', 'fake-token');
        axios.put.mockRejectedValueOnce(new Error('fail'));
        window.alert = jest.fn();
        render(<CustomerUpdate />);

        await userEvent.click(screen.getByRole('button', { name: /update/i }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Update failed');
        });
    });
});