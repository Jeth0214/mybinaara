import { RecentSearchProduct } from '../models/recent-search.model';

export const MOCK_RECENT_SEARCHES: RecentSearchProduct[] = [
  {
    id: 'rsp_001',
    title: 'Makita 18V Drill',
    category: 'POWER TOOLS',
    sku: 'MAK-DHP484Z',
    storeCount: 4,
    searchedAt: new Date('2026-04-19T06:00:00'),
  },
  {
    id: 'rsp_002',
    title: 'M8 Hex Bolt Set (50 pcs)',
    category: 'FASTENERS',
    sku: 'BOLT-M8-50',
    storeCount: 12,
    searchedAt: new Date('2026-04-18T14:30:00'),
  },
  {
    id: 'rsp_003',
    title: 'PVC Pipe 3/4"',
    category: 'PLUMBING',
    sku: 'PVC-75-3M',
    storeCount: 8,
    searchedAt: new Date('2026-04-18T09:15:00'),
  },
  {
    id: 'rsp_004',
    title: 'Cement 40kg Bag',
    category: 'MASONRY',
    sku: 'CEM-40KG-OPC',
    storeCount: 6,
    searchedAt: new Date('2026-04-17T16:45:00'),
  },
  {
    id: 'rsp_005',
    title: 'Stanley Tape Measure 5m',
    category: 'HAND TOOLS',
    sku: 'STN-TM-5M',
    storeCount: 9,
    searchedAt: new Date('2026-04-17T11:00:00'),
  },
];
