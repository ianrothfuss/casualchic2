// Casual Chic Boutique 2.0 - Frontend Components

// Frontend: Homepage Component (src/pages/index.js)
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useTrendingProducts } from '../hooks/useTrendingProducts';
import { useNewArrivals } from '../hooks/useNewArrivals';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductSlider from '../components/ProductSlider';
import Newsletter from '../components/Newsletter';
import StyleQuiz from '../components/StyleQuiz';

const HomePage = () => {
  const { products: trendingProducts, isLoading: trendingLoading } = useTrendingProducts();
  const { products: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals();
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);
  
  return (
    <Layout title="Casual Chic Boutique - Fashion Redefined">
      <Hero 
        title="Redefine Your Style"
        subtitle="Discover the perfect blend of comfort and elegance"
        ctaText="Shop New Collection"
        ctaLink="/products"
        backgroundImage="/images/hero-banner.jpg"
      />
      
      <FeaturedCategories categories={[
        { name: 'Summer Dresses', image: '/images/category-dresses.jpg', link: '/categories/dresses' },
        { name: 'Casual Wear', image: '/images/category-casual.jpg', link: '/categories/casual' },
        { name: 'Office Attire', image: '/images/category-office.jpg', link: '/categories/office' },
        { name: 'Accessories', image: '/images/category-accessories.jpg', link: '/categories/accessories' }
      ]} />
      
      <section className="section-trending">
        <div className="container">
          <h2 className="section-title">Trending Now</h2>
          <ProductSlider 
            products={trendingProducts} 
            isLoading={trendingLoading} 
          />
        </div>
      </section>
      
      <section className="section-new-arrivals">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <ProductSlider 
            products={newArrivals} 
            isLoading={newArrivalsLoading} 
          />
        </div>
      </section>
      
      <section className="section-style-quiz">
        <div className="container">
          <div className="style-quiz-banner">
            <h2>Find Your Personal Style</h2>
            <p>Take our quick style quiz and discover pieces that match your unique taste</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowStyleQuiz(true)}
            >
              Start Style Quiz
            </button>
          </div>
        </div>
      </section>
      
      {showStyleQuiz && (
        <StyleQuiz onClose={() => setShowStyleQuiz(false)} />
      )}
      
      <Newsletter />
    </Layout>
  );
};

export default HomePage;

// Frontend: Product Detail Page (src/pages/products/[handle].js)
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useProduct } from '../../hooks/useProduct';
import Layout from '../../components/Layout';
import ProductGallery from '../../components/ProductGallery';
import ProductInfo from '../../components/ProductInfo';
import VirtualTryOn from '../../components/VirtualTryOn';
import SizeRecommendation from '../../components/SizeRecommendation';
import RelatedProducts from '../../components/RelatedProducts';
import OutfitSuggestions from '../../components/OutfitSuggestions';

