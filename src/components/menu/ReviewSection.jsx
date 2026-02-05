import { useState } from 'react';
import { Rating } from './Rating';
import './ReviewSection.css';

export const ReviewSection = ({
  reviews = [],
  menuItemId,
  onSubmitReview,
  showForm = true,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitReview({
        menuItemId,
        customerName: customerName.trim() || 'Anonymous',
        rating,
        comment: comment.trim(),
      });
      setRating(0);
      setComment('');
      setCustomerName('');
      setShowReviewForm(false);
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="review-section">
      {/* Summary Header */}
      <div className="review-summary">
        <div className="review-summary-rating">
          <span className="review-summary-value">{averageRating.toFixed(1)}</span>
          <Rating value={averageRating} size="small" />
          <span className="review-summary-count">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        {showForm && !showReviewForm && (
          <button
            className="write-review-btn"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-rating">
            <label>Your Rating</label>
            <Rating
              value={rating}
              interactive
              onChange={setRating}
              size="large"
            />
          </div>

          <div className="review-form-field">
            <label>Your Name (optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Anonymous"
            />
          </div>

          <div className="review-form-field">
            <label>Your Review (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this dish..."
              rows={3}
            />
          </div>

          <div className="review-form-actions">
            <button
              type="button"
              className="review-form-cancel"
              onClick={() => {
                setShowReviewForm(false);
                setRating(0);
                setComment('');
                setCustomerName('');
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-form-submit"
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card-header">
                <div className="review-card-author">
                  <div className="review-avatar">
                    {(review.customerName || 'A')[0].toUpperCase()}
                  </div>
                  <div className="review-author-info">
                    <span className="review-author-name">
                      {review.customerName || 'Anonymous'}
                    </span>
                    <span className="review-date">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <Rating value={review.rating} size="small" />
              </div>
              {review.comment && (
                <p className="review-card-comment">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="reviews-empty">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};
