import { Injectable, signal, computed } from '@angular/core';
import { CustomerAccount, AdminUser, UserStatus, AdminRole } from '../models/user.model';
import { Product, Category } from '../models/catalog.model';
import { MOCK_STORES } from '../data/mock-stores.data';

@Injectable({
  providedIn: 'root'
})
export class UserCatalogService {
  // ── CUSTOMERS & CONTRACTORS STATE ───────────────────────────────────────
  private readonly _customers = signal<CustomerAccount[]>([
    {
      id: 'cust-1',
      name: 'Ahmad Al-Saeed',
      email: 'ahmad@saeed.sa',
      phone: '+966501234567',
      type: 'customer',
      status: 'active',
      joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cust-2',
      name: 'Riyadh Contracting Corp.',
      email: 'info@riyadhcontracting.com.sa',
      phone: '+966512345678',
      type: 'contractor',
      status: 'active',
      companyName: 'Riyadh Contracting & Infrastructure Corp.',
      vatNumber: '310998877600003',
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cust-3',
      name: 'Jeddah Builders Ltd.',
      email: 'admin@jeddahbuilders.sa',
      phone: '+966522334455',
      type: 'contractor',
      status: 'suspended',
      companyName: 'Jeddah Contracting & Building Materials Ltd.',
      vatNumber: '300887766500003',
      joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'cust-4',
      name: 'Sara Al-Otaibi',
      email: 'sara.otaibi@gmail.com',
      phone: '+966598765432',
      type: 'customer',
      status: 'active',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  readonly customers = this._customers.asReadonly();

  toggleCustomerStatus(customerId: string): void {
    this._customers.update(list =>
      list.map(cust => {
        if (cust.id !== customerId) return cust;
        const status: UserStatus = cust.status === 'active' ? 'suspended' : 'active';
        return { ...cust, status };
      })
    );
  }

  // ── ADMIN SUB-USERS STATE ────────────────────────────────────────────────
  private readonly _admins = signal<AdminUser[]>([
    {
      id: 'admin-1',
      name: 'Super Admin User',
      email: 'super@mybinaara.com',
      role: 'super admin',
      status: 'active',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'admin-2',
      name: 'Finance Controller',
      email: 'finance@mybinaara.com',
      role: 'finance',
      status: 'active',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'admin-3',
      name: 'Operations Specialist',
      email: 'ops@mybinaara.com',
      role: 'ops',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'admin-4',
      name: 'Support Agent 1',
      email: 'support1@mybinaara.com',
      role: 'support',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  readonly admins = this._admins.asReadonly();

  addAdminUser(name: string, email: string, role: AdminRole): void {
    const id = `admin-${Date.now()}`;
    const newAdmin: AdminUser = {
      id,
      name,
      email,
      role,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this._admins.update(list => [...list, newAdmin]);
  }

  toggleAdminStatus(adminId: string): void {
    this._admins.update(list =>
      list.map(admin => {
        if (admin.id !== adminId) return admin;
        const status: UserStatus = admin.status === 'active' ? 'suspended' : 'active';
        return { ...admin, status };
      })
    );
  }

  // ── PRODUCT CATALOG STATE ────────────────────────────────────────────────
  private readonly _products = signal<Product[]>(this.generateMockProducts());

  private generateMockProducts(): Product[] {
    const baseProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Heavy Duty PVC Pipe 110mm',
        storeId: 'store-1',
        storeName: 'Al-Fozan Building Materials',
        category: 'Plumbing',
        brand: 'Saudi Pipes',
        price: 45.00,
        sku: 'PL-PVC-110-HD',
        isSuspended: false,
        description: 'Industrial grade 110mm outer diameter PVC pipe. High pressure resistant, suitable for drainage and waste systems.',
        image: '/assets/mock-products/pvc_pipe.jpg',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod-2',
        name: 'Copper Electrical Wire 4mm 100m',
        storeId: 'store-1',
        storeName: 'Al-Fozan Building Materials',
        category: 'Electrical',
        brand: 'Schneider Electric',
        price: 185.00,
        sku: 'EL-COP-4-100',
        isSuspended: false,
        description: 'Single-core copper wiring cable insulated with high-grade PVC. 4mm core diameter, ideal for home and industrial lighting grids.',
        image: '/assets/mock-products/copper_wire.jpg',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod-3',
        name: 'Premium Waterproof Concrete Mix 20kg',
        storeId: 'store-2',
        storeName: 'Riyadh Steel Co.',
        category: 'Building Materials',
        brand: 'Riyadh Steel',
        price: 28.50,
        sku: 'BM-CONC-WP-20',
        isSuspended: false,
        description: 'Quick-setting concrete mix enhanced with waterproofing additives. Perfect for foundations, retaining walls, and wet areas.',
        image: '/assets/mock-products/concrete_mix.jpg',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'prod-4',
        name: 'Industrial Hammer Drill 800W',
        storeId: 'store-5',
        storeName: 'Najd HVAC Solutions',
        category: 'Tools & Hardware',
        brand: 'Bosch',
        price: 340.00,
        sku: 'TL-DRILL-800-HD',
        isSuspended: true,
        suspensionReason: 'Reported for counterfeit branding. Suspended pending vendor documentation review.',
        description: 'Bosch professional hammer drill with 800W motor. Reversible speed trigger, active vibration control.',
        image: '/assets/mock-products/hammer_drill.jpg',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const generated: Product[] = [];
    const categoriesList = ['Building Materials', 'Cement & Blocks', 'Steel & Metal', 'Doors & Windows', 'Paint & Finishes', 'Electrical', 'Plumbing', 'HVAC & Air Conditioning', 'Wood & Carpentry', 'Roofing', 'Flooring & Tiles', 'Glass & Aluminum', 'Waterproofing', 'Tools & Hardware', 'Equipment & Machinery', 'Safety Supplies', 'Landscaping'];
    const brandsList = ['Riyadh Steel', 'Schneider Electric', 'Saudi Pipes', 'Bosch', 'Al-Jazeerah Paints', 'SABIC', 'Saudi Ceramics'];

    for (let i = 5; i <= 100; i++) {
      let storeId = `store-${(i % 100) + 1}`;
      let store = MOCK_STORES.find(s => s.id === storeId);

      // Reassign to a non-pending store if the selected one is pending
      if (store && store.status === 'pending') {
        const nonPending = MOCK_STORES.find(s => s.status !== 'pending' && s.id !== storeId);
        if (nonPending) {
          storeId = nonPending.id;
          store = nonPending;
        }
      }

      const storeName = store ? store.name : `Saudi Merchant Supply Co. ${(i % 100) + 1}`;
      const cat = categoriesList[i % categoriesList.length];
      const brand = brandsList[i % brandsList.length];
      const price = Math.floor(15 + Math.random() * 2485);

      generated.push({
        id: `prod-${i}`,
        name: `Industrial ${cat} Brand ${brand} v${i}`,
        storeId: storeId,
        storeName: storeName,
        category: cat,
        brand: brand,
        price: price,
        sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
        isSuspended: i % 17 === 0,
        description: `High-quality industrial grade ${cat} solution under Brand ${brand}. Built to Saudi standards, certified for commercial construction grids.`,
        image: (i % 6 === 0) ? '' : '/assets/mock-products/product_sample.jpg',
        createdAt: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return [...baseProducts, ...generated];
  }

  readonly products = this._products.asReadonly();

  suspendProduct(productId: string, reason: string): void {
    this._products.update(list =>
      list.map(p =>
        p.id === productId ? { ...p, isSuspended: true, suspensionReason: reason } : p
      )
    );
  }

  unsuspendProduct(productId: string): void {
    this._products.update(list =>
      list.map(p =>
        p.id === productId ? { ...p, isSuspended: false, suspensionReason: undefined } : p
      )
    );
  }

  updateProduct(productId: string, changes: Partial<Product>): void {
    this._products.update(list =>
      list.map(p => p.id === productId ? { ...p, ...changes } : p)
    );
  }

  deleteProduct(productId: string): void {
    this._products.update(list => list.filter(p => p.id !== productId));
  }

  // ── CATEGORIES STATE ────────────────────────────────────────────────────
  private readonly _categories = signal<Category[]>([
    { id: 'cat-1', name: 'Building Materials', slug: 'building-materials', description: 'Basic building raw materials, cement bases, and structural elements', productCount: 45, isActive: true, image: '/images/category-icons/building-materials.svg' },
    { id: 'cat-2', name: 'Cement & Blocks', slug: 'cement-blocks', description: 'Portland cement bags, lightweight blocks, hollow concrete blocks', productCount: 28, isActive: true, image: '/images/category-icons/cement-and-blocks.svg' },
    { id: 'cat-3', name: 'Steel & Metal', slug: 'steel-metal', description: 'Rebars, steel beams, structural metal elements, wires, and sheets', productCount: 34, isActive: true, image: '/images/category-icons/steel-and-metal.svg' },
    { id: 'cat-4', name: 'Doors & Windows', slug: 'doors-windows', description: 'Wooden doors, aluminum windows, safety panels, frames, and locks', productCount: 19, isActive: true, image: '/images/category-icons/doors-and-windows.svg' },
    { id: 'cat-5', name: 'Paint & Finishes', slug: 'paint-finishes', description: 'Interior and exterior paints, varnishes, primers, and brushes', productCount: 52, isActive: true, image: '/images/category-icons/paints-and-finishes.svg' },
    { id: 'cat-6', name: 'Electrical', slug: 'electrical', description: 'Wires, cables, breaker boxes, sockets, switches, lighting systems', productCount: 88, isActive: true, image: '/images/category-icons/electrical.svg' },
    { id: 'cat-7', name: 'Plumbing', slug: 'plumbing', description: 'Pipes, joints, drains, water tanks, pumps, valves, and fixtures', productCount: 62, isActive: true, image: '/images/category-icons/plumbing.svg' },
    { id: 'cat-8', name: 'HVAC & Air Conditioning', slug: 'hvac-air-conditioning', description: 'Central AC systems, split units, ventilation fans, and ductworks', productCount: 29, isActive: true, image: '/images/category-icons/hvac-and-air-conditioning.svg' },
    { id: 'cat-9', name: 'Wood & Carpentry', slug: 'wood-carpentry', description: 'Plywood, hardwood panels, timber beams, frames, and carpenters tools', productCount: 21, isActive: true, image: '/images/category-icons/wood-and-carpentry.svg' },
    { id: 'cat-10', name: 'Roofing', slug: 'roofing', description: 'Corrugated roof sheets, tiles, roof frames, panels, and rain gutters', productCount: 14, isActive: true, image: '/images/category-icons/roofing.svg' },
    { id: 'cat-11', name: 'Flooring & Tiles', slug: 'flooring-tiles', description: 'Ceramic tiles, porcelain, marble slabs, wooden parquet, floor finishes', productCount: 41, isActive: true, image: '/images/category-icons/flooring-and-tiles.svg' },
    { id: 'cat-12', name: 'Glass & Aluminum', slug: 'glass-aluminum', description: 'Glass panels, double glazing windows, aluminum profiles, and facades', productCount: 17, isActive: true, image: '/images/category-icons/glass-and-aluminum.svg' },
    { id: 'cat-13', name: 'Waterproofing', slug: 'waterproofing', description: 'Waterproofing membranes, sealants, chemical coatings, and rolls', productCount: 23, isActive: true, image: '/images/category-icons/waterproofing.svg' },
    { id: 'cat-14', name: 'Tools & Hardware', slug: 'tools-hardware', description: 'Hand tools, power tools, nails, screws, hinges, and hardware boxes', productCount: 104, isActive: true, image: '/images/category-icons/tools-and-hardware.svg' },
    { id: 'cat-15', name: 'Equipment & Machinery', slug: 'equipment-machinery', description: 'Concrete mixers, generators, scaffolding lifts, compactors, machinery', productCount: 12, isActive: true, image: '/images/category-icons/equipments-and-machinery.svg' },
    { id: 'cat-16', name: 'Safety Supplies', slug: 'safety-supplies', description: 'Helmets, safety vests, gloves, boots, signs, and first aid kits', productCount: 31, isActive: true, image: '/images/category-icons/safety-supplies.svg' },
    { id: 'cat-17', name: 'Landscaping', slug: 'landscaping', description: 'Outdoor pavers, soil, decorative rocks, artificial grass, garden pipes', productCount: 16, isActive: true, image: '/images/category-icons/landscaping.svg' },
    { id: 'cat-18', name: 'Miscellaneous', slug: 'miscellaneous', description: 'General building supplies, auxiliary accessories, non-categorized items', productCount: 9, isActive: true, image: '/images/category-icons/miscellaneous.svg' }
  ]);

  readonly categories = this._categories.asReadonly();

  addCategory(name: string, description: string, image: string): void {
    const id = `cat-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id,
      name,
      slug,
      description,
      productCount: 0,
      isActive: true,
      image
    };
    this._categories.update(list => [...list, newCat]);
  }

  toggleCategoryStatus(catId: string): void {
    this._categories.update(list =>
      list.map(c => c.id === catId ? { ...c, isActive: !c.isActive } : c)
    );
  }

  updateCategory(categoryId: string, changes: Partial<Category>): void {
    this._categories.update(list =>
      list.map(c => c.id === categoryId ? { ...c, ...changes } : c)
    );
  }

  deleteCategory(categoryId: string): void {
    this._categories.update(list => list.filter(c => c.id !== categoryId));
  }
}
