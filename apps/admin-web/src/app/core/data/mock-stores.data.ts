import { Store } from '../models/store.model';

export const MOCK_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Al-Fozan Building Materials',
    crNumber: '1010348712',
    vatNumber: '300054321000003',
    iban: 'SA5580000000123456789012',
    ownerName: 'Mohammed Al-Fozan',
    ownerEmail: 'mohammed@fozan.com.sa',
    ownerPhone: '+966505123456',
    location: 'Riyadh',
    category: 'Building Materials',
    status: 'active',
    subscriptionPlanId: 'enterprise',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    documents: [
      {
        type: 'cr',
        fileName: 'commercial_registration.pdf',
        fileUrl: '/assets/mock-docs/cr_fozan.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_certificate.pdf',
        fileUrl: '/assets/mock-docs/vat_fozan.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_letter.pdf',
        fileUrl: '/assets/mock-docs/iban_fozan.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'store-2',
    name: 'Riyadh Steel Co.',
    crNumber: '1010892341',
    vatNumber: '310243210900003',
    iban: 'SA4540000000987654321098',
    ownerName: 'Abdulrahman Al-Sudairy',
    ownerEmail: 'sudairy@riyadhsteel.sa',
    ownerPhone: '+966541223344',
    location: 'Riyadh',
    category: 'Building Materials',
    status: 'active',
    subscriptionPlanId: 'premium',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'cr_riyadh_steel.pdf',
        fileUrl: '/assets/mock-docs/cr_steel.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_cert_steel.pdf',
        fileUrl: '/assets/mock-docs/vat_steel.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_bank_letter.pdf',
        fileUrl: '/assets/mock-docs/iban_steel.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'store-3',
    name: 'Desert Sun Electricals',
    crNumber: '4030129843',
    vatNumber: '300998877600003',
    iban: 'SA2010000000112233445566',
    ownerName: 'Khalid Masoud',
    ownerEmail: 'khalid@desertsun.com',
    ownerPhone: '+966567890123',
    location: 'Jeddah',
    category: 'Electrical',
    status: 'pending',
    subscriptionPlanId: 'basic',
    activationLink: 'https://mybinaara.com/activate/ds-elec-9988',
    tempPassword: 'BinaaraStoreTempPass9988!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    documents: [
      {
        type: 'cr',
        fileName: 'cr_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/cr_desert_sun.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_cert_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/vat_desert_sun.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/iban_desert_sun.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'store-4',
    name: 'Red Sea Plumbing & Piping',
    crNumber: '4030654321',
    vatNumber: '302055667700003',
    iban: 'SA8805000000443322110099',
    ownerName: 'Yousef Al-Harbi',
    ownerEmail: 'yousef@redseapipes.sa',
    ownerPhone: '+966555666777',
    location: 'Jeddah',
    category: 'Plumbing',
    status: 'suspended',
    subscriptionPlanId: 'basic',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'cr_red_sea.pdf',
        fileUrl: '/assets/mock-docs/cr_red_sea.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_red_sea.pdf',
        fileUrl: '/assets/mock-docs/vat_red_sea.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_red_sea.pdf',
        fileUrl: '/assets/mock-docs/iban_red_sea.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'store-5',
    name: 'Najd HVAC Solutions',
    crNumber: '1010998877',
    vatNumber: '304099887700003',
    iban: 'SA1230000000778899001122',
    ownerName: 'Fahad Al-Otaibi',
    ownerEmail: 'fahad@najdhvac.sa',
    ownerPhone: '+966533444555',
    location: 'Riyadh',
    category: 'HVAC',
    status: 'rejected',
    rejectionReason: 'The VAT registration number is invalid and Commercial Registration has expired.',
    subscriptionPlanId: 'premium',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'expired_cr.pdf',
        fileUrl: '/assets/mock-docs/expired_cr.pdf',
        status: 'rejected',
        rejectionReason: 'This Commercial Registration expired in 2025.',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_document.pdf',
        fileUrl: '/assets/mock-docs/vat_document.pdf',
        status: 'rejected',
        rejectionReason: 'Invalid VAT number format.',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_letter.pdf',
        fileUrl: '/assets/mock-docs/iban_letter.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'store-6',
    name: 'Hejaz Hardware Store',
    crNumber: '4031223344',
    vatNumber: '301122334400003',
    iban: 'SA9245000000223344556677',
    ownerName: 'Ali bin Laden',
    ownerEmail: 'ali@hejaztools.com',
    ownerPhone: '+966598765432',
    location: 'Mecca',
    category: 'Tools & Hardware',
    status: 'pending',
    subscriptionPlanId: 'premium',
    activationLink: 'https://mybinaara.com/activate/hejaz-tools-4433',
    tempPassword: 'BinaaraStoreTempPass4433!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    documents: [
      {
        type: 'cr',
        fileName: 'cr_hejaz.pdf',
        fileUrl: '/assets/mock-docs/cr_hejaz.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_cert_hejaz.pdf',
        fileUrl: '/assets/mock-docs/vat_cert_hejaz.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_letter.pdf',
        fileUrl: '/assets/mock-docs/iban_letter.pdf',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];
