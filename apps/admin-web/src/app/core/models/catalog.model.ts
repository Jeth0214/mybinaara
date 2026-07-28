export interface Product {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  category: string;
  brand: string;
  price: number;
  sku: string;
  isSuspended: boolean;
  description: string;
  image: string;
  createdAt: string;
  suspensionReason?: string;
}

/** Mock product-category taxonomy used only for product filters/dashboard stats.
 *  Unrelated to the real `Category` API model in `core/models/category.model.ts`. */
export interface ProductCategoryOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isActive: boolean;
  image: string;
}
