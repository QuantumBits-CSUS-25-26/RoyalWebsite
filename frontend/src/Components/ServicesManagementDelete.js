import React, { useRef } from 'react';
import { Button } from 'reactstrap';
import { API_BASE_URL } from '../config';

const ServicesManagementDelete = ({ isOpen, onClose, services = [], onServiceDeleted }) => {

    const mouseDownTarget = useRef(null);
    
    const DisplayService = ({ service }) => {
        return (
            <div className="content">
                <Button
                type="button"
                className='btn'
                onClick={() => handleDelete(service)}
                >
                  {service.name}
                </Button>
            </div>
        )
    }


    const handleDelete = async (service) => {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/api/services/${service.service_id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok || res.status === 204) {
                if (onServiceDeleted) onServiceDeleted();
                onClose();
            } else {
                const data = await res.json();
                alert(data.detail || 'Failed to delete service.');
            }
        } catch (err) {
            alert('Error deleting service: ' + err.message);
        }
    }

    if (!isOpen) return null;

   
    const handleMouseDown = (e) => {
        mouseDownTarget.current = e.target;
    }

    //Only close if both mousedown and mouseup happen outside box thing
    const handleMouseUp = (e) => {
        if (e.target.className === 'services-management-delete-overlay' && 
            mouseDownTarget.current?.className === 'services-management-delete-overlay') {
            onClose();
        }
        mouseDownTarget.current = null;
    };

    return (
        <div 
            className="services-management-delete-overlay"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="services-management-delete">
                <div className="title">
                    Delete Service
                </div>
                <form>
                    <div className="content">
                        Select a service to delete
                        {services.map((service) => (
                            <DisplayService key={service.service_id} service={service} />
                        ))}
                    </div>
                </form>            
            </div>
        </div>
    );


}

export default ServicesManagementDelete;