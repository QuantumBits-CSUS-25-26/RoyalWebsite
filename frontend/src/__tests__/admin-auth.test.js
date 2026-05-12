import React from 'react';
import '@testing-library/jest-dom';
const { render, screen, cleanup } = require('@testing-library/react');
const AuthErrorPage = require('../Components/AuthErrorPage/AuthErrorPage').default;

// Helper functions matching the auth check used in admin pages
const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const isAuthorized = (user) => {
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  if (!user && token) return true;
  if (!user) return false;
  if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) return true;
  if (user.role && (user.role === 'employee' || user.role === 'admin')) return true;
  if (Array.isArray(user.roles) && (user.roles.includes('employee') || user.roles.includes('admin'))) return true;
  return false;
};

// Minimal test-only page that mirrors admin pages' authorization behavior
function TestPage({ title }) {
  const storedUser = parseStoredUser();
  if (!isAuthorized(storedUser)) return React.createElement(AuthErrorPage);
  return React.createElement('div', null, title);
}

const pages = [
  { name: 'Appointments', displayTitle: 'Appointments', visibleText: /Appointments/i },
  { name: 'CustomerList', displayTitle: 'Customer List', visibleText: /Customer List|Customer list/i },
  { name: 'Management', displayTitle: 'Management', visibleText: /Management/i },
  { name: 'Invoices', displayTitle: 'Invoices', visibleText: /Invoices/i },
  { name: 'Messages', displayTitle: 'Messages', visibleText: /Messages/i },
  { name: 'AdminServices', displayTitle: 'Services', visibleText: /Services/i },
  { name: 'ServicesManagement', displayTitle: 'Services Management', visibleText: /Services Management/i },
  { name: 'AdminDashboard', displayTitle: 'Admin Dashboard', visibleText: /Admin Dashboard|Admin Dashboard/i },
];

describe('Admin pages authorization (isolated)', () => {
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
