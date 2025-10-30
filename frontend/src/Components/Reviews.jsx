import React, { useState, useEffect } from 'react';
import './CustomerReviews.css';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/places/reviews');
                const data = await response.json();

                if (data.status === 'OK') {

                    const positiveReviews = data.result.reviews

                    setReviews(positiveReviews);
                }
            } catch (err) {
                setError('Error fetching reviews');
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);


    const staticReviews = [
        {
            text: "They treated me kindly and explained everything to me in detail. Great place!",
            author: "Daniel C.",
            rating: 5
        },
        {
            text: "Very honest people that made me feel like I could actually trust them. 10/10!",
            author: "Mabel P.",
            rating: 5
        },
        {
            text: "Great customer service as send reminders of appointn and are trustworthy people.",
            author: "Greg H.",
            rating: 5
        }
    ];

    if (loading) {
        return (
            <section className="customer-reviews">
                <h2>Google Maps Customer Feedback</h2>
                <div className="reviews-container">
                    {staticReviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <div className="stars">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                            <p className="review-text">"{review.text}"</p>
                            <p className="review-author">- {review.author}</p>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="customer-reviews">
                <h2>Google Maps Customer Feedback</h2>
                <div className="reviews-container">
                    {staticReviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <div className="stars">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                            <p className="review-text">"{review.text}"</p>
                            <p className="review-author">- {review.author}</p>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="customer-reviews">
            <h2>Google Maps Customer Feedback</h2>
            <div className="reviews-container">
                {reviews.map((review, index) => (
                    <div key={index} className="review-card">
                        <div className="review-header">
                            <img
                                src={review.profile_photo_url}
                                alt={review.author_name}
                                className="profile-photo"
                            />
                            <div className="reviewer-info">
                                <div className="stars">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <p className="review-author">{review.author_name}</p>
                                <p className="review-time">{review.relative_time_description}</p>
                            </div>
                        </div>
                        <p className="review-text">"{review.text}"</p>
                    </div>
                ))}
            </div>

            <div className="appointment-section">
                <button className="book-appointment-btn">
                    Book Appointment
                </button>
                <a href="#services" className="view-services-link">
                    View All Services
                </a>
            </div>
        </section>
    );
};

export default CustomerReviews;