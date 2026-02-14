
import React, { useState } from 'react';
import { Package, Clock, Calendar, ChevronRight, FileText, CheckCircle2, MessageSquare, Droplets, Layers, RotateCcw } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { STATUS_STEPS } from '../constants';
import { Modal } from './Modal';

interface OrderListProps {
  orders: Order[];
  onReorder?: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onReorder }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Helper to get status percentage
  const getProgress = (status: OrderStatus) => {
    const index = STATUS_STEPS.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / STATUS_STEPS.length) * 100;
  };

  const getStatusColor = (status: OrderStatus) => {
    if (status === 'Completed' || status === 'Ready for Pickup') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'Submitted') return 'text-slate-600 bg-slate-100 border-slate-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-xl font-medium text-slate-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{order.serviceName}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {order.date}</span>
                    <span className="flex items-center gap-1">ID: {order.id}</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-6 text-right">
                   <div>
                       <p className="text-2xl font-bold text-slate-800">₱{order.totalPrice.toFixed(2)}</p>
                       <p className="text-sm text-slate-500">{order.quantity} units</p>
                   </div>
                   {onReorder && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); onReorder(order); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 border border-transparent font-medium transition-all"
                       >
                           <RotateCcw size={16} /> Re-order
                       </button>
                   )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${order.status === 'Completed' ? 'bg-green-500' : 'bg-teal-500'}`}
                    style={{ width: `${getProgress(order.status)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                   {STATUS_STEPS.map((step, idx) => (
                      <span key={step} className={STATUS_STEPS.indexOf(order.status) >= idx ? 'text-teal-600' : ''}>
                        {step}
                      </span>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <div className="text-center">
                  <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                    <FileText size={40} className="text-teal-500" />
                  </div>
                  <p className="font-medium text-slate-700">{selectedOrder.fileName}</p>
                  <p className="text-xs text-slate-400">Uploaded on {selectedOrder.date}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                  <p className="text-slate-500 mb-1">Service Type</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.serviceName}</p>
               </div>
               <div>
                  <p className="text-slate-500 mb-1">Quantity</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.quantity}</p>
               </div>
               <div>
                  <p className="text-slate-500 mb-1">Paper Material</p>
                  <p className="font-semibold text-slate-800">{selectedOrder.paperType}</p>
               </div>
               <div>
                  <p className="text-slate-500 mb-1">Print Specs</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 flex items-center gap-2">
                       {selectedOrder.printColor === 'Color' ? <Droplets size={12} className="text-purple-500"/> : <div className="w-3 h-3 bg-slate-800 rounded-full"></div>}
                       {selectedOrder.printColor}
                    </p>
                    <p className="text-slate-600 text-xs flex items-center gap-1">
                       <Layers size={10} /> {selectedOrder.orientation}, {selectedOrder.printSides}
                    </p>
                  </div>
               </div>
               <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Total Paid</p>
                  <p className="font-semibold text-green-600 text-lg">₱{selectedOrder.totalPrice.toFixed(2)}</p>
               </div>
               
               {selectedOrder.notes && (
                 <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <p className="flex items-center gap-1 text-xs font-bold text-amber-700 mb-1">
                      <MessageSquare size={12} /> Special Instructions
                    </p>
                    <p className="text-slate-700 italic">{selectedOrder.notes}</p>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                   className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                   onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
                {onReorder && (
                    <button 
                       className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                       onClick={() => {
                           onReorder(selectedOrder);
                           setSelectedOrder(null);
                       }}
                    >
                      <RotateCcw size={18} /> Re-order
                    </button>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
