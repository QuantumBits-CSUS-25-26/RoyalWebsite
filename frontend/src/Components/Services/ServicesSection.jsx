import React from "react";
import styles from "./Services.module.css";
import { Link } from "react-router-dom";
import oilChange from "./asset/services-1.png";
import brakeRepair from "./asset/services-2.jpeg";
import suspensionWork from "./asset/services-3.jpeg";
import vehicleInspection from "./asset/services-4.jpeg";

const ServicesSection = () => {
    const services = [
        {
            id: 1,
            img: oilChange,
            title: "Oil Changes",
            desc: "Quick and reliable oil changes to keep your engine healthy.",
        },
        {
            id: 2,
            img: brakeRepair,
            title: "Brake Repairs",
            desc: "Professional brake inspection and replacement for safe driving.",
        },
        {
            id: 3,
            img: suspensionWork,
            title: "Suspension Work",
            desc: "Smooth out your ride with full suspension diagnostics and repair.",
        },
        {
            id: 4,
            img: vehicleInspection,
            title: "Vehicle Inspections",
            desc: "Certified inspections for Uber and Lyft drivers.",
        },
    ];

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
                                <div key={service.id} className={styles.serviceCard}>

                                    <img
                                        src={service.img}
                                        alt={service.title}
                                        className={styles.serviceImage}
                                    />
                                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                                    <p className={styles.serviceDesc}>{service.desc}</p>
                                    <Link to={`/service/${service.id}`} className={styles.viewMore}>
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
