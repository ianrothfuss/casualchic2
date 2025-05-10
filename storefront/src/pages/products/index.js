import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import * as api from '../../services/api';

const ProductListing = () => {
  const router = useRouter();
  const { category, search, sort } = router.query;
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: category || '',
    sortBy: sort || 'created_at',
    sortOrder: 'DESC',
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products and categories on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const params = {
          limit: filters.limit,
          offset: (filters.page - 1) * filters.limit,
          sort: filters.sortBy,
          order: filters.sortOrder,
        };
        
        // Add category filter if present
        if (filters.category) {
          params.category_id = filters.category;
        }
        
        // Add search term if present
        if (search) {
          params.q = search;
        }
        
        // Fetch products
        const productsData = await api.getProducts(params);
        setProducts(productsData.products);
        
        // Calculate total pages
        const total = productsData.count;
        setTotalPages(Math.ceil(total / filters.limit));
        
        // Fetch categories if they haven't been loaded yet
        if (categories.length === 0) {
          const categoriesData = await api.getCategories();
          setCategories(categoriesData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters, search, categories.length]);

  // Update URL when filters change
  useEffect(() => {
    const query = { ...router.query };
    
    if (filters.category) {
      query.category = filters.category;
    } else {
      delete query.category;
    }
    
    if (filters.sortBy !== 'created_at' || filters.sortOrder !== 'DESC') {
      query.sort = filters.sortBy;
      query.order = filters.sortOrder;
    } else {
      delete query.sort;
      delete query.order;
    }
    
    if (filters.page > 1) {
      query.page = filters.page;
    } else {
      delete query.page;
    }
    
    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  }, [filters, router]);

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setFilters({
      ...filters,
      category: categoryId,
      page: 1, // Reset to first page when changing category
    });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    let sortBy, sortOrder;
    
    switch (value) {
      case 'price_asc':
        sortBy = 'price';
        sortOrder = 'ASC';
        break;
      case 'price_desc':
        sortBy = 'price';
        sortOrder = 'DESC';
        break;
      case 'name_asc':
        sortBy = 'title';
        sortOrder = 'ASC';
        break;
      case 'name_desc':
        sortBy = 'title';
        sortOrder = 'DESC';
        break;
      case 'newest':
      default:
        sortBy = 'created_at';
        sortOrder = 'DESC';
        break;
    }
    
    setFilters({
      ...filters,
      sortBy,
      sortOrder,
      page: 1, // Reset to first page when changing sort
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page,
    });
    
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  // Toggle mobile filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Layout title="Shop | Casual Chic Boutique">
      <Head>
        <title>
          {search
            ? `Search: ${search} | Casual Chic Boutique`
            : category
            ? `${categories.find(c => c.id === category)?.name || 'Category'} | Casual Chic Boutique`
            : 'Shop | Casual Chic Boutique'}
        </title>
      </Head>

      <div className="products-page py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="page-header mb-8">
            <h1 className="text-3xl font-serif font-bold">
              {search
                ? `Search Results: "${search}"`
                : category
                ? categories.find(c => c.id === category)?.name || 'Shop'
                : 'All Products'}
            </h1>
            
            {search && (
              <div className="mt-2">
                <Link href="/products">
                  <a className="text-primary hover:underline">Clear Search</a>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              className="btn btn-secondary w-full"
              onClick={toggleFilters}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div
              className={`filters md:block ${
                showFilters ? 'block' : 'hidden'
              }`}
            >
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium mb-4">Categories</h2>
                
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left py-1 ${
                        filters.category === '' ? 'font-medium text-primary' : ''
                      }`}
                      onClick={() => handleCategoryChange('')}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        className={`w-full text-left py-1 ${
                          filters.category === category.id ? 'font-medium text-primary' : ''
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Product Grid */}
            <div className="products-content md:col-span-3">
              {/* Sort and Filter Bar */}
              <div className="sort-bar flex justify-between items-center mb-6 pb-4 border-b">
                <div className="results-count">
                  {isLoading ? (
                    <span>Loading products...</span>
                  ) : (
                    <span>{products.length} products</span>
                  )}
                </div>
                
                <div className="sort-options">
                  <select
                    className="form-select border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={
                      filters.sortBy === 'created_at' && filters.sortOrder === 'DESC'
                        ? 'newest'
                        : filters.sortBy === 'price' && filters.sortOrder === 'ASC'
                        ? 'price_asc'
                        : filters.sortBy === 'price' && filters.sortOrder === 'DESC'
                        ? 'price_desc'
                        : filters.sortBy === 'title' && filters.sortOrder === 'ASC'
                        ? 'name_asc'
                        : filters.sortBy === 'title' && filters.sortOrder === 'DESC'
                        ? 'name_desc'
                        : 'newest'
                    }
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="loading flex justify-center items-center h-64">
                  <div className="loading-spinner animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : error ? (
                <div className="error-message text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-message text-center py-12">
                  <p className="text-gray-500 mb-4">No products found</p>
                  <Link href="/products">
                    <a className="btn btn-primary">View All Products</a>
                  </Link>
                </div>
              ) : (
                <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="product-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <Link href={`/products/${product.handle}`}>
                        <a className="block">
                          <div className="product-image relative aspect-w-1 aspect-h-1">
                            <div className="h-[300px] w-full relative bg-gray-100">
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
                            <h3 className="product-title text-lg font-medium">
                              {product.title}
                            </h3>
                            
                            <div className="product-price mt-2 text-primary font-medium">
                              ${(product.variants[0]?.prices[0]?.amount / 100 || 0).toFixed(2)}
                            </div>
                          </div>
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination flex justify-center mt-12">
                  <div className="flex">
                    <button
                      className="pagination-prev px-3 py-1 border rounded-l disabled:opacity-50"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1 || isLoading}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`pagination-num px-3 py-1 border-t border-b ${
                          page === filters.page ? 'bg-primary text-white' : ''
                        }`}
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      className="pagination-next px-3 py-1 border rounded-r disabled:opacity-50"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages || isLoading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductListing;