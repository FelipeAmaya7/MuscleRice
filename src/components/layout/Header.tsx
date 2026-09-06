import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';

// Brands list — adjust logos/slugs as your catalog grows
const BRANDS = [
  { slug: 'optimum',   label: 'Optimum Nutrition', icon: '💪' },
  { slug: 'dymatize',  label: 'Dymatize',           icon: '🏋️' },
  { slug: 'muscletech',label: 'MuscleTech',          icon: '⚡' },
  { slug: 'bsn',       label: 'BSN',                 icon: '🔥' },
  { slug: 'cellucor',  label: 'Cellucor (C4)',        icon: '🚀' },
  { slug: 'nutrex',    label: 'Nutrex (Lipo6)',       icon: '🌡️' },
  { slug: 'orgain',    label: 'Orgain / Vega',        icon: '🌱' },
  { slug: 'quest',     label: 'Quest Nutrition',      icon: '🍫' },
];

function Header() {
  const { totalCount, totalPrice } = useCart();
  const navigate = useNavigate();

  // Brands dropdown state
  const [brandsOpen, setBrandsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrandsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandSelect = (slug: string) => {
    setBrandsOpen(false);
    navigate(`/productos?brand=${slug}`);
  };

  // Formatear precio para el Header
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(totalPrice);
  return (
    <header className="site-header">
      <section className="header-top">
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <nav aria-label="Enlaces superiores">
                <ul className="top-links">
                  <li><a href="#contacto"><i className="fa fa-headphones"></i> Servicio al cliente</a></li>
                  <li><a href="#contacto"><i className="fa fa-envelope-open"></i> Buzón de mensajes</a></li>
                </ul>
              </nav>
            </div>
            <div className="col-md-3">
              <div className="icon social-list">
                <a href="#" aria-label="Facebook"><i className="fa fa-facebook"></i></a>
                <a href="#" aria-label="Twitter"><i className="fa fa-twitter"></i></a>
                <a href="#" aria-label="Google Plus"><i className="fa fa-google-plus"></i></a>
                <a href="#" aria-label="Linkedin"><i className="fa fa-linkedin"></i></a>
                <a href="#" aria-label="Blog"><i className="fa fa-rss"></i></a>
              </div>
            </div>
            <div className="col-md-4">
              <div className="a-right account-actions">
                <Link to="/login" className="btn-auth" aria-label="Iniciar sesión">
                  <i className="fa fa-user-circle-o"></i>
                  <span>Iniciar sesión</span>
                </Link>
                <Link to="/login" className="btn-auth btn-auth-register" aria-label="Crear cuenta">
                  <i className="fa fa-user-plus"></i>
                  <span>Crear cuenta</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="header header-main">
        <div className="container">
          <div className="row header-main-row">
            <div className="col-md-3 col-sm-12">
              <div className="logo">
                <Link to="/" className="site-logo">
                  <img src="/img/logo-musclerice..webp" alt="MuscleRice" className="site-logo-img" />
                </Link>
              </div>
            </div>
            <div className="col-md-6 col-sm-12">
              <nav aria-label="Navegación Principal">
                <ul className="nav navbar-nav main-nav">
                  <li className="active"><Link to="/">Inicio</Link></li>
                  <li><Link to="/categorias">Categorías</Link></li>
                  {/* ── Brands Dropdown ── */}
                  <li
                    ref={dropdownRef}
                    className={`nav-dropdown-wrap${brandsOpen ? ' is-open' : ''}`}
                  >
                    <button
                      className="nav-dropdown-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={brandsOpen}
                      onClick={() => setBrandsOpen(prev => !prev)}
                    >
                      Marcas
                      <svg
                        className="nav-dropdown-caret"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {brandsOpen && (
                      <div className="nav-dropdown-menu" role="listbox" aria-label="Filtrar por marca">
                        <div className="nav-dropdown-header">Filtrar por marca</div>
                        <ul className="nav-dropdown-list">
                          {BRANDS.map(brand => (
                            <li key={brand.slug}>
                              <button
                                role="option"
                                className="nav-dropdown-item"
                                onClick={() => handleBrandSelect(brand.slug)}
                              >
                                <span className="nav-dropdown-item-icon">{brand.icon}</span>
                                <span className="nav-dropdown-item-label">{brand.label}</span>
                                <svg className="nav-dropdown-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="nav-dropdown-footer">
                          <button className="nav-dropdown-all" onClick={() => { setBrandsOpen(false); navigate('/productos'); }}>
                            Ver todos los productos
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                  <li><Link to="/ofertas">Ofertas</Link></li>
                  <li><a href="#" className="sale-link">Sale</a></li>
                </ul>
              </nav>
            </div>
            <div className="col-md-3 col-sm-12">
              <div className="cart header-cart">
                <Link to="/carrito" aria-label="Carrito de compras">
                  <span className="cart-icon-wrap">
                    <i className="fa fa-shopping-bag"></i>
                    <span className="cart-count">{totalCount}</span>
                  </span>
                  <span className="cart-price">{formattedPrice}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export default Header;
