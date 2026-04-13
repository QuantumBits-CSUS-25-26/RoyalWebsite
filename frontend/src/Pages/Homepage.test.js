// Homepage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Homepage from './Homepage';

// Mock child components
jest.mock('../Components/HeroSection', () => {
    return function MockHeroSection() {
        return <div data-testid="hero-section">Hero Section</div>;
    };
});

jest.mock('../Components/AboutServices/AboutServices', () => {
    return function MockAboutServices() {
        return <div data-testid="about-services">About Services</div>;
    };
});

jest.mock('../Components/ServicesCarousel', () => {
    return function MockServicesCarousel() {
        return <div data-testid="services-carousel">Services Carousel</div>;
    };
});

jest.mock('../Components/Reviews', () => {
    return function MockReviews() {
        return <div data-testid="reviews">Reviews</div>;
    };
});

jest.mock('../Components/Footer/ContactFooter', () => {
    return function MockContactFooter() {
        return <div data-testid="contact-footer">Contact Footer</div>;
    };
});

describe('Homepage Component Rendering', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the homepage with correct structure', () => {
        const { container } = render(<Homepage />);
        
        const homepageDiv = container.querySelector('.homepage');
        expect(homepageDiv).toBeInTheDocument();
        expect(homepageDiv).toHaveClass('homepage');
        
        const homepageContentDiv = container.querySelector('.homepage-content');
        expect(homepageContentDiv).toBeInTheDocument();
        expect(homepageContentDiv).toHaveClass('homepage-content');
    });

    test('renders all child components', () => {
        render(<Homepage />);

        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('about-services')).toBeInTheDocument();
        expect(screen.getByTestId('services-carousel')).toBeInTheDocument();
        expect(screen.getByTestId('reviews')).toBeInTheDocument();
        expect(screen.getByTestId('contact-footer')).toBeInTheDocument();
    });

    test('renders HeroSection component', () => {
        render(<Homepage />);

        expect(screen.getByText('Hero Section')).toBeInTheDocument();
    });

    test('renders AboutServices component', () => {
        render(<Homepage />);

        expect(screen.getByText('About Services')).toBeInTheDocument();
    });

    test('renders ServicesCarousel component', () => {
        render(<Homepage />);

        expect(screen.getByText('Services Carousel')).toBeInTheDocument();
    });

    test('renders Reviews component', () => {
        render(<Homepage />);

        expect(screen.getByText('Reviews')).toBeInTheDocument();
    });

    test('renders ContactFooter component', () => {
        render(<Homepage />);

        expect(screen.getByText('Contact Footer')).toBeInTheDocument();
    });

    test('renders components in correct order', () => {
        const { container } = render(<Homepage />);

        const heroSection = screen.getByTestId('hero-section');
        const aboutServices = screen.getByTestId('about-services');
        const servicesCarousel = screen.getByTestId('services-carousel');
        const reviews = screen.getByTestId('reviews');
        const contactFooter = screen.getByTestId('contact-footer');

        // Get all test ids in document order
        const testIds = [heroSection, aboutServices, servicesCarousel, reviews, contactFooter];
        
        for (let i = 0; i < testIds.length - 1; i++) {
            // Check that each element comes before the next one
            expect(testIds[i].compareDocumentPosition(testIds[i + 1])).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        }
    });

    test('wraps content in homepage-content div', () => {
        const { container } = render(<Homepage />);

        const homepageContentDiv = container.querySelector('.homepage-content');
        expect(homepageContentDiv).toBeInTheDocument();

        // Verify all child components are within the content wrapper
        expect(homepageContentDiv).toContainElement(screen.getByTestId('hero-section'));
        expect(homepageContentDiv).toContainElement(screen.getByTestId('about-services'));
        expect(homepageContentDiv).toContainElement(screen.getByTestId('services-carousel'));
        expect(homepageContentDiv).toContainElement(screen.getByTestId('reviews'));
        expect(homepageContentDiv).toContainElement(screen.getByTestId('contact-footer'));
    });
});