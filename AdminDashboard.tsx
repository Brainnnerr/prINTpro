
import React from 'react';
import { PhilippinePeso, Printer, Clock, ArrowUpRight } from 'lucide-react';
import { Order } from '../types';

interface AdminDashboardProps {
  orders: Order[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  // Compute Stats
  const pendingOrders = orders.filter(o => o.status === 'Submitted').length;
  const activePrintJobs = orders.filter(o => o.status === 'Printing').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-slate-800">{pendingOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
            <Printer size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Print Jobs</p>
            <p className="text-2xl font-bold text-slate-800">{activePrintJobs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <PhilippinePeso size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-800">₱{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Orders</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Live Data</span>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${order.status === 'Submitted' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{order.serviceName}</p>
                  <p className="text-xs text-slate-500">Order #{order.id} • {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-700">₱{order.totalPrice.toFixed(2)}</p>
                <p className="text-xs text-slate-500">{order.status}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
             <div className="p-8 text-center text-slate-400">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
