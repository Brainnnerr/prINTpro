
export type ServiceType = 'card' | 'poster' | 'thesis' | 'sticker' | 'flyer' | 'banner';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  tier: 'Standard' | 'Premium';
  description: string;
  basePrice: number; // Price per unit
  iconName: string;
}

export type PaperType = string;

export type OrderStatus = 'Submitted' | 'Printing' | 'Quality Check' | 'Ready for Pickup' | 'Completed';

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  status: OrderStatus;
  quantity: number;
  paperType: PaperType;
  printColor: 'Color' | 'B&W';
  printSides: 'Single-Sided' | 'Double-Sided';
  orientation: 'Portrait' | 'Landscape';
  notes: string;
  totalPrice: number;
  fileName: string;
  customerName: string;
  customerEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  threshold: number;
}
