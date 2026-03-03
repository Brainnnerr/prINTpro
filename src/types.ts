

export type OrderStatus = 'Order Received' | 'Preparing Files' | 'Printing' | 'Binding/Finishing' | 'Ready for Pickup' | 'Completed';

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  iconName: string; 
  tier: 'Standard' | 'Premium';
}

export interface Order {
  id: string;
  serviceName: string;
  status: OrderStatus;
  quantity: number;
  totalPrice: number;
  date: string;
}