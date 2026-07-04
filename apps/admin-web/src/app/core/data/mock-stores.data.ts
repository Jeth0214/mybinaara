import { Store } from '../models/store.model';

const BASE_MOCK_STORES: any[] = [
  {
    id: 'store-1',
    name: 'Al-Fozan Building Materials',
    crNumber: '1010348712',
    vatNumber: '300054321000003',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        status: 'approved',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Generate 94 more stores to reach exactly 100 stores
const GENERATED_STORES: any[] = [];
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
        status: 'approved',
        uploadedAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'vat',
        status: 'approved',
        uploadedAt: new Date(Date.now() - (i % 60) * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
}

export const MOCK_STORES: Store[] = [...BASE_MOCK_STORES, ...GENERATED_STORES].map(s => {
  const buildingNumber = '1234';
  const streetName = s.streetAddress || 'Main Street';
  const district = s.district || '';
  const city = s.location || '';
  const postalCode = '12345';
  const additionalNumber = '9123';
  const country = 'Saudi Arabia';
  const fullAddress = `${buildingNumber} ${streetName},\n${district ? district + ',\n' : ''}${city} ${postalCode} - ${additionalNumber},\n${country}`;

  const loc = {
    fullAddress,
    buildingNumber,
    streetName,
    district,
    city,
    postalCode,
    additionalNumber,
    country,
    latitude: Number(s.lat || 0),
    longitude: Number(s.lng || 0),
    plusCode: ''
  };

  return {
    ...s,
    location: loc,
    totalProducts: s.totalProducts || 0,
    schedule: s.schedule || [
      { day: 'sat', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'sun', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'mon', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'tue', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'wed', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'thu', openTime: '08:00 AM', closeTime: '09:00 PM', isOff: false },
      { day: 'fri', openTime: '', closeTime: '', isOff: true }
    ]
  };
});
