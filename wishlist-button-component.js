// Wishlist Button Component for Casual Chic Boutique 2.0

// storefront/src/components/WishlistButton.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

const WishlistButton = ({ product, className = '' }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if product is in wishlist on mount and when user changes
  useEffect(() => {
    checkWishlistStatus();
  }, [user]);
  
  // Check if product is in wishlist
  const checkWishlistStatus = () => {
    if (!user) {
      // Check localStorage for guest wishlists
      try {
        const wishlistString = localStorage.getItem('guestWishlist');
        if (wishlistString) {
          const wishlist = JSON.parse(wishlistString);
          setIsInWishlist(wishlist.some(item => item.id === product.id));
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
      return;
    }
    
    // For logged in users, we would normally call an API
    // For demo purposes, we'll use localStorage
    try {
      const wishlistString = localStorage.getItem(`wishlist_${user.id}`);
      if (wishlistString) {
        const wishlist = JSON.parse(wishlistString);
        setIsInWishlist(wishlist.some(item => item.id === product.id));
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };
  
  // Toggle wishlist
  const toggleWishlist = async () => {
    setIsUpdating(true);
    
    try {
      if (!user) {
        // Handle guest wishlist
        handleGuestWishlist();
        return;
      }
      
      // For logged in users, we would normally call an API
      // For demo purposes, we'll use localStorage
      const wishlistString = localStorage.getItem(`wishlist_${user.id}`);
      let wishlist = wishlistString ? JSON.parse(wishlistString) : [];
      
      if (isInWishlist) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id !== product.id);
      } else {
        // Add to wishlist
        wishlist.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          thumbnail: product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : null),
          price: product.variants && product.variants[0]?.prices && product.variants[0]?.prices[0]?.amount
            ? (product.variants[0].prices[0].amount / 100).toFixed(2)
            : null,
          addedAt: new Date().toISOString()
        });
      }
      
      // Save to localStorage
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
      
      // Update state
      setIsInWishlist(!isInWishlist);
      
      // Track event for analytics
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: isInWishlist ? 'removeFromWishlist' : 'addToWishlist',
          ecommerce: {
            [isInWishlist ? 'remove' : 'add']: {
              products: [{
                name: product.title,
                id: product.id,
                price: product.variants?.[0]?.prices?.[0]?.amount 
                  ? (product.variants[0].prices[0].amount / 100).toFixed(2) 
                  : '0.00',
                category: product.categories?.[0]?.name || '',
                variant: product.variants?.[0]?.title || '',
              }]
            }
          }
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle guest wishlist
  const handleGuestWishlist = () => {
    try {
      const wishlistString = localStorage.getItem('guestWishlist');
      let wishlist = wishlistString ? JSON.parse(wishlistString) : [];
      
      if (isInWishlist) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id !== product.id);
      } else {
        // Add to wishlist
        wishlist.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          thumbnail: product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : null),
          price: product.variants && product.variants[0]?.prices && product.variants[0]?.prices[0]?.amount
            ? (product.variants[0].prices[0].amount / 100).toFixed(2)
            : null,
          addedAt: new Date().toISOString()
        });
      }
      
      // Save to localStorage
      localStorage.setItem('guestWishlist', JSON.stringify(wishlist));
      
      // Update state
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Error updating guest wishlist:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Prompt login for guest users
  const promptLogin = () => {
    router.push(`/login?returnUrl=${router.asPath}`);
  };
  
  return (
    <button
      className={`wishlist-button ${className} ${isInWishlist ? 'in-wishlist' : ''}`}
      onClick={toggleWishlist}
      disabled={isUpdating}
      aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {isInWishlist ? (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
              clipRule="evenodd" 
            />
          </svg>
          Saved
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          Wishlist
        </>
      )}
    </button>
  );
};

export default WishlistButton;
