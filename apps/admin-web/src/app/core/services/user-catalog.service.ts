import { Injectable, signal } from '@angular/core';
import { CustomerAccount, UserStatus } from '../models/user.model';

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
}
