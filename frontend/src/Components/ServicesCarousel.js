import styles from "./Services/Services.module.css";
import { Link } from "react-router-dom";
import oilChange from "./Services/asset/services-1.png";
import brakeRepair from "./Services/asset/services-2.jpeg";
import suspensionWork from "./Services/asset/services-3.jpeg";
import vehicleInspection from "./Services/asset/services-4.jpeg";
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
} from "reactstrap";
import { useState, useEffect } from "react";


const ServicesCarousel = () => {
    const services = [
        {
            id: 1,
            img: oilChange,
            title: "Oil Changes",
            cost: "20$",
            date: "2026/02/25",
            desc: "Quick and reliable oil changes to keep your engine healthy.",
        },
        {
            id: 2,
            img: brakeRepair,
            title: "Brake Repairs",
            desc: "Professional brake inspection and replacement for safe driving.",
            cost: "10$",
            date: "2026/02/25",
        },
        {
            id: 3,
            img: suspensionWork,
            title: "Suspension Work",
            desc: "Smooth out your ride with full suspension diagnostics and repair.",
            cost: "50$",
            date: "2026/02/25",
        },
        {


            id: 4,
            img: vehicleInspection,
            title: "Vehicle Inspections",
            cost: "70$",
            date: "2026/02/25",
            desc: "Certified inspections for Uber and Lyft drivers.",
        },
    ];

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const groupSize = isMobile ? 1 : 3;
    const groups = [];
    for (let i = 0; i < services.length; i += groupSize) {
        groups.push(services.slice(i, i + groupSize));
    }

    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === groups.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? groups.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    }

    const carouselSlides = groups.map((group, idx) => (
        <CarouselItem
            key={idx}
            onExiting={() => setAnimating(true)}
            onExited={() => setAnimating(false)}
        >
            <div className={`${styles.serviceList} mx-auto`}>
                {group.map((service) => (
                    <div key={service.id} className={`${styles.serviceCard} mx-auto`}>
                        <img
                            src={service.img}
                            alt={service.title}
                            className={styles.serviceImage}
                        />
                        <h3 className={styles.serviceTitle}>{service.title}</h3>
                        <h3 className={styles.serviceTitle}>{service.date}</h3>
                        <h3 className={styles.serviceTitle}>{service.cost}</h3>
                        <p className={styles.serviceDesc}>{service.desc}</p>
                        <Link to={`/service/${service.id}`} className={styles.viewMore}>
                            View More →
                        </Link>
                    </div>
                ))}
            </div>
        </CarouselItem>
    ));

    return (
        <Carousel activeIndex={activeIndex} next={next} previous={previous}>
            <CarouselIndicators items={groups} activeIndex={activeIndex} onClickHandler={goToIndex} />
            {carouselSlides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
        </Carousel>
    )
}

export default ServicesCarousel