import React, { useState, useEffect } from 'react';
import './CustomerReviews.css';
import { API_BASE_URL } from '../config';

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [failedImages, setFailedImages] = useState(new Set());

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

    if (reviews.length === 0 && !loading && !error) {
        return (
            <section className="customer-reviews">
                <h2>Google Maps Customer Feedback</h2>
                <div className="reviews-container">
                    <p>No reviews available at this time.</p>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="customer-reviews">
                <h2>Google Maps Customer Feedback</h2>
                <div className="reviews-container">
                    <p>Loading reviews...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="customer-reviews">
                <h2>Google Maps Customer Feedback</h2>
                <div className="reviews-container">
                    <p>{error}</p>
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
                                {imgSrc && !failedImages.has(index) ? (
                                    <img 
                                        src={imgSrc} 
                                        alt={author} 
                                        className="profile-photo" 
                                        onError={() => setFailedImages(prev => new Set([...prev, index]))}
                                    />
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