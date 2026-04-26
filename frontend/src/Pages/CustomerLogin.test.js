import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CustomerLogin from './CustomerLogin';

const mockNavigate = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CustomerLogin page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderPage = () => render(<CustomerLogin />);

  test('renders customer login form fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  test('shows validation placeholders when form fields are empty', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute('placeholder', 'Email is required.');
      expect(screen.getByLabelText(/Password/i)).toHaveAttribute('placeholder', 'Password is required.');
    });
  });

  test('shows invalid email placeholder when email is malformed', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalidemail' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute('placeholder', 'Please enter a valid email address.');
    });
  });

  test('shows short password placeholder when password is too short', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Password/i)).toHaveAttribute('placeholder', 'Password must be at least 8 characters.');
    });
  });

  test('stores token and navigates to dashboard on successful login', async () => {
    axios.post.mockResolvedValueOnce({ data: { access: 'test-token' } });

    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {

      expect(localStorage.getItem('authToken')).toBe('test-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows invalid credentials placeholder on login failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Request failed'));

    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Password/i)).toHaveAttribute('placeholder', 'Invalid email or password');
      expect(screen.getByLabelText(/Password/i)).toHaveValue('');
    });
  });

  test('navigates to account creation when Sign Up is clicked', () => {
    renderPage();

    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(mockNavigate).toHaveBeenCalledWith('/account-creation');
  });
});
