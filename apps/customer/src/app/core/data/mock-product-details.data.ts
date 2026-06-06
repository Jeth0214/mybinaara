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
  {
    id: 'sp_19',
    description: 'High-quality red clay bricks designed for partition walls, facades, and load-bearing structures. Exceptional thermal insulation and durability.',
    specs: ['Red Clay', 'Standard size', 'High load capacity'],
    availableAt: [
      { storeId: 'store_01', stock: 1200 },
      { storeId: 'store_02', stock: 800 },
    ],
  },
  {
    id: 'sp_20',
    description: 'Clean river sand for concrete mixes, mortar preparation, and plastering. Free from organic matter and clay contaminants.',
    specs: ['1 Ton bag', 'Medium-coarse grain', 'Washed & graded'],
    availableAt: [
      { storeId: 'store_03', stock: 15 },
      { storeId: 'store_05', stock: 8 },
    ],
  },
  {
    id: 'sp_21',
    description: 'Premium grade solid mahogany wood door. Precision-carved with a classic paneled design. Excellent weather resistance and wood grain texture.',
    specs: ['200×90cm size', 'Solid Mahogany', 'Unfinished surface'],
    availableAt: [
      { storeId: 'store_02', stock: 4 },
      { storeId: 'store_04', stock: 10 },
    ],
  },
  {
    id: 'sp_22',
    description: 'Double-glazed sliding window with durable powder-coated aluminum frame. Excellent thermal insulation and noise reduction.',
    specs: ['1.2×1.2m size', 'Double glazed', 'White aluminum frame'],
    availableAt: [
      { storeId: 'store_01', stock: 6 },
      { storeId: 'store_04', stock: 12 },
    ],
  },
  {
    id: 'sp_23',
    description: 'Energy-efficient LED panel light with slim aluminum bezel. Provides uniform, flicker-free bright white illumination suitable for home and office.',
    specs: ['12W power', 'Cool White (6500K)', 'Recessed mounting'],
    availableAt: [
      { storeId: 'store_01', stock: 150 },
      { storeId: 'store_02', stock: 90 },
      { storeId: 'store_03', stock: 240 },
    ],
  },
  {
    id: 'sp_24',
    description: 'High-quality copper conductor wire with durable PVC insulation. Ideal for domestic and commercial electrical wiring projects.',
    specs: ['1.5mm thickness', '100m roll', 'Flame retardant'],
    availableAt: [
      { storeId: 'store_01', stock: 40 },
      { storeId: 'store_03', stock: 80 },
      { storeId: 'store_05', stock: 25 },
    ],
  },
  {
    id: 'sp_25',
    description: 'Polypropylene Random (PPR) pipes designed for hot and cold water plumbing networks. High heat resistance and leak-proof fusion joints.',
    specs: ['20mm diameter', '4m length', 'PN20 pressure rated'],
    availableAt: [
      { storeId: 'store_01', stock: 500 },
      { storeId: 'store_02', stock: 320 },
      { storeId: 'store_03', stock: 450 },
    ],
  },
  {
    id: 'sp_26',
    description: 'Heavy duty brass ball valve with full port design and chrome-plated brass ball. Provides reliable flow shut-off for water supply systems.',
    specs: ['1/2 inch thread', 'Full bore flow', 'Quarter turn handle'],
    availableAt: [
      { storeId: 'store_01', stock: 85 },
      { storeId: 'store_03', stock: 120 },
      { storeId: 'store_04', stock: 60 },
    ],
  },
  {
    id: 'sp_27',
    description: 'High-performance split AC unit featuring dual rotary compressor, smart temperature control, and washable dust filters.',
    specs: ['18000 BTU capacity', 'R32 refrigerant', '4-star energy rating'],
    availableAt: [
      { storeId: 'store_02', stock: 5 },
      { storeId: 'store_03', stock: 8 },
    ],
  },
  {
    id: 'sp_28',
    description: 'Heavy gauge corrugated galvanized iron roofing sheets. Highly weather-resistant, anti-rust coated, and durable structural design.',
    specs: ['3m length', '0.4mm thickness', 'Zinc-coated steel'],
    availableAt: [
      { storeId: 'store_01', stock: 150 },
      { storeId: 'store_04', stock: 80 },
    ],
  },
  {
    id: 'sp_29',
    description: 'Self-adhesive bituminous waterproofing membrane roll for roof structures, wet areas, and foundation sealing. High flexibility and elongation.',
    specs: ['10m×1m roll', '3mm thickness', 'Polyester reinforced'],
    availableAt: [
      { storeId: 'store_02', stock: 20 },
      { storeId: 'store_03', stock: 45 },
    ],
  },
  {
    id: 'sp_30',
    description: 'Ergonomic fiberglass handle claw hammer with high-carbon steel head. Shock dampening grip design for comfortable all-day use.',
    specs: ['16 oz head', 'Fiberglass handle', 'Magnetic nail starter'],
    availableAt: [
      { storeId: 'store_01', stock: 35 },
      { storeId: 'store_03', stock: 50 },
      { storeId: 'store_05', stock: 15 },
    ],
  },
  {
    id: 'sp_31',
    description: 'Heavy duty concrete mixer with durable cast iron drum and high-torque electric motor. Easy transport wheels and dual side tilt levers.',
    specs: ['200L capacity', '2.0 HP motor', 'Powder-coated frame'],
    availableAt: [
      { storeId: 'store_01', stock: 2 },
      { storeId: 'store_05', stock: 3 },
    ],
  },
  {
    id: 'sp_32',
    description: 'Safety helmet featuring a high-density polyethylene shell, comfortable 4-point pinlock suspension, and standard accessory slots.',
    specs: ['Class E rated', '4-point suspension', 'Adjustable headband'],
    availableAt: [
      { storeId: 'store_01', stock: 120 },
      { storeId: 'store_02', stock: 80 },
      { storeId: 'store_03', stock: 160 },
    ],
  },
  {
    id: 'sp_33',
    description: 'Premium quality artificial grass turf with realistic multi-tone fibers. Highly durable, UV-resistant, and features built-in drainage holes.',
    specs: ['2×5m dimensions', '30mm pile height', 'UV & fade resistant'],
    availableAt: [
      { storeId: 'store_02', stock: 8 },
      { storeId: 'store_04', stock: 15 },
    ],
  },
  {
    id: 'sp_34',
    description: 'Ultra-strong, multi-purpose waterproof adhesive duct tape. Thick rubber adhesive bond sticks to smooth, rough, or uneven surfaces.',
    specs: ['50m length', '48mm width', 'Triple layer adhesion'],
    availableAt: [
      { storeId: 'store_01', stock: 200 },
      { storeId: 'store_02', stock: 140 },
      { storeId: 'store_04', stock: 310 },
    ],
  },
];
