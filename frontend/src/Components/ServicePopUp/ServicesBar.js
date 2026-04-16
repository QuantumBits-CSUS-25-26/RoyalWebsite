
import React, { useEffect, useState } from 'react';
import { useUi } from './UiContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../App.css';

export default function ServicesBars(){
    const {servicesOpen, setServiceOpen, openServices, scheduleCloseServices} = useUi();
    const location = useLocation();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/services/`)
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Failed to fetch services:', err));
    }, []);

    useEffect(() => {
        setServiceOpen(false);
    }, [location, setServiceOpen]);

    useEffect(() => {
        function onKey(e){
            if (e.key === 'Escape') setServiceOpen(false);
        }
        if(servicesOpen) document.addEventListener('keydown', onKey);
        return() => document.removeEventListener('keydown', onKey);
    }, [servicesOpen, setServiceOpen]);

    if (!servicesOpen) return null;
    return(
        <>
            <aside className="services-drawer" role="dialog" aria-modal="true" onMouseEnter={openServices} onMouseLeave={scheduleCloseServices}>
                <header className="services-drawer-header">
                    <h2>Services</h2>
                    <button className="service-popup-close-btn" onClick={() => setServiceOpen(false)}>✕</button>
                </header>
                <div className="services-list">
                    <ul>
                        {services.map((service) => (
                            <li key={service.service_id}>
                                <button
                                    className='service-list-buttons'
                                    onClick={() => {
                                        setServiceOpen(false);
                                        navigate(`/service/${service.service_id}`);
                                    }}
                                >
                                    {service.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <div onClick={() => setServiceOpen(false)}/>
        </>
    );

}
