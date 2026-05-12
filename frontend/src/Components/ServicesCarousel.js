import styles from "./Services/Services.module.css";
import { Link } from "react-router-dom";
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
} from "reactstrap";
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config';


const ServicesCarousel = () => {
    const [services, setServices] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/services/`)
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error('Failed to fetch services:', err));
    }, []);

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
                    <div key={service.service_id} className={`${styles.serviceCard} mx-auto`}>
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