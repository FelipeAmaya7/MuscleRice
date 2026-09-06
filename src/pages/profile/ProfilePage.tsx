import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Address } from '../../types';
import '@/styles/pages/_profile.css';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type ProfileTab = 'orders' | 'profile';

// ─────────────────────────────────────────────────────────────────────────────
// Address Form Modal
// ─────────────────────────────────────────────────────────────────────────────
interface AddressFormProps {
  onSave: (addr: Omit<Address, 'id'>) => void;
  onCancel: () => void;
}

function AddressForm({ onSave, onCancel }: AddressFormProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.address || !form.city) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Agregar dirección</h3>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Cerrar">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="addr-firstname">Nombre</label>
              <input
                id="addr-firstname"
                type="text"
                placeholder="Juan"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="addr-lastname">Apellido</label>
              <input
                id="addr-lastname"
                type="text"
                placeholder="Pérez"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="addr-address">Dirección</label>
            <input
              id="addr-address"
              type="text"
              placeholder="Calle 123, Edificio 4, Apto 5"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="addr-city">Ciudad</label>
              <input
                id="addr-city"
                type="text"
                placeholder="Bogotá"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="addr-zip">Código Postal</label>
              <input
                id="addr-zip"
                type="text"
                placeholder="110111"
                value={form.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="addr-phone">Teléfono</label>
            <input
              id="addr-phone"
              type="tel"
              placeholder="+57 300 123 4567"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar dirección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfilePage
// ─────────────────────────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Si no está autenticado, redirigir
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAddress = (addr: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addr,
      id: 'addr-' + Math.random().toString(36).substring(2, 9),
    };
    setAddresses((prev) => [...prev, newAddress]);
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ── Header del perfil ── */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout} id="btn-logout">
            <i className="fa-solid fa-right-from-bracket"></i>
            Cerrar sesión
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('orders')}
            id="tab-orders"
          >
            <i className="fa-solid fa-box"></i>
            Órdenes
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('profile')}
            id="tab-profile"
          >
            <i className="fa-solid fa-user"></i>
            Perfil
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="profile-content">
          {/* ÓRDENES */}
          {activeTab === 'orders' && (
            <div className="tab-panel" key="orders">
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fa-solid fa-bag-shopping"></i>
                </div>
                <h3>Aún no tienes órdenes</h3>
                <p>Cuando realices tu primera compra, aparecerá aquí.</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/productos')}
                  id="btn-go-shop"
                >
                  Explorar productos
                </button>
              </div>
            </div>
          )}

          {/* PERFIL & DIRECCIONES */}
          {activeTab === 'profile' && (
            <div className="tab-panel" key="profile">
              {/* Info del usuario */}
              <div className="section-card">
                <h3 className="section-title">Información de la cuenta</h3>
                <div className="info-row">
                  <span className="info-label">Correo electrónico</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nombre</span>
                  <span className="info-value">{user.name}</span>
                </div>
              </div>

              {/* Direcciones */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">Direcciones</h3>
                  <button
                    className="btn-add"
                    onClick={() => setShowAddressForm(true)}
                    id="btn-add-address"
                  >
                    <i className="fa-solid fa-plus"></i>
                    Agregar
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="empty-inline">
                    <i className="fa-solid fa-location-dot"></i>
                    <p>No tienes direcciones guardadas</p>
                  </div>
                ) : (
                  <div className="address-list">
                    {addresses.map((addr) => (
                      <div className="address-card" key={addr.id}>
                        <div className="address-info">
                          <strong>{addr.firstName} {addr.lastName}</strong>
                          <p>{addr.address}</p>
                          <p>{addr.city}{addr.zipCode ? `, ${addr.zipCode}` : ''}</p>
                          {addr.phone && <p>{addr.phone}</p>}
                        </div>
                        <button
                          className="btn-delete-addr"
                          onClick={() => handleDeleteAddress(addr.id)}
                          aria-label="Eliminar dirección"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de dirección ── */}
      {showAddressForm && (
        <AddressForm
          onSave={handleSaveAddress}
          onCancel={() => setShowAddressForm(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
