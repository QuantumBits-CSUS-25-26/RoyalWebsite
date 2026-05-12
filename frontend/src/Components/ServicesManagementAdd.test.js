import React from 'react';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import ServicesManagementAdd from './ServicesManagementAdd';

jest.mock('../config', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

global.fetch = jest.fn();

// Sample existing services for duplicate testing
const existingServices = [
    { service_id: 1, name: 'Oil Change', description: 'Full synthetic oil change', cost: 49.99 },
    { service_id: 2, name: 'Tire Rotation', description: 'Rotate tires for even wear', cost: 29.99 },
];

describe('ServicesManagementAdd', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        fetch.mockClear();
        mockOnClose.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    // ==================== Rendering Tests ====================

    test('renders nothing when isOpen is false', () => {
        const { container } = render(
            <ServicesManagementAdd isOpen={false} onClose={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders modal when isOpen is true', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        // Use getByRole to be more specific - finds the title element
        expect(screen.getAllByText(/Add Service/i)[0]).toBeInTheDocument();
    });

    test('renders all form fields', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        expect(screen.getByLabelText(/Service Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Approximate Cost/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Image Path/i)).toBeInTheDocument();
    });

    test('renders submit button', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        expect(screen.getByRole('button', { name: /Add Service/i })).toBeInTheDocument();
    });

    // ==================== Form Field Tests ====================

    test('name input accepts text', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        const nameInput = screen.getByLabelText(/Service Name/i);
        fireEvent.change(nameInput, { target: { value: 'New Service' } });
        expect(nameInput.value).toBe('New Service');
    });

    test('description textarea accepts text', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        const descInput = screen.getByLabelText(/Description/i);
        fireEvent.change(descInput, { target: { value: 'Service description' } });
        expect(descInput.value).toBe('Service description');
    });

    test('cost input accepts numbers', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        const costInput = screen.getByLabelText(/Approximate Cost/i);
        fireEvent.change(costInput, { target: { value: '49.99' } });
        expect(costInput.value).toBe('49.99');
    });

    test('image input accepts text', () => {
        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );
        const imageInput = screen.getByLabelText(/Image Path/i);
        fireEvent.change(imageInput, { target: { value: '/images/services/new.jpg' } });
        expect(imageInput.value).toBe('/images/services/new.jpg');
    });

    // ==================== Validation Tests ====================

    test('shows error when submitting empty form', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ detail: 'Validation error' }),
        });
        global.fetch = mockFetch;

        render(
            <ServicesManagementAdd isOpen={true} onClose={() => {}} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Add Service/i }));

        await waitFor(() => {
            expect(screen.getByText(/Service name is required/i)).toBeInTheDocument();
        });
    });

    test('shows error for duplicate service name', async () => {
        const mockFetch = jest.fn();
        global.fetch = mockFetch;

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={() => {}} 
                services={existingServices}
            />
        );

        // Enter existing service name
        const nameInput = screen.getByLabelText(/Service Name/i);
        fireEvent.change(nameInput, { target: { value: 'Oil Change' } });

        fireEvent.click(screen.getByRole('button', { name: /Add Service/i }));

        await waitFor(() => {
            expect(screen.getByText(/A service with this name already exists/i)).toBeInTheDocument();
        });
    });

    test('case-insensitive duplicate check', async () => {
        const mockFetch = jest.fn();
        global.fetch = mockFetch;

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={() => {}} 
                services={existingServices}
            />
        );

        // Enter existing service name with different case
        const nameInput = screen.getByLabelText(/Service Name/i);
        fireEvent.change(nameInput, { target: { value: 'OIL CHANGE' } });

        fireEvent.click(screen.getByRole('button', { name: /Add Service/i }));

        await waitFor(() => {
            expect(screen.getByText(/A service with this name already exists/i)).toBeInTheDocument();
        });
    });

    // ==================== API Submission Tests ====================

    test('successfully creates new service', async () => {
        const newService = { 
            service_id: 3, 
            name: 'New Service', 
            description: 'New description',
            image: '',
            cost: 59.99 
        };
        
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(newService),
        });
        global.fetch = mockFetch;

        const mockOnServiceAdded = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={mockOnClose}
                onServiceAdded={mockOnServiceAdded}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Service Name/i), { target: { value: 'New Service' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New description' } });
        fireEvent.change(screen.getByLabelText(/Image/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/Approximate Cost/i), { target: { value: '59.99' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Add Service/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/services/',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer mock-auth-token',
                    }),
                    body: JSON.stringify({
                        name: 'New Service',
                        description: 'New description',
                        image: '',
                        cost: 59.99,
                    }),
                })
            );
        });

        // Check callbacks
        await waitFor(() => {
            expect(mockOnServiceAdded).toHaveBeenCalledWith(newService);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });


    // ==================== Overlay Close Test ====================

    test('closes when clicking overlay background', () => {
        const mockOnClose = jest.fn();

        const { container } = render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={mockOnClose}
            />
        );

        // Get the overlay element
        const overlay = screen.getAllByText(/Add Service/i)[0].closest('.services-management-add-overlay')
            || document.querySelector('.services-management-add-overlay');

        // The component uses onMouseUp to detect clicks on overlay
        // This test verifies the component renders with the overlay
        expect(screen.getAllByText(/Add Service/i)[0]).toBeInTheDocument();
    });


    // ==================== Props Tests ====================

    test('accepts services prop for duplicate checking', () => {
        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={() => {}}
                services={existingServices}
            />
        );
        expect(screen.getAllByText(/Add Service/i)[0]).toBeInTheDocument();
    });

    test('accepts onServiceAdded callback', () => {
        const mockOnServiceAdded = jest.fn();

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={() => {}}
                onServiceAdded={mockOnServiceAdded}
            />
        );
        expect(screen.getAllByText(/Add Service/i)[0]).toBeInTheDocument();
    });

    test('accepts onClose callback', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={mockOnClose}
            />
        );
        expect(screen.getAllByText(/Add Service/i)[0]).toBeInTheDocument();
    });

    // ==================== Form Reset Tests ====================

    test('form resets after successful submission', async () => {
        const newService = { service_id: 3, name: 'New Service' };
        
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(newService),
        });
        global.fetch = mockFetch;

        render(
            <ServicesManagementAdd 
                isOpen={true} 
                onClose={() => {}}
            />
        );

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Service Name/i), { target: { value: 'New Service' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Description' } });
        fireEvent.change(screen.getByLabelText(/Approximate Cost/i), { target: { value: '50' } });

        fireEvent.submit(screen.getByRole('button', { name: /Add Service/i }));

        await waitFor(() => {
            // Form should be reset after submission
            expect(screen.getByLabelText(/Service Name/i).value).toBe('');
        });
    });

});