

export type OrderStatus = 'Order Received' | 'Preparing Files' | 'Printing' | 'Binding/Finishing' | 'Ready for Pickup' | 'Completed';

export interface Service {
  id: string;
  name: string;
  price: number;        // Use 'price' to match your components
  icon: any;            // Use 'icon' to match your components
  description: string;  // Use 'description'
  desc?: string;        // Add this as optional to stop the ServicesTab error
  tier?: 'Standard' | 'Premium';
}

export interface Order {
  id: string;
  serviceName: string;
  status: OrderStatus;
  quantity: number;
  totalPrice: number;
  date: string;
}
