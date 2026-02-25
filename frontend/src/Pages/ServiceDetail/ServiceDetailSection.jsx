import React from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ServiceDetail.module.css";

import oilChange from "./asset/services-1.png";
import brakeRepair from "./asset/services-2.jpeg";
import suspensionWork from "./asset/services-3.jpeg";
import vehicleInspection from "./asset/services-4.jpeg";

const serviceData = {
    1: {
        title: "Oil Changes",
        img: oilChange,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    2: {
        title: "Brake Repairs",
        img: brakeRepair,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    3: {
        title: "Suspension Work",
        img: suspensionWork,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    4: {
        title: "Vehicle Inspections",
        img: vehicleInspection,
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
};

const ServiceDetailSection = () => {
    const { id } = useParams();
    const service = serviceData[id];

    if (!service) return <p>Service not found</p>;

    return (
        <div className={styles.detailPage}>
            <Link to="/services" className={styles.backLink}>← Back to Services</Link>
            <div className={styles.container}>
                <img src={service.img} alt={service.title} className={styles.image} />
                <div className={styles.info}>
                    <h1 className={styles.title}>{service.title}</h1>
                    <p className={styles.text}>{service.description}</p>

                </div>
            </div>
        </div>
    );
};

export default ServiceDetailSection;
