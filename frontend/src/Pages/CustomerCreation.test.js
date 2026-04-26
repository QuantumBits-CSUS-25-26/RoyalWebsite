import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerCreation from './CustomerCreation';

const mockNavigate = jest.fn();

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => <>{children}</>,
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

const { BrowserRouter } = require('react-router-dom');

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
    sessionStorage.clear();
    global.fetch = jest.fn();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
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

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/Required/i)).toHaveLength(6);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('first name input enforces max length', async () => {
      renderWithRouter(<CustomerCreation />);

      const firstNameInput = screen.getByLabelText(/First Name/i);
      await userEvent.type(firstNameInput, 'a'.repeat(25));

      expect(firstNameInput).toHaveValue('a'.repeat(24));
    });

    test('last name input enforces max length', async () => {
      renderWithRouter(<CustomerCreation />);

      const lastNameInput = screen.getByLabelText(/Last Name/i);
      await userEvent.type(lastNameInput, 'b'.repeat(25));

      expect(lastNameInput).toHaveValue('b'.repeat(24));
    });

    test('validates email format', async () => {
      renderWithRouter(<CustomerCreation />);

      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(emailInput, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/Invalid email format/i)).not.toBeInTheDocument();
      });
    });

    test('validates phone number format', async () => {
      renderWithRouter(<CustomerCreation />);

      const phoneInput = screen.getByLabelText(/Phone Number/i);

      await userEvent.type(phoneInput, 'abc');

      await waitFor(() => {
        expect(screen.getByText(/Invalid phone number/i)).toBeInTheDocument();
      });

      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, '+1234567890');

      await waitFor(() => {
        expect(screen.queryByText(/Invalid phone number/i)).not.toBeInTheDocument();
      });
    });

    test('validates password length', async () => {
      renderWithRouter(<CustomerCreation />);

      const passwordInput = screen.getByLabelText(/^Password$/i);

      await userEvent.type(passwordInput, '1234567');

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });

      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'a'.repeat(25));

      expect(passwordInput).toHaveValue('a'.repeat(25));

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

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });

      await userEvent.clear(confirmPasswordInput);
      await userEvent.type(confirmPasswordInput, 'password123');

      await waitFor(() => {
        expect(screen.queryByText(/Passwords do not match/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission Tests', () => {
    test('successfully submits form with valid data and navigates to dashboard', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access: 'fake-token',
        }),
      });

      renderWithRouter(<CustomerCreation />);

      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
      await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
      await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/customers/register/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              password: 'password123',
              phone: '+1234567890',
            }),
          }
        );
      });

      expect(sessionStorage.getItem('authToken')).toBe('fake-token');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('alerts when server returns non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

      renderWithRouter(<CustomerCreation />);

      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
      await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
      await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
      await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Account creation failed: Failed to create account'
        );
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('alerts on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failed'));

      renderWithRouter(<CustomerCreation />);

      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1234567890');
      await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
      await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Account creation failed: Network failed'
        );
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('does not submit when form is invalid', async () => {
      renderWithRouter(<CustomerCreation />);

      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(screen.getAllByText(/Required/i).length).toBeGreaterThan(0);
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Tests', () => {
    test('navigates to login page when clicking login link', async () => {
      renderWithRouter(<CustomerCreation />);

      fireEvent.click(screen.getByText(/Log In/i));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Real-time Validation Tests', () => {
    test('clears field error when user enters a valid email', async () => {
      renderWithRouter(<CustomerCreation />);

      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(emailInput, 'invalid-email');

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