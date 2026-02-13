"use client";

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Filter, ChevronDown, User } from 'lucide-react';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  size?: string;
  color?: string;
  images?: string[];
}

interface CustomerReviewsProps {
  productId: string;
  productName: string;
  averageRating?: number;
  totalReviews?: number;
}

export default function CustomerReviews({ 
  productId, 
  productName,
  averageRating = 0, 
  totalReviews = 0 
}: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('mostRecent');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        productId,
        sortBy,
        filter: filterBy,
      });
      
      const response = await fetch(`/api/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        console.error('Error fetching reviews:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews(); // Refresh reviews after submission
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {renderStars(review.rating)}
            <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </div>
        </div>
        {review.verified && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Verified Purchase
          </span>
        )}
      </div>
      
      <h4 className="font-medium mb-2">{review.title}</h4>
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.content}</p>
      
      {(review.size || review.color) && (
        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          {review.size && <span>Size: {review.size}</span>}
          {review.color && <span>Color: {review.color}</span>}
        </div>
      )}
      
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((image: string, index: number) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-4 text-sm">
        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">Helpful ({review.helpful})</span>
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ThumbsDown className="w-4 h-4" />
          <span className="text-xs">Not Helpful ({review.notHelpful})</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience with this product!</p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Write the First Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          
          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={productId}
                productName={productName}
                onReviewSubmitted={handleReviewSubmitted}
              />
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Reviews Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              {renderStars(Math.round(averageRating))}
              <p className="text-gray-600">{totalReviews} reviews</p>
            </div>
            
            <div className="text-center">
              <h3 className="font-medium mb-2">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${(Math.random() * 80 + 20)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="font-medium mb-2">Filter Reviews</h3>
              <p className="text-gray-600 text-sm mb-4">
                {totalReviews} reviews • {reviews.filter(r => r.rating >= 4).length} 5-star reviews
              </p>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="mostRecent">Most Recent</option>
                <option value="mostHelpful">Most Helpful</option>
                <option value="highestRating">Highest Rating</option>
                <option value="lowestRating">Lowest Rating</option>
              </select>
            </div>

            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Write a Review
            </button>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="absolute right-0 mt-12 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="py-2 border-b border-gray-200">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    filterBy === 'all' ? 'bg-gray-100' : ''
                  }`}
                >
                  All Reviews
                </button>
              </div>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating}>
                  <button
                    onClick={() => setFilterBy(rating.toString())}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      filterBy === rating.toString() ? 'bg-gray-100' : ''
                    }`}
                  >
                    {rating} Stars
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load More */}
        {reviews.length >= 10 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
