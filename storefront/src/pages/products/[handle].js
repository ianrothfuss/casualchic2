import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SizeRecommendation from '../../components/SizeRecommendation';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useUserMeasurements } from '../../hooks/useUserMeasurements';
import * as api from '../../services/api';

const ProductDetail = ({ product, error }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addItem, isLoading: cartLoading } = useCart();
  const { getSizeRecommendation } = useUserMeasurements();
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);
  const [showSizeRecommendation, setShowSizeRecommendation] = useState(false);
  const [sizeRecommendation, setSizeRecommendation] = useState(null);
  const [sizeRecommendationLoading, setSizeRecommendationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // If the router is still loading the query params
  const { handle, isFallback } = router;
  
  // Handle product variant selection based on selected options
  useEffect(() => {
    if (product && product.variants) {
      // If no selected variant or selected options change, find the matching variant
      const matchingVariant = product.variants.find((variant) => {
        // Check if all selected options match this variant's options
        return variant.options.every(
          (option) => selectedOptions[option.option_id] === option.value
        );
      });
      
      // If a matching variant is found, select it
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      } else if (product.variants.length > 0) {
        // Otherwise, select the first variant
        const firstVariant = product.variants[0];
        setSelectedVariant(firstVariant);
        
        // Initialize selected options based on the first variant
        const initialOptions = {};
        firstVariant.options.forEach((option) => {
          initialOptions[option.option_id] = option.value;
        });
        setSelectedOptions(initialOptions);
      }
    }
  }, [product, selectedOptions]);

  // Handle option change
  const handleOptionChange = (optionId, value) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionId]: value,
    });
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    try {
      setIsAddingToCart(true);
      setAddToCartError(null);
      
      await addItem(selectedVariant.id, quantity);
      
      // Show success message or open cart drawer here
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setAddToCartError('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle get size recommendation
  const handleGetSizeRecommendation = async (measurements) => {
    try {
      setSizeRecommendationLoading(true);
      const recommendation = await getSizeRecommendation(product.id, measurements);
      setSizeRecommendation(recommendation);
    } catch (err) {
      console.error('Error getting size recommendation:', err);
    } finally {
      setSizeRecommendationLoading(false);
    }
  };

  // Format price display
  const formatPrice = (variant) => {
    if (!variant || !variant.prices || variant.prices.length === 0) {
      return 'Price not available';
    }
    
    const price = variant.prices[0];
    return `$${(price.amount / 100).toFixed(2)}`;
  };

  // If there was an error fetching the product
  if (error) {
    return (
      <Layout title="Product Not Found | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Product Not Found</h1>
            <p className="mb-6">Sorry, the product you're looking for could not be found.</p>
            <Link href="/products">
              <a className="btn btn-primary">Continue Shopping</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // If the product data is still loading
  if (isFallback || !product) {
    return (
      <Layout title="Loading... | Casual Chic Boutique">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${product.title} | Casual Chic Boutique`}>
      <Head>
        <title>{product.title} | Casual Chic Boutique</title>
        <meta name="description" content={product.description?.substring(0, 160) || `${product.title} - Casual Chic Boutique`} />
        <meta property="og:title" content={`${product.title} | Casual Chic Boutique`} />
        <meta property="og:description" content={product.description?.substring(0, 160) || `${product.title} - Casual Chic Boutique`} />
        {product.thumbnail && (
          <meta property="og:image" content={product.thumbnail} />
        )}
      </Head>

      <div className="product-detail-page py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="product-images">
              {/* Main Image */}
              <div className="main-image mb-4 relative aspect-w-4 aspect-h-5 rounded-lg overflow-hidden bg-gray-100">
                <div className="h-[600px] w-full relative">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[activeImage].url}
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
              
              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="image-thumbnails grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      className={`relative aspect-w-1 aspect-h-1 rounded overflow-hidden ${
                        index === activeImage ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <div className="h-24 w-full relative">
                        <Image
                          src={image.url}
                          alt={`${product.title} - Image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Virtual Try-On Button */}
              <div className="virtual-try-on-button mt-6">
                <Link href={`/virtual-try-on?product=${product.id}`}>
                  <a className="btn btn-secondary w-full flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Virtual Try-On</span>
                  </a>
                </Link>
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <h1 className="text-3xl font-serif font-bold mb-2">{product.title}</h1>
              
              {/* Price */}
              <div className="product-price text-2xl text-primary font-medium mb-4">
                {formatPrice(selectedVariant)}
              </div>
              
              {/* Short Description */}
              {product.subtitle && (
                <div className="product-subtitle text-gray-600 mb-6">
                  {product.subtitle}
                </div>
              )}
              
              {/* Variant Options */}
              {product.options && product.options.length > 0 && (
                <div className="product-options space-y-4 mb-6">
                  {product.options.map((option) => (
                    <div key={option.id} className="option">
                      <label className="block text-sm font-medium mb-2">
                        {option.title}
                      </label>
                      
                      <div className="option-values flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <button
                            key={value.id}
                            className={`px-4 py-2 border rounded ${
                              selectedOptions[option.id] === value.value
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-gray-300 hover:border-primary'
                            }`}
                            onClick={() => handleOptionChange(option.id, value.value)}
                          >
                            {value.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Size Recommendation */}
              {product.metadata?.product_type && ['tops', 'bottoms', 'dresses'].includes(product.metadata.product_type) && (
                <div className="size-recommendation mb-6">
                  <button
                    className="text-primary hover:underline flex items-center space-x-1"
                    onClick={() => setShowSizeRecommendation(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Find Your Size</span>
                  </button>
                </div>
              )}
              
              {/* Add to Cart */}
              <div className="add-to-cart mb-8">
                {/* Quantity Selector */}
                <div className="quantity-selector flex items-center space-x-4 mb-4">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex">
                    <button
                      className="px-3 py-2 border border-r-0 rounded-l"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-16 px-3 py-2 border text-center"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <button
                      className="px-3 py-2 border border-l-0 rounded-r"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedVariant}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="loading-spinner animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                {/* Cart Error */}
                {addToCartError && (
                  <div className="text-red-500 text-sm mt-2">{addToCartError}</div>
                )}
              </div>
              
              {/* Wishlist and Share */}
              <div className="product-actions flex space-x-4 mb-8">
                {/* Wishlist Button */}
                <button className="text-gray-600 hover:text-primary flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Add to Wishlist</span>
                </button>
                
                {/* Share Button */}
                <button className="text-gray-600 hover:text-primary flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
              
              {/* Product Details Tabs */}
              <div className="product-tabs mb-8">
                <div className="tab-header border-b">
                  <div className="flex">
                    <button
                      className={`py-2 px-4 border-b-2 ${
                        activeTab === 'description'
                          ? 'border-primary text-primary'
                          : 'border-transparent'
                      }`}
                      onClick={() => setActiveTab('description')}
                    >
                      Description
                    </button>
                    <button
                      className={`py-2 px-4 border-b-2 ${
                        activeTab === 'details'
                          ? 'border-primary text-primary'
                          : 'border-transparent'
                      }`}
                      onClick={() => setActiveTab('details')}
                    >
                      Details
                    </button>
                    <button
                      className={`py-2 px-4 border-b-2 ${
                        activeTab === 'sizing'
                          ? 'border-primary text-primary'
                          : 'border-transparent'
                      }`}
                      onClick={() => setActiveTab('sizing')}
                    >
                      Sizing
                    </button>
                  </div>
                </div>
                
                <div className="tab-content py-4">
                  {activeTab === 'description' && (
                    <div className="tab-pane">
                      <div className="product-description prose">
                        {product.description ? (
                          <p>{product.description}</p>
                        ) : (
                          <p>No description available.</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'details' && (
                    <div className="tab-pane">
                      <div className="product-details">
                        <ul className="list-disc pl-5 space-y-2">
                          {product.metadata?.material && (
                            <li><strong>Material:</strong> {product.metadata.material}</li>
                          )}
                          {product.metadata?.care && (
                            <li><strong>Care:</strong> {product.metadata.care}</li>
                          )}
                          {product.metadata?.fit && (
                            <li><strong>Fit:</strong> {product.metadata.fit}</li>
                          )}
                          {product.metadata?.origin && (
                            <li><strong>Origin:</strong> {product.metadata.origin}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'sizing' && (
                    <div className="tab-pane">
                      <div className="product-sizing">
                        <p className="mb-4">
                          Reference the size chart below or use our
                          <button
                            className="text-primary hover:underline ml-1"
                            onClick={() => setShowSizeRecommendation(true)}
                          >
                            size recommendation tool
                          </button>.
                        </p>
                        
                        <div className="size-chart overflow-x-auto">
                          <table className="w-full min-w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 px-4 text-left">Size</th>
                                <th className="py-2 px-4 text-left">Bust (cm)</th>
                                <th className="py-2 px-4 text-left">Waist (cm)</th>
                                <th className="py-2 px-4 text-left">Hips (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="py-2 px-4">XS</td>
                                <td className="py-2 px-4">76-81</td>
                                <td className="py-2 px-4">58-63</td>
                                <td className="py-2 px-4">83-88</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4">S</td>
                                <td className="py-2 px-4">82-87</td>
                                <td className="py-2 px-4">64-69</td>
                                <td className="py-2 px-4">89-94</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4">M</td>
                                <td className="py-2 px-4">88-93</td>
                                <td className="py-2 px-4">70-75</td>
                                <td className="py-2 px-4">95-100</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4">L</td>
                                <td className="py-2 px-4">94-99</td>
                                <td className="py-2 px-4">76-81</td>
                                <td className="py-2 px-4">101-106</td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-2 px-4">XL</td>
                                <td className="py-2 px-4">100-107</td>
                                <td className="py-2 px-4">82-89</td>
                                <td className="py-2 px-4">107-114</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Size Recommendation Modal */}
          <SizeRecommendation
            product={product}
            onGetRecommendation={handleGetSizeRecommendation}
            recommendation={sizeRecommendation}
            show={showSizeRecommendation}
            onClose={() => setShowSizeRecommendation(false)}
          />
        </div>
      </div>
    </Layout>
  );
};

// Get product data server-side
export async function getServerSideProps({ params }) {
  try {
    const product = await api.getProduct(params.handle);
    
    return {
      props: {
        product,
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return {
      props: {
        error: true,
      },
    };
  }
}

export default ProductDetail;