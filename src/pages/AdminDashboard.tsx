import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Printer, LogOut, X, LayoutDashboard, ListOrdered, Settings, 
  Users, Info, ClipboardList, MessageSquare, Bell, Construction, Clock,
  CheckCircle, Truck, Package, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Overview from '../components/admin/Overview'; 
import HistoryLog from '../components/admin/HistoryLog'; 
import JobQueue from '../components/admin/JobQueue';
import MessagesTab from '../components/admin/MessagesTab';
import NotificationsTab from '../components/admin/NotificationsTab';
import InventoryTab from '../components/admin/InventoryTab';
import StudentsTab from '../components/admin/StudentsTab';

type TabType = 'overview' | 'queue' | 'history' | 'messages' | 'notifications' | 'inventory' | 'users' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0); //

  // 1. Fetch Orders Logic
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    if (data) {
      setOrders(data);
      if (activeTab === 'history') {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  // 2. Fetch Unread Notification Count
  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    
    if (!error) setUnreadNotifCount(count || 0);
  };

  useEffect(() => {
    fetchOrders();
    fetchUnreadCount();

    // Listen for Order changes
    const orderChannel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    // Listen for Notification changes (New notif or Mark as Read)
    const notifChannel = supabase.channel('admin-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(notifChannel); 
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      )
    );

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    
    if (!error) {
      setSelectedOrder(null);
      fetchOrders();
    } else {
      fetchOrders();
      alert("Failed to update status");
    }
  };

  const formatTimeAMPM = (time: string) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
            <div className="bg-emerald-500 p-1 rounded-full">
              <Check size={14} className="text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Recorded</p>
          </div>
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <Printer className="text-slate-900" size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">PrintPro <span className="text-emerald-500">Admin</span></span>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-grow overflow-y-auto">
          <p className="text-[10px] font-black text-slate-500 uppercase px-4 mb-2 tracking-widest">Main Menu</p>
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
          <SidebarLink active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<ListOrdered size={18}/>} label="Job Queue" badge={pendingCount} />
          <SidebarLink active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClipboardList size={18}/>} label="History Log" />
          
          <p className="text-[10px] font-black text-slate-500 uppercase px-4 mt-6 mb-2 tracking-widest">Communication</p>
          <SidebarLink active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<MessageSquare size={18}/>} label="Messages" />
          
          {/* Notifications Link with Dynamic Badge Count */}
          <SidebarLink 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
            icon={<Bell size={18}/>} 
            label="Notifications" 
            badge={unreadNotifCount} 
          />
          
          <p className="text-[10px] font-black text-slate-500 uppercase px-4 mt-6 mb-2 tracking-widest">Management</p>
          <SidebarLink active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18}/>} label="Inventory" />
          <SidebarLink active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="Students" />
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all font-medium text-sm">
            <LogOut size={18}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 capitalize tracking-tight">{activeTab} Management</h2>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">System Live</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'overview' && <Overview orders={orders} onViewQueue={() => setActiveTab('queue')} />}
          {activeTab === 'queue' && <JobQueue orders={orders} searchTerm={searchTerm} setSearchTerm={setSearchTerm} formatTime={formatTimeAMPM} updateStatus={updateStatus} />}
          {activeTab === 'history' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto"><HistoryLog orders={orders} onRefresh={fetchOrders} /></div>}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'users' && <StudentsTab />}


          {[ 'settings'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-dashed border-slate-200 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-emerald-50 rounded-full mb-4"><Construction className="text-emerald-500" size={40} /></div>
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">Feature Coming Soon</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">We are currently building the {activeTab} module.</p>
              <button onClick={() => setActiveTab('overview')} className="mt-6 text-xs font-black text-emerald-600 hover:underline uppercase tracking-widest">Return to Overview</button>
            </div>
          )}
        </div>
      </main>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} formatTime={formatTimeAMPM} updateStatus={updateStatus} />}
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label, badge }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      <div className="flex items-center gap-3">{icon} <span>{label}</span></div>
      {badge > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${active ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'}`}>{badge}</span>}
    </button>
  );
}

function OrderModal({ order, onClose, formatTime, updateStatus }: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div><h2 className="text-lg font-bold text-slate-800">{order.customer_name}</h2><p className="text-[10px] font-bold text-slate-400 uppercase">Order Ref: {order.id.slice(0,8)}</p></div>
          <button onClick={onClose} title="Close Modal" aria-label="Close Modal" className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"><X size={18}/></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
               <ModalRow label="Service Type" value={order.service_name} />
               <ModalRow label="Specs" value={`${order.paper_size} • ${order.side_mode}`} />
               <ModalRow label="Pickup" value={formatTime(order.pickup_time)} />
               <ModalRow label="Price" value={`₱${Number(order.total_price).toFixed(2)}`} highlight />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 flex flex-col items-center justify-center">
               <QRCodeSVG value={order.id} size={120} level="M" /><p className="mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verify ID</p>
            </div>
          </div>
          {order.description && <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-800"><Info size={18} className="shrink-0"/><p className="text-xs font-medium italic">"{order.description}"</p></div>}
          <div className="grid grid-cols-3 gap-2">
            <StatusButton label="Printing" onClick={() => updateStatus(order.id, 'Printing')} color="blue" icon={<Clock size={14}/>}/>
            {order.fulfillment === 'pickup' ? (
                <StatusButton label="Ready" onClick={() => updateStatus(order.id, 'Ready for Pickup')} color="emerald" icon={<CheckCircle size={14}/>}/>
            ) : (
                <StatusButton label="Shipped" onClick={() => updateStatus(order.id, 'In Transit')} color="emerald" icon={<Truck size={14}/>}/>
            )}
            <StatusButton label="Final" onClick={() => updateStatus(order.id, 'Completed')} color="slate" icon={<Package size={14}/>}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalRow({ label, value, highlight }: any) {
  return (
    <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p><p className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-slate-700'}`}>{value || 'N/A'}</p></div>
  );
}

function StatusButton({ label, onClick, color, icon }: any) {
  const colors: any = { blue: 'bg-blue-600 hover:bg-blue-700', emerald: 'bg-emerald-600 hover:bg-emerald-700', slate: 'bg-slate-900 hover:bg-slate-950' };
  return (
    <button onClick={onClick} title={label} className={`text-white py-3 rounded-lg font-bold text-[10px] uppercase flex flex-col items-center gap-1 transition-all ${colors[color]}`}>{icon} {label}</button>
  );
}