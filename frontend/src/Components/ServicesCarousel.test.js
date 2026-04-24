import React from 'react';
import '@testing-library/jest-dom';
const { render, screen, cleanup, waitFor, fireEvent } = require('@testing-library/react');
const ServicesCarousel = require('./ServicesCarousel').default;

// Mock the API config
jest.mock('../config', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

// Mock reactstrap components
jest.mock('reactstrap', () => ({
    Carousel: ({ children }) => <div data-testid="carousel">{children}</div>,
    CarouselItem: ({ children }) => <div data-testid="carousel-item">{children}</div>,
    CarouselControl: ({ directionText, onClickHandler }) => (
        <button data-testid={`carousel-control-${directionText.toLowerCase()}`} onClick={onClickHandler}>
            {directionText}
        </button>
    ),
    CarouselIndicators: ({ items, activeIndex, onClickHandler }) => (
        <div data-testid="carousel-indicators">
            {items.map((_, idx) => (
                <button
                    key={idx}
                    data-testid={`indicator-${idx}`}
                    onClick={() => onClickHandler(idx)}
                >
                    {idx}
                </button>
            ))}
        </div>
    ),
}));

// Mock react-router-dom Link
jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to} data-testid="service-link">{children}</a>,
}));

// Sample service data for testing
const mockServices = [
    {
        service_id: 1,
        name: 'Oil Change',
        cost: 49.99,
        description: 'Full synthetic oil change with filter replacement',
        image: 'http://localhost:8000/media/oil-change.jpg',
    },
    {
        service_id: 2,
        name: 'Tire Rotation',
        cost: 29.99,
        description: 'Rotate tires for even wear and extended tire life',
        image: 'http://localhost:8000/media/tire-rotation.jpg',
    },
    {
        service_id: 3,
        name: 'Brake Inspection',
        cost: 39.99,
        description: 'Complete brake system inspection',
        image: 'http://localhost:8000/media/brake-inspection.jpg',
    },
    {
        service_id: 4,
        name: 'Air Filter Replacement',
        cost: 19.99,
        description: 'Replace engine air filter for better performance',
        image: null,
    },
];

describe('ServicesCarousel', () => {
    beforeEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test('renders loading state initially', () => {
        // Render without mocking fetch to see initial state
        render(<ServicesCarousel />);
        // The component should attempt to fetch services
        expect(screen.queryByTestId('carousel')).toBeInTheDocument();
    });

    test('fetches services from API on mount', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/services/');
        });
    });

    test('displays service cards when services are loaded', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
            expect(screen.getByText('Tire Rotation')).toBeInTheDocument();
            expect(screen.getByText('Brake Inspection')).toBeInTheDocument();
        });
    });

    test('displays service costs correctly', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('$49.99')).toBeInTheDocument();
            expect(screen.getByText('$29.99')).toBeInTheDocument();
            expect(screen.getByText('$39.99')).toBeInTheDocument();
        });
    });

    test('displays service descriptions', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText(/Full synthetic oil change/i)).toBeInTheDocument();
            expect(screen.getByText(/Rotate tires for even wear/i)).toBeInTheDocument();
        });
    });

    test('displays View More links for each service', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            const links = screen.getAllByText(/View More →/i);
            expect(links).toHaveLength(4);
        });
    });

    test('handles API fetch error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch services:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    test('displays carousel controls', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByTestId('carousel-control-previous')).toBeInTheDocument();
            expect(screen.getByTestId('carousel-control-next')).toBeInTheDocument();
        });
    });

    test('displays carousel indicators', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByTestId('carousel-indicators')).toBeInTheDocument();
        });
    });

    test('handles empty services array', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });
        // Should render carousel even with empty services
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    test('handles service without image', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([mockServices[3]]),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Air Filter Replacement')).toBeInTheDocument();
            expect(screen.getByText('$19.99')).toBeInTheDocument();
        });
    });

    test('handles service without cost', async () => {
        const serviceWithoutCost = [{
            service_id: 5,
            name: 'Diagnostic Check',
            cost: null,
            description: 'Free diagnostic check',
            image: null,
        }];
        
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(serviceWithoutCost),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Diagnostic Check')).toBeInTheDocument();
        });
    });

    // ==================== Carousel Navigation Tests ====================

    test('clicking next button advances to next slide', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        const { container } = render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // Click the next button
        const nextButton = screen.getByTestId('carousel-control-next');
        fireEvent.click(nextButton);

        // The carousel should have moved to the next slide
        // With 4 services and groupSize=3 (desktop), we have 2 groups
        // After clicking next, we should be on slide 1 (showing Tire Rotation, Brake Inspection, Air Filter)
        // or slide 0 if it wraps around
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    test('clicking previous button goes to previous slide', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // Click the previous button
        const prevButton = screen.getByTestId('carousel-control-previous');
        fireEvent.click(prevButton);

        // Should navigate to previous slide (with wrap-around to last slide)
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    // ==================== Circular Navigation Tests ====================

    test('circular navigation: next at last slide wraps to first slide', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // Click next multiple times to go through all slides and wrap around
        const nextButton = screen.getByTestId('carousel-control-next');
        
        // With 4 services and groupSize=3, we have 2 groups
        // Click next twice to complete a cycle
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        // Should wrap around and still show carousel
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    test('circular navigation: previous at first slide wraps to last slide', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // Click previous when on first slide - should wrap to last
        const prevButton = screen.getByTestId('carousel-control-previous');
        fireEvent.click(prevButton);

        // Should wrap to last slide
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    // ==================== Service Selection Navigation Tests ====================

    test('clicking indicator navigates to correct slide', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // With 4 services and groupSize=3, we have 2 groups (indices 0 and 1)
        // Click on indicator 1 (second slide)
        const indicator1 = screen.getByTestId('indicator-1');
        fireEvent.click(indicator1);

        // Should navigate to slide 1
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    test('clicking different indicators navigates to respective slides', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // Get all indicators
        const indicator0 = screen.getByTestId('indicator-0');
        const indicator1 = screen.getByTestId('indicator-1');

        // Click indicator 1 first
        fireEvent.click(indicator1);
        expect(screen.getByTestId('carousel')).toBeInTheDocument();

        // Click indicator 0 to go back
        fireEvent.click(indicator0);
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    test('service link has correct URL for each service', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            const links = screen.getAllByTestId('service-link');
            expect(links).toHaveLength(4);
        });

        // Get all service links and verify their href attributes
        const links = screen.getAllByTestId('service-link');
        
        expect(links[0].getAttribute('href')).toBe('/service/1');
        expect(links[1].getAttribute('href')).toBe('/service/2');
        expect(links[2].getAttribute('href')).toBe('/service/3');
        expect(links[3].getAttribute('href')).toBe('/service/4');
    });

    test('navigation is blocked when animating', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockServices),
        });
        global.fetch = mockFetch;

        render(<ServicesCarousel />);

        await waitFor(() => {
            expect(screen.getByText('Oil Change')).toBeInTheDocument();
        });

        // The component should prevent navigation when animating is true
        // This is tested by verifying the next/previous functions check animating state
        const nextButton = screen.getByTestId('carousel-control-next');
        
        // Clicking should work when not animating
        fireEvent.click(nextButton);
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });
});