import React from 'react';

const StarRating = ({ rating = 5, totalReviews = null, interactive = false, onRatingChange = null }) => {
  const rounded = Math.round(rating);

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi ${star <= (interactive ? rating : rounded) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
            style={{ cursor: interactive ? 'pointer' : 'default', fontSize: interactive ? '1.5rem' : '0.9rem' }}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          ></i>
        ))}
      </div>
      <span className="fw-bold ms-1 text-dark" style={{ fontSize: '0.85rem' }}>
        {Number(rating).toFixed(1)}
      </span>
      {totalReviews !== null && (
        <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default StarRating;
