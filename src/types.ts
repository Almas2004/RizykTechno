export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  categoryId: number;
  category: Category;
  createdAt: string;
};

export type LeadRequest = {
  id: number;
  name: string;
  phone: string;
  comment?: string;
  itemsJson?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  product?: Product | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
