import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, X, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const platformParam = searchParams.get('platform') || 'All';
  const sortParam = searchParams.get('sort') || 'relevance';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPlatform, setSelectedPlatform] = useState(platformParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [selectedRating, setSelectedRating] = useState(0);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);
    setSelectedPlatform(platformParam);
    setSelectedSort(sortParam);
  }, [queryParam, categoryParam, platformParam, sortParam]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Fetch filtered products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedPlatform && selectedPlatform !== 'All') params.set('platform', selectedPlatform);
    if (selectedSort) params.set('sort', selectedSort);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        let list = data.products || [];
        if (selectedRating > 0) {
          list = list.filter(p => (p.rating || 0) >= selectedRating);
        }
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory, selectedPlatform, selectedSort, selectedRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery });
  };

  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v && v !== 'All') updated.set(k, v);
      else updated.delete(k);
    });
    setSearchParams(updated);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPlatform('All');
    setSelectedRating(0);
    setSelectedSort('relevance');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '36px 24px 64px' }}>
      {/* Search Header Bar */}
      <div style={{ marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '640px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '42px', fontSize: '15px' }}
              placeholder="Search apps, games, web platforms, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="search-page-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); updateUrlParams({ q: '' }); }}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" id="search-page-submit-btn">
            Search
          </button>
        </form>
      </div>

      {/* Platform Quick Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'Android', 'Web', 'Games'].map(p => (
          <button
            key={p}
            onClick={() => {
              if (p === 'Games') {
                setSelectedCategory('Games');
                setSelectedPlatform('All');
                updateUrlParams({ category: 'Games', platform: 'All' });
              } else {
                setSelectedPlatform(p);
                updateUrlParams({ platform: p });
              }
            }}
            className={`btn btn-sm ${
              (p === 'Games' && selectedCategory === 'Games') || selectedPlatform === p
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
            style={{ borderRadius: '9999px', padding: '6px 16px' }}
          >
            {p === 'All' ? 'All Products' : p}
          </button>
        ))}
      </div>

      {/* Main Two-Column Layout (Sidebar Filters + Results Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#0F172A', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Category
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'All'}
                  onChange={() => { setSelectedCategory('All'); updateUrlParams({ category: 'All' }); }}
                />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                    onChange={() => { setSelectedCategory(cat.name); updateUrlParams({ category: cat.name }); }}
                  />
                  {cat.name}
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: 'auto' }}>
                    {cat.appCount}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#0F172A', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Rating
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[0, 4.5, 4.0, 3.0].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === r}
                    onChange={() => setSelectedRating(r)}
                  />
                  {r === 0 ? 'Any rating' : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {r}★ & higher
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={resetAllFilters}
            className="btn btn-outline btn-sm btn-block"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} /> Reset Filters
          </button>
        </aside>

        {/* Results Area */}
        <div>
          {/* Results Summary and Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '15px', color: '#475569' }}>
              {searchQuery ? (
                <>Results for "<strong style={{ color: '#0F172A' }}>{searchQuery}</strong>"</>
              ) : (
                <>Showing all <strong style={{ color: '#0F172A' }}>{selectedCategory === 'All' ? 'products' : selectedCategory}</strong></>
              )}
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#94A3B8' }}>
                ({products.length} {products.length === 1 ? 'result' : 'results'})
              </span>
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
              <span style={{ color: '#64748B' }}>Sort:</span>
              <select
                className="input-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={selectedSort}
                onChange={e => {
                  setSelectedSort(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                id="search-sort-select"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest Releases</option>
                <option value="popular">Popular Downloads</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748B' }}>
              Loading matching software...
            </div>
          ) : products.length > 0 ? (
            <div className="grid-3">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px dashed #CBD5E1'
            }}>
              <Search size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                No software found
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 18px' }}>
                We couldn't find any products matching your specific query or filters. Try adjusting your terms.
              </p>
              <button onClick={resetAllFilters} className="btn btn-primary btn-sm">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
