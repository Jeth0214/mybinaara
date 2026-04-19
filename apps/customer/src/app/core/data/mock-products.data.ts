import { Product } from '../models/product.model';

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  const categories = ['POWER TOOLS', 'FASTENERS', 'PLUMBING', 'ELECTRICAL', 'HAND TOOLS'];
  const titles = ['Makita 18V Drill', 'M8 Hex Bolt Set (50 pcs)', 'PVC Pipe 3/4"', 'Cable 20m 3-core', 'Claw Hammer'];
  const skus = ['MAK-DHP484Z', 'BOLT-M8-50', 'PVC-75-3M', 'CBL-20-3C', 'HAM-CL-16'];

  for (let i = 0; i < 50; i++) {
    const index = i % 5;
    products.push({
      id: `prod_${i + 1}`,
      title: `${titles[index]} - Variant ${i + 1}`,
      category: categories[index],
      sku: `${skus[index]}-V${i}`,
      price: Math.floor(Math.random() * 1000) + 10,
      storeInfo: {
        id: `store_${(i % 3) + 1}`,
        name: `Hardware Store ${(i % 3) + 1}`,
        storeCount: (i % 15) + 1,
      },
    });
  }

  // Override the first three with specific names mirroring the design
  products[0] = {
    ...products[0],
    title: 'Makita 18V Drill',
    category: 'POWER TOOLS',
    sku: 'MAK-DHP484Z',
    storeInfo: { id: 's1', name: 'Store 1', storeCount: 4 }
  };
  products[1] = {
    ...products[1],
    title: 'M8 Hex Bolt Set (50 pcs)',
    category: 'FASTENERS',
    sku: 'BOLT-M8-50',
    storeInfo: { id: 's2', name: 'Store 2', storeCount: 12 }
  };
  products[2] = {
    ...products[2],
    title: 'PVC Pipe 3/4"',
    category: 'PLUMBING',
    sku: 'PVC-75-3M',
    storeInfo: { id: 's3', name: 'Store 3', storeCount: 8 }
  };

  return products;
};

export const MOCK_PRODUCTS: Product[] = generateProducts();
