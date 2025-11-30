import React from 'react';

const StarRating = ({ rating, onRate, readOnly = false, size = '1.2rem' }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {stars.map((star) => (
                <span
                    key={star}
                    onClick={() => !readOnly && onRate && onRate(star)}
                    style={{
                        cursor: readOnly ? 'default' : 'pointer',
                        color: star <= rating ? '#ffc107' : '#e4e5e9',
                        fontSize: size,
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;
