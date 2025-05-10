// Home Page Component for Casual Chic Boutique 2.0

// storefront/src/pages/index.js
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTrendingProducts } from '../hooks/useTrendingProducts';
import { useNewArrivals } from '../hooks/useNewArrivals';
import { useCategories } from '../hooks/useCategories';
import { useStyleProfile } from '../hooks/useStyleProfile';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import ProductSlider from '../components/ProductSlider';
import CategoryGrid from '../components/CategoryGrid';
import Hero from '../components/Hero';
import FeaturedOutfit from '../components/FeaturedOutfit';
import StyleQuiz from '../components/StyleQuiz';
import Newsletter from '../components/Newsletter';
import Loader from '../components/Loader';

const HomePage = () => {
  const { user } = useAuth();
  const { products: trendingProducts, isLoading: trendingLoading } = useTrendingProducts();
  const { products: newArrivals, isLoading: newArrivalsLoading } = useNewArrivals();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { recommendations, profile } = useStyleProfile();
  
  const [showStyleQuiz, setShowStyleQuiz] = useState(false);
  
  // Featured collection - could be fetched from backend in a real implementation
  const featuredCollection = {
    id: 'summer-2025',
    title: 'Summer 2025 Collection',
    description: 'Embrace the season with our latest summer styles. Light fabrics, vibrant colors, and effortless elegance for warm days and cool nights.',
    image: '/images/collections/summer-2025.jpg',
    handle: 'summer-2025'
  };
  
  // Featured outfit - could be fetched from backend in a real implementation
  const featuredOutfit = {
    id: 'beach-day',
    name: 'Beach Day Ensemble',
    description: 'The perfect outfit for a stylish day at the beach or a casual boardwalk stroll.',
    products: newArrivals?.slice(0, 3) || [],
    image: '/images/outfits/beach-day.jpg'
  };
  
  return (
    <Layout title="Casual Chic Boutique - Fashion Redefined">
      {/* Hero Section */}
      <Hero 
        title="Redefine Your Style"
        subtitle="Discover the perfect blend of comfort and elegance"
        ctaText="Shop New Collection"
        ctaLink="/products"
        backgroundImage="/images/hero-banner.jpg"
      />
      
      {/* Featured Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center mb-8">Shop by Category</h2>
          
          {categoriesLoading ? (
            <div className="text-center py-12">
              <Loader />
            </div>
          ) : (
            <CategoryGrid 
              categories={categories?.slice(0, 4) || [
                { name: 'Dresses', image: '/images/categories/dresses.jpg', handle: 'dresses' },
                { name: 'Tops', image: '/images/categories/tops.jpg', handle: 'tops' },
                { name: 'Bottoms', image: '/images/categories/bottoms.jpg', handle: 'bottoms' },
                { name: 'Accessories', image: '/images/categories/accessories.jpg', handle: 'accessories' }
              ]}
            />
          )}
          
          <div className="text-center mt-8">
            <Link href="/categories">
              <a className="btn btn-secondary">View All Categories</a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Collection */}
      <section className="section bg-light">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="featured-collection-content">
              <h2 className="section-title mb-4">{featuredCollection.title}</h2>
              <p className="mb-6">{featuredCollection.description}</p>
              <Link href={`/collections/${featuredCollection.handle}`}>
                <a className="btn btn-primary">Explore Collection</a>
              </Link>
            </div>
            
            <div className="featured-collection-image relative h-96 w-full">
              <Image 
                src={featuredCollection.image}
                alt={featuredCollection.title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center mb-8">New Arrivals</h2>
          
          {newArrivalsLoading ? (
            <div className="text-center py-12">
              <Loader />
            </div>
          ) : (
            <ProductSlider products={newArrivals || []} />
          )}
          
          <div className="text-center mt-8">
            <Link href="/products?sort=created_at&order=desc">
              <a className="btn btn-secondary">View All New Arrivals</a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Virtual Try-On Promo */}
      <section className="section bg-primary/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="virtual-try-on-image relative h-96 w-full">
              <Image 
                src="/images/features/virtual-try-on.jpg"
                alt="Virtual Try-On"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow"
              />
              
              <div className="absolute top-4 left-4 bg-primary text-white py-2 px-4 rounded-lg">
                New Feature
              </div>
            </div>
            
            <div className="virtual-try-on-content">
              <h2 className="section-title mb-4">Virtual Try-On Experience</h2>
              <p className="mb-6">
                See how our clothes look on you before you buy. Our virtual try-on feature lets you
                visualize any garment on your own photo for a personalized shopping experience.
              </p>
              <Link href="/products">
                <a className="btn btn-primary">Try It Now</a>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending Products */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center mb-8">Trending Now</h2>
          
          {trendingLoading ? (
            <div className="text-center py-12">
              <Loader />
            </div>
          ) : (
            <ProductSlider products={trendingProducts || []} />
          )}
          
          <div className="text-center mt-8">
            <Link href="/products?sort=popularity&order=desc">
              <a className="btn btn-secondary">View All Trending Items</a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Outfit */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title text-center mb-8">Complete The Look</h2>
          
          <FeaturedOutfit outfit={featuredOutfit} />
          
          <div className="text-center mt-8">
            <Link href="/outfits">
              <a className="btn btn-secondary">Explore Outfit Ideas</a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Style Quiz Banner */}
      <section className="section">
        <div className="container">
          <div className="style-quiz-banner bg-brand-accent/10 p-8 rounded-lg text-center">
            <h2 className="text-2xl mb-3">Find Your Personal Style</h2>
            <p className="mb-6">
              Take our quick style quiz and discover pieces that match your unique taste.
              Get personalized recommendations based on your preferences.
            </p>
            <button 
              className="btn btn-accent"
              onClick={() => setShowStyleQuiz(true)}
            >
              Start Style Quiz
            </button>
          </div>
        </div>
      </section>
      
      {/* Personalized Recommendations (for logged-in users with a style profile) */}
      {user && profile && recommendations && recommendations.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title text-center mb-2">For You, {user.first_name}</h2>
            <p className="text-center mb-8">
              Personalized recommendations based on your style profile
            </p>
            
            <ProductSlider products={recommendations.map(rec => rec.product) || []} />
            
            <div className="text-center mt-8">
              <Link href="/recommendations">
                <a className="btn btn-secondary">View All Recommendations</a>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Sustainability Banner */}
      <section className="section bg-primary/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="sustainability-content order-2 md:order-1">
              <h2 className="section-title mb-4">Sustainable Fashion</h2>
              <p className="mb-6">
                We're committed to reducing our environmental impact and promoting ethical
                manufacturing. Look for our sustainability rating on each product to make
                informed choices.
              </p>
              <Link href="/about/sustainability">
                <a className="btn btn-primary">Learn About Our Commitment</a>
              </Link>
            </div>
            
            <div className="sustainability-image relative h-96 w-full order-1 md:order-2">
              <Image 
                src="/images/features/sustainability.jpg"
                alt="Sustainable Fashion"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <Newsletter />
      
      {/* Style Quiz Modal */}
      {showStyleQuiz && (
        <StyleQuiz onClose={() => setShowStyleQuiz(false)} />
      )}
    </Layout>
  );
};

export default HomePage;
