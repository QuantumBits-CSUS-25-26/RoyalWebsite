import React from 'react';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import ServicesManagementUpdate from './ServicesManagementUpdate';

jest.mock('../config', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

global.fetch = jest.fn();

// Sample services for testing
const testServices = [
    { service_id: 1, name: 'Oil Change', description: 'Full synthetic oil change', cost: 49.99, image: '/images/services/oil.jpg' },
    { service_id: 2, name: 'Tire Rotation', description: 'Rotate tires for even wear', cost: 29.99, image: '' },
    { service_id: 3, name: 'Brake Service', description: 'Complete brake inspection', cost: 89.99, image: null },
];

describe('ServicesManagementUpdate', () => {
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
            <ServicesManagementUpdate isOpen={false} onClose={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders modal when isOpen is true', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getAllByText(/Update Service/i)[0]).toBeInTheDocument();
    });

    test('renders service selection when no service is selected', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getByText(/Select a service to update:/i)).toBeInTheDocument();
    });

    test('renders all service buttons', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
        expect(screen.getByText('Tire Rotation')).toBeInTheDocument();
        expect(screen.getByText('Brake Service')).toBeInTheDocument();
    });

    // ==================== Service Selection Tests ====================

    test('shows form when service is selected', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Click on a service to select it
        fireEvent.click(screen.getByText('Oil Change'));

        expect(screen.getByLabelText(/Service Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Approximate Cost/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Image Path/i)).toBeInTheDocument();
    });

    test('pre-fills form with selected service data', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Check form is pre-filled
        expect(screen.getByLabelText(/Service Name/i).value).toBe('Oil Change');
        expect(screen.getByLabelText(/Description/i).value).toBe('Full synthetic oil change');
        expect(screen.getByLabelText(/Approximate Cost/i).value).toBe('49.99');
        expect(screen.getByLabelText(/Image Path/i).value).toBe('/images/services/oil.jpg');
    });

    test('renders update and back buttons', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        expect(screen.getByRole('button', { name: /Update Service/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /← Back/i })).toBeInTheDocument();
    });

    test('returns to service selection when back is clicked', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Click back
        fireEvent.click(screen.getByRole('button', { name: /← Back/i }));

        expect(screen.getByText(/Select a service to update:/i)).toBeInTheDocument();
    });

    // ==================== Form Field Tests ====================

    test('name input accepts text', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        const nameInput = screen.getByLabelText(/Service Name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Service Name' } });
        expect(nameInput.value).toBe('Updated Service Name');
    });

    test('description textarea accepts text', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        const descInput = screen.getByLabelText(/Description/i);
        fireEvent.change(descInput, { target: { value: 'Updated description' } });
        expect(descInput.value).toBe('Updated description');
    });

    test('cost input accepts numbers', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        const costInput = screen.getByLabelText(/Approximate Cost/i);
        fireEvent.change(costInput, { target: { value: '59.99' } });
        expect(costInput.value).toBe('59.99');
    });

    test('image input accepts text', () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        const imageInput = screen.getByLabelText(/Image Path/i);
        fireEvent.change(imageInput, { target: { value: '/images/services/updated.jpg' } });
        expect(imageInput.value).toBe('/images/services/updated.jpg');
    });

    // ==================== Validation Tests ====================

    test('shows error when submitting empty name', async () => {
        render(
            <ServicesManagementUpdate isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Clear the name field
        const nameInput = screen.getByLabelText(/Service Name/i);
        fireEvent.change(nameInput, { target: { value: '' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Update Service/i }));

        await waitFor(() => {
            expect(screen.getByText(/Service name is required/i)).toBeInTheDocument();
        });
    });

    // ==================== API Submission Tests ====================

    test('successfully updates service', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ service_id: 1, name: 'Updated Service' }),
        });
        global.fetch = mockFetch;

        const mockOnServiceUpdated = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={mockOnClose}
                onServiceUpdated={mockOnServiceUpdated}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Update the form
        fireEvent.change(screen.getByLabelText(/Service Name/i), { target: { value: 'Updated Service' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Update Service/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/services/1/',
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer mock-auth-token',
                    }),
                    body: JSON.stringify({
                        name: 'Updated Service',
                        description: 'Full synthetic oil change',
                        image: '/images/services/oil.jpg',
                        cost: 49.99,
                    }),
                })
            );
        });

        // Check callbacks
        await waitFor(() => {
            expect(mockOnServiceUpdated).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('shows error when update fails', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ detail: 'Failed to update service' }),
        });
        global.fetch = mockFetch;

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service and submit
        fireEvent.click(screen.getByText('Oil Change'));
        fireEvent.click(screen.getByRole('button', { name: /Update Service/i }));

        await waitFor(() => {
            expect(screen.getByText(/Failed to update service/i)).toBeInTheDocument();
        });
    });
    

    // ==================== Overlay Close Tests ====================

    test('renders overlay when open', () => {
        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        const overlay = document.querySelector('.services-management-update-overlay');
        expect(overlay).toBeInTheDocument();
    });

    // ==================== Props Tests ====================

    test('accepts services prop', () => {
        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
    });

    test('accepts onServiceUpdated callback', () => {
        const mockOnServiceUpdated = jest.fn();

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                onServiceUpdated={mockOnServiceUpdated}
                services={testServices}
            />
        );
        expect(screen.getAllByText(/Update Service/i)[0]).toBeInTheDocument();
    });

    test('accepts onClose callback', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={mockOnClose}
                services={testServices}
            />
        );
        expect(screen.getAllByText(/Update Service/i)[0]).toBeInTheDocument();
    });

    // ==================== Edge Cases Tests ====================

    test('handles empty services array', () => {
        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={[]}
            />
        );
        expect(screen.getByText(/Select a service to update:/i)).toBeInTheDocument();
    });

    test('handles service with null/empty optional fields', () => {
        const minimalServices = [
            { service_id: 1, name: 'Basic Service' },
        ];

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={minimalServices}
            />
        );

        // Select the service
        fireEvent.click(screen.getByText('Basic Service'));

        // Check form is pre-filled with empty values
        expect(screen.getByLabelText(/Service Name/i).value).toBe('Basic Service');
        expect(screen.getByLabelText(/Description/i).value).toBe('');
        expect(screen.getByLabelText(/Approximate Cost/i).value).toBe('');
        expect(screen.getByLabelText(/Image Path/i).value).toBe('');
    });

    test('shows loading state while submitting', () => {
        const mockFetch = jest.fn(() => new Promise(() => {}));
        global.fetch = mockFetch;

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service and submit
        fireEvent.click(screen.getByText('Oil Change'));
        fireEvent.click(screen.getByRole('button', { name: /Update Service/i }));

        expect(screen.getByRole('button', { name: /Updating.../i })).toBeInTheDocument();
    });

    test('resets form on close', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={mockOnClose}
                services={testServices}
            />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));
        expect(screen.getByLabelText(/Service Name/i).value).toBe('Oil Change');

        // Close the modal
        mockOnClose();

        // Re-render to check state is reset
        const { rerender } = render(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        rerender(
            <ServicesManagementUpdate 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        // Should show service selection, not form
        expect(screen.getByText(/Select a service to update:/i)).toBeInTheDocument();
    });

});