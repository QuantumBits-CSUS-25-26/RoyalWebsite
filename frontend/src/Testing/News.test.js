import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import News from '../Pages/News';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        data: [
          {
            id: '1',
            created_time: '2026-04-23T12:00:00+0000',
            message: 'Test Facebook post',
            full_picture: 'http://example.com/image.jpg'
          }
        ]
      })
    })
  );
});

afterEach(() => {
  global.fetch.mockClear();
  delete global.fetch;
});

test('renders Facebook posts from API', async () => {
  render(<News />);
  expect(screen.getByText(/Loading Facebook posts/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Test Facebook post/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Facebook post/i)).toBeInTheDocument();
  });
});

test('shows loading state', () => {
  global.fetch = jest.fn(() => new Promise(() => {}));
  render(<News />);
  expect(screen.getByText(/Loading Facebook posts/i)).toBeInTheDocument();
});

test('shows error state if fetch fails', async () => {
  global.fetch = jest.fn(() => Promise.reject('API is down'));
  render(<News />);
  await waitFor(() => {
    expect(screen.getByText(/Failed to load Facebook posts/i)).toBeInTheDocument();
  });
});

test('shows fallback sample entries if no Facebook posts', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ data: [] }) }));
  render(<News />);
  await waitFor(() => {
    expect(screen.getByText(/Holiday Hours & Specials/i)).toBeInTheDocument();
    expect(screen.getByText(/New Lift Installed/i)).toBeInTheDocument();
  });
});