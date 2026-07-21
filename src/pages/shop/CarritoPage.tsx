import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import type { CartItem } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 150_000;
const SHIPPING_FEE = 12_000;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatCOP(value: number): string {
  return (
    '$' +
    new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(value)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: fila de producto
// ─────────────────────────────────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const unitPrice = formatCOP(item.price);
  const totalPrice = formatCOP(item.price * item.quantity);
  const variant = item.category ?? null;

  return (
    <article className="cp-item" aria-label={`Producto: ${item.name}`}>
      {/* Imagen */}
      <div className="cp-item-img-wrap">
        <img
          src={item.image}
          alt={item.name}
          className="cp-item-img"
          loading="lazy"
          width={110}
          height={110}
        />
      </div>

      {/* Info central */}
      <div className="cp-item-info">
        <h2 className="cp-item-name">{item.name}</h2>

        {variant && (
          <p className="cp-item-variant">
            Categoría: <strong>{variant}</strong>
          </p>
        )}

        <p className="cp-item-unit-price">Precio unitario: {unitPrice}</p>

        {/* Selector de cantidad */}
        <div
          className="cp-qty-controls"
          role="group"
          aria-label="Selector de cantidad"
        >
          <button
            className="cp-qty-btn"
            aria-label="Disminuir cantidad"
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            id={`qty-minus-${item.id}`}
          >
            −
          </button>
          <span
            className="cp-qty-display"
            aria-live="polite"
            aria-label={`Cantidad: ${item.quantity}`}
          >
            {item.quantity}
          </span>
          <button
            className="cp-qty-btn"
            aria-label="Aumentar cantidad"
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            id={`qty-plus-${item.id}`}
          >
            +
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="cp-item-actions">
          <button
            className="cp-action-btn cp-action-btn--delete"
            onClick={() => onRemove(item.id)}
            aria-label={`Eliminar ${item.name} del carrito`}
            id={`btn-remove-${item.id}`}
          >
            🗑️ Eliminar
          </button>
          <span className="cp-action-divider" aria-hidden="true" />
          <button
            className="cp-action-btn cp-action-btn--save"
            aria-label={`Guardar ${item.name} para más tarde`}
            id={`btn-save-${item.id}`}
          >
            🔖 Guardar para después
          </button>
        </div>
      </div>

      {/* Precio total de la línea */}
      <div className="cp-item-price-col">
        <span
          className="cp-item-total-price"
          aria-label={`Total línea: ${totalPrice}`}
        >
          {totalPrice}
        </span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Sidebar resumen
// ─────────────────────────────────────────────────────────────────────────────
interface OrderSummaryProps {
  subtotal: number;
  itemCount: number;
}

function OrderSummary({ subtotal, itemCount }: OrderSummaryProps) {
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <aside className="cp-sidebar-col" aria-label="Resumen del pedido">
      <div className="cp-summary-card">
        <h2 className="cp-summary-title">Resumen del pedido</h2>

        {/* Indicador envío gratis */}
        {!isFreeShipping && (
          <p className="cp-shipping-alert">
            ¡Agrega <strong>{formatCOP(remainingForFree)}</strong> más y obtén
            envío gratis 🚚
          </p>
        )}

        <div className="cp-summary-lines">
          <div className="cp-summary-line">
            <span className="cp-summary-line--label">
              Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
            </span>
            <span
              className="cp-summary-line--value"
              id="cart-subtotal"
            >
              {formatCOP(subtotal)}
            </span>
          </div>

          <div className="cp-summary-line cp-summary-line--shipping">
            <span className="cp-summary-line--label">Envío</span>
            <span className="cp-summary-line--value" id="cart-shipping">
              {isFreeShipping ? '¡Gratis! 🎉' : formatCOP(shipping)}
            </span>
          </div>
        </div>

        <hr className="cp-summary-divider" />

        <div className="cp-summary-total">
          <span className="cp-summary-total-label">Total</span>
          <span className="cp-summary-total-value" id="cart-total">
            {formatCOP(total)}
          </span>
        </div>

        {/* CTA principal */}
        <button
          className="cp-btn-checkout"
          id="btn-proceder-pago"
          type="button"
          aria-label="Proceder al pago"
        >
          <span className="cp-btn-checkout-icon">🔒</span>
          Proceder al pago
        </button>

        <a href="/productos" className="cp-continue-link" id="link-seguir-comprando">
          ← Seguir comprando
        </a>

        {/* Métodos de pago */}
        <div className="cp-payment-methods" aria-label="Métodos de pago aceptados">
          <p className="cp-payment-title">Métodos de pago aceptados</p>
          <div className="cp-payment-logos">
            <span className="cp-payment-badge">
              <span className="cp-payment-badge-icon">💵</span>
              Efectivo
            </span>
            <span className="cp-payment-badge">
              <span className="cp-payment-badge-icon">🏦</span>
              PSE
            </span>
            <span className="cp-payment-badge">
              <span className="cp-payment-badge-icon">📱</span>
              Nequi
            </span>
            <span className="cp-payment-badge">
              <span className="cp-payment-badge-icon">💳</span>
              Tarjeta
            </span>
          </div>
        </div>

        {/* Badges de confianza */}
        <div className="cp-trust-badges" role="list">
          <div className="cp-trust-item" role="listitem">
            <span className="cp-trust-icon">✅</span>
            <span>Compra 100% segura y encriptada</span>
          </div>
          <div className="cp-trust-item" role="listitem">
            <span className="cp-trust-icon">🔄</span>
            <span>Devoluciones hasta 30 días</span>
          </div>
          <div className="cp-trust-item" role="listitem">
            <span className="cp-trust-icon">📦</span>
            <span>Envío a todo Colombia</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Estado vacío
// ─────────────────────────────────────────────────────────────────────────────
function EmptyCartState() {
  return (
    <div
      className="cp-empty-state"
      id="cart-empty-state"
      role="status"
      aria-label="Carrito vacío"
    >
      <div className="cp-empty-icon-wrapper" aria-hidden="true">
        🛒
      </div>
      <h2 className="cp-empty-title">Tu carrito está vacío</h2>
      <p className="cp-empty-subtitle">
        ¡Empieza a entrenar tu mutación!<br />
        Descubre nuestros suplementos premium y proteínas de alto rendimiento.
      </p>
      <Link
        to="/productos"
        className="cp-btn-explore"
        id="btn-ver-productos"
        aria-label="Ver catálogo de productos"
      >
        🏋️ Explorar productos
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalCount } =
    useCart();

  return (
    <main className="cp-page" id="carrito-page">
      {/* Breadcrumb */}
      <nav className="cp-breadcrumb" aria-label="Migas de pan">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Tu Carrito</span>
      </nav>

      {/* Título */}
      <header className="cp-title">
        <span className="cp-title-icon" aria-hidden="true">🛒</span>
        <h1>Tu Carrito</h1>
        {totalCount > 0 && (
          <span className="cp-title-count">
            {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
          </span>
        )}
      </header>

      {cart.length > 0 ? (
        /* Layout de dos columnas */
        <div className="cp-layout" id="cart-content-wrapper">
          {/* Columna izquierda — productos */}
          <section
            className="cp-items-col"
            id="cart-items-list"
            aria-label="Productos en el carrito"
          >
            {cart.map((item: CartItem) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQty={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </section>

          {/* Columna derecha — resumen */}
          <OrderSummary subtotal={totalPrice} itemCount={totalCount} />
        </div>
      ) : (
        <EmptyCartState />
      )}
    </main>
  );
}

export default CarritoPage;
