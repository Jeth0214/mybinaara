import { SearchProduct } from '../models/search-product.model';

export const MOCK_SEARCH_PRODUCTS: SearchProduct[] = [
  // Cement & Blocks (originally Cement)
  { id: 'sp_01', name: 'Portland Cement 50kg',      category: 'Cement & Blocks', brand: 'Al-Saqr Brand',  price: 22.50,  unit: 'bag',   storeCount: 14, distanceKm: 1.2, iconBg: '#e8f5eb' },
  { id: 'sp_02', name: 'White Cement 25kg',          category: 'Cement & Blocks', brand: 'Najd Plus',      price: 38.00,  unit: 'bag',   storeCount: 6,  distanceKm: 2.3, iconBg: '#e8f5eb' },
  { id: 'sp_03', name: 'Rapid Set Cement 40kg',      category: 'Cement & Blocks', brand: 'SwiftBuild',     price: 55.00,  unit: 'bag',   storeCount: 9,  distanceKm: 3.1, iconBg: '#e8f5eb' },
  { id: 'sp_04', name: 'Masonry Cement 50kg',        category: 'Cement & Blocks', brand: 'BinNabil Co.',   price: 19.75,  unit: 'bag',   storeCount: 18, distanceKm: 0.8, iconBg: '#e8f5eb' },
  // Steel & Metal (originally Steel)
  { id: 'sp_05', name: 'Steel Rebar 12mm x 6m',     category: 'Steel & Metal',  brand: 'Gulf Steel',     price: 45.00,  unit: 'piece', storeCount: 8,  distanceKm: 1.8, iconBg: '#e3f2fd' },
  { id: 'sp_06', name: 'Hollow Section 50x50mm',     category: 'Steel & Metal',  brand: 'Eastern Steel',  price: 62.00,  unit: 'piece', storeCount: 5,  distanceKm: 4.2, iconBg: '#e3f2fd' },
  { id: 'sp_07', name: 'Steel Angle Bar 40x40mm',    category: 'Steel & Metal',  brand: 'Gulf Steel',     price: 38.50,  unit: 'piece', storeCount: 7,  distanceKm: 2.1, iconBg: '#e3f2fd' },
  // Wood & Carpentry (originally Wood)
  { id: 'sp_08', name: 'Pine Plywood 18mm',          category: 'Wood & Carpentry', brand: 'AlWood',         price: 85.00,  unit: 'sheet', storeCount: 7,  distanceKm: 2.5, iconBg: '#fff8e1' },
  { id: 'sp_09', name: 'MDF Board 12mm',             category: 'Wood & Carpentry', brand: 'BuildMart',      price: 55.00,  unit: 'sheet', storeCount: 11, distanceKm: 1.5, iconBg: '#fff8e1' },
  { id: 'sp_10', name: 'Hardwood Timber 4x2 inch',   category: 'Wood & Carpentry', brand: 'AlWood',         price: 32.00,  unit: 'piece', storeCount: 9,  distanceKm: 3.0, iconBg: '#fff8e1' },
  // Glass & Aluminum (originally Glass)
  { id: 'sp_11', name: 'Clear Float Glass 4mm',      category: 'Glass & Aluminum', brand: 'Gulf Glass',     price: 120.00, unit: 'piece', storeCount: 4,  distanceKm: 5.1, iconBg: '#e0f7fa' },
  { id: 'sp_12', name: 'Tempered Glass 8mm',         category: 'Glass & Aluminum', brand: 'SafeGlass Co.',  price: 280.00, unit: 'piece', storeCount: 3,  distanceKm: 6.2, iconBg: '#e0f7fa' },
  // Paint & Finishes (originally Paint)
  { id: 'sp_13', name: 'Interior Emulsion 20L',      category: 'Paint & Finishes', brand: 'ColorMax',       price: 95.00,  unit: 'can',   storeCount: 12, distanceKm: 1.1, iconBg: '#f3e5f5' },
  { id: 'sp_14', name: 'Exterior Weathershield 10L', category: 'Paint & Finishes', brand: 'ProCoat',        price: 145.00, unit: 'can',   storeCount: 8,  distanceKm: 2.8, iconBg: '#f3e5f5' },
  { id: 'sp_15', name: 'Anti-Rust Metal Primer 5L',  category: 'Paint & Finishes', brand: 'ShieldCoat',     price: 68.00,  unit: 'can',   storeCount: 6,  distanceKm: 1.9, iconBg: '#f3e5f5' },
  // Flooring & Tiles (originally Tiles)
  { id: 'sp_16', name: 'Ceramic Floor Tile 60x60',   category: 'Flooring & Tiles', brand: 'AlFanar',        price: 35.00,  unit: 'piece', storeCount: 10, distanceKm: 1.6, iconBg: '#fbe9e7' },
  { id: 'sp_17', name: 'Porcelain Wall Tile 30x60',  category: 'Flooring & Tiles', brand: 'TilePro',        price: 28.00,  unit: 'piece', storeCount: 14, distanceKm: 0.9, iconBg: '#fbe9e7' },
  { id: 'sp_18', name: 'Mosaic Glass Tile 30x30',    category: 'Flooring & Tiles', brand: 'DecorTile',      price: 55.00,  unit: 'piece', storeCount: 6,  distanceKm: 3.4, iconBg: '#fbe9e7' },
  
  // Building Materials
  { id: 'sp_19', name: 'Red Clay Bricks (100 pcs)',  category: 'Building Materials', brand: 'Najd Bricks',  price: 75.00,  unit: 'pack',  storeCount: 15, distanceKm: 1.4, iconBg: '#efebe9' },
  { id: 'sp_20', name: 'River Sand 1 Ton',           category: 'Building Materials', brand: 'SandsCo',      price: 120.00, unit: 'ton',   storeCount: 4,  distanceKm: 4.8, iconBg: '#efebe9' },
  // Doors & Windows
  { id: 'sp_21', name: 'Solid Mahogany Door 2x0.9m', category: 'Doors & Windows', brand: 'Riyadh Wood',    price: 450.00, unit: 'piece', storeCount: 5,  distanceKm: 3.2, iconBg: '#f1f8e9' },
  { id: 'sp_22', name: 'Sliding Aluminum Window',    category: 'Doors & Windows', brand: 'AluFrame',        price: 320.00, unit: 'piece', storeCount: 8,  distanceKm: 2.7, iconBg: '#f1f8e9' },
  // Electrical
  { id: 'sp_23', name: 'LED Panel Light 12W',        category: 'Electrical', brand: 'AlFanar',              price: 15.00,  unit: 'piece', storeCount: 22, distanceKm: 0.5, iconBg: '#fffde7' },
  { id: 'sp_24', name: 'Copper Wire Roll 1.5mm 100m',category: 'Electrical', brand: 'AlFanar',              price: 85.00,  unit: 'roll',  storeCount: 18, distanceKm: 0.5, iconBg: '#fffde7' },
  // Plumbing
  { id: 'sp_25', name: 'PPR Water Pipe 20mm x 4m',   category: 'Plumbing', brand: 'NIPCO',                  price: 12.00,  unit: 'piece', storeCount: 30, distanceKm: 0.9, iconBg: '#e0f2f1' },
  { id: 'sp_26', name: 'Brass Ball Valve 1/2"',      category: 'Plumbing', brand: 'FlowMax',                price: 24.50,  unit: 'piece', storeCount: 12, distanceKm: 1.5, iconBg: '#e0f2f1' },
  // HVAC & Air Conditioning
  { id: 'sp_27', name: 'Split AC Unit 18000 BTU',    category: 'HVAC & Air Conditioning', brand: 'SuperGeneral', price: 1450.00, unit: 'unit', storeCount: 4,  distanceKm: 2.9, iconBg: '#e0f7fa' },
  // Roofing
  { id: 'sp_28', name: 'G.I. Roofing Sheet 3m',      category: 'Roofing', brand: 'Gulf Steel',              price: 48.00,  unit: 'piece', storeCount: 10, distanceKm: 3.5, iconBg: '#eceff1' },
  // Waterproofing
  { id: 'sp_29', name: 'Waterproof Membrane Roll',   category: 'Waterproofing', brand: 'Drizoro',           price: 180.00, unit: 'roll',  storeCount: 6,  distanceKm: 2.2, iconBg: '#e8eaf6' },
  // Tools & Hardware
  { id: 'sp_30', name: 'Heavy Duty Claw Hammer',     category: 'Tools & Hardware', brand: 'Stanley',        price: 35.00,  unit: 'piece', storeCount: 25, distanceKm: 0.4, iconBg: '#efebe9' },
  // Equipment & Machinery
  { id: 'sp_31', name: 'Concrete Mixer 200L 2HP',    category: 'Equipment & Machinery', brand: 'BuildTech', price: 1250.00, unit: 'unit', storeCount: 2,  distanceKm: 5.6, iconBg: '#f3e5f5' },
  // Safety Supplies
  { id: 'sp_32', name: 'Industrial Safety Helmet',   category: 'Safety Supplies', brand: '3M',              price: 28.00,  unit: 'piece', storeCount: 15, distanceKm: 1.1, iconBg: '#ffebee' },
  // Landscaping
  { id: 'sp_33', name: 'Premium Artificial Turf 2x5m', category: 'Landscaping', brand: 'GreenLawn',        price: 195.00, unit: 'roll',  storeCount: 4,  distanceKm: 4.1, iconBg: '#e8f5e9' },
  // Miscellaneous
  { id: 'sp_34', name: 'Heavy Duty Duct Tape 50m',   category: 'Miscellaneous', brand: 'Gorilla',           price: 18.50,  unit: 'roll',  storeCount: 40, distanceKm: 0.3, iconBg: '#f5f5f5' },
];
