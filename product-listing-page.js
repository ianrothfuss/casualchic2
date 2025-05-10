// Product Listing Page Component for Casual Chic Boutique 2.0

// storefront/src/pages/products/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import Breadcrumbs from '../../components/Breadcrumbs';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import FilterSidebar from '../../components/FilterSidebar';
import SortDropdown from '../../components/SortDropdown';

const ProductListingPage = () => {
  const router = useRouter();
  const { query } = router;
  
  // Parse query parameters
  const categoryId = query.category_id;
  const searchQuery = query.q;
  const sortOption = query.sort || 'created_at';
  const sortOrder = query.order || 'desc';
  const pageNumber = Number(query.page) || 1;
  const pageSize = Number(query.limit) || 12;
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get categories
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // Build query params for products fetch
  const buildProductParams = () => {
    const params = {
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
    };
    
    // Add sort options
    if (sortOption && sortOrder) {
      params.sort = sortOption;
      params.order = sortOrder;
    }
    
    // Add search query
    if (searchQuery) {
      params.q = searchQuery;
    }
    
    // Add category filter
    if (categoryId) {
      params.category_id = categoryId;
    } else if (selectedCategories.length > 0) {
      params.category_id = selectedCategories;
    }
    
    // Add price range filter
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      params.price_from = priceRange[0] * 100; // Convert to cents
      params.price_to = priceRange[1] * 100; // Convert to cents
    }
    
    // Add color filter
    if (selectedColors.length > 0) {
      params.colors = selectedColors;
    }
    
    // Add size filter
    if (selectedSizes.length > 0) {
      params.sizes = selectedSizes;
    }
    
    return params;
  };
  
  // Get products with built params
  const { products, isLoading, error, hasMore, loadMore } = useProducts(buildProductParams());
  
  // Effect to sync URL params with filter states
  useEffect(() => {
    if (query.category_id && !Array.isArray(query.category_id)) {
      setSelectedCategories(query.category_id.split(','));
    }
    
    if (query.price_range) {
      const [min, max] = query.price_range.split('-').map(Number);
      setPriceRange([min, max]);
    }
    
    if (query.colors) {
      setSelectedColors(query.colors.split(','));
    }
    
    if (query.sizes) {
      setSelectedSizes(query.sizes.split(','));
    }
  }, [query]);
  
  // Update URL with filter and sort params
  const updateUrlParams = () => {
    const params = {};
    
    if (selectedCategories.length > 0) {
      params.category_id = selectedCategories.join(',');
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      params.price_range = `${priceRange[0]}-${priceRange[1]}`;
    }
    
    if (selectedColors.length > 0) {
      params.colors = selectedColors.join(',');
    }
    
    if (selectedSizes.length > 0) {
      params.sizes = selectedSizes.join(',');
    }
    
    if (sortOption !== 'created_at' || sortOrder !== 'desc') {
      params.sort = sortOption;
      params.order = sortOrder;
    }
    
    if (pageNumber > 1) {
      params.page = pageNumber;
    }
    
    if (searchQuery) {
      params.q = searchQuery;
    }
    
    router.push({
      pathname: '/products',
      query: params
    }, undefined, { shallow: true });
  };
  
  // Apply filters handler
  const handleApplyFilters = () => {
    updateUrlParams();
    setIsSidebarOpen(false);
  };
  
  // Clear filters handler
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    
    router.push('/products', undefined, { shallow: true });
  };
  
  // Handle sort change
  const handleSortChange = (option, order) => {
    const newQuery = {
      ...router.query,
      sort: option,
      order: order,
      page: 1 // Reset to first page when sort changes
    };
    
    router.push({
      pathname: '/products',
      query: newQuery
    }, undefined, { shallow: true });
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    const newQuery = {
      ...router.query,
      page
    };
    
    router.push({
      pathname: '/products',
      query: newQuery
    }, undefined, { shallow: true });
    
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  // Get page title
  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    
    if (categoryId && categories) {
      const category = categories.find(c => c.id === categoryId);
      return category ? category.name : 'Products';
    }
    
    return 'All Products';
  };
  
  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (selectedColors.length > 0) count++;
    if (selectedSizes.length > 0) count++;
    
    return count;
  };
  
  return (
    <Layout title={`${getPageTitle()} - Casual Chic Boutique`}>
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: getPageTitle(), href: null }
          ]}
          className="mb-6"
        />
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-serif mb-4 md:mb-0">{getPageTitle()}</h1>
          
          <div className="flex items-center">
            {/* Mobile Filter Button */}
            <button
              className="btn btn-secondary mr-3 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span>Filters</span>
              {countActiveFilters() > 0 && (
                <span className="ml-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {countActiveFilters()}
                </span>
              )}
            </button>
            
            {/* Sort Dropdown */}
            <SortDropdown
              value={sortOption}
              order={sortOrder}
              onChange={handleSortChange}
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden md:block w-64 mr-8">
            <FilterSidebar
              categories={categories || []}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              isLoading={categoriesLoading}
            />
          </div>
          
          {/* Filter Sidebar - Mobile */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
              
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium">Filters</h3>
                  <button
                    className="text-gray-500"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <FilterSidebar
                  categories={categories || []}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedColors={selectedColors}
                  setSelectedColors={setSelectedColors}
                  selectedSizes={selectedSizes}
                  setSelectedSizes={setSelectedSizes}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  isLoading={categoriesLoading}
                />
              </div>
            </div>
          )}
          
          {/* Product Grid */}
          <div className="flex-1">
            {isLoading && products.length === 0 ? (
              <div className="text-center py-12">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-error">Error loading products. Please try again.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="mb-4">No products found.</p>
                <button
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Active Filters */}
                {countActiveFilters() > 0 && (
                  <div className="active-filters mb-6 p-4 bg-light rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Active Filters:</h3>
                      <button
                        className="text-sm text-primary"
                        onClick={handleClearFilters}
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap mt-3">
                      {selectedCategories.length > 0 && categories && (
                        <div className="filter-tag">
                          Categories: {selectedCategories.map(id => {
                            const category = categories.find(c => c.id === id);
                            return category ? category.name : id;
                          }).join(', ')}
                        </div>
                      )}
                      
                      {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                        <div className="filter-tag">
                          Price: ${priceRange[0]} - ${priceRange[1]}
                        </div>
                      )}
                      
                      {selectedColors.length > 0 && (
                        <div className="filter-tag">
                          Colors: {selectedColors.join(', ')}
                        </div>
                      )}
                      
                      {selectedSizes.length > 0 && (
                        <div className="filter-tag">
                          Sizes: {selectedSizes.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Products Count */}
                <div className="products-count mb-6 text-gray-500">
                  Showing {products.length} products
                </div>
                
                {/* Product Grid */}
                <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Load More / Pagination */}
                <div className="mt-12 text-center">
                  {hasMore ? (
                    <button
                      className="btn btn-secondary"
                      onClick={loadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  ) : (
                    <Pagination
                      currentPage={pageNumber}
                      totalPages={Math.ceil(products.length / pageSize)}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductListingPage;
