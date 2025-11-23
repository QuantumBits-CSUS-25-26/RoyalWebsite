
import React, { useEffect } from 'react';
import { useUi } from './UiContext';
import { useLocation } from 'react-router-dom';
import '../../App.css';

export default function ServicesBars(){
    const {servicesOpen, setServiceOpen, openServices, scheduleCloseServices} = useUi();
     const location = useLocation();

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

    useEffect(() => {
        if (!servicesOpen) return;

        const timeoutId = setTimeout(() => {
            setServiceOpen(false);
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [servicesOpen, setServiceOpen])

    if (!servicesOpen) return null;
    return(
        <>
            <aside className="services-drawer" role="dialog" aria-modal="true" onMouseEnter={openServices} onMouseLeave={scheduleCloseServices}>
                <header className="services-drawer-header">
                    <h2>Services</h2>
                    <button onClick={() => setServiceOpen(false)}>✕</button>
                </header>
                <div className="services-list">
                    <ul>
                        <li>
                            <button className='service-list-buttons'>Brake Work</button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>Body Work</button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>Engine/Transmission</button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>Hybrid Services</button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>Oil Change</button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>
                                Suspension Work
                            </button>
                        </li>
                        <li>
                            <button className='service-list-buttons'>
                                Tune Up
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
            <div className="services-backdrop" onClick={() => setServiceOpen(false)}/>
        </>
    );

}
