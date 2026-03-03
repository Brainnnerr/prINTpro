import { Search, Clock, Store, Truck, FileDown, Eye, X, Info, ExternalLink, CheckCircle, Package } from 'lucide-react';
import { useState } from 'react';

interface JobQueueProps {
  orders: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  formatTime: (time: string) => string;
  updateStatus: (id: string, newStatus: string) => void;
}

export default function JobQueue({ orders, searchTerm, setSearchTerm, formatTime, updateStatus }: JobQueueProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getPriorityQueue = () => {
    return orders
      .filter(o => 
        !o.is_manual &&                  // Exclude face-to-face transactions
        o.status !== 'Completed' &&      // Keep only active jobs
        (o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm))
      )
      .sort((a, b) => {
        if (!a.pickup_time) return 1;
        if (!b.pickup_time) return -1;
        return a.pickup_time.localeCompare(b.pickup_time);
      });
  };

  const prioritizedOrders = getPriorityQueue();

  const getFileUrl = (path: string) => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/print-files/${path}`;
  };

  // Logic to determine which buttons should be disabled based on status
  
  const isPrintingDisabled = (status: string) => ['Printing', 'Ready for Pickup', 'In Transit', 'Completed'].includes(status);
  const isReadyDisabled = (status: string) => ['Ready for Pickup', 'In Transit', 'Completed', 'pending'].includes(status) && status !== 'Printing';
  const isFinalizeDisabled = (status: string) => status === 'pending';

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus(id, newStatus);
    setSelectedOrder(null); 
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Job Queue</h1>
          <p className="text-sm text-slate-500 font-medium italic">Priority ranking based on pickup time.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search customer name..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-medium text-sm transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {prioritizedOrders.length > 0 ? prioritizedOrders.map((order, index) => (
          <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-300 transition-all shadow-sm relative overflow-hidden group">
            {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
            
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="text-center px-4 border-r border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Schedule</p>
                <p className="text-sm font-bold text-slate-700">{formatTime(order.pickup_time)}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{order.customer_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ref: {order.id.slice(0,8)}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-grow justify-around max-w-xl">
              <DetailItem label="Fulfillment" value={order.fulfillment} icon={order.fulfillment === 'pickup' ? <Store size={14}/> : <Truck size={14}/>}/>
              <DetailItem label="Service" value={order.service_name}/>
              <DetailItem label="Due" value={`₱${Number(order.total_price).toFixed(2)}`} isPrice/>
            </div>

            <button 
                onClick={() => setSelectedOrder(order)} 
                className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
                <Eye size={16}/> View Details
            </button>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Clock className="mx-auto text-slate-200 mb-2" size={40} />
            <p className="text-sm font-bold text-slate-400">Queue is empty</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL (Styled like image_e25c27.png) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedOrder.customer_name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Job Details • {selectedOrder.id.slice(0,8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400" title="Close Details" aria-label="Close">
                <X size={24}/>
              </button>
            </div>

            <div className="px-8 pb-8 space-y-8">
              {/* Info Grid (Top row) */}
              <div className="grid grid-cols-2 gap-y-6">
                <ModalInfo label="Service" value={selectedOrder.service_name} />
                <ModalInfo label="Specifications" value={`${selectedOrder.paper_size} • ${selectedOrder.side_mode}`} />
                <ModalInfo label="Fulfillment" value={selectedOrder.fulfillment === 'pickup' ? 'Store Pickup' : 'Home Delivery'} />
                <ModalInfo label="Schedule" value={formatTime(selectedOrder.pickup_time)} highlight />
              </div>

              {/* Instructions */}
              {selectedOrder.description && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 text-slate-600">
                  <Info size={18} className="shrink-0 mt-0.5 text-slate-400"/>
                  <p className="text-xs font-medium italic">"{selectedOrder.description}"</p>
                </div>
              )}

              {/* Asset Control Section */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Control</p>
                {selectedOrder.file_url ? (
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={getFileUrl(selectedOrder.file_url)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-2 bg-[#F1F5F9] text-slate-700 py-3.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200"
                    >
                      <ExternalLink size={16}/> Preview File
                    </a>
                    <a 
                      href={getFileUrl(selectedOrder.file_url)} 
                      download 
                      className="flex items-center justify-center gap-2 bg-[#059669] text-white py-3.5 rounded-xl font-bold text-xs hover:bg-[#047857] transition-all shadow-lg shadow-emerald-100"
                    >
                      <FileDown size={16}/> Download
                    </a>
                  </div>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs italic">No asset uploaded</div>
                )}
              </div>

              {/* Order Status Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Update Order Progress</p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button 
                    disabled={isPrintingDisabled(selectedOrder.status)}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Printing')}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold text-[10px] uppercase transition-all
                      ${isPrintingDisabled(selectedOrder.status) 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md shadow-blue-100'}`}
                  >
                    <Clock size={16}/> Printing
                  </button>
                  
                  {selectedOrder.fulfillment === 'pickup' ? (
                    <button 
                      disabled={isReadyDisabled(selectedOrder.status)}
                      onClick={() => handleStatusChange(selectedOrder.id, 'Ready for Pickup')}
                      className={`flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold text-[10px] uppercase transition-all
                        ${isReadyDisabled(selectedOrder.status) 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                          : 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md shadow-emerald-100'}`}
                    >
                      <CheckCircle size={16}/> Ready
                    </button>
                  ) : (
                    <button 
                      disabled={isReadyDisabled(selectedOrder.status)}
                      onClick={() => handleStatusChange(selectedOrder.id, 'In Transit')}
                      className={`flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold text-[10px] uppercase transition-all
                        ${isReadyDisabled(selectedOrder.status) 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                          : 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md shadow-emerald-100'}`}
                    >
                      <Truck size={16}/> Shipped
                    </button>
                  )}

                  <button 
                    disabled={isFinalizeDisabled(selectedOrder.status)}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Completed')}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold text-[10px] uppercase transition-all
                      ${isFinalizeDisabled(selectedOrder.status) 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                        : 'bg-[#0F172A] text-white hover:bg-black shadow-md shadow-slate-200'}`}
                  >
                    <Package size={16}/> Finalize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, icon, isPrice }: any) {
  return (
    <div className="hidden sm:block text-center px-4">
      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{label}</p>
      <p className={`text-xs font-bold flex items-center justify-center gap-1 capitalize ${isPrice ? 'text-emerald-600' : 'text-slate-700'}`}>
        {icon} {value}
      </p>
    </div>
  );
}

function ModalInfo({ label, value, highlight }: any) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-widest">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-[#10B981]' : 'text-slate-700'}`}>{value || 'N/A'}</p>
    </div>
  );
}