const ProductPage = () => {
  const router = useRouter();
  const { handle } = router.query;
  const { product, isLoading, error } = useProduct(handle);
  const [activeTab, setActiveTab] = useState('details');
  
  if (isLoading) {
    return (
      <Layout>
        <div className="product-loading">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !product) {
    return (
      <Layout>
        <div className="product-error">
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/products')}
          >
            Return to Shop
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${product.title} - Casual Chic Boutique`}>
      <div className="product-page">
        <div className="product-content">
          <div className="product-gallery-container">
            <ProductGallery 
              images={product.images} 
              title={product.title} 
            />
          </div>
          
          <div className="product-details-container">
            <ProductInfo product={product} />
          </div>
        </div>
        
        <div className="product-tabs">
          <div className="tabs-header">
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button 
              className={`tab ${activeTab === 'size' ? 'active' : ''}`}
              onClick={() => setActiveTab('size')}
            >
              Size & Fit
            </button>
            <button 
              className={`tab ${activeTab === 'try-on' ? 'active' : ''}`}
              onClick={() => setActiveTab('try-on')}
            >
              Virtual Try-On
            </button>
            <button 
              className={`tab ${activeTab === 'outfits' ? 'active' : ''}`}
              onClick={() => setActiveTab('outfits')}
            >
              Complete the Look
            </button>
          </div>
          
          <div className="tabs-content">
            {activeTab === 'details' && (
              <div className="tab-content">
                <h3>Product Details</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                
                {product.fabric_composition && (
                  <div className="fabric-composition">
                    <h4>Fabric</h4>
                    <p>{product.fabric_composition}</p>
                  </div>
                )}
                
                {product.care_instructions && (
                  <div className="care-instructions">
                    <h4>Care</h4>
                    <p>{product.care_instructions}</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'size' && (
              <div className="tab-content">
                <h3>Size & Fit</h3>
                <p>This {product.title} is designed with a {product.fit_type || 'standard'} fit.</p>
                
                <div className="size-guide">
                  <h4>Size Guide</h4>
                  {/* Size chart would be displayed here */}
                </div>
                
                <SizeRecommendation product={product} />
              </div>
            )}
            
            {activeTab === 'try-on' && (
              <div className="tab-content">
                <h3>Virtual Try-On</h3>
                <p>See how this {product.title} looks on you with our virtual try-on feature.</p>
                
                <VirtualTryOn product={product} />
              </div>
            )}
            
            {activeTab === 'outfits' && (
              <div className="tab-content">
                <h3>Complete the Look</h3>
                <p>Style this {product.title} with these suggested items for a complete outfit.</p>
                
                <OutfitSuggestions product={product} />
              </div>
            )}
          </div>
        </div>
        
        <RelatedProducts 
          productId={product.id} 
          categoryId={product.categories[0]?.id}
        />
      </div>
    </Layout>
  );
};

export default ProductPage;

// Frontend: Style Quiz Component (src/components/StyleQuiz.jsx)
import React, { useState } from 'react';
import { createStyleProfile } from '../services/api';

const StyleQuiz = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    preferred_styles: [],
    preferred_colors: [],
    preferred_occasions: [],
    disliked_styles: [],
    disliked_colors: [],
    size_preferences: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const styleOptions = [
    { id: 'casual', label: 'Casual', image: '/images/styles/casual.jpg' },
    { id: 'bohemian', label: 'Bohemian', image: '/images/styles/bohemian.jpg' },
    { id: 'minimalist', label: 'Minimalist', image: '/images/styles/minimalist.jpg' },
    { id: 'streetwear', label: 'Streetwear', image: '/images/styles/streetwear.jpg' },
    { id: 'preppy', label: 'Preppy', image: '/images/styles/preppy.jpg' },
    { id: 'vintage', label: 'Vintage', image: '/images/styles/vintage.jpg' },
    { id: 'athleisure', label: 'Athleisure', image: '/images/styles/athleisure.jpg' },
    { id: 'elegant', label: 'Elegant', image: '/images/styles/elegant.jpg' }
  ];
  
  const colorOptions = [
    { id: 'black', label: 'Black', hex: '#000000' },
    { id: 'white', label: 'White', hex: '#FFFFFF' },
    { id: 'navy', label: 'Navy', hex: '#000080' },
    { id: 'beige', label: 'Beige', hex: '#F5F5DC' },
    { id: 'pastel', label: 'Pastels', hex: '#FFB6C1' },
    { id: 'olive', label: 'Olive Green', hex: '#808000' },
    { id: 'burgundy', label: 'Burgundy', hex: '#800020' },
    { id: 'mustard', label: 'Mustard', hex: '#FFDB58' },
    { id: 'emerald', label: 'Emerald', hex: '#50C878' },
    { id: 'lavender', label: 'Lavender', hex: '#E6E6FA' }
  ];
  
  const occasionOptions = [
    { id: 'casual', label: 'Casual Everyday', image: '/images/occasions/casual.jpg' },
    { id: 'office', label: 'Office/Work', image: '/images/occasions/office.jpg' },
    { id: 'evening', label: 'Evening Out', image: '/images/occasions/evening.jpg' },
    { id: 'formal', label: 'Formal Events', image: '/images/occasions/formal.jpg' },
    { id: 'active', label: 'Active/Sports', image: '/images/occasions/active.jpg' },
    { id: 'vacation', label: 'Vacation', image: '/images/occasions/vacation.jpg' }
  ];
  
  const sizeOptions = {
    tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    bottoms: ['0', '2', '4', '6', '8', '10', '12', '14', '16'],
    dresses: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    shoes: ['5', '6', '7', '8', '9', '10', '11']
  };
  
  const steps = [
    {
      title: 'Styles You Love',
      description: 'Select the styles that resonate with you the most',
      field: 'preferred_styles',
      options: styleOptions,
      multiple: true
    },
    {
      title: 'Your Favorite Colors',
      description: 'Choose colors you love to wear',
      field: 'preferred_colors',
      options: colorOptions,
      multiple: true
    },
    {
      title: 'Colors You Avoid',
      description: 'Select colors you prefer not to wear',
      field: 'disliked_colors',
      options: colorOptions,
      multiple: true
    },
    {
      title: 'Dressing Occasions',
      description: 'What occasions do you typically dress for?',
      field: 'preferred_occasions',
      options: occasionOptions,
      multiple: true
    },
    {
      title: 'Styles You Avoid',
      description: 'Select styles that don\'t match your taste',
      field: 'disliked_styles',
      options: styleOptions,
      multiple: true
    },
    {
      title: 'Your Sizes',
      description: 'Help us recommend the right fit for you',
      field: 'size_preferences',
      type: 'size_selection'
    }
  ];
  
  const handleOptionSelect = (field, optionId) => {
    setAnswers(prev => {
      const current = [...prev[field]];
      const index = current.indexOf(optionId);
      
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(optionId);
      }
      
      return {
        ...prev,
        [field]: current
      };
    });
  };
  
  const handleSizeSelect = (category, size) => {
    setAnswers(prev => ({
      ...prev,
      size_preferences: {
        ...prev.size_preferences,
        [category]: size
      }
    }));
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await createStyleProfile(answers);
      setIsComplete(true);
    } catch (error) {
      console.error('Error creating style profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isComplete) {
    return (
      <div className="style-quiz-modal">
        <div className="style-quiz-content">
          <div className="style-quiz-complete">
            <h2>Your Style Profile is Complete!</h2>
            <p>Thank you for sharing your preferences. We'll use this information to personalize your shopping experience.</p>
            <p>Check out your personalized recommendations in your account dashboard.</p>
            <button className="btn btn-primary" onClick={onClose}>
              See Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="style-quiz-modal">
      <div className="style-quiz-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="style-quiz-header">
          <h2>{currentStepData.title}</h2>
          <p>{currentStepData.description}</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="style-quiz-body">
          {currentStepData.type === 'size_selection' ? (
            <div className="size-selection">
              <div className="size-category">
                <h3>Tops</h3>
                <div className="size-options">
                  {sizeOptions.tops.map(size => (
                    <button
                      key={`tops-${size}`}
                      className={`size-option ${answers.size_preferences.tops === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect('tops', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="size-category">
                <h3>Bottoms</h3>
                <div className="size-options">
                  {sizeOptions.bottoms.map(size => (
                    <button
                      key={`bottoms-${size}`}
                      className={`size-option ${answers.size_preferences.bottoms === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect('bottoms', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="size-category">
                <h3>Dresses</h3>
                <div className="size-options">
                  {sizeOptions.dresses.map(size => (
                    <button
                      key={`dresses-${size}`}
                      className={`size-option ${answers.size_preferences.dresses === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect('dresses', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="size-category">
                <h3>Shoes</h3>
                <div className="size-options">
                  {sizeOptions.shoes.map(size => (
                    <button
                      key={`shoes-${size}`}
                      className={`size-option ${answers.size_preferences.shoes === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect('shoes', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="options-grid">
              {currentStepData.options.map(option => (
                <div
                  key={option.id}
                  className={`option-card ${answers[currentStepData.field].includes(option.id) ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(currentStepData.field, option.id)}
                >
                  {option.image ? (
                    <div className="option-image">
                      <img src={option.image} alt={option.label} />
                    </div>
                  ) : option.hex ? (
                    <div className="color-swatch" style={{ backgroundColor: option.hex }}></div>
                  ) : null}
                  <div className="option-label">{option.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="style-quiz-footer">
          {currentStep > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep === steps.length - 1 ? (
              isSubmitting ? 'Saving...' : 'Complete Quiz'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyleQuiz;