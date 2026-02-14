
import { Service, User, Order, InventoryItem } from './types';

export const CURRENT_USER: User = {
  id: 'u-123',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  avatarUrl: 'https://picsum.photos/100/100',
};

export const SERVICES: Service[] = [
  {
    id: 's-1',
    name: 'Business Cards',
    type: 'card',
    tier: 'Standard',
    description: 'Premium quality cards to make a lasting impression.',
    basePrice: 0.15,
    iconName: 'CreditCard',
  },
  {
    id: 's-2',
    name: 'Event Posters',
    type: 'poster',
    tier: 'Premium',
    description: 'High-gloss posters available in A3, A2, and A1 sizes.',
    basePrice: 5.00,
    iconName: 'Image',
  },
  {
    id: 's-3',
    name: 'Thesis Binding',
    type: 'thesis',
    tier: 'Premium',
    description: 'Professional hard-cover binding for your dissertation.',
    basePrice: 25.00,
    iconName: 'Book',
  },
  {
    id: 's-4',
    name: 'Custom Stickers',
    type: 'sticker',
    tier: 'Standard',
    description: 'Die-cut vinyl stickers, waterproof and durable.',
    basePrice: 0.50,
    iconName: 'Sticker',
  },
  {
    id: 's-5',
    name: 'Marketing Flyers',
    type: 'flyer',
    tier: 'Standard',
    description: 'Vibrant colors on lightweight paper for mass distribution.',
    basePrice: 0.20,
    iconName: 'Files',
  },
  {
    id: 's-6',
    name: 'Large Banners',
    type: 'banner',
    tier: 'Premium',
    description: 'Heavy-duty vinyl banners with grommets for hanging.',
    basePrice: 45.00,
    iconName: 'Flag',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    serviceId: 's-2',
    serviceName: 'Event Posters',
    date: '2023-10-15',
    status: 'Completed',
    quantity: 10,
    paperType: 'A4 Glossy Paper',
    printColor: 'Color',
    printSides: 'Single-Sided',
    orientation: 'Portrait',
    notes: 'Please trim white borders.',
    totalPrice: 50.00,
    fileName: 'concert_promo_v2.pdf',
    customerName: 'Sarah Conner',
    customerEmail: 'sarah.c@example.com'
  },
  {
    id: 'ord-002',
    serviceId: 's-1',
    serviceName: 'Business Cards',
    date: '2023-10-26',
    status: 'Printing',
    quantity: 500,
    paperType: 'Cardstock Premium',
    printColor: 'Color',
    printSides: 'Double-Sided',
    orientation: 'Landscape',
    notes: '',
    totalPrice: 75.00,
    fileName: 'alex_cards_final.ai',
    customerName: 'Alex Johnson',
    customerEmail: 'alex.j@example.com'
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'A4 Glossy Paper', sku: 'P-GL-A4', quantity: 2400, unit: 'sheets', threshold: 500 },
  { id: 'inv-2', name: 'A4 Matte Paper', sku: 'P-MT-A4', quantity: 150, unit: 'sheets', threshold: 300 },
  { id: 'inv-3', name: 'Cardstock Premium', sku: 'P-CS-01', quantity: 850, unit: 'sheets', threshold: 200 },
  { id: 'inv-4', name: 'Cyan Ink Cartridge', sku: 'INK-C-XL', quantity: 12, unit: 'units', threshold: 5 },
  { id: 'inv-5', name: 'Magenta Ink Cartridge', sku: 'INK-M-XL', quantity: 4, unit: 'units', threshold: 5 },
  { id: 'inv-6', name: 'Binding Glue', sku: 'BND-GLU', quantity: 30, unit: 'bottles', threshold: 10 },
];

export const STATUS_STEPS = ['Submitted', 'Printing', 'Quality Check', 'Ready for Pickup', 'Completed'];
