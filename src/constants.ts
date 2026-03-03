// src/constants.ts
import { CreditCard, Book } from 'lucide-react'; // Added this line
import type { Service } from './types'; 

export const SERVICES: Service[] = [
  { 
    id: 's1', 
    name: 'Business Cards', 
    description: 'Luxury 400gsm stocks.', 
    desc: 'Luxury 400gsm stocks.',
    price: 0.15, 
    icon: CreditCard, 
    tier: 'Standard' 
  },
  { 
    id: 's2', 
    name: 'Thesis Binding', 
    description: 'Hardbound with gold foil.', 
    desc: 'Hardbound with gold foil.',
    price: 25.00, 
    icon: Book, 
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
