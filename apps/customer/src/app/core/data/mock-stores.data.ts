import { Store } from '../models/store.model';

export const MOCK_STORES: Store[] = [
  { id: 'store_01', name: 'Al-Amal Building Materials', city: 'Jeddah', district: 'Al-Rawdah',  distanceKm: 1.2 },
  { id: 'store_02', name: 'Nour Hardware & Supply',     city: 'Jeddah', district: 'Al-Balad',   distanceKm: 2.8 },
  { id: 'store_03', name: 'Gulf Tools Center',          city: 'Jeddah', district: 'Al-Hamra',   distanceKm: 3.5 },
  { id: 'store_04', name: 'Eastern Hardware',           city: 'Jeddah', district: 'Al-Andalus', distanceKm: 4.1 },
  { id: 'store_05', name: 'Saudi Steel & Co.',          city: 'Jeddah', district: 'Al-Safa',    distanceKm: 5.3 },
];
