import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

const ServicesManagementDelete = ({ isOpen, onClose, services = [], onServiceDeleted }) => {

    const [selectedService, setSelectedService] = useState(null);
    const mouseDownTarget = useRef(null);

    const handleDelete = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/api/services/${selectedService.service_id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok || res.status === 204) {
                if (onServiceDeleted) onServiceDeleted();
                handleClose();
            } else {
                const data = await res.json();
                alert(data.detail || 'Failed to delete service.');
            }
        } catch (err) {
            alert('Error deleting service: ' + err.message);
        }
    };

    const handleDisable = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/services/${selectedService.service_id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: false }),
            });
            if (res.ok) {
                if (onServiceDeleted) onServiceDeleted();
                handleClose();
            } else {
                const data = await res.json();
                alert(data.detail || 'Failed to disable service.');
            }
        } catch (err) {
            alert('Error disabling service: ' + err.message);
        }
    };

    const handleClose = () => {
        setSelectedService(null);
        onClose();
    };

    const handleMouseDown = (e) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e) => {
        if (e.target.className === 'services-management-delete-overlay' &&
            mouseDownTarget.current?.className === 'services-management-delete-overlay') {
            handleClose();
        }
        mouseDownTarget.current = null;
    };

    if (!isOpen) return null;

    return (
        <div
            className="services-management-delete-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="services-management-delete">
                <div className="title">Delete Service</div>

                {!selectedService ? (
                    <div className="update-service-select">
                        <p>Select a service to delete:</p>
                        {services.map((service) => (
                            <button
                                key={service.service_id}
                                type="button"
                                className="update-service-select-btn"
                                onClick={() => setSelectedService(service)}
                            >
                                {service.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="delete-confirm">
                        <p className="delete-confirm-text">
                            Are you sure you would like to delete service — <strong>{selectedService.name}</strong>?
                        </p>
                        <div className="delete-confirm-actions">
                            <button
                                type="button"
                                className="delete-confirm-btn cancel"
                                onClick={() => setSelectedService(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="delete-confirm-btn disable"
                                onClick={handleDisable}
                            >
                                Disable
                            </button>
                            <button
                                type="button"
                                className="delete-confirm-btn delete"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );


}

export default ServicesManagementDelete;