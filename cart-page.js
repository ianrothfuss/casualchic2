// Cart Page Component for Casual Chic Boutique 2.0

// storefront/src/pages/cart.js
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Breadcrumbs from '../components/Breadcrumbs';
import Loader from '../components/Loader';
import OutfitSuggestions from '../components/OutfitSuggestions';
import EmptyCart from '../components/EmptyCart';

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    cart, 
    isLoading, 
    error, 
    updateItem, 
    removeItem,
    refreshCart
  } = useCart();
  
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Handle quantity change
  const handleQuantityChange = async (lineId, value) => {
    const quantity = parseInt(value);
    
    if (isNaN(quantity) || quantity < 1) {
      return;
    }
    
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
  
  // Handle coupon submission
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode || couponCode.trim() === '') {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);
    
    try {
      // Mock implementation - in a real app, this would call the API
      // to apply the coupon to the cart
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, let's just accept "WELCOME10" as a valid coupon
      if (couponCode.toUpperCase() === 'WELCOME10') {
        setCouponSuccess('Coupon applied successfully! 10% discount added.');
        // In a real implementation, we would refresh the cart here
        await refreshCart();
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    // For authenticated users, go straight to checkout
    if (user) {
      router.push('/checkout');
    } else {
      // For guests, redirect to login with returnUrl set to checkout
      router.push('/login?returnUrl=/checkout');
    }
  };
  
  // Loading state
  if (isLoading && !cart) {
    return (
      <Layout title="Shopping Cart - Casual Chic Boutique">
        <div className="container py-8">
          <div className="text-center py-12">
            <Loader />
            <p className="mt-4">Loading your cart...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout title="Shopping Cart - Casual Chic Boutique">
        <div className="container py-8">
          <div className="text-center py-12">
            <p className="text-error mb-4">Error loading your cart. Please try again.</p>
            <button
              className="btn btn-primary"
              onClick={refreshCart}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <Layout title="Shopping Cart - Casual Chic Boutique">
        <div className="container py-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cart', href: null }
            ]}
            className="mb-6"
          />
          
          <EmptyCart />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Shopping Cart - Casual Chic Boutique">
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: null }
          ]}
          className="mb-6"
        />
        
        <h1 className="text-3xl font-serif mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-light">
                <div className="col-span-6 font-medium">Product</div>
                <div className="col-span-2 font-medium text-center">Price</div>
                <div className="col-span-2 font-medium text-center">Quantity</div>
                <div className="col-span-2 font-medium text-right">Total</div>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y">
                {cart.items.map(item => (
                  <div key={item.id} className="p-4">
                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="flex mb-4">
                        <div className="relative w-20 h-24 mr-4">
                          <Image
                            src={item.thumbnail || '/images/placeholder-product.jpg'}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Link href={`/products/${item.variant.product.handle}`}>
                            <a className="font-medium hover:text-primary mb-1 block">
                              {item.title}
                            </a>
                          </Link>
                          
                          {item.variant && item.variant.title !== 'Default Title' && (
                            <p className="text-sm text-gray-500 mb-2">
                              {item.variant.title}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm font-medium">
                              ${(item.unit_price / 100).toFixed(2)}
                            </div>
                            
                            <button
                              className="text-sm text-gray-500 hover:text-error"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removingItemId === item.id}
                            >
                              {removingItemId === item.id ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="quantity-selector flex items-center">
                          <button
                            className="w-8 h-8 flex items-center justify-center border rounded-l"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={updatingItemId === item.id || item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-12 h-8 border-t border-b text-center"
                            disabled={updatingItemId === item.id}
                          />
                          <button
                            className="w-8 h-8 flex items-center justify-center border rounded-r"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingItemId === item.id}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="font-medium">
                          ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <div className="flex items-center">
                          <div className="relative w-16 h-20 mr-4">
                            <Image
                              src={item.thumbnail || '/images/placeholder-product.jpg'}
                              alt={item.title}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          </div>
                          
                          <div>
                            <Link href={`/products/${item.variant.product.handle}`}>
                              <a className="font-medium hover:text-primary mb-1 block">
                                {item.title}
                              </a>
                            </Link>
                            
                            {item.variant && item.variant.title !== 'Default Title' && (
                              <p className="text-sm text-gray-500 mb-2">
                                {item.variant.title}
                              </p>
                            )}
                            
                            <button
                              className="text-sm text-gray-500 hover:text-error"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removingItemId === item.id}
                            >
                              {removingItemId === item.id ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        ${(item.unit_price / 100).toFixed(2)}
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <div className="quantity-selector flex items-center justify-center">
                          <button
                            className="w-8 h-8 flex items-center justify-center border rounded-l"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={updatingItemId === item.id || item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-12 h-8 border-t border-b text-center"
                            disabled={updatingItemId === item.id}
                          />
                          <button
                            className="w-8 h-8 flex items-center justify-center border rounded-r"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingItemId === item.id}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right font-medium">
                        ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Footer */}
              <div className="p-4 bg-light flex justify-between items-center">
                <Link href="/products">
                  <a className="text-sm hover:text-primary">
                    ← Continue Shopping
                  </a>
                </Link>
                
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={refreshCart}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Cart'}
                </button>
              </div>
            </div>
            
            {/* Cart Notes */}
            <div className="mt-8 bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-3">Order Notes</h3>
              <textarea
                className="form-control w-full"
                rows="3"
                placeholder="Any special instructions for your order..."
              ></textarea>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">${(cart.subtotal / 100).toFixed(2)}</span>
                </div>
                
                {cart.discount_total > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-${(cart.discount_total / 100).toFixed(2)}</span>
                  </div>
                )}
                
                {cart.tax_total > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(cart.tax_total / 100).toFixed(2)}</span>
                  </div>
                )}
                
                {cart.shipping_total > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${(cart.shipping_total / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-xl">${(cart.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-6">
                <form onSubmit={handleApplyCoupon}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="form-control flex-1"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isApplyingCoupon}
                    />
                    <button
                      type="submit"
                      className="btn btn-secondary"
                      disabled={isApplyingCoupon || !couponCode}
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </form>
                
                {couponError && (
                  <p className="text-error text-sm mt-2">{couponError}</p>
                )}
                
                {couponSuccess && (
                  <p className="text-success text-sm mt-2">{couponSuccess}</p>
                )}
              </div>
              
              {/* Checkout Button */}
              <button
                className="btn btn-primary w-full mb-4"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              
              {/* Secure Checkout Message */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex justify-center items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
                <p>All transactions are secure and encrypted.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cross-Sell: Complete the Look */}
        {cart.items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif mb-6">Complete Your Look</h2>
            
            <OutfitSuggestions 
              product={cart.items[0].variant.product}
              maxItems={4}
            />
          </div>
        )}
        
        {/* Recently Viewed */}
        <div className="mt-12">
          <h2 className="text-2xl font-serif mb-6">Recently Viewed</h2>
          
          {/* This would typically be populated from a cookie or local storage */}
          <div className="text-center py-8 bg-light rounded-lg">
            <p className="text-gray-500">Your recently viewed items will appear here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
