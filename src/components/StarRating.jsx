import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating = 5, totalStars = 5, size = 16, interactive = false, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(totalStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = interactive
          ? (hoverRating || rating) >= starValue
          : rating >= starValue;

        return (
          <button
            type="button"
            key={i}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none'
            }}
            aria-label={`Rate ${starValue} stars`}
          >
            <Star
              size={size}
              fill={isFilled ? '#F59E0B' : 'transparent'}
              color={isFilled ? '#F59E0B' : '#CBD5E1'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
