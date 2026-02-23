import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ServiceDetail.module.css";
import { API_BASE_URL } from '../../config';

const ServiceDetailSection = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/services/${id}/`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => setService(data))
            .catch(() => setService(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!service) return <p>Service not found</p>;

    return (
        <div className={styles.detailPage}>
            <Link to="/services" className={styles.backLink}>← Back to Services</Link>
            <div className={styles.container}>
                {service.image && (
                    <img src={service.image} alt={service.name} className={styles.image} />
                )}
                <div className={styles.info}>
                    <h1 className={styles.title}>{service.name}</h1>
                    <p className={styles.text}>{service.description}</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailSection;
