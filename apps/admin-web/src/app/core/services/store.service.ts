import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Store, StoreStatus, StoreDocument, DocumentType, DocumentStatus } from '../models/store.model';
import { MOCK_STORES } from '../data/mock-stores.data';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Master reactive state for stores
  private readonly _stores = signal<Store[]>(MOCK_STORES);
  
  // Read-only signals for consumer components
  readonly stores = this._stores.asReadonly();
  
  // Computed signals for common groupings
  readonly pendingVerificationStores = computed(() => 
    this._stores().filter(s => s.status === 'pending')
  );

  readonly activeStores = computed(() => 
    this._stores().filter(s => s.status === 'active')
  );

  readonly suspendedStores = computed(() => 
    this._stores().filter(s => s.status === 'suspended')
  );

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
    const tempPassword = `Binaara${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
    const activationLink = `https://mybinaara.com/activate/${id}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Create mock documents if details were provided
    const documents: StoreDocument[] = [
      {
        type: 'cr',
        fileName: `cr_${storeData.name?.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileUrl: '/assets/mock-docs/cr_sample.pdf',
        status: 'pending',
        uploadedAt: new Date().toISOString()
      },
      {
        type: 'vat',
        fileName: `vat_${storeData.name?.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileUrl: '/assets/mock-docs/vat_sample.pdf',
        status: 'pending',
        uploadedAt: new Date().toISOString()
      },
      {
        type: 'iban',
        fileName: `iban_${storeData.name?.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileUrl: '/assets/mock-docs/iban_sample.pdf',
        status: 'pending',
        uploadedAt: new Date().toISOString()
      }
    ];

    const newStore: Store = {
      id,
      name: storeData.name || 'Unnamed Store',
      crNumber: storeData.crNumber || '',
      vatNumber: storeData.vatNumber || '',
      iban: storeData.iban || '',
      ownerName: storeData.ownerName || '',
      ownerEmail: storeData.ownerEmail || '',
      ownerPhone: storeData.ownerPhone || '',
      location: storeData.location || 'Riyadh',
      category: storeData.category || 'Building Materials',
      status: 'pending', // Starts as pending verification
      subscriptionPlanId: storeData.subscriptionPlanId || 'basic',
      activationLink,
      tempPassword,
      createdAt: new Date().toISOString(),
      documents
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
          storeStatus = 'rejected';
          finalRejectionReason = `Document Verification Failed: ${rejectionReason}`;
        } else if (updatedDocs.every(d => d.status === 'approved')) {
          storeStatus = 'active'; // Auto-activate if all docs approved
          finalRejectionReason = undefined;
        }

        return {
          ...store,
          documents: updatedDocs,
          status: storeStatus,
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

        return {
          ...store,
          status,
          documents: updatedDocs,
          rejectionReason: status === 'rejected' ? rejectionReason : store.rejectionReason
        };
      })
    );
  }

  /**
   * Change Assigned Subscription Plan
   */
  assignSubscriptionPlan(storeId: string, planId: 'basic' | 'premium' | 'enterprise'): void {
    this._stores.update(currentStores =>
      currentStores.map(store =>
        store.id === storeId ? { ...store, subscriptionPlanId: planId } : store
      )
    );
  }
}
