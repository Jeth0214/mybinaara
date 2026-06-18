import { Store } from '../models/store.model';

const BASE_MOCK_STORES: any[] = [
  {
    id: 'store-1',
    name: 'Al-Fozan Building Materials',
    crNumber: '1010348712',
    vatNumber: '300054321000003',
    iban: 'SA5580000000123456789012',
    ownerName: 'Mohammed Al-Fozan',
    ownerEmail: 'mohammed@fozan.com.sa',
    ownerPhone: '+966505123456',
    ownerWhatsapp: '+966505123456',
    location: 'Riyadh',
    district: 'Al-Olaya',
    lat: 24.6877,
    lng: 46.7211,
    status: 'active',
    isActivated: true,
    subscriptionPlanId: 'enterprise',
    subscriptionHistory: [
      { planId: 'basic', startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { planId: 'enterprise', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    ownerWhatsapp: '+966541223344',
    location: 'Riyadh',
    district: 'Industrial Area',
    lat: 24.5765,
    lng: 46.8234,
    status: 'active',
    isActivated: true,
    subscriptionPlanId: 'premium',
    subscriptionHistory: [
      { planId: 'basic', startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { planId: 'premium', startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
    ],
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
    ownerWhatsapp: '+966567890123',
    location: 'Jeddah',
    district: 'Al-Safa',
    lat: 21.5794,
    lng: 39.2014,
    status: 'pending',
    isActivated: false,
    subscriptionPlanId: 'basic',
    subscriptionHistory: [
      { planId: 'premium', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { planId: 'basic', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    activationLink: 'https://mybinaara.com/activate/ds-elec-9988',
    tempPassword: 'BinaaraStoreTempPass9988!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'cr_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/cr_desert_sun.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_cert_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/vat_desert_sun.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_desert_sun.pdf',
        fileUrl: '/assets/mock-docs/iban_desert_sun.pdf',
        status: 'approved',
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
    ownerWhatsapp: '+966555666777',
    location: 'Jeddah',
    district: 'Al-Hamra',
    lat: 21.5169,
    lng: 39.1558,
    status: 'suspended',
    isActivated: true,
    subscriptionPlanId: 'basic',
    subscriptionHistory: [
      { planId: 'basic', startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() }
    ],
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
    ownerWhatsapp: '+966533444555',
    location: 'Riyadh',
    district: 'Al-Malaz',
    lat: 24.6644,
    lng: 46.7323,
    status: 'suspended',
    isActivated: true,
    rejectionReason: 'Subscription expired and not renewed.',
    subscriptionPlanId: 'premium',
    subscriptionHistory: [
      { planId: 'basic', startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { planId: 'premium', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'cr_najd.pdf',
        fileUrl: '/assets/mock-docs/cr_najd.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_najd.pdf',
        fileUrl: '/assets/mock-docs/vat_najd.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_najd.pdf',
        fileUrl: '/assets/mock-docs/iban_najd.pdf',
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
    ownerWhatsapp: '+966598765432',
    location: 'Mecca',
    district: 'Al-Shoqiyah',
    lat: 21.3789,
    lng: 39.8155,
    status: 'pending',
    isActivated: false,
    subscriptionPlanId: 'basic',
    subscriptionHistory: [],
    activationLink: 'https://mybinaara.com/activate/hejaz-tools-4433',
    tempPassword: 'BinaaraStoreTempPass4433!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      {
        type: 'cr',
        fileName: 'cr_hejaz.pdf',
        fileUrl: '/assets/mock-docs/cr_hejaz.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: 'vat_cert_hejaz.pdf',
        fileUrl: '/assets/mock-docs/vat_cert_hejaz.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: 'iban_letter.pdf',
        fileUrl: '/assets/mock-docs/iban_letter.pdf',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Generate 94 more stores to reach exactly 100 stores
const GENERATED_STORES: Store[] = [];
const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Jubail', 'Tabuk', 'Abha', 'Buraidah'];
const plans = ['basic', 'premium', 'enterprise'] as const;
const statuses = ['active', 'suspended', 'pending'] as const;
const districts = ['Al-Nafal', 'Al-Malqa', 'Al-Yasmin', 'Al-Rawdah', 'Al-Naeem', 'Al-Safa', 'Al-Hamra', 'Al-Batha'];

for (let i = 7; i <= 100; i++) {
  const city = cities[i % cities.length];

  const plan = plans[i % plans.length];
  const status = statuses[i % statuses.length];
  const district = districts[i % districts.length];

  GENERATED_STORES.push({
    id: `store-${i}`,
    name: `Saudi Merchant Supply Co. ${i}`,
    crNumber: `1010${Math.floor(100000 + Math.random() * 900000)}`,
    vatNumber: `3000${Math.floor(100000000 + Math.random() * 900000000)}00003`,
    iban: `SA${Math.floor(10 + Math.random() * 89)}80000000${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    ownerName: `Abdulrahman Al-Qahtani ${i}`,
    ownerEmail: `vendor${i}@saudisupply.sa`,
    ownerPhone: `+96650${Math.floor(1000000 + Math.random() * 9000000)}`,
    ownerWhatsapp: `+96650${Math.floor(1000000 + Math.random() * 9000000)}`,
    location: city,
    district: district,
    lat: 24.6 + (i * 0.003),
    lng: 46.7 + (i * 0.003),
    status: status,
    isActivated: status === 'active' || status === 'suspended',
    subscriptionPlanId: status === 'pending' ? 'basic' : plan,
    subscriptionHistory: status === 'pending' ? [] : [
      { planId: 'basic', startDate: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString(), endDate: plan !== 'basic' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() : undefined },
      ...(plan !== 'basic' ? [{ planId: plan, startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }] : []),
      // For some basic stores, simulate they were subscribed in the past to test "unsubscribed" count
      ...(plan === 'basic' && i % 6 === 0 ? [{ planId: 'premium' as const, startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }] : [])
    ],
    createdAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString(),
    tempPassword: `TempPassSaudi${i}!`,
    storeLogo: i % 4 === 0 ? `https://picsum.photos/id/${10 + i}/100/100` : undefined,
    totalProducts: 0,
    documents: [
      {
        type: 'cr',
        fileName: `cr_supply_${i}.pdf`,
        fileUrl: `/assets/mock-docs/cr_sample.pdf`,
        status: 'approved',
        uploadedAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        fileName: `vat_supply_${i}.pdf`,
        fileUrl: `/assets/mock-docs/vat_sample.pdf`,
        status: 'approved',
        uploadedAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'iban',
        fileName: `iban_supply_${i}.pdf`,
        fileUrl: `/assets/mock-docs/iban_sample.pdf`,
        status: 'approved',
        uploadedAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
}

export const MOCK_STORES: Store[] = [...BASE_MOCK_STORES, ...GENERATED_STORES].map(s => ({ 
  ...s, 
  totalProducts: s.totalProducts || 0 
}));

