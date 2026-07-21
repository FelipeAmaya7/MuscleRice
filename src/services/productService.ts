import { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || "";

const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Proteína Whey (2 LB)",
    price: 160000,
    image: "/img/whey protein.webp",
    category: "proteinas"
  },
  {
    id: "prod-002",
    name: "Creatina Monohidratada Creapure (300g)",
    price: 95000,
    image: "/img/Creatina Monohidratada Creapure (300g).webp",
    category: "rendimiento"
  },
  {
    id: "prod-003",
    name: "Colágeno Hidrolizado con Magnesio (300g)",
    price: 85000,
    image: "/img/Colágeno Hidrolizado con Magnesio (300g).webp",
    category: "limpias"
  },
  {
    id: "prod-004",
    name: "Proteína Vegetal (Orgain o Vega 2 LB)",
    price: 135000,
    image: "/img/Proteína Vegetal (Orgain o Vega 2lb).webp",
    category: "limpias"
  },
  {
    id: "prod-005",
    name: "Barra Proteica Quest (por diez und)",
    price: 90000,
    image: "/img/Barra Proteica Quest (por unidad) (1).webp",
    category: "proteinas"
  },
  {
    id: "prod-006",
    name: "Pre-entreno C4 Original (30 servicios)",
    price: 125000,
    image: "/img/Pre-entreno C4 Original (30 servicios).webp",
    category: "energy"
  },
  {
    id: "prod-007",
    name: "Quemador de grasa Lipo6 (60 cápsulas)",
    price: 105000,
    image: "/img/Quemador de grasa Lipo6 (60 cápsulas).webp",
    category: "definicion"
  },
  {
    id: "prod-008",
    name: "Avena + Proteína (mezcla lista 1kg)",
    price: 55000,
    image: "/img/Avena + Proteína (mezcla lista 1kg).webp",
    category: "limpias"
  }
];

// Fallback Mock helper: Retrasa la respuesta para simular carga de red
const simulateNetworkDelay = <T,>(data: T, ms: number = 1200): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

const mapDbProductToProduct = (dbProduct: any): Product => {
  const name = dbProduct.nombre || "";
  
  // Categorize product based on its name
  let category = "suplementos";
  const nameLower = name.toLowerCase();
  if (nameLower.includes("proteína") || nameLower.includes("protein")) {
    category = "proteinas";
  } else if (nameLower.includes("creatina")) {
    category = "rendimiento";
  } else if (nameLower.includes("colágeno") || nameLower.includes("avena") || nameLower.includes("vegetal")) {
    category = "limpias";
  } else if (nameLower.includes("c4") || nameLower.includes("pre-entreno")) {
    category = "energy";
  } else if (nameLower.includes("lipo6") || nameLower.includes("quemador")) {
    category = "definicion";
  }

  // Prepend slash and resolve extension to webp if it's jpg
  let image = dbProduct.imagen || "";
  if (image && !image.startsWith("/")) {
    image = "/" + image;
  }
  if (image && image.endsWith(".jpg")) {
    image = image.replace(".jpg", ".webp");
  }

  return {
    id: String(dbProduct.id),
    name: dbProduct.nombre,
    price: Number(dbProduct.precio),
    image: image,
    category: category,
    description: dbProduct.descripcion || "",
    rating: 5,
    ratingCount: 15,
    badge: dbProduct.precio > 120000 ? { text: "Premium", type: "premium" } : undefined
  };
};

export const apiGetProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/api/productos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }

    const data = await response.json();
    return data.map(mapDbProductToProduct);
  } catch (error) {
    console.warn('⚠️ API no disponible o error. Usando Fallback Mock para apiGetProducts...', error);
    return simulateNetworkDelay(mockProducts);
  }
};
