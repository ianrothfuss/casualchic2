import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import * as api from '../services/api';

const Checkout = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, error: cartError } = useCart();
  
  const [activeStep, setActiveStep] = useState('info');
  const [formData, setFormData] = useState({
    email: '',
    shipping_address: {
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: 'US',
      phone: '',
    },
    billing_address: {
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: 'US',
      phone: '',
    },
    same_as_shipping: true,
    payment_method: 'card',
    card: {
      number: '',
      expiry: '',
      cvc: '',
      name: '',
    },
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [order, setOrder] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  // Populate form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        shipping_address: {
          ...prev.shipping_address,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          ...(user.shipping_addresses && user.shipping_addresses.length > 0
            ? {
                address_1: user.shipping_addresses[0].address_1 || '',
                address_2: user.shipping_addresses[0].address_2 || '',
                city: user.shipping_addresses[0].city || '',
                province: user.shipping_addresses[0].province || '',
                postal_code: user.shipping_addresses[0].postal_code || '',
                country_code: user.shipping_addresses[0].country_code || 'US',
                phone: user.shipping_addresses[0].phone || user.phone || '',
              }
            : {}),
        },
      }));
    }
  }, [isAuthenticated, user]);

  // Update billing address when same_as_shipping changes
  useEffect(() => {
    if (formData.same_as_shipping) {
      setFormData((prev) => ({
        ...prev,
        billing_address: { ...prev.shipping_address },
      }));
    }
  }, [formData.same_as_shipping, formData.shipping_address]);

  // Handle form input changes
  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'same_as_shipping') {
      setFormData({
        ...formData,
        same_as_shipping: checked,
      });
      return;
    }
    
    if (section) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Validate the customer information form
  const validateInfoForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate shipping address
    if (!formData.shipping_address.first_name) {
      newErrors['shipping_address.first_name'] = 'First name is required';
    }
    
    if (!formData.shipping_address.last_name) {
      newErrors['shipping_address.last_name'] = 'Last name is required';
    }
    
    if (!formData.shipping_address.address_1) {
      newErrors['shipping_address.address_1'] = 'Address is required';
    }
    
    if (!formData.shipping_address.city) {
      newErrors['shipping_address.city'] = 'City is required';
    }
    
    if (!formData.shipping_address.province) {
      newErrors['shipping_address.province'] = 'State/Province is required';
    }
    
    if (!formData.shipping_address.postal_code) {
      newErrors['shipping_address.postal_code'] = 'Postal code is required';
    }
    
    if (!formData.shipping_address.country_code) {
      newErrors['shipping_address.country_code'] = 'Country is required';
    }
    
    // If billing address is different from shipping, validate it too
    if (!formData.same_as_shipping) {
      if (!formData.billing_address.first_name) {
        newErrors['billing_address.first_name'] = 'First name is required';
      }
      
      if (!formData.billing_address.last_name) {
        newErrors['billing_address.last_name'] = 'Last name is required';
      }
      
      if (!formData.billing_address.address_1) {
        newErrors['billing_address.address_1'] = 'Address is required';
      }
      
      if (!formData.billing_address.city) {
        newErrors['billing_address.city'] = 'City is required';
      }
      
      if (!formData.billing_address.province) {
        newErrors['billing_address.province'] = 'State/Province is required';
      }
      
      if (!formData.billing_address.postal_code) {
        newErrors['billing_address.postal_code'] = 'Postal code is required';
      }
      
      if (!formData.billing_address.country_code) {
        newErrors['billing_address.country_code'] = 'Country is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate the payment form
  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (formData.payment_method === 'card') {
      if (!formData.card.number) {
        newErrors['card.number'] = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.card.number.replace(/\s/g, ''))) {
        newErrors['card.number'] = 'Card number must be 16 digits';
      }
      
      if (!formData.card.expiry) {
        newErrors['card.expiry'] = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.card.expiry)) {
        newErrors['card.expiry'] = 'Expiry date must be in MM/YY format';
      }
      
      if (!formData.card.cvc) {
        newErrors['card.cvc'] = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.card.cvc)) {
        newErrors['card.cvc'] = 'CVC must be 3 or 4 digits';
      }
      
      if (!formData.card.name) {
        newErrors['card.name'] = 'Name on card is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle customer info form submission
  const handleInfoSubmit = (e) => {
    e.preventDefault();
    
    if (validateInfoForm()) {
      setActiveStep('payment');
      window.scrollTo(0, 0);
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setCheckoutError(null);
      
      // In a real implementation, you would:
      // 1. Process the payment with a payment provider
      // 2. Complete the checkout with Medusa
      // 3. Redirect to the order confirmation page
      
      // For this pilot, we'll simulate a successful checkout
      setTimeout(() => {
        setOrder({
          id: 'ord_' + Math.random().toString(36).substr(2, 9),
          display_id: '1234',
          email: formData.email,
          shipping_address: formData.shipping_address,
          total: cart.total,
          items: cart.items,
        });
        
        setActiveStep('confirmation');
        window.scrollTo(0, 0);
      }, 2000);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('An error occurred during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  // If cart is loading, show loading indicator
  if (cartLoading || authLoading) {
    return (
      <Layout title="Checkout | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // If cart error, show error message
  if (cartError) {
    return (
      <Layout title="Checkout | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Error</h1>
            <p className="mb-6">There was an error loading your cart. Please try again.</p>
            <Link href="/cart">
              <a className="btn btn-primary">Return to Cart</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // If cart is empty, don't render anything (redirect will happen)
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <Layout title="Checkout | Casual Chic Boutique">
      <Head>
        <title>Checkout | Casual Chic Boutique</title>
      </Head>

      <div className="checkout-page py-12">
        <div className="container mx-auto px-4">
          {/* Checkout Steps */}
          <div className="checkout-steps flex justify-center mb-8">
            <div className="steps-container">
              <div className="flex items-center">
                <div className={`step-circle ${activeStep === 'info' || activeStep === 'payment' || activeStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <div className="step-label mx-2">Information</div>
                <div className="step-connector w-12 h-1 mx-2 bg-gray-200"></div>
                
                <div className={`step-circle ${activeStep === 'payment' || activeStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <div className="step-label mx-2">Payment</div>
                <div className="step-connector w-12 h-1 mx-2 bg-gray-200"></div>
                
                <div className={`step-circle ${activeStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <div className="step-label mx-2">Confirmation</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {/* Customer Information Step */}
              {activeStep === 'info' && (
                <div className="info-step">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-serif font-bold mb-6">Customer Information</h2>
                    
                    <form onSubmit={handleInfoSubmit}>
                      {/* Email */}
                      <div className="form-group mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                      
                      {/* Shipping Address */}
                      <div className="shipping-address mb-6">
                        <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div className="form-group">
                            <label htmlFor="shipping_first_name" className="block text-sm font-medium mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="shipping_first_name"
                              name="first_name"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.first_name'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.first_name}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.first_name'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.first_name']}
                              </p>
                            )}
                          </div>
                          
                          {/* Last Name */}
                          <div className="form-group">
                            <label htmlFor="shipping_last_name" className="block text-sm font-medium mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="shipping_last_name"
                              name="last_name"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.last_name'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.last_name}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.last_name'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.last_name']}
                              </p>
                            )}
                          </div>
                          
                          {/* Address Line 1 */}
                          <div className="form-group md:col-span-2">
                            <label htmlFor="shipping_address_1" className="block text-sm font-medium mb-2">
                              Address
                            </label>
                            <input
                              type="text"
                              id="shipping_address_1"
                              name="address_1"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.address_1'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.address_1}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.address_1'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.address_1']}
                              </p>
                            )}
                          </div>
                          
                          {/* Address Line 2 */}
                          <div className="form-group md:col-span-2">
                            <label htmlFor="shipping_address_2" className="block text-sm font-medium mb-2">
                              Apartment, suite, etc. (optional)
                            </label>
                            <input
                              type="text"
                              id="shipping_address_2"
                              name="address_2"
                              className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                              value={formData.shipping_address.address_2}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                            />
                          </div>
                          
                          {/* City */}
                          <div className="form-group">
                            <label htmlFor="shipping_city" className="block text-sm font-medium mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              id="shipping_city"
                              name="city"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.city'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.city}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.city'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.city']}
                              </p>
                            )}
                          </div>
                          
                          {/* State/Province */}
                          <div className="form-group">
                            <label htmlFor="shipping_province" className="block text-sm font-medium mb-2">
                              State / Province
                            </label>
                            <input
                              type="text"
                              id="shipping_province"
                              name="province"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.province'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.province}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.province'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.province']}
                              </p>
                            )}
                          </div>
                          
                          {/* Postal Code */}
                          <div className="form-group">
                            <label htmlFor="shipping_postal_code" className="block text-sm font-medium mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              id="shipping_postal_code"
                              name="postal_code"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.postal_code'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.postal_code}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            />
                            {errors['shipping_address.postal_code'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.postal_code']}
                              </p>
                            )}
                          </div>
                          
                          {/* Country */}
                          <div className="form-group">
                            <label htmlFor="shipping_country_code" className="block text-sm font-medium mb-2">
                              Country
                            </label>
                            <select
                              id="shipping_country_code"
                              name="country_code"
                              className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                errors['shipping_address.country_code'] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              value={formData.shipping_address.country_code}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                              required
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                            </select>
                            {errors['shipping_address.country_code'] && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors['shipping_address.country_code']}
                              </p>
                            )}
                          </div>
                          
                          {/* Phone */}
                          <div className="form-group">
                            <label htmlFor="shipping_phone" className="block text-sm font-medium mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              id="shipping_phone"
                              name="phone"
                              className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                              value={formData.shipping_address.phone}
                              onChange={(e) => handleChange(e, 'shipping_address')}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Billing Address */}
                      <div className="billing-address mb-6">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="same_as_shipping"
                            name="same_as_shipping"
                            className="mr-2"
                            checked={formData.same_as_shipping}
                            onChange={handleChange}
                          />
                          <label htmlFor="same_as_shipping" className="text-sm">
                            Billing address same as shipping address
                          </label>
                        </div>
                        
                        {!formData.same_as_shipping && (
                          <div className="billing-form">
                            <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* First Name */}
                              <div className="form-group">
                                <label htmlFor="billing_first_name" className="block text-sm font-medium mb-2">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  id="billing_first_name"
                                  name="first_name"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.first_name'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.first_name}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.first_name'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.first_name']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Last Name */}
                              <div className="form-group">
                                <label htmlFor="billing_last_name" className="block text-sm font-medium mb-2">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  id="billing_last_name"
                                  name="last_name"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.last_name'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.last_name}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.last_name'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.last_name']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Address Line 1 */}
                              <div className="form-group md:col-span-2">
                                <label htmlFor="billing_address_1" className="block text-sm font-medium mb-2">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  id="billing_address_1"
                                  name="address_1"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.address_1'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.address_1}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.address_1'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.address_1']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Address Line 2 */}
                              <div className="form-group md:col-span-2">
                                <label htmlFor="billing_address_2" className="block text-sm font-medium mb-2">
                                  Apartment, suite, etc. (optional)
                                </label>
                                <input
                                  type="text"
                                  id="billing_address_2"
                                  name="address_2"
                                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                  value={formData.billing_address.address_2}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                />
                              </div>
                              
                              {/* City */}
                              <div className="form-group">
                                <label htmlFor="billing_city" className="block text-sm font-medium mb-2">
                                  City
                                </label>
                                <input
                                  type="text"
                                  id="billing_city"
                                  name="city"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.city'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.city}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.city'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.city']}
                                  </p>
                                )}
                              </div>
                              
                              {/* State/Province */}
                              <div className="form-group">
                                <label htmlFor="billing_province" className="block text-sm font-medium mb-2">
                                  State / Province
                                </label>
                                <input
                                  type="text"
                                  id="billing_province"
                                  name="province"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.province'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.province}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.province'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.province']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Postal Code */}
                              <div className="form-group">
                                <label htmlFor="billing_postal_code" className="block text-sm font-medium mb-2">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  id="billing_postal_code"
                                  name="postal_code"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.postal_code'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.postal_code}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                />
                                {errors['billing_address.postal_code'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.postal_code']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Country */}
                              <div className="form-group">
                                <label htmlFor="billing_country_code" className="block text-sm font-medium mb-2">
                                  Country
                                </label>
                                <select
                                  id="billing_country_code"
                                  name="country_code"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['billing_address.country_code'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.billing_address.country_code}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                  required
                                >
                                  <option value="US">United States</option>
                                  <option value="CA">Canada</option>
                                  <option value="GB">United Kingdom</option>
                                  <option value="AU">Australia</option>
                                </select>
                                {errors['billing_address.country_code'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['billing_address.country_code']}
                                  </p>
                                )}
                              </div>
                              
                              {/* Phone */}
                              <div className="form-group">
                                <label htmlFor="billing_phone" className="block text-sm font-medium mb-2">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  id="billing_phone"
                                  name="phone"
                                  className="block w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                  value={formData.billing_address.phone}
                                  onChange={(e) => handleChange(e, 'billing_address')}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Form Actions */}
                      <div className="form-actions flex justify-between items-center">
                        <Link href="/cart">
                          <a className="text-primary hover:underline">← Return to cart</a>
                        </Link>
                        
                        <button type="submit" className="btn btn-primary">
                          Continue to Payment
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* Payment Step */}
              {activeStep === 'payment' && (
                <div className="payment-step">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-serif font-bold mb-6">Payment</h2>
                    
                    {checkoutError && (
                      <div className="error-alert bg-red-50 text-red-500 p-4 mb-6 rounded">
                        {checkoutError}
                      </div>
                    )}
                    
                    <form onSubmit={handlePaymentSubmit}>
                      {/* Payment Methods */}
                      <div className="payment-methods mb-6">
                        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {/* Credit Card */}
                          <label className="payment-method-option border p-4 rounded flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="payment_method"
                              value="card"
                              className="mr-3"
                              checked={formData.payment_method === 'card'}
                              onChange={handleChange}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>Credit / Debit Card</span>
                                <div className="payment-icons flex space-x-2">
                                  <span className="text-gray-400">Visa</span>
                                  <span className="text-gray-400">Mastercard</span>
                                  <span className="text-gray-400">Amex</span>
                                </div>
                              </div>
                            </div>
                          </label>
                          
                          {/* PayPal */}
                          <label className="payment-method-option border p-4 rounded flex items-center cursor-pointer opacity-50">
                            <input
                              type="radio"
                              name="payment_method"
                              value="paypal"
                              className="mr-3"
                              disabled
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>PayPal</span>
                                <span className="text-gray-400">Coming Soon</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      {/* Card Details */}
                      {formData.payment_method === 'card' && (
                        <div className="card-details mb-6">
                          <h3 className="text-lg font-medium mb-4">Card Details</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {/* Card Number */}
                            <div className="form-group">
                              <label htmlFor="card_number" className="block text-sm font-medium mb-2">
                                Card Number
                              </label>
                              <input
                                type="text"
                                id="card_number"
                                name="number"
                                className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                  errors['card.number'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.card.number}
                                onChange={(e) => handleChange(e, 'card')}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                required
                              />
                              {errors['card.number'] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors['card.number']}
                                </p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Expiry Date */}
                              <div className="form-group">
                                <label htmlFor="card_expiry" className="block text-sm font-medium mb-2">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  id="card_expiry"
                                  name="expiry"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['card.expiry'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.card.expiry}
                                  onChange={(e) => handleChange(e, 'card')}
                                  placeholder="MM/YY"
                                  maxLength="5"
                                  required
                                />
                                {errors['card.expiry'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['card.expiry']}
                                  </p>
                                )}
                              </div>
                              
                              {/* CVC */}
                              <div className="form-group">
                                <label htmlFor="card_cvc" className="block text-sm font-medium mb-2">
                                  CVC
                                </label>
                                <input
                                  type="text"
                                  id="card_cvc"
                                  name="cvc"
                                  className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                    errors['card.cvc'] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  value={formData.card.cvc}
                                  onChange={(e) => handleChange(e, 'card')}
                                  placeholder="123"
                                  maxLength="4"
                                  required
                                />
                                {errors['card.cvc'] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors['card.cvc']}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Name on Card */}
                            <div className="form-group">
                              <label htmlFor="card_name" className="block text-sm font-medium mb-2">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                id="card_name"
                                name="name"
                                className={`block w-full px-4 py-2 border rounded focus:ring-primary focus:border-primary ${
                                  errors['card.name'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.card.name}
                                onChange={(e) => handleChange(e, 'card')}
                                required
                              />
                              {errors['card.name'] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors['card.name']}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Billing Address Summary */}
                      <div className="billing-summary mb-6">
                        <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                        
                        <div className="p-4 border rounded bg-gray-50">
                          <p>
                            {formData.billing_address.first_name} {formData.billing_address.last_name}
                          </p>
                          <p>{formData.billing_address.address_1}</p>
                          {formData.billing_address.address_2 && (
                            <p>{formData.billing_address.address_2}</p>
                          )}
                          <p>
                            {formData.billing_address.city}, {formData.billing_address.province}{' '}
                            {formData.billing_address.postal_code}
                          </p>
                          <p>{formData.billing_address.country_code}</p>
                          {formData.billing_address.phone && (
                            <p>Phone: {formData.billing_address.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Form Actions */}
                      <div className="form-actions flex justify-between items-center">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => {
                            setActiveStep('info');
                            window.scrollTo(0, 0);
                          }}
                        >
                          ← Return to information
                        </button>
                        
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="loading-spinner animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            'Complete Order'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* Order Confirmation Step */}
              {activeStep === 'confirmation' && order && (
                <div className="confirmation-step">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-center mb-8">
                      <div className="success-check mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-serif font-bold mb-2">
                        Thank you for your order!
                      </h2>
                      <p className="text-gray-600">
                        Your order #{order.display_id} has been placed successfully.
                      </p>
                    </div>
                    
                    <div className="order-details mb-8">
                      <h3 className="text-lg font-medium mb-4">Order Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Confirmation Email */}
                        <div className="detail-block p-4 border rounded">
                          <h4 className="font-medium mb-2">Confirmation Email</h4>
                          <p>{order.email}</p>
                        </div>
                        
                        {/* Shipping Address */}
                        <div className="detail-block p-4 border rounded">
                          <h4 className="font-medium mb-2">Shipping Address</h4>
                          <p>
                            {order.shipping_address.first_name} {order.shipping_address.last_name}
                          </p>
                          <p>{order.shipping_address.address_1}</p>
                          {order.shipping_address.address_2 && (
                            <p>{order.shipping_address.address_2}</p>
                          )}
                          <p>
                            {order.shipping_address.city}, {order.shipping_address.province}{' '}
                            {order.shipping_address.postal_code}
                          </p>
                          <p>{order.shipping_address.country_code}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="order-items mb-8">
                      <h3 className="text-lg font-medium mb-4">Order Items</h3>
                      
                      <div className="items-list space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="item flex border-b pb-4">
                            <div className="item-image relative h-20 w-20 bg-gray-100 rounded flex-shrink-0">
                              {item.thumbnail ? (
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-gray-400 text-xs">No image</span>
                                </div>
                              )}
                              <div className="item-quantity absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {item.quantity}
                              </div>
                            </div>
                            
                            <div className="item-details flex-1 ml-4">
                              <h4 className="item-title font-medium">{item.title}</h4>
                              {item.variant && item.variant.title !== 'Default' && (
                                <p className="item-variant text-sm text-gray-600">{item.variant.title}</p>
                              )}
                            </div>
                            
                            <div className="item-price text-right">
                              {formatPrice(item.unit_price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Actions */}
                    <div className="order-actions flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                      <Link href="/">
                        <a className="btn btn-primary">Continue Shopping</a>
                      </Link>
                      
                      <Link href={`/account/orders/${order.id}`}>
                        <a className="btn btn-secondary">View Order</a>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="cart-items mb-6 max-h-80 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="cart-item flex py-3 border-b">
                      <div className="item-image relative h-16 w-16 bg-gray-100 rounded flex-shrink-0">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <div className="item-quantity absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="item-details flex-1 ml-4">
                        <h4 className="item-title text-sm font-medium">{item.title}</h4>
                        {item.variant && item.variant.title !== 'Default' && (
                          <p className="item-variant text-xs text-gray-600">{item.variant.title}</p>
                        )}
                      </div>
                      
                      <div className="item-price text-sm text-right">
                        {formatPrice(item.unit_price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Totals */}
                <div className="order-totals space-y-2 mb-6">
                  <div className="total-row flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  
                  <div className="total-row flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(cart.shipping_total)}</span>
                  </div>
                  
                  {cart.discount_total > 0 && (
                    <div className="total-row flex justify-between text-green-600">
                      <span>Discounts</span>
                      <span>-{formatPrice(cart.discount_total)}</span>
                    </div>
                  )}
                  
                  <div className="total-row flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(cart.tax_total)}</span>
                  </div>
                  
                  <div className="total-row flex justify-between font-medium text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>
                
                {/* Return to Cart */}
                <div className="text-center">
                  <Link href="/cart">
                    <a className="text-primary hover:underline text-sm">
                      Return to Cart
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;