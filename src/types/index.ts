export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  brand?: string;
  rating?: number;
  ratingCount?: number;
  oldPrice?: number;
  badge?: {
    text: string;
    type: string; // ej: 'premium', 'sale', 'new'
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'customer';
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
}
