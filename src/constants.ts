// src/constants.ts
import type { Service } from './types'; 

export const SERVICES: Service[] = [
  { 
    id: 's1', 
    name: 'Business Cards', 
    description: 'Luxury 400gsm stocks.', 
    basePrice: 0.15, 
    iconName: 'CreditCard', 
    tier: 'Standard' 
  },
  { 
    id: 's2', 
    name: 'Thesis Binding', 
    description: 'Hardbound with gold foil.', 
    basePrice: 25.00, 
    iconName: 'Book', 
    tier: 'Premium' 
  }
];

// Updated status steps for a better user experience
export const STATUS_STEPS = [
  'Order Received', 
  'Preparing Files', 
  'Printing', 
  'Binding/Finishing', 
  'Ready for Pickup', 
  'Completed'
];