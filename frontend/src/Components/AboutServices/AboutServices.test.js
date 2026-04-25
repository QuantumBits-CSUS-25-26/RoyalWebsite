import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutServices from './AboutServices';

const mockNavigate = jest.fn();
const mockOpenMobileNav = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../MobileNavContext', () => ({
  useMobileNav: () => ({
    openMobileNav: mockOpenMobileNav,
  }),
}));

describe('AboutServices component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<AboutServices />);

  test('renders AboutServices section content', () => {
    renderPage();

    expect(
      screen.getByAltText(/Mechanic working on engine/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/^Services$/i)).toBeInTheDocument();

    expect(
      screen.getByText(/Royal Auto and Body Repair is a Sacramento-based auto repair shop/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /View all available auto repair services/i })
    ).toBeInTheDocument();
  });

  test('navigates to /services when "View all services" is clicked on desktop', () => {
    renderPage();

    // Mock desktop view
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    fireEvent.click(
      screen.getByRole('button', { name: /View all available auto repair services/i,})
    );

    expect(mockNavigate).toHaveBeenCalledWith('/services');
    expect(mockOpenMobileNav).not.toHaveBeenCalled();
  });
});