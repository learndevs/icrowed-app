export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: string;
  comparePrice?: string | null;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  specifications?: Record<string, string> | null;
  tags?: string[] | null;
  categoryId?: string | null;
  brandId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder?: number | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  price?: string | null;
  stock: number;
  options?: Record<string, string> | null;
  isActive: boolean;
}

export interface ProductWithRelations extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
}
