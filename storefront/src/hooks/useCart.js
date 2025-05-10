import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get cart ID from localStorage
  const getCartId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cartId');
    }
    return null;
  }, []);

  // Load cart on component mount
  useEffect(() => {
    const loadCart = async () => {
      const cartId = getCartId();
      
      if (!cartId) {
        // No existing cart, create one
        try {
          setIsLoading(true);
          const newCart = await api.createCart();
          setCart(newCart);
          setError(null);
        } catch (err) {
          console.error('Error creating cart:', err);
          setError('Failed to create cart');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fetch existing cart
        try {
          setIsLoading(true);
          const existingCart = await api.getCart(cartId);
          setCart(existingCart);
          setError(null);
        } catch (err) {
          console.error('Error fetching cart:', err);
          
          // If cart not found, create a new one
          if (err.status === 404) {
            try {
              const newCart = await api.createCart();
              setCart(newCart);
              setError(null);
            } catch (createErr) {
              setError('Failed to create cart');
            }
          } else {
            setError('Failed to load cart');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCart();
  }, [getCartId]);

  // Add item to cart
  const addItem = useCallback(async (variantId, quantity = 1) => {
    try {
      setIsLoading(true);
      let cartId = getCartId();
      
      // If no cart exists, create one first
      if (!cartId) {
        const newCart = await api.createCart();
        cartId = newCart.id;
        setCart(newCart);
      }
      
      const updatedCart = await api.addItemToCart(cartId, variantId, quantity);
      setCart(updatedCart);
      setError(null);
      return updatedCart;
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getCartId]);

  // Update item quantity
  const updateItem = useCallback(async (lineId, quantity) => {
    try {
      setIsLoading(true);
      const cartId = getCartId();
      
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const updatedCart = await api.updateCartItem(cartId, lineId, quantity);
      setCart(updatedCart);
      setError(null);
      return updatedCart;
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getCartId]);

  // Remove item from cart
  const removeItem = useCallback(async (lineId) => {
    try {
      setIsLoading(true);
      const cartId = getCartId();
      
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const updatedCart = await api.removeCartItem(cartId, lineId);
      setCart(updatedCart);
      setError(null);
      return updatedCart;
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getCartId]);

  // Calculate total number of items in cart
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Calculate total amount in cart
  const totalAmount = cart?.total || 0;

  return {
    cart,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    itemCount,
    totalAmount
  };
};