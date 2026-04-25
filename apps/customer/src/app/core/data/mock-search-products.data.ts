import { SearchProduct } from '../models/search-product.model';

export const MOCK_SEARCH_PRODUCTS: SearchProduct[] = [
  // Cement
  { id: 'sp_01', name: 'Portland Cement 50kg',      category: 'Cement', brand: 'Al-Saqr Brand',  price: 22.50,  unit: 'bag',   storeCount: 14, distanceKm: 1.2, iconBg: '#e8f5eb' },
  { id: 'sp_02', name: 'White Cement 25kg',          category: 'Cement', brand: 'Najd Plus',      price: 38.00,  unit: 'bag',   storeCount: 6,  distanceKm: 2.3, iconBg: '#e8f5eb' },
  { id: 'sp_03', name: 'Rapid Set Cement 40kg',      category: 'Cement', brand: 'SwiftBuild',     price: 55.00,  unit: 'bag',   storeCount: 9,  distanceKm: 3.1, iconBg: '#e8f5eb' },
  { id: 'sp_04', name: 'Masonry Cement 50kg',        category: 'Cement', brand: 'BinNabil Co.',   price: 19.75,  unit: 'bag',   storeCount: 18, distanceKm: 0.8, iconBg: '#e8f5eb' },
  // Steel
  { id: 'sp_05', name: 'Steel Rebar 12mm x 6m',     category: 'Steel',  brand: 'Gulf Steel',     price: 45.00,  unit: 'piece', storeCount: 8,  distanceKm: 1.8, iconBg: '#e3f2fd' },
  { id: 'sp_06', name: 'Hollow Section 50x50mm',     category: 'Steel',  brand: 'Eastern Steel',  price: 62.00,  unit: 'piece', storeCount: 5,  distanceKm: 4.2, iconBg: '#e3f2fd' },
  { id: 'sp_07', name: 'Steel Angle Bar 40x40mm',    category: 'Steel',  brand: 'Gulf Steel',     price: 38.50,  unit: 'piece', storeCount: 7,  distanceKm: 2.1, iconBg: '#e3f2fd' },
  // Wood
  { id: 'sp_08', name: 'Pine Plywood 18mm',          category: 'Wood',   brand: 'AlWood',         price: 85.00,  unit: 'sheet', storeCount: 7,  distanceKm: 2.5, iconBg: '#fff8e1' },
  { id: 'sp_09', name: 'MDF Board 12mm',             category: 'Wood',   brand: 'BuildMart',      price: 55.00,  unit: 'sheet', storeCount: 11, distanceKm: 1.5, iconBg: '#fff8e1' },
  { id: 'sp_10', name: 'Hardwood Timber 4x2 inch',   category: 'Wood',   brand: 'AlWood',         price: 32.00,  unit: 'piece', storeCount: 9,  distanceKm: 3.0, iconBg: '#fff8e1' },
  // Glass
  { id: 'sp_11', name: 'Clear Float Glass 4mm',      category: 'Glass',  brand: 'Gulf Glass',     price: 120.00, unit: 'piece', storeCount: 4,  distanceKm: 5.1, iconBg: '#e0f7fa' },
  { id: 'sp_12', name: 'Tempered Glass 8mm',         category: 'Glass',  brand: 'SafeGlass Co.',  price: 280.00, unit: 'piece', storeCount: 3,  distanceKm: 6.2, iconBg: '#e0f7fa' },
  // Paint
  { id: 'sp_13', name: 'Interior Emulsion 20L',      category: 'Paint',  brand: 'ColorMax',       price: 95.00,  unit: 'can',   storeCount: 12, distanceKm: 1.1, iconBg: '#f3e5f5' },
  { id: 'sp_14', name: 'Exterior Weathershield 10L', category: 'Paint',  brand: 'ProCoat',        price: 145.00, unit: 'can',   storeCount: 8,  distanceKm: 2.8, iconBg: '#f3e5f5' },
  { id: 'sp_15', name: 'Anti-Rust Metal Primer 5L',  category: 'Paint',  brand: 'ShieldCoat',     price: 68.00,  unit: 'can',   storeCount: 6,  distanceKm: 1.9, iconBg: '#f3e5f5' },
  // Tiles
  { id: 'sp_16', name: 'Ceramic Floor Tile 60x60',   category: 'Tiles',  brand: 'AlFanar',        price: 35.00,  unit: 'piece', storeCount: 10, distanceKm: 1.6, iconBg: '#fbe9e7' },
  { id: 'sp_17', name: 'Porcelain Wall Tile 30x60',  category: 'Tiles',  brand: 'TilePro',        price: 28.00,  unit: 'piece', storeCount: 14, distanceKm: 0.9, iconBg: '#fbe9e7' },
  { id: 'sp_18', name: 'Mosaic Glass Tile 30x30',    category: 'Tiles',  brand: 'DecorTile',      price: 55.00,  unit: 'piece', storeCount: 6,  distanceKm: 3.4, iconBg: '#fbe9e7' },
];
