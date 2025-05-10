import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/Layout';
import VirtualTryOn from '../components/VirtualTryOn';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';

const VirtualTryOnPage = () => {
  const router = useRouter();
  const { product: productId } = router.query;
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  
  // Fetch product if productId is provided
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        
        const productData = await api.getProduct(productId);
        setProduct(productData);
        setError(null);
        
        // Add to recent products
        if (productData) {
          setRecentProducts(prev => {
            // Filter out this product if it's already in the list
            const filtered = prev.filter(p => p.id !== productData.id);
            
            // Add the product to the beginning of the list
            return [productData, ...filtered].slice(0, 4);
          });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  // Get recent products from local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem('recently_viewed_products');
      
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          setRecentProducts(parsedProducts);
        } catch (err) {
          console.error('Error parsing recent products from local storage:', err);
        }
      }
    }
  }, []);
  
  // Update recent products in local storage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && recentProducts.length > 0) {
      localStorage.setItem('recently_viewed_products', JSON.stringify(recentProducts));
    }
  }, [recentProducts]);
  
  // Handle product selection
  const handleSelectProduct = async (product) => {
    setProduct(product);
    
    // Update URL to reflect the selected product
    router.push({
      pathname: router.pathname,
      query: { product: product.id }
    }, undefined, { shallow: true });
  };
  
  return (
    <Layout title="Virtual Try-On | Casual Chic Boutique">
      <Head>
        <title>
          {product
            ? `Virtual Try-On: ${product.title} | Casual Chic Boutique`
            : 'Virtual Try-On | Casual Chic Boutique'}
        </title>
      </Head>

      <div className="virtual-try-on-page py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold mb-2">Virtual Try-On</h1>
          
          <p className="text-gray-600 mb-8">
            Experience clothes before you buy them with our virtual try-on technology.
          </p>
          
          {/* Product Selection */}
          {!product && !isLoading && (
            <div className="product-selection mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium mb-4">Select a Product to Try On</h2>
                
                {error && (
                  <div className="error-alert bg-red-50 text-red-500 p-4 mb-6 rounded">
                    {error}
                  </div>
                )}
                
                {/* Recent Products */}
                {recentProducts.length > 0 && (
                  <div className="recent-products mb-8">
                    <h3 className="text-lg font-medium mb-4">Recently Viewed</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {recentProducts.map((product) => (
                        <div key={product.id} className="product-card bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <button
                            className="w-full text-left"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className="product-image relative aspect-w-1 aspect-h-1">
                              <div className="h-[200px] w-full relative bg-gray-100">
                                {product.thumbnail ? (
                                  <Image
                                    src={product.thumbnail}
                                    alt={product.title}
                                    layout="fill"
                                    objectFit="cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <span className="text-gray-400">No image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="product-info p-4">
                              <h4 className="product-title text-sm font-medium line-clamp-2">
                                {product.title}
                              </h4>
                              
                              <div className="product-price mt-2 text-primary text-sm font-medium">
                                ${(product.variants[0]?.prices[0]?.amount / 100 || 0).toFixed(2)}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Browse Products Link */}
                <div className="browse-products text-center">
                  <Link href="/products">
                    <a className="btn btn-primary">Browse All Products</a>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="loading flex justify-center items-center h-64">
              <div className="loading-spinner animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Virtual Try-On Component */}
          {product && (
            <div className="virtual-try-on-container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">
                  {product.title}
                </h2>
                
                <button
                  className="text-primary hover:underline"
                  onClick={() => {
                    setProduct(null);
                    router.push({
                      pathname: router.pathname
                    }, undefined, { shallow: true });
                  }}
                >
                  Try a different product
                </button>
              </div>
              
              <VirtualTryOn product={product} />
              
              <div className="product-actions mt-8 flex justify-center">
                <Link href={`/products/${product.handle}`}>
                  <a className="btn btn-primary mx-2">View Product Details</a>
                </Link>
              </div>
            </div>
          )}
          
          {/* How It Works */}
          <div className="how-it-works mt-16">
            <h2 className="text-2xl font-serif font-bold mb-6">How Virtual Try-On Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="step text-center">
                <div className="step-number flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="step-title text-lg font-medium mb-2">Upload Your Photo</h3>
                <p className="step-description text-gray-600">
                  Upload a full-body photo with a neutral background for best results.
                </p>
              </div>
              
              <div className="step text-center">
                <div className="step-number flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="step-title text-lg font-medium mb-2">Generate Try-On</h3>
                <p className="step-description text-gray-600">
                  Our AI technology visualizes how the garment would look on you.
                </p>
              </div>
              
              <div className="step text-center">
                <div className="step-number flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="step-title text-lg font-medium mb-2">Shop with Confidence</h3>
                <p className="step-description text-gray-600">
                  Make purchase decisions with a better idea of how items will look on you.
                </p>
              </div>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="privacy-notice mt-12 p-6 bg-light rounded-lg">
            <h3 className="text-lg font-medium mb-2">Privacy & Security</h3>
            <p className="text-gray-600">
              Your photos are used solely for the try-on visualization and are automatically deleted after processing. 
              We do not store or share your images with third parties.
              {!isAuthenticated && (
                <span>
                  {' '}
                  <Link href="/login?redirect=/virtual-try-on">
                    <a className="text-primary hover:underline">Log in</a>
                  </Link>{' '}
                  to save your try-on history to your account.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VirtualTryOnPage;