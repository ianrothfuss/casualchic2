// Recently Viewed Component for Casual Chic Boutique 2.0

// storefront/src/components/RecentlyViewed.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const RecentlyViewed = ({ currentProductId, className = '' }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get recently viewed products from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    
    try {
      // Get existing recently viewed items
      const recentlyViewedString = localStorage.getItem('recentlyViewed');
      
      if (recentlyViewedString) {
        const items = JSON.parse(recentlyViewedString);
        
        // Filter out current product (if provided)
        const filteredItems = currentProductId 
          ? items.filter(item => item.id !== currentProductId)
          : items;
        
        setRecentlyViewed(filteredItems.slice(0, 6)); // Limit to 6 items
      }
    } catch (error) {
      console.error('Error getting recently viewed products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProductId]);
  
  // If no recently viewed products, return null
  if (isLoading) {
    return null;
  }
  
  if (recentlyViewed.length === 0) {
    return null;
  }
  
  return (
    <div className={`recently-viewed ${className}`}>
      <h2 className="text-2xl font-serif mb-6">Recently Viewed</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentlyViewed.map((product) => (
          <Link 
            href={`/products/${product.handle}`}
            key={product.id}
          >
            <a className="product-card-mini bg-white rounded-lg shadow overflow-hidden transition-transform hover:translate-y-[-4px]">
              <div className="relative h-40 md:h-48">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2 h-10 mb-1">{product.title}</h3>
                <p className="text-primary font-medium">${parseFloat(product.price).toFixed(2)}</p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
