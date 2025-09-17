import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { FiFilter, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const sort = searchParams.get('sort') || 'newest';
  const inStock = searchParams.get('inStock') || 'true';

  // React Query fetch
  var { data, isLoading, error } = useQuery(
    [
      'products',
      {
        page,
        limit,
        search,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        size,
        color,
        sort,
        inStock,
      },
    ],
    async () => {
      const res = await productsAPI.getProducts({
        page,
        limit,
        search,
        category,
        subcategory,
        brand,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        size,
        color,
        sort,
        inStock: inStock === 'true',
      });
  
      // ✅ now only return products array
      return (data = res.data);
    }
  );
  

  const products = data?.products || [];
  const totalProducts = data?.totalProducts || 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    newParams.set('limit', limit.toString());
    setSearchParams(newParams);
  };

  if (error) {
    return (
      <div className="products-error">
        <h2>Something went wrong</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Products</h1>
          {search && <p className="search-results">Showing results for "{search}"</p>}
        </div>

        <div className="products-content">
          {/* Filters Sidebar */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="close-filters" onClick={() => setShowFilters(false)}>×</button>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                <span>-</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <h4>Brand</h4>
              <input type="text" placeholder="Search brand" value={brand} onChange={(e) => handleFilterChange('brand', e.target.value)} />
            </div>

            <div className="filter-group">
              <h4>Size</h4>
              <select value={size} onChange={(e) => handleFilterChange('size', e.target.value)}>
                <option value="">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="filter-group">
              <h4>Color</h4>
              <input type="text" placeholder="Search color" value={color} onChange={(e) => handleFilterChange('color', e.target.value)} />
            </div>

            <div className="filter-group">
              <h4>Availability</h4>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={inStock === 'true'} onChange={(e) => handleFilterChange('inStock', e.target.checked.toString())} />
                <span className="checkmark"></span>
                In Stock Only
              </label>
            </div>
          </div>

          {/* Products Main */}
          <div className="products-main">
            <div className="products-toolbar">
              <div className="toolbar-left">
                <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                  <FiFilter /> Filters
                </button>
                <span className="results-count">{totalProducts} products found</span>
              </div>

              <div className="toolbar-right">
                <div className="sort-dropdown">
                  <FiChevronDown />
                  <select value={sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                <div className="view-toggle">
                  <button className={`view-button ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
                  <button className={`view-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                <div className={`products-grid ${viewMode}`}>
                  {products.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <span className="page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
