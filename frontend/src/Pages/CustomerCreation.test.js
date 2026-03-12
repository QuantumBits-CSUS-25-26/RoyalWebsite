
// CustomerCreation.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import CustomerCreation from './CustomerCreation';

jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('CustomerCreation Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering Tests', () => {
        test('renders all form fields correctly', () => {
            renderWithRouter(<CustomerCreation />);


            expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();


            expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();

            expect(screen.getByText(/Log In/i)).toBeInTheDocument();
        });

        test('renders with correct initial values', () => {
            renderWithRouter(<CustomerCreation />);

            expect(screen.getByLabelText(/First Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Last Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
            expect(screen.getByLabelText(/^Password$/i)).toHaveValue('');
            expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue('');
        });
    });

    describe('Validation Tests', () => {
        test('shows required errors when submitting empty form', async () => {
            renderWithRouter(<CustomerCreation />);

            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getAllByText(/Required/i)).toHaveLength(6);
            });
        });

        test('validates first name maximum length', async () => {
            renderWithRouter(<CustomerCreation />);

            const firstNameInput = screen.getByLabelText(/First Name/i);


            await userEvent.type(firstNameInput, 'a'.repeat(25));

            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.getByText(/Maximum 24 characters/i)).toBeInTheDocument();
            });
        });

        test('validates last name maximum length', async () => {
            renderWithRouter(<CustomerCreation />);

            const lastNameInput = screen.getByLabelText(/Last Name/i);

            await userEvent.type(lastNameInput, 'b'.repeat(25));
            fireEvent.blur(lastNameInput);

            await waitFor(() => {
                expect(screen.getByText(/Maximum 24 characters/i)).toBeInTheDocument();
            });
        });

        test('validates email format', async () => {
            renderWithRouter(<CustomerCreation />);

            const emailInput = screen.getByLabelText(/Email/i);

            await userEvent.type(emailInput, 'invalid-email');
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
            });


            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'test@example.com');
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument();
            });
        });

        test('validates phone number format', async () => {
            renderWithRouter(<CustomerCreation />);

            const phoneInput = screen.getByLabelText(/Phone Number/i);


            await userEvent.type(phoneInput, 'abc');
            fireEvent.blur(phoneInput);

            await waitFor(() => {
                expect(screen.getByText(/Invalid phone number/i)).toBeInTheDocument();
            });

            await userEvent.clear(phoneInput);
            await userEvent.type(phoneInput, '+1234567890');
            fireEvent.blur(phoneInput);

            await waitFor(() => {
                expect(screen.queryByText(/Invalid phone number/i)).not.toBeInTheDocument();
            });
        });

        test('validates password length', async () => {
            renderWithRouter(<CustomerCreation />);

            const passwordInput = screen.getByLabelText(/^Password$/i);


            await userEvent.type(passwordInput, '1234567');
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
            });

            await userEvent.clear(passwordInput);
            await userEvent.type(passwordInput, 'a'.repeat(25));
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(screen.getByText(/Password must be at most 24 characters/i)).toBeInTheDocument();
            });
        });

        test('validates password confirmation match', async () => {
            renderWithRouter(<CustomerCreation />);

            const passwordInput = screen.getByLabelText(/^Password$/i);
            const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

            await userEvent.type(passwordInput, 'password123');
            await userEvent.type(confirmPasswordInput, 'password456');
            fireEvent.blur(confirmPasswordInput);

            await waitFor(() => {
                expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
            });

            await userEvent.clear(confirmPasswordInput);
            await userEvent.type(confirmPasswordInput, 'password123');
            fireEvent.blur(confirmPasswordInput);

            await waitFor(() => {
                expect(screen.queryByText(/Passwords do not match/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Form Submission Tests', () => {
        test('successfully submits form with valid data', async () => {
            axios.post.mockResolvedValueOnce({
                data: {
                    message: 'User created successfully',
                    token: 'fake-token'
                }
            });

            renderWithRouter(<CustomerCreation />);

            await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
            await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
            await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
            await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
            await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');


            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    'http://127.0.0.1:8000/api/customers/register/',
                    {
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com',
                        password: 'password123',
                        phone: '+1234567890',
                    }
                );
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            });
        });

        test('handles server error response', async () => {

            const serverError = {
                response: {
                    data: {
                        message: 'Email already exists',
                        errors: {
                            email: ['This email is already registered']
                        }
                    }
                }
            };
            axios.post.mockRejectedValueOnce(serverError);

            renderWithRouter(<CustomerCreation />);

            await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
            await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
            await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
            await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
            await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
            await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
                expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
            });

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        test('handles network error', async () => {

            axios.post.mockRejectedValueOnce({ request: {} });

            renderWithRouter(<CustomerCreation />);


            await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
            await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
            await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
            await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
            await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);


            await waitFor(() => {
                expect(screen.getByText(/عدم ارتباط با سرور/i)).toBeInTheDocument();
            });
        });

        test('shows loading state during submission', async () => {

            axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

            renderWithRouter(<CustomerCreation />);

            await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
            await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
            await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
            await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
            await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');


            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
                expect(submitButton).toBeDisabled();
            });

            expect(screen.getByLabelText(/First Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Last Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Email/i)).toBeDisabled();
        });
    });

    describe('Navigation Tests', () => {
        test('navigates to login page when clicking login link', () => {
            renderWithRouter(<CustomerCreation />);

            const loginLink = screen.getByText(/Log In/i);
            fireEvent.click(loginLink);

            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        test('does not navigate when clicking login link during loading', async () => {
            axios.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

            renderWithRouter(<CustomerCreation />);


            await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
            await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');

            const submitButton = screen.getByRole('button', { name: /Sign Up/i });
            fireEvent.click(submitButton);


            await waitFor(() => {
                expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
            });

            const loginLink = screen.getByText(/Log In/i);
            fireEvent.click(loginLink);

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('Real-time Validation Tests', () => {
        test('clears field error when user starts typing', async () => {
            renderWithRouter(<CustomerCreation />);

            const emailInput = screen.getByLabelText(/Email/i);


            await userEvent.type(emailInput, 'invalid-email');
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
            });

            await userEvent.clear(emailInput);
            await userEvent.type(emailInput, 'valid@email.com');


            await waitFor(() => {
                expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument();
            });
        });
    });
});