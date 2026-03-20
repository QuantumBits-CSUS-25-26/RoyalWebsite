import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

const ServicesManagementUpdate = ({ isOpen, onClose, services = [], onServiceUpdated }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: '',
        image: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const mouseDownTarget = useRef(null);

    const handleSelectService = (service) => {
        setSelectedService(service);
        setFormData({
            name: service.name || '',
            description: service.description || '',
            cost: service.cost || '',
            image: service.image || '',
        });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Service name is required.');
            return;
        }

        setSubmitting(true);

        try {
            const token = sessionStorage.getItem('authToken');
            const body = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                image: formData.image.trim(),
            };

            if (formData.cost) {
                body.cost = parseFloat(formData.cost);
            } else {
                body.cost = null;
            }

            const res = await fetch(`${API_BASE_URL}/api/services/${selectedService.service_id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Failed to update service.');
            }

            setSelectedService(null);
            setFormData({ name: '', description: '', cost: '', image: '' });
            if (onServiceUpdated) onServiceUpdated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        setSelectedService(null);
        setFormData({ name: '', description: '', cost: '', image: '' });
        setError('');
    };

    const handleClose = () => {
        setSelectedService(null);
        setFormData({ name: '', description: '', cost: '', image: '' });
        setError('');
        onClose();
    };

    const handleMouseDown = (e) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e) => {
        if (
            e.target.className === 'services-management-update-overlay' &&
            mouseDownTarget.current?.className === 'services-management-update-overlay'
        ) {
            handleClose();
        }
        mouseDownTarget.current = null;
    };

    if (!isOpen) return null;

    return (
        <div
            className="services-management-update-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="services-management-update">
                <div className="title">Update Service</div>

                {!selectedService ? (
                    <div className="update-service-select">
                        <p>Select a service to update:</p>
                        {services.map((service) => (
                            <button
                                key={service.service_id}
                                type="button"
                                className="update-service-select-btn"
                                onClick={() => handleSelectService(service)}
                            >
                                {service.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="add-service-content">
                            <div className="add-service-field">
                                <label htmlFor="update-name">Service Name *</label>
                                <input
                                    id="update-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="add-service-field">
                                <label htmlFor="update-description">Description</label>
                                <textarea
                                    id="update-description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="add-service-field">
                                <label htmlFor="update-cost">Approximate Cost ($)</label>
                                <input
                                    id="update-cost"
                                    name="cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.cost}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="add-service-field">
                                <label htmlFor="update-image">Image Path</label>
                                <input
                                    id="update-image"
                                    name="image"
                                    type="text"
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                            </div>

                            {error && <div className="add-service-error">{error}</div>}

                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Updating...' : 'Update Service'}
                            </button>
                            <button type="button" onClick={handleBack} style={{ background: '#6b7280' }}>
                                ← Back
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ServicesManagementUpdate;
