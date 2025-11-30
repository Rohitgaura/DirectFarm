import React, { useState } from 'react';
import StarRating from './StarRating';
import '../../styles/RatingModal.css';

const RatingModal = ({ isOpen, onClose, onSubmit, orderId, ratedUserName }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ orderId, rating, review });
            setRating(0);
            setReview('');
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-modal-overlay">
            <div className="rating-modal">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Rate {ratedUserName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="rating-input">
                        <label>Rating:</label>
                        <StarRating rating={rating} onRate={setRating} size="2rem" />
                    </div>
                    <div className="review-input">
                        <label>Review (Optional):</label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience..."
                            rows="4"
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
