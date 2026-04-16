import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

const ServicesManagementAdd = ({ isOpen, onClose, onServiceAdded, services = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: '',
        image: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const mouseDownTarget = useRef(null);

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

        const duplicate = services.find(
            s => s.name.toLowerCase() === formData.name.trim().toLowerCase()
        );
        if (duplicate) {
            setError('A service with this name already exists. Use the Update button to modify it.');
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
            }

            const res = await fetch(`${API_BASE_URL}/api/services/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Failed to create service.');
            }

            const created = await res.json();
            setFormData({ name: '', description: '', cost: '', image: '' });

            if (onServiceAdded) {
                onServiceAdded(created);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMouseDown = (e) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e) => {
        if (
            e.target.className === 'services-management-add-overlay' &&
            mouseDownTarget.current?.className === 'services-management-add-overlay'
        ) {
            onClose();
        }
        mouseDownTarget.current = null;
    };

    if (!isOpen) return null;

    return (
        <div
            className="services-management-add-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="services-management-add">
                <div className="title">Add Service</div>
                <form onSubmit={handleSubmit}>
                    <div className="add-service-content">
                        <div className="add-service-field">
                            <label htmlFor="name">Service Name *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Oil Change"
                            />
                        </div>

                        <div className="add-service-field">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the service..."
                            />
                        </div>

                        <div className="add-service-field">
                            <label htmlFor="cost">Approximate Cost ($)</label>
                            <input
                                id="cost"
                                name="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.cost}
                                onChange={handleChange}
                                placeholder="e.g. 29.99"
                            />
                        </div>

                        <div className="add-service-field">
                            <label htmlFor="image">Image Path</label>
                            <input
                                id="image"
                                name="image"
                                type="text"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="e.g. /images/services/oil-change.jpg"
                            />
                        </div>

                        {error && <div className="add-service-error">{error}</div>}

                        <button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServicesManagementAdd;
