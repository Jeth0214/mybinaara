import { Injectable, signal, computed } from '@angular/core';
import { SubscriptionPlan, StoreSubscription, SupportTicket, AuditLog, SystemNotification } from '../models/subscription-support.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionSupportService {
  // ── SUBSCRIPTION PLANS STATE ───────────────────────────────────────────
  private readonly _plans = signal<SubscriptionPlan[]>([
    { id: 'basic', name: 'Basic (Free Trial)', priceSAR: 0, productLimit: 100, prioritySearch: false, dedicatedSupport: false },
    { id: 'premium', name: 'Premium Merchant', priceSAR: 499, productLimit: 2000, prioritySearch: true, dedicatedSupport: false },
    { id: 'enterprise', name: 'Enterprise VIP', priceSAR: 1499, productLimit: 99999, prioritySearch: true, dedicatedSupport: true }
  ]);

  readonly plans = this._plans.asReadonly();

  updatePlan(updatedPlan: SubscriptionPlan): void {
    this._plans.update(list =>
      list.map(p => p.id === updatedPlan.id ? { ...p, ...updatedPlan } : p)
    );
  }

  // ── STORE SUBSCRIPTIONS BILLING STATE ────────────────────────────────────
  private readonly _storeSubscriptions = signal<StoreSubscription[]>([
    {
      id: 'sub-101',
      storeId: 'store-1',
      storeName: 'Al-Fozan Building Materials',
      planId: 'enterprise',
      priceSAR: 1499,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextRenewalDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(), // Annual setup
      status: 'active'
    },
    {
      id: 'sub-102',
      storeId: 'store-2',
      storeName: 'Riyadh Steel Co.',
      planId: 'premium',
      priceSAR: 499,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      nextRenewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'sub-103',
      storeId: 'store-4',
      storeName: 'Red Sea Plumbing & Piping',
      planId: 'basic',
      priceSAR: 0,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      nextRenewalDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // Expired
      status: 'expired'
    }
  ]);

  readonly storeSubscriptions = this._storeSubscriptions.asReadonly();

  cancelSubscription(id: string): void {
    this._storeSubscriptions.update(list =>
      list.map(sub => sub.id === id ? { ...sub, status: 'cancelled' } : sub)
    );
  }

  renewSubscription(id: string): void {
    this._storeSubscriptions.update(list =>
      list.map(sub => {
        if (sub.id !== id) return sub;
        
        const price = sub.planId === 'premium' ? 499 : sub.planId === 'enterprise' ? 1499 : 0;
        return {
          ...sub,
          priceSAR: price,
          status: 'active',
          startDate: new Date().toISOString(),
          nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      })
    );
  }

  // ── SUPPORT TICKETS STATE ────────────────────────────────────────────────
  private readonly _tickets = signal<SupportTicket[]>([
    {
      id: 'tick-201',
      userType: 'store',
      userName: 'Desert Sun Electricals',
      email: 'khalid@desertsun.com',
      subject: 'Unable to upload CR document scan',
      message: 'Hello Support, I am trying to upload my Commercial Registration PDF in the wizard but keep getting an "Upload connection timeout" error. Can you verify my registration manually?',
      priority: 'high',
      status: 'open',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      replies: []
    },
    {
      id: 'tick-202',
      userType: 'contractor',
      userName: 'Riyadh Contracting Corp.',
      email: 'info@riyadhcontracting.com.sa',
      subject: 'Inquiring about corporate VAT invoices',
      message: 'Greetings. We need to print VAT compliant tax invoices for our corporate subscriptions. Where can we download past transaction logs in the customer app?',
      priority: 'medium',
      status: 'resolved',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36h ago
      replies: ['Thank you for reaching out. You can retrieve tax invoices directly in the store portal under Billing > History. Let us know if you need more assistance.']
    },
    {
      id: 'tick-203',
      userType: 'customer',
      userName: 'Sara Al-Otaibi',
      email: 'sara.otaibi@gmail.com',
      subject: 'Item damaged during delivery',
      message: 'My order #B-9921 which contained tiles arrived with 3 broken tiles. I want to report this to logistics for compensation or immediate exchange.',
      priority: 'critical',
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
      replies: []
    }
  ]);

  readonly tickets = this._tickets.asReadonly();

  readonly openTickets = computed(() => this._tickets().filter(t => t.status === 'open'));

  replyToTicket(ticketId: string, replyText: string): void {
    this._tickets.update(list =>
      list.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'resolved', // Automatically marks resolved upon response
          replies: [...t.replies, replyText]
        };
      })
    );
  }

  // ── AUDIT LOGS STATE ────────────────────────────────────────────────────
  private readonly _auditLogs = signal<AuditLog[]>([
    {
      id: 'log-1',
      operatorName: 'Super Admin User',
      role: 'super admin',
      action: 'Authorized store: Al-Fozan Building Materials (store-1)',
      module: 'Stores',
      ip: '192.168.1.45',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'log-2',
      operatorName: 'Finance Controller',
      role: 'finance',
      action: 'Assigned Enterprise Plan subscription to store-1',
      module: 'Billing',
      ip: '192.168.1.102',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'log-3',
      operatorName: 'Operations Specialist',
      role: 'ops',
      action: 'Rejected product submission: SKU TL-DRILL-800-HD due to incorrect SKU pattern',
      module: 'Catalog',
      ip: '192.168.1.18',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  readonly auditLogs = this._auditLogs.asReadonly();

  addAuditLog(operatorName: string, role: string, action: string, module: AuditLog['module']): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      operatorName,
      role,
      action,
      module,
      ip: '192.168.1.50',
      timestamp: new Date().toISOString()
    };
    this._auditLogs.update(list => [newLog, ...list]);
  }

  // ── SYSTEM BROADCAST NOTIFICATIONS STATE ───────────────────────────────
  private readonly _notifications = signal<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Scheduled Platform Maintenance',
      content: 'The MyBinaara database will undergo scheduled index optimization on June 18 between 02:00 and 04:00 AST. Expect temporary portal downtime.',
      type: 'warning',
      targetGroup: 'all',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-2',
      title: 'New Logistics Partner App Integration',
      content: 'We have updated our shipping logistics rules for contractors. Free delivery is now supported inside Riyadh regions.',
      type: 'success',
      targetGroup: 'contractors',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  readonly notifications = this._notifications.asReadonly();

  broadcastNotification(title: string, content: string, type: SystemNotification['type'], targetGroup: SystemNotification['targetGroup']): void {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      content,
      type,
      targetGroup,
      createdAt: new Date().toISOString()
    };
    this._notifications.update(list => [newNotif, ...list]);
  }
}
