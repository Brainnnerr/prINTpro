import { useState } from 'react';
import { 
  FileText, Clock, CheckCircle2, Package, Truck, 
  Info, ExternalLink, 
} from 'lucide-react';

interface OrdersTabProps {
  orders: any[];
}

type OrderFilter = 'pending' | 'received' | 'completed';

export default function OrdersTab({ orders }: OrdersTabProps) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('pending');

  // Helper to convert 24h time "14:30" to "02:30 PM"
  const formatTimeAMPM = (time: string) => {
    if (!time) return 'Scheduled Time';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; // Convert 0 to 12
    return `${h}:${minutes} ${ampm}`;
  };

  const filteredOrders = orders.filter(order => {
    const status = order.status?.toLowerCase();
    if (activeFilter === 'pending') return status === 'pending' || status === 'printing';
    if (activeFilter === 'received') return status === 'ready for pickup' || status === 'in transit';
    if (activeFilter === 'completed') return status === 'completed';
    return false;
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { icon: <Clock size={12} />, className: 'bg-amber-100 text-amber-700', label: 'Awaiting Admin' };
      case 'printing':
        return { icon: <Clock size={12} className="animate-spin" />, className: 'bg-blue-100 text-blue-700', label: 'Printing Now' };
      case 'ready for pickup':
        return { icon: <Package size={12} />, className: 'bg-emerald-100 text-emerald-700', label: 'Ready for Pickup' };
      case 'in transit':
        return { icon: <Truck size={12} />, className: 'bg-purple-100 text-purple-700', label: 'Out for Delivery' };
      case 'completed':
        return { icon: <CheckCircle2 size={12} />, className: 'bg-slate-100 text-slate-600', label: 'Transaction Finished' };
      default:
        return { icon: <Info size={12} />, className: 'bg-slate-100 text-slate-600', label: status };
    }
  };

  const getFileUrl = (path: string) => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/print-files/${path}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- STATUS NAVIGATION --- */}
      <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm max-w-md">
        <FilterBtn 
          active={activeFilter === 'pending'} 
          onClick={() => setActiveFilter('pending')} 
          label="Pending" 
          count={orders.filter(o => ['pending', 'printing'].includes(o.status?.toLowerCase())).length}
        />
        <FilterBtn 
          active={activeFilter === 'received'} 
          onClick={() => setActiveFilter('received')} 
          label="To Received" 
          count={orders.filter(o => ['ready for pickup', 'in transit'].includes(o.status?.toLowerCase())).length}
        />
        <FilterBtn 
          active={activeFilter === 'completed'} 
          onClick={() => setActiveFilter('completed')} 
          label="Completed" 
          count={orders.filter(o => o.status?.toLowerCase() === 'completed').length}
        />
      </div>

      {/* --- ORDERS LIST --- */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div key={order.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:border-emerald-200 transition-all group shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  <div className="flex gap-5">
                    <div className="h-14 w-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors shrink-0">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base">{order.service_name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${badge.className}`}>
                        {badge.icon} {badge.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
                    <OrderData label="Total Payment" value={`₱${Number(order.total_price).toFixed(2)}`} highlight />
                    <OrderData label="Specifications" value={`${order.paper_size} • ${order.side_mode}`} />
                    <OrderData label="Date Created" value={new Date(order.created_at).toLocaleDateString()} />
                  </div>

                  <div className="flex items-center">
                    {order.file_url ? (
                      <a 
                        href={getFileUrl(order.file_url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                      >
                        <ExternalLink size={14} /> Preview Asset
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic">No asset attached</span>
                    )}
                  </div>
                </div>
                
                {/* Fulfillment Footer */}
                <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                    {order.fulfillment === 'pickup' ? <Package size={14} className="text-emerald-500"/> : <Truck size={14} className="text-emerald-500"/>}
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {order.fulfillment === 'pickup' 
                        ? `Pick up at ${formatTimeAMPM(order.pickup_time)}` // FIXED: Now shows AM/PM
                        : `Deliver to: ${order.address}`}
                    </p>
                  </div>
                  {order.description && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Info size={14} />
                      <p className="text-[10px] italic font-medium line-clamp-1 italic">"{order.description}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white py-24 rounded-[40px] border border-dashed border-slate-200 text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-slate-200" size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nothing in {activeFilter}</h3>
          <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto font-medium uppercase tracking-wide">
            Your orders will appear here once you've started a requisition.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function OrderData({ label, value, highlight }: any) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
      <p className={`text-sm font-black tracking-tight ${highlight ? 'text-emerald-600' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}