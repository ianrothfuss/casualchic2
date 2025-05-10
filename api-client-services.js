// API Client Services for Casual Chic Boutique 2.0

// src/services/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

// Create axios instance with default config
export const medusaClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
medusaClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('medusa_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
medusaClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medusa_token');
      // Redirect to login page if needed
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication Services

export const loginUser = async (email, password) => {
  try {
    const response = await medusaClient.post('/store/auth', { email, password });
    if (response.data.customer) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('medusa_token', response.data.customer.token);
      }
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await medusaClient.post('/store/customers', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medusa_token');
  }
  // Additional cleanup if needed
};

export const getCurrentUser = async () => {
  try {
    const response = await medusaClient.get('/store/auth');
    return response.data.customer;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Product Services

export const getProducts = async (params = {}) => {
  try {
    const response = await medusaClient.get('/store/products', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getProduct = async (handle) => {
  try {
    const response = await medusaClient.get(`/store/products/${handle}`);
    return response.data.product;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getTrendingProducts = async () => {
  try {
    const response = await medusaClient.get('/store/products/trending');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getNewArrivals = async () => {
  try {
    // Get the newest products by sorting by created_at
    const response = await medusaClient.get('/store/products', {
      params: {
        limit: 10,
        sort: 'created_at',
        order: 'DESC',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getRelatedProducts = async (productId, categoryId, limit = 4) => {
  try {
    // Get products in the same category
    const response = await medusaClient.get('/store/products', {
      params: {
        category_id: categoryId,
        limit,
        id: { $ne: productId }, // Exclude current product
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const searchProducts = async (searchTerm) => {
  try {
    const response = await medusaClient.get('/store/products', {
      params: {
        q: searchTerm,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Category Services

export const getCategories = async () => {
  try {
    const response = await medusaClient.get('/store/product-categories');
    return response.data.product_categories;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getCategory = async (handle) => {
  try {
    const response = await medusaClient.get(`/store/product-categories/${handle}`);
    return response.data.product_category;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Cart Services

export const createCart = async () => {
  try {
    const response = await medusaClient.post('/store/carts');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartId', response.data.cart.id);
    }
    return response.data.cart;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getCart = async (cartId) => {
  try {
    const response = await medusaClient.get(`/store/carts/${cartId}`);
    return response.data.cart;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const addItemToCart = async (cartId, variantId, quantity = 1) => {
  try {
    const response = await medusaClient.post(`/store/carts/${cartId}/line-items`, {
      variant_id: variantId,
      quantity,
    });
    return response.data.cart;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const updateCartItem = async (cartId, lineId, quantity) => {
  try {
    const response = await medusaClient.post(`/store/carts/${cartId}/line-items/${lineId}`, {
      quantity,
    });
    return response.data.cart;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const removeCartItem = async (cartId, lineId) => {
  try {
    const response = await medusaClient.delete(`/store/carts/${cartId}/line-items/${lineId}`);
    return response.data.cart;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const createCheckout = async (cartId, customer) => {
  try {
    const response = await medusaClient.post(`/store/carts/${cartId}/checkout`, {
      email: customer.email,
      shipping_address: customer.shipping_address,
      billing_address: customer.billing_address,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Order Services

export const getOrders = async () => {
  try {
    const response = await medusaClient.get('/store/customers/me/orders');
    return response.data.orders;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await medusaClient.get(`/store/orders/${id}`);
    return response.data.order;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Custom Outfit Services

export const getOutfits = async (params = {}) => {
  try {
    const response = await medusaClient.get('/store/outfits', { params });
    return response.data.outfits;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getOutfit = async (id) => {
  try {
    const response = await medusaClient.get(`/store/outfits/${id}`);
    return response.data.outfit;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const createOutfit = async (outfitData) => {
  try {
    const response = await medusaClient.post('/store/outfits', outfitData);
    return response.data.outfit;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const deleteOutfit = async (id) => {
  try {
    const response = await medusaClient.delete(`/store/outfits/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Style Profile Services

export const getStyleProfile = async () => {
  try {
    const response = await medusaClient.get('/store/style-profile');
    return response.data.profile;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const createStyleProfile = async (profileData) => {
  try {
    const response = await medusaClient.post('/store/style-profile', profileData);
    return response.data.profile;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getStyleRecommendations = async () => {
  try {
    const response = await medusaClient.get('/store/style-profile/recommendations');
    return response.data.recommendations;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// User Measurements Services

export const getUserMeasurements = async () => {
  try {
    const response = await medusaClient.get('/store/measurements');
    return response.data.measurements;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const updateUserMeasurements = async (measurementsData) => {
  try {
    const response = await medusaClient.post('/store/measurements', measurementsData);
    return response.data.measurements;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Size Recommendation Services

export const getSizeRecommendation = async (productId, measurements) => {
  try {
    const response = await medusaClient.post('/store/size-recommendation', {
      product_id: productId,
      measurements,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Virtual Try-On Services

export const uploadTryOnImage = async (formData) => {
  try {
    const response = await medusaClient.post('/store/virtual-try-on/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const generateVirtualTryOn = async (productId, userImageId) => {
  try {
    const response = await medusaClient.post('/store/virtual-try-on/generate', {
      product_id: productId,
      user_image_id: userImageId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getTryOnResult = async (id) => {
  try {
    const response = await medusaClient.get(`/store/virtual-try-on/${id}`);
    return response.data.try_on;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
