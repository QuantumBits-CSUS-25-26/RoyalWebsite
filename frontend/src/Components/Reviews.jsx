import React, { useState, useEffect } from 'react';
import './CustomerReviews.css';
import { API_BASE_URL } from '../config';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/places/reviews`);
                if (!response.ok) {
                    console.error('Reviews API error', response.status, response.statusText);
                    setError('Error fetching reviews');
                    return;
                }

                const data = await response.json();

                if (data && data.status === 'OK' && data.result && Array.isArray(data.result.reviews)) {
                    // Prefer highest-rated and most recent reviews. Sort by rating desc, then time desc.
                    const sorted = data.result.reviews
                        .slice()
                        .sort((a, b) => {
                            const ra = Number(a.rating) || 0;
                            const rb = Number(b.rating) || 0;
                            if (rb !== ra) return rb - ra;
                            const ta = Number(a.time) || 0;
                            const tb = Number(b.time) || 0;
                            return tb - ta;
                        })
                        .slice(0, 3);

                    setReviews(sorted);
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
                {reviews.map((review, index) => {
                    const rating = Number(review.rating) || 0;
                    const filled = Math.max(0, Math.min(5, Math.floor(rating)));
                    const empty = 5 - filled;
                    const imgSrc = review && typeof review.profile_photo_url === 'string' ? review.profile_photo_url : null;
                    const author = review && (review.author_name || review.author) ? (review.author_name || review.author) : `Reviewer ${index + 1}`;
                    const time = review && review.relative_time_description ? review.relative_time_description : '';

                    return (
                        <div key={index} className="review-card">
                            <div className="review-header">
                                {imgSrc ? (
                                    <img src={imgSrc} alt={author} className="profile-photo" />
                                ) : null}
                                <div className="reviewer-info">
                                    <div className="stars">
                                        {'★'.repeat(filled)}{'☆'.repeat(empty)}
                                    </div>
                                    <p className="review-author">{author}</p>
                                    {time ? <p className="review-time">{time}</p> : null}
                                </div>
                            </div>
                            <p className="review-text">"{(review && review.text) || ''}"</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CustomerReviews;