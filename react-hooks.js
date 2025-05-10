// React Hooks for Casual Chic Boutique 2.0

// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(params.limit || 12);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = {
          ...params,
          offset,
          limit,
        };
        
        const data = await getProducts(queryParams);
        
        if (offset === 0) {
          setProducts(data.products);
        } else {
          setProducts(prevProducts => [...prevProducts, ...data.products]);
        }
        
        // Check if there are more products to load
        setHasMore(data.count > offset + data.products.length);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [params, offset, limit]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setOffset(prevOffset => prevOffset + limit);
    }
  };

  return { products, isLoading, error, hasMore, loadMore };
};

// src/hooks/useProduct.js
import { useState, useEffect } from 'react';
import { getProduct } from '../services/api';

export const useProduct = (handle) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!handle) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getProduct(handle);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { product, isLoading, error };
};

// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

// src/hooks/useCategory.js
import { useState, useEffect } from 'react';
import { getCategory } from '../services/api';

export const useCategory = (handle) => {
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!handle) return;

    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getCategory(handle);
        setCategory(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch category');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [handle]);

  return { category, isLoading, error };
};

// src/hooks/useTrendingProducts.js
import { useState, useEffect } from 'react';
import { getTrendingProducts } from '../services/api';

export const useTrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getTrendingProducts();
        setProducts(data.products);
      } catch (err) {
        setError(err.message || 'Failed to fetch trending products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return { products, isLoading, error };
};

// src/hooks/useNewArrivals.js
import { useState, useEffect } from 'react';
import { getNewArrivals } from '../services/api';

export const useNewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getNewArrivals();
        setProducts(data.products);
      } catch (err) {
        setError(err.message || 'Failed to fetch new arrivals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return { products, isLoading, error };
};

// src/hooks/useRelatedProducts.js
import { useState, useEffect } from 'react';
import { getRelatedProducts } from '../services/api';

export const useRelatedProducts = (productId, categoryId, limit = 4) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId || !categoryId) return;

    const fetchRelatedProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getRelatedProducts(productId, categoryId, limit);
        setProducts(data.products);
      } catch (err) {
        setError(err.message || 'Failed to fetch related products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId, limit]);

  return { products, isLoading, error };
};

// src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('medusa_token');
        
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        setError(err.message || 'Authentication failed');
        localStorage.removeItem('medusa_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await loginUser(email, password);
      setUser(data.customer);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await registerUser(userData);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// src/hooks/useCart.js
import { useState, useEffect, useContext, createContext } from 'react';
import {
  createCart,
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
} from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if we have a cart ID in local storage
        const cartId = localStorage.getItem('cartId');
        
        if (cartId) {
          // Get the existing cart
          try {
            const cartData = await getCart(cartId);
            setCart(cartData);
          } catch (err) {
            // If the cart doesn't exist anymore, create a new one
            const newCart = await createCart();
            setCart(newCart);
          }
        } else {
          // Create a new cart
          const newCart = await createCart();
          setCart(newCart);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize cart');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, []);

  const addItem = async (variantId, quantity = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!cart) {
        throw new Error('Cart not initialized');
      }
      
      const updatedCart = await addItemToCart(cart.id, variantId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (lineId, quantity) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!cart) {
        throw new Error('Cart not initialized');
      }
      
      const updatedCart = await updateCartItem(cart.id, lineId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to update cart item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (lineId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!cart) {
        throw new Error('Cart not initialized');
      }
      
      const updatedCart = await removeCartItem(cart.id, lineId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to remove cart item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!cart) {
        throw new Error('Cart not initialized');
      }
      
      const updatedCart = await getCart(cart.id);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message || 'Failed to refresh cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        itemCount: cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0,
        totalAmount: cart ? cart.total / 100 : 0, // Convert cents to dollars
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

// src/hooks/useOutfits.js
import { useState, useEffect } from 'react';
import { getOutfits, createOutfit, deleteOutfit } from '../services/api';

export const useOutfits = (params = {}) => {
  const [outfits, setOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getOutfits(params);
        setOutfits(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch outfits');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutfits();
  }, [params]);

  const createNewOutfit = async (outfitData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newOutfit = await createOutfit(outfitData);
      setOutfits(prevOutfits => [...prevOutfits, newOutfit]);
      return newOutfit;
    } catch (err) {
      setError(err.message || 'Failed to create outfit');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeOutfit = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteOutfit(id);
      setOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete outfit');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    outfits,
    isLoading,
    error,
    createOutfit: createNewOutfit,
    deleteOutfit: removeOutfit,
  };
};

// src/hooks/useOutfit.js
import { useState, useEffect } from 'react';
import { getOutfit } from '../services/api';

export const useOutfit = (id) => {
  const [outfit, setOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchOutfit = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getOutfit(id);
        setOutfit(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch outfit');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutfit();
  }, [id]);

  return { outfit, isLoading, error };
};

// src/hooks/useStyleProfile.js
import { useState, useEffect } from 'react';
import { getStyleProfile, createStyleProfile, getStyleRecommendations } from '../services/api';

export const useStyleProfile = () => {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getStyleProfile();
        setProfile(data);
        
        // If profile exists, get recommendations
        if (data) {
          const recData = await getStyleRecommendations();
          setRecommendations(recData);
        }
      } catch (err) {
        // It's okay if the profile doesn't exist yet
        if (err.message !== 'Profile not found') {
          setError(err.message || 'Failed to fetch style profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await createStyleProfile(profileData);
      setProfile(updatedProfile);
      
      // Get updated recommendations
      const recData = await getStyleRecommendations();
      setRecommendations(recData);
      
      return updatedProfile;
    } catch (err) {
      setError(err.message || 'Failed to update style profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    recommendations,
    isLoading,
    error,
    updateProfile,
  };
};

// src/hooks/useUserMeasurements.js
import { useState, useEffect } from 'react';
import { getUserMeasurements, updateUserMeasurements } from '../services/api';

export const useUserMeasurements = () => {
  const [measurements, setMeasurements] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getUserMeasurements();
        setMeasurements(data);
      } catch (err) {
        // It's okay if measurements don't exist yet
        if (err.message !== 'Measurements not found') {
          setError(err.message || 'Failed to fetch measurements');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  const updateMeasurements = async (measurementsData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedMeasurements = await updateUserMeasurements(measurementsData);
      setMeasurements(updatedMeasurements);
      return updatedMeasurements;
    } catch (err) {
      setError(err.message || 'Failed to update measurements');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    measurements,
    isLoading,
    error,
    updateMeasurements,
  };
};

// src/hooks/useSizeRecommendation.js
import { useState } from 'react';
import { getSizeRecommendation } from '../services/api';

export const useSizeRecommendation = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendation = async (productId, measurements) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getSizeRecommendation(productId, measurements);
      setRecommendation(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to get size recommendation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendation,
    isLoading,
    error,
    getRecommendation,
  };
};

// src/hooks/useVirtualTryOn.js
import { useState } from 'react';
import { uploadTryOnImage, generateVirtualTryOn, getTryOnResult } from '../services/api';

export const useVirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await uploadTryOnImage(formData);
      setUserImage(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateTryOn = async (productId, imageId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateVirtualTryOn(productId, imageId);
      
      // Start polling for the result as it's an async process
      pollTryOnResult(result.id);
      
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate try-on');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pollTryOnResult = async (id, interval = 2000, maxAttempts = 15) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const result = await getTryOnResult(id);
        
        if (result.status === 'completed') {
          setTryOnResult(result);
          setIsLoading(false);
          return;
        }
        
        if (result.status === 'failed') {
          throw new Error('Virtual try-on generation failed');
        }
        
        // If still processing and not reached max attempts, try again
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, interval);
        } else {
          throw new Error('Virtual try-on generation timeout');
        }
      } catch (err) {
        setError(err.message || 'Failed to get try-on result');
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    poll();
  };

  return {
    userImage,
    tryOnResult,
    isLoading,
    error,
    uploadImage,
    generateTryOn,
  };
};

// src/hooks/useOrders.js
import { useState, useEffect } from 'react';
import { getOrders, getOrder } from '../services/api';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getOrder(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    fetchOrderDetails,
  };
};

// src/hooks/useSearch.js
import { useState } from 'react';
import { searchProducts } from '../services/api';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchProducts(searchTerm);
      setResults(data.products);
      return data.products;
    } catch (err) {
      setError(err.message || 'Search failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
  };
};
