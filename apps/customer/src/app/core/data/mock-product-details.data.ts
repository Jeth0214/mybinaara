import { ProductDetail } from '../models/product-detail.model';

export const MOCK_PRODUCT_DETAILS: ProductDetail[] = [
  {
    id: 'sp_01',
    description: 'High-strength OPC Portland cement. Suitable for structural concrete, plastering, and masonry work. Meets Saudi SASO 143 standard.',
    specs: ['50kg bag', 'Grade 42.5N', 'SASO certified'],
    availableAt: [
      { storeId: 'store_01', stock: 320 },
      { storeId: 'store_02', stock: 85 },
      { storeId: 'store_03', stock: 200 },
      { storeId: 'store_04', stock: 150 },
      { storeId: 'store_05', stock: 60 },
    ],
  },
  {
    id: 'sp_02',
    description: 'Premium white cement for decorative finishes, grouting, and tile work. Excellent whiteness consistency and smooth workability.',
    specs: ['25kg bag', 'High whiteness', 'Water resistant'],
    availableAt: [
      { storeId: 'store_01', stock: 45 },
      { storeId: 'store_03', stock: 120 },
      { storeId: 'store_04', stock: 30 },
    ],
  },
  {
    id: 'sp_03',
    description: 'Fast-setting cement mix for quick repairs and time-critical applications. Initial set in under 30 minutes, full strength in 24 hours.',
    specs: ['40kg bag', 'Sets in 30 min', 'High strength'],
    availableAt: [
      { storeId: 'store_02', stock: 60 },
      { storeId: 'store_03', stock: 90 },
      { storeId: 'store_05', stock: 25 },
    ],
  },
  {
    id: 'sp_04',
    description: 'Pre-blended masonry cement formulated for bricklaying, blockwork, and render. Excellent workability and long-term bond strength.',
    specs: ['50kg bag', 'Pre-blended', 'Easy to mix'],
    availableAt: [
      { storeId: 'store_01', stock: 180 },
      { storeId: 'store_02', stock: 210 },
      { storeId: 'store_03', stock: 95 },
      { storeId: 'store_04', stock: 75 },
      { storeId: 'store_05', stock: 140 },
    ],
  },
  {
    id: 'sp_05',
    description: 'High-tensile deformed steel rebar for reinforced concrete structures. Excellent ductility and weldability. Meets SASO 2 and ASTM A615.',
    specs: ['12mm dia', '6m length', 'Grade 60'],
    availableAt: [
      { storeId: 'store_01', stock: 50 },
      { storeId: 'store_02', stock: 120 },
      { storeId: 'store_04', stock: 30 },
      { storeId: 'store_05', stock: 80 },
    ],
  },
  {
    id: 'sp_06',
    description: 'Square hollow steel section for structural and fabrication applications. Hot-rolled finish with consistent wall thickness.',
    specs: ['50×50mm', '2mm wall', 'S235 grade'],
    availableAt: [
      { storeId: 'store_03', stock: 40 },
      { storeId: 'store_05', stock: 25 },
    ],
  },
  {
    id: 'sp_07',
    description: 'Mild steel equal angle bar for general fabrication, brackets, shelving, and structural framing. Consistent dimensions and surface finish.',
    specs: ['40×40mm', '4mm thickness', 'Hot rolled'],
    availableAt: [
      { storeId: 'store_01', stock: 80 },
      { storeId: 'store_02', stock: 60 },
      { storeId: 'store_03', stock: 45 },
      { storeId: 'store_04', stock: 35 },
    ],
  },
  {
    id: 'sp_08',
    description: 'Structural pine plywood for flooring, roofing, and concrete shuttering. Bonded with WBP waterproof adhesive for outdoor durability.',
    specs: ['18mm thick', '2440×1220mm', 'WBP glue'],
    availableAt: [
      { storeId: 'store_02', stock: 30 },
      { storeId: 'store_04', stock: 50 },
      { storeId: 'store_05', stock: 20 },
    ],
  },
  {
    id: 'sp_09',
    description: 'Smooth medium-density fibreboard for furniture manufacturing, cabinets, and interior fit-outs. Low formaldehyde E1 emission class.',
    specs: ['12mm thick', '2440×1220mm', 'E1 emission'],
    availableAt: [
      { storeId: 'store_01', stock: 75 },
      { storeId: 'store_02', stock: 40 },
      { storeId: 'store_03', stock: 90 },
      { storeId: 'store_04', stock: 60 },
    ],
  },
  {
    id: 'sp_10',
    description: 'Seasoned hardwood timber for structural framing, decking, and general construction. Kiln-dried for dimensional stability.',
    specs: ['4×2 inch', '3m length', 'Kiln dried'],
    availableAt: [
      { storeId: 'store_01', stock: 120 },
      { storeId: 'store_03', stock: 85 },
      { storeId: 'store_04', stock: 60 },
      { storeId: 'store_05', stock: 40 },
    ],
  },
  {
    id: 'sp_11',
    description: 'Standard clear float glass for windows, interior partitions, and general glazing. Smooth surface with excellent light transmission.',
    specs: ['4mm thick', '1000×2000mm', 'Clear float'],
    availableAt: [
      { storeId: 'store_02', stock: 15 },
      { storeId: 'store_03', stock: 25 },
    ],
  },
  {
    id: 'sp_12',
    description: 'Toughened safety glass for balustrades, shower enclosures, and frameless doors. 5× stronger than standard glass; breaks into safe fragments.',
    specs: ['8mm thick', 'Tempered', 'Safety rated'],
    availableAt: [
      { storeId: 'store_03', stock: 8 },
      { storeId: 'store_05', stock: 12 },
    ],
  },
  {
    id: 'sp_13',
    description: 'Smooth matte interior wall emulsion with excellent coverage and washability. Low VOC, quick-drying formula for healthy indoor spaces.',
    specs: ['20L can', 'Low VOC', 'Washable'],
    availableAt: [
      { storeId: 'store_01', stock: 60 },
      { storeId: 'store_02', stock: 45 },
      { storeId: 'store_03', stock: 80 },
      { storeId: 'store_04', stock: 30 },
      { storeId: 'store_05', stock: 55 },
    ],
  },
  {
    id: 'sp_14',
    description: 'Durable exterior masonry paint with advanced weathershield protection against UV, rain, and dust. 10-year performance guarantee.',
    specs: ['10L can', 'UV resistant', '10yr warranty'],
    availableAt: [
      { storeId: 'store_01', stock: 25 },
      { storeId: 'store_02', stock: 40 },
      { storeId: 'store_04', stock: 30 },
      { storeId: 'store_05', stock: 18 },
    ],
  },
  {
    id: 'sp_15',
    description: 'High-performance rust-inhibiting primer for ferrous metals. Provides long-lasting anti-corrosion protection and excellent adhesion.',
    specs: ['5L can', 'Anti-rust', 'Fast dry'],
    availableAt: [
      { storeId: 'store_02', stock: 35 },
      { storeId: 'store_03', stock: 60 },
      { storeId: 'store_05', stock: 20 },
    ],
  },
  {
    id: 'sp_16',
    description: 'Durable ceramic floor tile with a porcelain-effect surface. Suitable for residential and light commercial floors. R9 slip resistance.',
    specs: ['60×60cm', 'R9 slip rating', 'Indoor use'],
    availableAt: [
      { storeId: 'store_01', stock: 200 },
      { storeId: 'store_02', stock: 150 },
      { storeId: 'store_03', stock: 300 },
      { storeId: 'store_04', stock: 180 },
      { storeId: 'store_05', stock: 120 },
    ],
  },
  {
    id: 'sp_17',
    description: 'Smooth gloss porcelain wall tile for bathrooms and kitchens. Water-resistant, easy to clean, with a modern rectified edge finish.',
    specs: ['30×60cm', 'Gloss finish', 'Water rated'],
    availableAt: [
      { storeId: 'store_01', stock: 350 },
      { storeId: 'store_02', stock: 280 },
      { storeId: 'store_03', stock: 420 },
      { storeId: 'store_04', stock: 190 },
      { storeId: 'store_05', stock: 260 },
    ],
  },
  {
    id: 'sp_18',
    description: 'Decorative glass mosaic tile for feature walls, backsplashes, and wet areas. Mounted on fibreglass mesh for easy installation.',
    specs: ['30×30cm', 'Glass mosaic', 'Mesh backed'],
    availableAt: [
      { storeId: 'store_01', stock: 80 },
      { storeId: 'store_04', stock: 45 },
    ],
  },
];
