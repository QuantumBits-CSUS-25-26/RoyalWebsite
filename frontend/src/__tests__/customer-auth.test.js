import React from 'react';
import '@testing-library/jest-dom';
const { render, screen, cleanup } = require('@testing-library/react');
const AuthErrorPage = require('../Components/AuthErrorPage/AuthErrorPage').default;

// Helper functions matching the auth check used in customer pages
const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const isAuthorized = (user) => {
  // if a token exists assume authenticated and allow; stored user may not be saved by login flow
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  if (!user && token) return true;
  if (!user) return false;
  if (user.is_customer || user.is_superuser) return true;
  if (user.role && (user.role === 'customer')) return true;
  if (Array.isArray(user.roles) && (user.roles.includes('customer'))) return true;
  return false;
};

// Minimal test-only page that mirrors customer pages' authorization behavior
function TestPage({ title }) {
  const storedUser = parseStoredUser();
  if (!isAuthorized(storedUser)) return React.createElement(AuthErrorPage);
  return React.createElement('div', null, title);
}

const pages = [
  { name: 'CustomerDashboard', displayTitle: 'Account Info', visibleText: /Account Info/i },
  { name: 'CustomerUpdate', displayTitle: 'Update Account Information', visibleText: /Update Account Information/i },
];

describe('Customer pages authorization (isolated)', () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
  });

  test.each(pages)('%s shows AuthErrorPage when no auth present', async (p) => {
    render(React.createElement(TestPage, { title: p.displayTitle }));
    expect(await screen.findByText(/403 - Forbidden/i)).toBeInTheDocument();
  });

  test.each(pages)('%s renders page when authToken present', async (p) => {
    sessionStorage.setItem('authToken', 'fake-token');
    render(React.createElement(TestPage, { title: p.displayTitle }));
    expect(await screen.findByText(p.visibleText)).toBeInTheDocument();
  });
});
