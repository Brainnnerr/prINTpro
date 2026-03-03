import type { ReactNode } from 'react';

export type OrderStatus = 'Submitted' | 'Printing' | 'Quality Check' | 'Ready for Pickup' | 'Completed';

export interface Service {
  id: string;
  name: string;
  desc: string;
  price: number;
  icon: ReactNode;
}

export interface Order {
  id: string;
  serviceName: string;
  status: OrderStatus;
  quantity: number;
  totalPrice: number;
  date: string;
}