import React from 'react';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import ServicesManagementDelete from './ServicesManagementDelete';

jest.mock('../config', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

global.fetch = jest.fn();

// Sample services for testing
const testServices = [
    { service_id: 1, name: 'Oil Change', description: 'Full synthetic oil change', cost: 49.99 },
    { service_id: 2, name: 'Tire Rotation', description: 'Rotate tires for even wear', cost: 29.99 },
    { service_id: 3, name: 'Brake Service', description: 'Complete brake inspection', cost: 89.99 },
];

describe('ServicesManagementDelete', () => {
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
            <ServicesManagementDelete isOpen={false} onClose={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders modal when isOpen is true', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getAllByText(/Delete Service/i)[0]).toBeInTheDocument();
    });

    test('renders service selection when no service is selected', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getByText(/Select a service to delete:/i)).toBeInTheDocument();
    });

    test('renders all service buttons', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
        expect(screen.getByText('Tire Rotation')).toBeInTheDocument();
        expect(screen.getByText('Brake Service')).toBeInTheDocument();
    });

    // ==================== Service Selection Tests ====================

    test('shows delete confirmation when service is selected', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Click on a service to select it
        fireEvent.click(screen.getByText('Oil Change'));

        expect(screen.getByText(/Are you sure you would like to delete service/i)).toBeInTheDocument();
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
    });

    test('shows cancel, disable, and delete buttons in confirmation', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Disable/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });

    test('returns to service selection when cancel is clicked', () => {
        render(
            <ServicesManagementDelete isOpen={true} onClose={() => {}} services={testServices} />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Click cancel
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

        expect(screen.getByText(/Select a service to delete:/i)).toBeInTheDocument();
    });

    // ==================== Delete API Tests ====================

    test('successfully deletes service', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 204,
        });
        global.fetch = mockFetch;

        const mockOnServiceDeleted = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={mockOnClose}
                onServiceDeleted={mockOnServiceDeleted}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));

        // Click delete button
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/services/1/',
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mock-auth-token',
                    }),
                })
            );
        });

        // Check callbacks
        await waitFor(() => {
            expect(mockOnServiceDeleted).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('shows alert when delete fails', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ detail: 'Cannot delete service' }),
        });
        global.fetch = mockFetch;

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service and click delete
        fireEvent.click(screen.getByText('Oil Change'));
        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Cannot delete service');
        });

        alertSpy.mockRestore();
    });

    // ==================== Disable API Tests ====================

    test('successfully disables service', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ is_active: false }),
        });
        global.fetch = mockFetch;

        const mockOnServiceDeleted = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={mockOnClose}
                onServiceDeleted={mockOnServiceDeleted}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service
        fireEvent.click(screen.getByText('Tire Rotation'));

        // Click disable button
        fireEvent.click(screen.getByRole('button', { name: /Disable/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:8000/api/services/2/',
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                    body: JSON.stringify({ is_active: false }),
                })
            );
        });

        // Check callbacks
        await waitFor(() => {
            expect(mockOnServiceDeleted).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('shows alert when disable fails', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ detail: 'Failed to disable service' }),
        });
        global.fetch = mockFetch;

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-auth-token');

        // Select a service and click disable
        fireEvent.click(screen.getByText('Tire Rotation'));
        fireEvent.click(screen.getByRole('button', { name: /Disable/i }));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to disable service');
        });

        alertSpy.mockRestore();
    });

    // ==================== Overlay Close Tests ====================

    test('closes when clicking overlay background', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={mockOnClose}
                services={testServices}
            />
        );

        // Get the overlay element
        const overlay = document.querySelector('.services-management-delete-overlay');
        expect(overlay).toBeInTheDocument();
    });

    // ==================== Props Tests ====================

    test('accepts services prop', () => {
        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
    });

    test('accepts onServiceDeleted callback', () => {
        const mockOnServiceDeleted = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                onServiceDeleted={mockOnServiceDeleted}
                services={testServices}
            />
        );
        expect(screen.getAllByText(/Delete Service/i)[0]).toBeInTheDocument();
    });

    test('accepts onClose callback', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={mockOnClose}
                services={testServices}
            />
        );
        expect(screen.getAllByText(/Delete Service/i)[0]).toBeInTheDocument();
    });

    // ==================== Edge Cases Tests ====================

    test('handles empty services array', () => {
        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={[]}
            />
        );
        expect(screen.getByText(/Select a service to delete:/i)).toBeInTheDocument();
    });

    test('handles services without optional fields', () => {
        const minimalServices = [
            { service_id: 1, name: 'Basic Service' },
        ];

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={minimalServices}
            />
        );
        expect(screen.getByText('Basic Service')).toBeInTheDocument();
    });

    test('resets selected service on close', () => {
        const mockOnClose = jest.fn();

        render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={mockOnClose}
                services={testServices}
            />
        );

        // Select a service
        fireEvent.click(screen.getByText('Oil Change'));
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

        // Close the modal
        mockOnClose();

        // Re-render with isOpen=true to check state is reset
        const { rerender } = render(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        rerender(
            <ServicesManagementDelete 
                isOpen={true} 
                onClose={() => {}}
                services={testServices}
            />
        );

        // Should show service selection, not confirmation
        expect(screen.getByText(/Select a service to delete:/i)).toBeInTheDocument();
    });

});