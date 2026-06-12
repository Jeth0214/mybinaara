import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthState } from '../state/auth.state';
import { Product } from '../models/product.model';

const STORAGE_PRODUCTS_KEY = 'mybinaara_store_products';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private store = inject(Store);

  // Active user signal from AuthState
  readonly currentUser = this.store.selectSignal(AuthState.user);

  // Internal reactive state for products of the CURRENT store
  private productsState = signal<Product[]>([]);

  // Expose read-only products signal
  readonly products = this.productsState.asReadonly();

  // Computed signals for stats
  readonly productsCount = computed(() => this.products().length);

  readonly productsLimit = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    if (user.subscriptionPlan === 'Enterprise') return 100;
    if (user.subscriptionPlan === 'Pro') return 50;
    return 5; // Free plan limit
  });

  readonly isLimitReached = computed(() => this.productsCount() >= this.productsLimit());

  readonly slotsRemaining = computed(() => {
    return Math.max(0, this.productsLimit() - this.productsCount());
  });

  readonly progressPercent = computed(() => {
    const limit = this.productsLimit();
    if (!limit) return 0;
    return Math.min((this.productsCount() / limit) * 100, 100);
  });

  readonly inStockCount = computed(() => {
    return this.products().filter((p) => p.stock > 10).length;
  });

  readonly lowStockCount = computed(() => {
    return this.products().filter((p) => p.stock > 0 && p.stock <= 10).length;
  });

  readonly outOfStockCount = computed(() => {
    return this.products().filter((p) => p.stock === 0).length;
  });

  constructor() {
    // Automatically reload products when the active user changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadProductsForStore(user.id);
      } else {
        this.productsState.set([]);
      }
    });
  }

  /**
   * Load products for a specific store from LocalStorage.
   * If empty and it is store-1, initialize with two default products.
   */
  private loadProductsForStore(storeId: string): void {
    const allProducts = this.getAllProductsFromStorage();
    let storeProducts = allProducts.filter((p) => p.storeId === storeId);

    // Default initialization for Al-Amal store to match UI skeletons
    if (storeProducts.length === 0 && storeId === 'store-1') {
      storeProducts = [
        {
          id: 'prod-1',
          storeId: 'store-1',
          name: 'Al-Amal Portland Cement Bag 50kg',
          sku: 'CEM-PORT-50',
          category: 'Cement & Blocks',
          price: 15.00,
          stock: 150,
          description: 'High strength ordinary Portland cement suitable for all general concrete and masonry works.',
          imageUrl: 'images/category-icons/cement-and-blocks.svg',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'prod-2',
          storeId: 'store-1',
          name: 'Deformed Steel Rebar 12mm Grade 60',
          sku: 'STL-REBAR-12',
          category: 'Steel & Metal',
          price: 42.00,
          stock: 85,
          description: 'High tensile reinforcement steel rebars for concrete structures. Conforms to SASO standards.',
          imageUrl: 'images/category-icons/steel-and-metal.svg',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      // Save these defaults
      const otherProducts = allProducts.filter((p) => p.storeId !== storeId);
      this.saveAllProductsToStorage([...otherProducts, ...storeProducts]);
    }

    this.productsState.set(storeProducts);
  }

  /**
   * Add a new product
   */
  addProduct(
    productData: Omit<Product, 'id' | 'storeId' | 'createdAt'>
  ): Observable<Product> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Store user not authenticated.'));
    }

    if (this.isLimitReached()) {
      return throwError(() => new Error('Subscription limit reached. Please upgrade your plan to add more products.'));
    }

    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substring(2, 9),
      storeId: user.id,
      createdAt: new Date().toISOString(),
    };

    const allProducts = this.getAllProductsFromStorage();
    allProducts.push(newProduct);
    this.saveAllProductsToStorage(allProducts);

    // Update state signal
    this.productsState.update((current) => [...current, newProduct]);

    return of(newProduct).pipe(delay(800));
  }

  /**
   * Update an existing product
   */
  updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'storeId' | 'createdAt'>>
  ): Observable<Product> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Store user not authenticated.'));
    }

    const allProducts = this.getAllProductsFromStorage();
    const index = allProducts.findIndex((p) => p.id === id && p.storeId === user.id);

    if (index === -1) {
      return throwError(() => new Error('Product not found.'));
    }

    const updatedProduct: Product = {
      ...allProducts[index],
      ...updates,
    };

    allProducts[index] = updatedProduct;
    this.saveAllProductsToStorage(allProducts);

    // Update state signal
    this.productsState.update((current) =>
      current.map((p) => (p.id === id ? updatedProduct : p))
    );

    return of(updatedProduct).pipe(delay(800));
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<boolean> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Store user not authenticated.'));
    }

    const allProducts = this.getAllProductsFromStorage();
    const filteredProducts = allProducts.filter(
      (p) => !(p.id === id && p.storeId === user.id)
    );

    if (allProducts.length === filteredProducts.length) {
      return throwError(() => new Error('Product not found or not owned.'));
    }

    this.saveAllProductsToStorage(filteredProducts);

    // Update state signal
    this.productsState.update((current) => current.filter((p) => p.id !== id));

    return of(true).pipe(delay(500));
  }

  /**
   * Quick update stocks of multiple products
   */
  updateStocks(updates: { id: string; stock: number }[]): Observable<boolean> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Store user not authenticated.'));
    }

    const allProducts = this.getAllProductsFromStorage();
    let modified = false;

    updates.forEach((u) => {
      const idx = allProducts.findIndex((p) => p.id === u.id && p.storeId === user.id);
      if (idx !== -1) {
        allProducts[idx].stock = Math.max(0, u.stock);
        modified = true;
      }
    });

    if (!modified) {
      return throwError(() => new Error('No products updated.'));
    }

    this.saveAllProductsToStorage(allProducts);

    // Refresh current store products state
    this.loadProductsForStore(user.id);

    return of(true).pipe(delay(800));
  }

  /**
   * Bulk import products (CSVs/parsed lists)
   */
  bulkImport(
    newProductsData: Omit<Product, 'id' | 'storeId' | 'createdAt'>[]
  ): Observable<boolean> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('Store user not authenticated.'));
    }

    // Verify user plan allows bulk import
    if (user.subscriptionPlan === 'Free') {
      return throwError(() => new Error('Bulk import is a premium feature. Please upgrade your plan to unlock.'));
    }

    const remainingSlots = this.slotsRemaining();
    if (newProductsData.length > remainingSlots) {
      return throwError(
        () =>
          new Error(
            `Import failed. You are trying to import ${newProductsData.length} products, but you only have ${remainingSlots} slots remaining on your ${user.subscriptionPlan} plan.`
          )
      );
    }

    const allProducts = this.getAllProductsFromStorage();
    const importedProducts: Product[] = newProductsData.map((p, idx) => ({
      ...p,
      id: 'prod-' + Math.random().toString(36).substring(2, 9) + '-' + idx,
      storeId: user.id,
      createdAt: new Date().toISOString(),
    }));

    const updatedAllProducts = [...allProducts, ...importedProducts];
    this.saveAllProductsToStorage(updatedAllProducts);

    // Update state signal
    this.productsState.update((current) => [...current, ...importedProducts]);

    return of(true).pipe(delay(1200));
  }

  // --- Helper Methods ---

  private getAllProductsFromStorage(): Product[] {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveAllProductsToStorage(products: Product[]): void {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }
}
