import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Store, StoreStatus, StoreDocument, DocumentType, DocumentStatus } from '../models/store.model';
import { MOCK_STORES } from '../data/mock-stores.data';
import { UserCatalogService } from './user-catalog.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly catalogService = inject(UserCatalogService);

  // Master reactive state for stores
  private readonly _stores = signal<Store[]>(MOCK_STORES);
  
  // Read-only signals for consumer components
  readonly stores = this._stores.asReadonly();
  
  // Computed signals for common groupings
  readonly unsubscribedStores = computed(() => 
    this._stores().filter(s => 
      s.subscriptionPlanId === 'basic' && 
      s.subscriptionHistory && 
      s.subscriptionHistory.some(h => h.planId === 'premium' || h.planId === 'enterprise')
    )
  );

  readonly activeStores = computed(() => 
    this._stores().filter(s => s.status === 'active')
  );

  readonly suspendedStores = computed(() => 
    this._stores().filter(s => s.status === 'suspended')
  );

  constructor() {
    const products = this.catalogService.products();
    this._stores.update(stores =>
      stores.map(store => ({
        ...store,
        totalProducts: products.filter(p => p.storeId === store.id).length
      }))
    );
  }

  /**
   * Fetch all stores as an Observable (for compatibility with HTTP patterns)
   */
  getStoresObservable(): Observable<Store[]> {
    return of(this._stores());
  }

  /**
   * Get store by ID
   */
  getStoreById(id: string): Store | undefined {
    return this._stores().find(s => s.id === id);
  }

  /**
   * Create a new store record (Stepper flow)
   */
  createStore(storeData: Partial<Store>): Store {
    const id = `store-${Date.now()}`;
    const tempPassword = storeData.tempPassword || `Binaara${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
    const activationLink = storeData.activationLink || 'https://mybinaara.com/activate';
    
    // Create mock documents if details were not provided, defaulting to approved
    const documents: StoreDocument[] = storeData.documents || [
      {
        type: 'cr',
        status: 'approved',
        uploadedAt: new Date().toISOString()
      },
      {
        type: 'vat',
        status: 'approved',
        uploadedAt: new Date().toISOString()
      }
    ];

    const newStore: Store = {
      id,
      name: storeData.name || 'Unnamed Store',
      crNumber: storeData.crNumber || '',
      vatNumber: storeData.vatNumber || '',
      ownerName: storeData.ownerName || '',
      ownerEmail: storeData.ownerEmail || '',
      ownerPhone: storeData.ownerPhone || '',
      ownerWhatsapp: storeData.ownerWhatsapp || '',
      location: storeData.location || {
        country: 'Saudi Arabia',
        city: 'Riyadh',
        district: '',
        buildingNumber: '1234',
        streetName: 'Main Street',
        postalCode: '12345',
        additionalNumber: '9123',
        fullAddress: '1234 Main Street,\nRiyadh 12345 - 9123,\nSaudi Arabia',
        latitude: 24.7136,
        longitude: 46.6753
      },
      status: 'pending',
      isActivated: false,
      subscriptionPlanId: 'basic',
      subscriptionHistory: [],
      activationLink,
      tempPassword,
      storeLogo: storeData.storeLogo,
      createdAt: new Date().toISOString(),
      documents,
      totalProducts: 0
    };

    this._stores.update(currentStores => [newStore, ...currentStores]);
    return newStore;
  }

  /**
   * Update an existing store profile
   */
  updateStore(id: string, updates: Partial<Store>): void {
    this._stores.update(currentStores =>
      currentStores.map(store =>
        store.id === id ? { ...store, ...updates } : store
      )
    );
  }

  /**
   * Update verification status of a specific document
   */
  verifyDocument(storeId: string, docType: DocumentType, status: DocumentStatus, rejectionReason?: string): void {
    this._stores.update(currentStores =>
      currentStores.map(store => {
        if (store.id !== storeId) return store;

        const updatedDocs = store.documents.map(doc =>
          doc.type === docType
            ? { ...doc, status, rejectionReason }
            : doc
        );

        // Auto-update store status if all docs are approved/any rejected
        let storeStatus = store.status;
        let finalRejectionReason = store.rejectionReason;

        if (status === 'rejected') {
          storeStatus = 'suspended';
          finalRejectionReason = `Document Verification Failed: ${rejectionReason}`;
        } else if (updatedDocs.every(d => d.status === 'approved')) {
          storeStatus = 'active'; // Auto-activate if all docs approved
          finalRejectionReason = undefined;
        }

        const isActivated = storeStatus === 'active' ? true : (storeStatus === 'pending' ? false : store.isActivated);

        let history = store.subscriptionHistory || [];
        if (storeStatus === 'active' && store.status === 'pending' && history.length === 0) {
          history = [{ planId: 'basic', startDate: new Date().toISOString() }];
        }

        return {
          ...store,
          documents: updatedDocs,
          status: storeStatus,
          isActivated,
          subscriptionHistory: history,
          rejectionReason: finalRejectionReason
        };
      })
    );
  }

  /**
   * Explicitly change the general store status (e.g. suspension)
   */
  updateStoreStatus(storeId: string, status: StoreStatus, rejectionReason?: string): void {
    this._stores.update(currentStores =>
      currentStores.map(store => {
        if (store.id !== storeId) return store;

        // If activating, verify that all documents are also marked approved
        const updatedDocs = store.documents.map(doc => {
          if (status === 'active' && doc.status !== 'approved') {
            return { ...doc, status: 'approved' as DocumentStatus };
          }
          return doc;
        });

        const isActivated = status === 'active' ? true : (status === 'pending' ? false : store.isActivated);

        let history = store.subscriptionHistory || [];
        if (status === 'active' && store.status === 'pending' && history.length === 0) {
          history = [{ planId: 'basic', startDate: new Date().toISOString() }];
        }

        return {
          ...store,
          status,
          isActivated,
          subscriptionHistory: history,
          documents: updatedDocs,
          rejectionReason: (status === 'suspended') ? rejectionReason : store.rejectionReason
        };
      })
    );
  }

  /**
   * Change Assigned Subscription Plan
   */
  assignSubscriptionPlan(storeId: string, planId: 'basic' | 'premium' | 'enterprise'): void {
    this._stores.update(currentStores =>
      currentStores.map(store => {
        if (store.id !== storeId) return store;

        const history = [...(store.subscriptionHistory || [])];
        const now = new Date().toISOString();

        // 1. Close the current active subscription entry (if any)
        if (history.length > 0 && !history[history.length - 1].endDate) {
          history[history.length - 1] = {
            ...history[history.length - 1],
            endDate: now
          };
        }

        // 2. Add the new plan entry
        history.push({
          planId: planId,
          startDate: now
        });

        return {
          ...store,
          subscriptionPlanId: planId,
          subscriptionHistory: history
        };
      })
    );
  }

  /**
   * Delete Store
   */
  deleteStore(storeId: string): void {
    this._stores.update(currentStores =>
      currentStores.filter(store => store.id !== storeId)
    );
  }
}

