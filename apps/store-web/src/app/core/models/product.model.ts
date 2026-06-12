export interface Product {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  status?: 'Available' | 'Unavailable';
  brand?: string;
  unit?: string;
  lowStockThreshold?: number;
  createdAt: string;
}

export interface CategoryInfo {
  name: string;
  iconName: string;
  iconPath: string;
}

export const PRODUCT_CATEGORIES: CategoryInfo[] = [
  { name: 'Building Materials', iconName: 'building-materials.svg', iconPath: 'images/category-icons/building-materials.svg' },
  { name: 'Cement & Blocks', iconName: 'cement-and-blocks.svg', iconPath: 'images/category-icons/cement-and-blocks.svg' },
  { name: 'Steel & Metal', iconName: 'steel-and-metal.svg', iconPath: 'images/category-icons/steel-and-metal.svg' },
  { name: 'Doors & Windows', iconName: 'doors-and-windows.svg', iconPath: 'images/category-icons/doors-and-windows.svg' },
  { name: 'Paint & Finishes', iconName: 'paints-and-finishes.svg', iconPath: 'images/category-icons/paints-and-finishes.svg' },
  { name: 'Electrical', iconName: 'electrical.svg', iconPath: 'images/category-icons/electrical.svg' },
  { name: 'Plumbing', iconName: 'plumbing.svg', iconPath: 'images/category-icons/plumbing.svg' },
  { name: 'HVAC & Air Conditioning', iconName: 'hvac-and-air-conditioning.svg', iconPath: 'images/category-icons/hvac-and-air-conditioning.svg' },
  { name: 'Wood & Carpentry', iconName: 'wood-and-carpentry.svg', iconPath: 'images/category-icons/wood-and-carpentry.svg' },
  { name: 'Roofing', iconName: 'roofing.svg', iconPath: 'images/category-icons/roofing.svg' },
  { name: 'Flooring & Tiles', iconName: 'flooring-and-tiles.svg', iconPath: 'images/category-icons/flooring-and-tiles.svg' },
  { name: 'Glass & Aluminum', iconName: 'glass-and-aluminum.svg', iconPath: 'images/category-icons/glass-and-aluminum.svg' },
  { name: 'Waterproofing', iconName: 'waterproofing.svg', iconPath: 'images/category-icons/waterproofing.svg' },
  { name: 'Tools & Hardware', iconName: 'tools-and-hardware.svg', iconPath: 'images/category-icons/tools-and-hardware.svg' },
  { name: 'Equipment & Machinery', iconName: 'equipments-and-machinery.svg', iconPath: 'images/category-icons/equipments-and-machinery.svg' },
  { name: 'Safety Supplies', iconName: 'safety-supplies.svg', iconPath: 'images/category-icons/safety-supplies.svg' },
  { name: 'Landscaping', iconName: 'landscaping.svg', iconPath: 'images/category-icons/landscaping.svg' },
  { name: 'Miscellaneous', iconName: 'miscellaneous.svg', iconPath: 'images/category-icons/miscellaneous.svg' },
];
