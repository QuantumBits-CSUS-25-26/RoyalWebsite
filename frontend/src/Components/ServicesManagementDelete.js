import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';

const ServicesManagementDelete = ({ isOpen, onClose }) => {

    //temp values for display and testing
    const sampleServices = {
        1: {
            title: "Oil Changes",
            cost: "$29.99",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
        2: {
            title: "Brake Repairs",
            cost: "$29.99",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
        3: {
            title: "Suspension Work",
            cost: "$49.99",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
        4: {
            title: "Vehicle Inspections",
            cost: "$79.99",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        },
    }
    const [selectedService, setSelectedService] = useState(null);

    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    
    const DisplayService = ({ service }) => {
        const { title } = service;
        return (
            <div className="content">
                <Button
                type="submit"
                className='btn'
                onClick={() => handleSubmit(service)}
                >
                  {title}
                </Button>
            </div>
        )
    }


    const handleSubmit = (service) => {
        setSelectedService(service);

        //make api call to delete service in database
        //service to delete is selectedService

        //close form

    }

    if (!isOpen) return null;

   
    const handleMouseDown = (e) => {
        setMouseDownTarget(e.target);
    }

    //Only close if both mousedown and mouseup happen outside box thing
    const handleMouseUp = (e) => {
        if (e.target.className === 'services-management-delete-overlay' && 
            mouseDownTarget?.className === 'services-management-delete-overlay') {
            onClose();
        }
        setMouseDownTarget(null);
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
                        {Object.values(sampleServices).map((service, index) => (
                            <DisplayService key={index} service={service} />
                        ))}
                    </div>
                </form>            
            </div>
        </div>
    );


}

export default ServicesManagementDelete;