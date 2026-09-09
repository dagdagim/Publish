import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, CheckCircle, AlertCircle, Send, User } from 'lucide-react';

export default function ReviewSection({ product, onRatingUpdated }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: authorName.trim() || 'Verified User',
          rating: Number(rating),
          comment: comment.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review');
      }

      const data = await res.json();
      setReviews(prev => [data.review, ...prev]);
      setComment('');
      setAuthorName('');
      setSuccess(true);
      if (onRatingUpdated) {
        onRatingUpdated(data.rating, data.reviewCount);
      }
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate rating counts for breakdown bars
  const totalCount = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalCount).toFixed(1)
    : (product.rating || 5.0).toFixed(1);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #E2E8F0',
      padding: '32px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '36px'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} color="#2563EB" /> Ratings & User Reviews
        </h2>
        <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
          {totalCount} {totalCount === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      {/* Ratings Summary Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '32px',
        backgroundColor: '#F8FAFC',
        borderRadius: '18px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        marginBottom: '28px',
        alignItems: 'center'
      }}>
        {/* Left: Big Score */}
        <div style={{ textAlign: 'center', minWidth: '110px' }}>
          <div style={{ fontSize: '46px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
            {avgRating}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '8px 0 4px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={16}
                fill={star <= Math.round(avgRating) ? '#F59E0B' : 'none'}
                color={star <= Math.round(avgRating) ? '#F59E0B' : '#CBD5E1'}
              />
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {totalCount} ratings
          </div>
        </div>

        {/* Right: 5-to-1 Star Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star] || 0;
            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span style={{ width: '20px', fontWeight: '700', color: '#475569', textAlign: 'right' }}>
                  {star}★
                </span>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: star >= 4 ? '#16A34A' : star === 3 ? '#F59E0B' : '#EF4444',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ width: '32px', color: '#64748B', textAlign: 'right', fontSize: '11px' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a Review Form */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
          Rate this Application
        </h3>

        <form onSubmit={handleSubmitReview}>
          {/* Star Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Your Rating:</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(s => {
                const isLit = (hoverRating || rating) >= s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
                  >
                    <Star
                      size={22}
                      fill={isLit ? '#F59E0B' : 'none'}
                      color={isLit ? '#F59E0B' : '#CBD5E1'}
                    />
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginLeft: '6px' }}>
              {rating === 5 ? '5 Stars — Excellent' : rating === 4 ? '4 Stars — Good' : rating === 3 ? '3 Stars — Average' : rating === 2 ? '2 Stars — Fair' : '1 Star — Poor'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Your Name or Nickname (optional)"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="input-control"
              style={{ fontSize: '13.5px' }}
            />
            <textarea
              rows={3}
              placeholder="Share your experience with this app... What did you like or what could be improved?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              className="input-control"
              style={{ fontSize: '13.5px' }}
            />
          </div>

          {error && (
            <div style={{ color: '#DC2626', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#16A34A', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <CheckCircle size={14} /> Thank you! Your review has been published.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={13} /> {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
          User Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13.5px' }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            color: '#64748B'
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: '600' }}>No reviews yet.</p>
            <p style={{ margin: 0, fontSize: '12.5px' }}>Be the first to rate and review this app!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map(r => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '12px',
                      color: '#1D4ED8'
                    }}>
                      {r.userAvatar || (r.userName ? r.userName[0].toUpperCase() : 'U')}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                        {r.userName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={12}
                              fill={s <= (r.rating || 5) ? '#F59E0B' : 'none'}
                              color={s <= (r.rating || 5) ? '#F59E0B' : '#CBD5E1'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>• {r.date}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    color: '#16A34A',
                    backgroundColor: '#DCFCE7',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={10} /> Verified Install
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
