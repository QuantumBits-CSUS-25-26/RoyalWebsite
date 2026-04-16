import React, { useState, useEffect } from "react";
import styles from "./Services.module.css";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../../config';

const ServicesSection = () => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/services/`)
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Failed to fetch services:', err));
    }, []);

    return (
        <div className={styles.servicesPage}>
            <main className={styles.content}>
                <section className={styles.servicesSection}>
                    <div className={styles.textContent}>
                        <div className={styles.grayBar}>
                            <div className={styles.title}>Our Services</div>
                        </div>

                        <p className={styles.description}>
                            We provide a wide range of auto repair and maintenance services
                            for all vehicle types. Whether you need a routine check-up or
                            major repair, Royal Auto and Body Repair ensures top-quality
                            service at an affordable price.
                        </p>


                        <div className={styles.serviceList}>
                            {services.map((service) => (
                                <div key={service.service_id} className={styles.serviceCard}>

                                    {service.image && (
                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            className={styles.serviceImage}
                                        />
                                    )}
                                    <h3 className={styles.serviceTitle}>{service.name}</h3>
                                    <h3 className={styles.serviceTitle}>{service.cost ? `$${service.cost}` : ''}</h3>
                                    <p className={styles.serviceDesc}>{service.description}</p>
                                    <Link to={`/service/${service.service_id}`} className={styles.viewMore}>
                                        View More →
                                    </Link>
                                </div>
                            ))}
                        </div>


                    </div>
                </section>
            </main>
        </div>
    );
};

export default ServicesSection;
