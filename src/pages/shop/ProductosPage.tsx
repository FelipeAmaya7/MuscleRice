import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { apiGetProducts } from '../../services/productService';
import { Product } from '../../types';

function ProductosPage() {
  const location = useLocation();
  const { addToCart } = useCart();
  
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState('todos');
  const [brandFilter, setBrandFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevancia');

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiGetProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Parse URL for initial category and brand
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    const brand = params.get('brand');
    if (cat) setFilter(cat);
    if (brand !== null) setBrandFilter(brand);
    else setBrandFilter('');
  }, [location.search]);

  // Derived state (Filtered and Sorted Products)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (filter !== 'todos') {
      result = result.filter(p => (p.category || '') === filter);
    }

    // Filter by Brand (URL ?brand=slug — matches product name loosely)
    if (brandFilter.trim() !== '') {
      const lowerBrand = brandFilter.toLowerCase();
      result = result.filter(
        p =>
          (p.name || '').toLowerCase().includes(lowerBrand) ||
          (p.brand || '').toLowerCase().includes(lowerBrand) ||
          (p.category || '').toLowerCase().includes(lowerBrand)
      );
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => (p.name || '').toLowerCase().includes(lowerQuery) || (p.category || '').toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'precio-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'precio-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'nombre') return (a.name || '').localeCompare(b.name || '');
      return 0; // relevance or default
    });

    return result;
  }, [products, filter, brandFilter, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`elite-star ${i >= rating ? 'elite-star--empty' : ''}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <main className="elite-catalog elite-catalog-page">
        {/* Hero */}
        <div className="elite-catalog-hero">
          <div className="elite-container">
            <nav className="elite-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Inicio</Link>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              <Link to="/categorias">Categorías</Link>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span>Catálogo</span>
            </nav>
            <h1 className="elite-catalog-title">
              {brandFilter
                ? <><span>{brandFilter.charAt(0).toUpperCase() + brandFilter.slice(1)}</span> — Productos</>
                : <>Nuestro <span>Catálogo</span></>}
            </h1>
            <p className="elite-catalog-subtitle">
              {brandFilter
                ? `Mostrando productos de ${brandFilter.charAt(0).toUpperCase() + brandFilter.slice(1)}`
                : 'Suplementos premium seleccionados para cada fase de tu entrenamiento'}
            </p>
            {brandFilter && (
              <button
                className="elite-filter-chip"
                style={{ marginTop: '0.75rem' }}
                onClick={() => { setBrandFilter(''); window.history.replaceState(null, '', '/productos'); }}
              >
                ✕ Limpiar filtro de marca
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Search + Filters + Sort */}
        <section className="elite-toolbar">
          <div className="elite-container">
            <div className="elite-toolbar-inner">
              {/* Search */}
              <div className="elite-search">
                <svg className="elite-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="elite-search-input" 
                  placeholder="Buscar suplementos..." 
                  autoComplete="off" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter chips */}
              <div className="elite-filters" role="group" aria-label="Filtros de categoría">
                {['todos', 'proteinas', 'rendimiento', 'definicion', 'energy', 'limpias'].map(cat => (
                  <button 
                    key={cat}
                    className={`elite-filter-chip ${filter === cat ? 'active' : ''}`} 
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="elite-sort">
                <select 
                  className="elite-sort-select" 
                  aria-label="Ordenar productos"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </div>
            </div>

            <p className="elite-results-count">Mostrando <strong>{filteredProducts.length}</strong> productos</p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="elite-section">
          <div className="elite-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div className="elite-spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '1rem' }}>Cargando catálogo premium...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'red' }}>
                <h3>Lo sentimos</h3>
                <p>{error}</p>
              </div>
            ) : (
              <div className="elite-product-grid">
                {filteredProducts.map((product: any) => (
                <article key={product.id} className="elite-product-card">
                  <div className="elite-product-img-wrap">
                    {product.badge && (
                      <span className={`elite-badge elite-badge--${product.badge.type}`}>
                        {product.badge.text}
                      </span>
                    )}
                    <div className="elite-product-actions">
                      <button className="elite-product-action-btn" aria-label="Agregar a favoritos" title="Favoritos">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                      <button className="elite-product-action-btn" aria-label="Vista rápida" title="Vista rápida">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    <img src={product.image || product.img} alt={product.name} className="elite-product-img" loading="lazy" />
                  </div>
                  <div className="elite-product-body">
                    <span className="elite-product-cat">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                    <h3 className="elite-product-name">{product.name}</h3>
                    <div className="elite-product-rating">
                      <div className="elite-stars">
                        {renderStars(product.rating)}
                      </div>
                      <span className="elite-rating-count">({product.ratingCount})</span>
                    </div>
                    <div className="elite-product-price-row">
                      <span className="elite-product-price">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="elite-product-price-old">{formatPrice(product.oldPrice)}</span>
                      )}
                    </div>
                    <button 
                      className="elite-add-cart" 
                      aria-label={`Agregar ${product.name} al carrito`}
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}

                {filteredProducts.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                    <h3>No se encontraron productos</h3>
                    <p className="text-muted">Intenta buscar con otros términos o cambia el filtro de categoría.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  );
}

export default ProductosPage;
