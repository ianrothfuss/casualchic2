import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';

export default function Home() {
  // Featured categories for homepage
  const featuredCategories = [
    {
      id: "tops",
      name: "Tops",
      image: "/images/category-tops.jpg",
      description: "Stylish tops for every occasion",
    },
    {
      id: "bottoms",
      name: "Bottoms",
      image: "/images/category-bottoms.jpg",
      description: "Complete your look with the perfect bottoms",
    },
    {
      id: "dresses",
      name: "Dresses",
      image: "/images/category-dresses.jpg",
      description: "Elegant dresses for every season",
    },
    {
      id: "accessories",
      name: "Accessories",
      image: "/images/category-accessories.jpg",
      description: "The finishing touches for your outfit",
    },
  ];

  // Featured products for homepage
  const featuredProducts = [
    {
      id: "prod_1",
      title: "Casual Linen Blouse",
      price: 4900,
      image: "/images/product-1.jpg",
      handle: "casual-linen-blouse",
    },
    {
      id: "prod_2",
      title: "Classic Denim Jeans",
      price: 7900,
      image: "/images/product-2.jpg",
      handle: "classic-denim-jeans",
    },
    {
      id: "prod_3",
      title: "Summer Floral Dress",
      price: 8900,
      image: "/images/product-3.jpg",
      handle: "summer-floral-dress",
    },
    {
      id: "prod_4",
      title: "Leather Crossbody Bag",
      price: 12900,
      image: "/images/product-4.jpg",
      handle: "leather-crossbody-bag",
    },
  ];

  return (
    <Layout title="Home | Casual Chic Boutique">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Style</h1>
          <p className="hero-subtitle">
            Discover the latest trends in women's fashion
          </p>
          <div className="hero-cta">
            <Link href="/products">
              <a className="btn btn-primary">Shop Now</a>
            </Link>
            <Link href="/outfits">
              <a className="btn btn-secondary">Explore Outfits</a>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories container mx-auto my-16 px-4">
        <h2 className="section-title text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => (
            <div key={category.id} className="category-card">
              <Link href={`/categories/${category.id}`}>
                <a className="block relative rounded overflow-hidden">
                  <div className="aspect-w-4 aspect-h-5">
                    <div className="h-full w-full relative">
                      {/* Placeholder for now, will use actual images in production */}
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                        <span>{category.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="category-info p-4">
                    <h3 className="category-name text-lg font-medium">
                      {category.name}
                    </h3>
                    <p className="category-description text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products container mx-auto my-16 px-4">
        <h2 className="section-title text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <Link href={`/products/${product.handle}`}>
                <a className="block">
                  <div className="product-image relative rounded overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1">
                      <div className="h-full w-full relative">
                        {/* Placeholder for now, will use actual images in production */}
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                          <span>{product.title}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="product-info p-4">
                    <h3 className="product-title text-lg font-medium">
                      {product.title}
                    </h3>
                    <p className="product-price text-primary font-medium">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products">
            <a className="btn btn-primary">View All Products</a>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features bg-light py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-8">Why Shop With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card text-center p-6">
              <div className="feature-icon mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
              </div>
              <h3 className="feature-title text-xl font-medium mb-2">
                Virtual Try-On
              </h3>
              <p className="feature-description text-gray-600">
                Try clothes virtually before you buy them.
              </p>
            </div>

            <div className="feature-card text-center p-6">
              <div className="feature-icon mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="feature-title text-xl font-medium mb-2">
                Outfit Builder
              </h3>
              <p className="feature-description text-gray-600">
                Create and save your perfect outfits.
              </p>
            </div>

            <div className="feature-card text-center p-6">
              <div className="feature-icon mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="feature-title text-xl font-medium mb-2">
                Size Recommendation
              </h3>
              <p className="feature-description text-gray-600">
                Get your perfect fit with personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter py-16">
        <div className="container mx-auto px-4">
          <div className="newsletter-content max-w-xl mx-auto text-center">
            <h2 className="section-title mb-4">Stay Updated</h2>
            <p className="mb-6">
              Subscribe to our newsletter for exclusive deals and style tips.
            </p>
            <form className="newsletter-form flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                className="form-control flex-grow"
                placeholder="Your email address"
                required
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}