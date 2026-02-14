
import React, { useState, useMemo } from 'react';
import { MoreHorizontal, FileText, CheckCircle, Printer, Truck, XCircle, Download, User, Mail, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Save, X, Filter, RotateCcw, Droplets, MessageSquare, Layers } from 'lucide-react';
import { Order, OrderStatus, PaperType } from '../types';
import { Modal } from './Modal';
import { SERVICES, STATUS_STEPS } from '../constants';

interface AdminOrderManagementProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrder: (order: Order) => void;
}

type SortKey = keyof Order;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ orders, onUpdateStatus, onUpdateOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ quantity: number; paperType: PaperType } | null>(null);
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Filtering and Sorting Logic
  const processedOrders = useMemo(() => {
    let result = [...orders];

    // 1. Filter by Status
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    // 2. Filter by Date Range
    if (dateFilter.start) {
      result = result.filter(o => o.date >= dateFilter.start);
    }
    if (dateFilter.end) {
      result = result.filter(o => o.date <= dateFilter.end);
    }

    // 3. Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [orders, sortConfig, statusFilter, dateFilter]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-teal-600" /> 
      : <ArrowDown size={14} className="text-teal-600" />;
  };

  const getStatusBadge = (status: string) => {
    let colors = 'bg-slate-100 text-slate-600';
    if (status === 'Submitted') colors = 'bg-amber-100 text-amber-700';
    if (status === 'Printing') colors = 'bg-teal-100 text-teal-700';
    if (status === 'Quality Check') colors = 'bg-purple-100 text-purple-700';
    if (status === 'Ready for Pickup') colors = 'bg-blue-100 text-blue-700';
    if (status === 'Completed') colors = 'bg-green-100 text-green-700';
    
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors}`}>{status}</span>;
  };

  const handleDownload = (fileName: string) => {
    console.log(`Downloading customer file: ${fileName}`);
    alert(`Downloading customer file: ${fileName}`); 
  };

  const startEditing = () => {
    if (selectedOrder) {
      setEditForm({
        quantity: selectedOrder.quantity,
        paperType: selectedOrder.paperType
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const saveChanges = () => {
    if (!selectedOrder || !editForm) return;

    // Recalculate price
    const service = SERVICES.find(s => s.id === selectedOrder.serviceId);
    const basePrice = service ? service.basePrice : 0;
    const multiplier = editForm.paperType.toLowerCase().includes('cardstock') ? 1.5 : 1;
    const newTotal = basePrice * editForm.quantity * multiplier;

    const updatedOrder = {
      ...selectedOrder,
      quantity: editForm.quantity,
      paperType: editForm.paperType,
      totalPrice: newTotal
    };

    onUpdateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsEditing(false);
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setDateFilter({ start: '', end: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
        <div className="text-sm text-slate-500">
          Showing {processedOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Orders</option>
              {STATUS_STEPS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input 
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input 
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500" 
            />
          </div>
        </div>

        <button 
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full md:w-auto justify-center"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                
                {/* Sortable Header: Customer */}
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => requestSort('customerName')}>
                  <div className="flex items-center gap-2">
                    Customer {getSortIcon('customerName')}
                  </div>
                </th>

                <th className="px-6 py-4">Service</th>
                
                {/* Sortable Header: Date */}
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => requestSort('date')}>
                  <div className="flex items-center gap-2">
                    Date {getSortIcon('date')}
                  </div>
                </th>
                
                {/* Sortable Header: Status */}
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => requestSort('status')}>
                  <div className="flex items-center gap-2">
                    Status {getSortIcon('status')}
                  </div>
                </th>

                {/* Sortable Header: Total */}
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => requestSort('totalPrice')}>
                  <div className="flex items-center gap-2">
                    Total {getSortIcon('totalPrice')}
                  </div>
                </th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedOrders.length > 0 ? (
                processedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-500">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex flex-col">
                        <span>{order.customerName}</span>
                        <span className="text-xs text-slate-400 font-normal">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{order.serviceName}</td>
                    <td className="px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">₱{order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-teal-600 hover:text-teal-800 font-medium text-xs border border-teal-200 bg-teal-50 px-3 py-1.5 rounded hover:bg-teal-100 transition-colors"
                      >
                        View Job Sheet
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={32} className="opacity-20" />
                      <p>No orders found matching your filters.</p>
                      <button onClick={resetFilters} className="text-teal-600 hover:underline text-sm font-medium">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Job Sheet */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={closeModal} 
        title={selectedOrder ? `Job Sheet: ${selectedOrder.id}` : 'Order Details'}
      >
        {selectedOrder && (
          <div className="space-y-6">
            
            {/* Customer Details Section */}
            <div className="border-b border-slate-100 pb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Customer Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                   <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                      <User size={16} />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400">Customer Name</p>
                      <p className="font-semibold text-slate-800">{selectedOrder.customerName}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                      <Mail size={16} />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400">Email Address</p>
                      <p className="font-semibold text-slate-800">{selectedOrder.customerEmail}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Order Specifications Section */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order Specifications</h4>
                {!isEditing ? (
                  <button onClick={startEditing} className="text-teal-600 hover:text-teal-800 text-xs font-bold flex items-center gap-1 transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={cancelEditing} className="text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors">
                      <X size={12} /> Cancel
                    </button>
                    <button onClick={saveChanges} className="text-green-600 hover:text-green-800 text-xs font-bold flex items-center gap-1 transition-colors">
                      <Save size={12} /> Save
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Service Type</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Paper Stock</p>
                    {isEditing && editForm ? (
                      <input 
                        type="text"
                        value={editForm.paperType} 
                        onChange={e => setEditForm({...editForm, paperType: e.target.value as PaperType})}
                        className="w-full p-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{selectedOrder.paperType}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Quantity</p>
                    {isEditing && editForm ? (
                      <input 
                        type="number" 
                        min="1"
                        value={editForm.quantity}
                        onChange={e => setEditForm({...editForm, quantity: Math.max(1, parseInt(e.target.value) || 0)})}
                        className="w-full p-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800">{selectedOrder.quantity}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Order Date</p>
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar size={14} className="text-slate-400" />
                      {selectedOrder.date}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Specs</p>
                    <div className="flex flex-col font-semibold text-slate-800">
                      <span className="flex items-center gap-1">
                        {selectedOrder.printColor === 'Color' ? <Droplets size={12} className="text-purple-500"/> : <div className="w-3 h-3 bg-slate-800 rounded-full"></div>}
                        {selectedOrder.printColor}
                      </span>
                      <span className="text-xs text-slate-500 font-normal flex items-center gap-1">
                        <Layers size={10} /> {selectedOrder.orientation}, {selectedOrder.printSides}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                      <p className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1">
                        <MessageSquare size={10} /> Notes
                      </p>
                      <p className="text-slate-700 italic text-xs bg-white p-2 rounded border border-slate-200">
                        "{selectedOrder.notes}"
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Production Files Section */}
            <div className="border-b border-slate-100 pb-4">
               <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Production Files</h4>
               <div className="flex items-center justify-between bg-teal-50 border border-teal-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-teal-600" />
                    <div>
                      <p className="font-bold text-teal-900 text-sm">{selectedOrder.fileName}</p>
                      <p className="text-xs text-teal-600">Ready for print</p>
                    </div>
                  </div>
                  <button 
                     onClick={() => handleDownload(selectedOrder.fileName)}
                     className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-200 rounded-lg text-sm font-bold text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm"
                  >
                    <Download size={16} />
                    Download File
                  </button>
               </div>
            </div>

            {/* Workflow Actions */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => onUpdateStatus(selectedOrder.id, 'Printing')}
                   disabled={selectedOrder.status === 'Printing'}
                   className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                     selectedOrder.status === 'Printing' 
                     ? 'bg-teal-600 text-white border-teal-600 opacity-50 cursor-default' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                   }`}
                 >
                   <Printer size={16} /> Mark Printing
                 </button>
                 
                 <button 
                   onClick={() => onUpdateStatus(selectedOrder.id, 'Quality Check')}
                   disabled={selectedOrder.status === 'Quality Check'}
                   className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                     selectedOrder.status === 'Quality Check' 
                     ? 'bg-purple-600 text-white border-purple-600 opacity-50 cursor-default' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                   }`}
                 >
                   <CheckCircle size={16} /> Quality Check
                 </button>

                 <button 
                   onClick={() => onUpdateStatus(selectedOrder.id, 'Ready for Pickup')}
                   disabled={selectedOrder.status === 'Ready for Pickup'}
                   className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                     selectedOrder.status === 'Ready for Pickup' 
                     ? 'bg-blue-600 text-white border-blue-600 opacity-50 cursor-default' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                   }`}
                 >
                   <Truck size={16} /> Ready for Pickup
                 </button>

                 <button 
                   onClick={() => onUpdateStatus(selectedOrder.id, 'Completed')}
                   disabled={selectedOrder.status === 'Completed'}
                   className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                     selectedOrder.status === 'Completed' 
                     ? 'bg-green-600 text-white border-green-600 opacity-50 cursor-default' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-600'
                   }`}
                 >
                   <CheckCircle size={16} /> Complete Order
                 </button>
              </div>
            </div>

            <button 
               onClick={closeModal}
               className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 text-sm font-medium"
            >
              Close Job Sheet
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
