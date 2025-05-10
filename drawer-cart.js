// Drawer Cart Component for Casual Chic Boutique 2.0

// storefront/src/components/DrawerCart.jsx
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '../hooks/useCart';
import Loader from './Loader';

const DrawerCart = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { 
    cart, 
    isLoading, 
    error, 
    updateItem, 
    removeItem,
    itemCount,
    totalAmount
  } = useCart();
  
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  
  // Handle quantity change
  const handleQuantityChange = async (lineId, quantity) => {
    try {
      setUpdatingItemId(lineId);
      await updateItem(lineId, quantity);
    } catch (error) {
      console.error('Error updating item quantity:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };
  
  // Handle item removal
  const handleRemoveItem = async (lineId) => {
    try {
      setRemovingItemId(lineId);
      await removeItem(lineId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingItemId(null);
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };
  
  // Handle view cart
  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    onClose();
  };
  
  return (
    <div className={`drawer-cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`drawer-cart ${isOpen ? 'open' : ''}`}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking on cart
      >
        {/* Cart Header */}
        <div className="drawer-cart-header">
          <h2 className="text-xl font-medium">Your Cart</h2>
          <button 
            className="drawer-cart-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart Content */}
        <div className="drawer-cart-content">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader />
              <p className="mt-4">Loading your cart...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <p className="text-error mb-4">Error loading your cart</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="empty-cart-icon mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Looks like you haven't added any items yet</p>
              <button 
                className="btn btn-primary"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  {/* Product Image */}
                  <div className="cart-item-image">
                    <div className="relative w-full h-full">
                      <Image 
                        src={item.thumbnail || '/images/placeholder-product.jpg'}
                        alt={item.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="cart-item-details">
                    <Link href={`/products/${item.variant.product.handle}`}>
                      <a className="cart-item-title" onClick={onClose}>
                        {item.title}
                      </a>
                    </Link>
                    
                    {item.variant && item.variant.title !== 'Default Title' && (
                      <p className="cart-item-variant">{item.variant.title}</p>
                    )}
                    
                    <div className="cart-item-price">
                      ${(item.unit_price / 100).toFixed(2)}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="cart-item-quantity">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updatingItemId === item.id || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn plus"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updatingItemId === item.id}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    className="cart-item-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItemId === item.id}
                    aria-label="Remove item"
                  >
                    {removingItemId === item.id ? (
                      <Loader size="small" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Footer */}
        {cart && cart.items.length > 0 && (
          <div className="drawer-cart-footer">
            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${(cart.subtotal / 100).toFixed(2)}</span>
              </div>
              
              {cart.discount_total > 0 && (
                <div className="cart-summary-row discount">
                  <span>Discount</span>
                  <span>-${(cart.discount_total / 100).toFixed(2)}</span>
                </div>
              )}
              
              <div className="cart-summary-row total">
                <span>Total</span>
                <span>${(cart.total / 100).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="cart-actions">
              <button 
                className="btn btn-primary w-full mb-2"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              
              <div className="flex justify-between">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleViewCart}
                >
                  View Cart
                </button>
                
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawerCart;
