import { useState, useEffect, useRef } from 'react';
import { 
  Printer, LogOut, User, LayoutGrid, FileText, 
  Menu, X, Layers, AlertCircle, RefreshCw 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

// Import Tabs
import OverviewTab from '../components/dashboard/OverviewTab';
import ServicesTab from '../components/dashboard/ServicesTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import OrdersTab from '../components/dashboard/OrdersTab';

interface DashboardProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

type Tab = 'overview' | 'services' | 'orders' | 'profile';

export default function Dashboard({ services, onSelectService }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Loading & Refresh States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setIsLoading(false);
    setIsRefreshing(false);
    setPullDistance(0);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || 'User');
        setUserEmail(user.email || '');
      }
    });
    
    fetchOrders();

    // Real-time listener for status updates
    const channel = supabase.channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders(true))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- MOBILE PULL-TO-REFRESH LOGIC ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart;

    if (distance > 0 && distance < 100) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 65) {
      setIsRefreshing(true);
      fetchOrders(true);
    } else {
      setPullDistance(0);
    }
    setTouchStart(null);
  };

  const handleConfirmLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'overview', icon: <LayoutGrid size={18} />, label: 'Overview' },
    { id: 'services', icon: <Layers size={18} />, label: 'New Order' },
    { id: 'orders', icon: <FileText size={18} />, label: 'My Orders' },
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
  ] as const;

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* --- MOBILE PULL INDICATOR --- */}
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center z-[110] pointer-events-none transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance - 50}px)`, opacity: pullDistance / 70 }}
      >
        <div className="bg-white p-3 rounded-full shadow-2xl border border-slate-100">
          <RefreshCw className={`text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`} size={20} />
        </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded-lg shadow-lg">
            <Printer size={16} className="text-emerald-400" />
          </div>
          <span className="font-black tracking-tight text-slate-900 uppercase text-xs">PrintPro</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-x-0 top-0 z-[90] lg:relative lg:inset-auto lg:z-40
        transform transition-all duration-500 ease-in-out
        w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 
        flex flex-col p-8 lg:pt-8
        ${isMobileMenuOpen ? 'translate-y-0 pt-24 opacity-100 pointer-events-auto' : '-translate-y-full pt-0 opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto'}
      `}>
        <div className="hidden lg:flex items-center gap-2 mb-12">
          <div className="bg-slate-900 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Printer size={18} className="text-emerald-400" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">PrintPro</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-4 px-5 py-4 lg:py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-4 px-5 py-4 lg:py-3 mt-8 lg:mt-auto text-slate-400 hover:text-red-500 rounded-2xl font-bold text-sm transition-all border-t lg:border-0 border-slate-50">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main ref={scrollRef} className="flex-grow pt-4 px-6 pb-6 md:p-12 overflow-y-auto relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight capitalize leading-none">
              {activeTab === 'overview' ? 'Dashboard' : activeTab.replace('_', ' ')}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {activeTab === 'overview' ? `Welcome back, ${userName}` : `Manage your ${activeTab} settings.`}
            </p>
          </div>
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">
            {userName[0]}
          </div>
        </header>

        {/* Content with Loading States */}
        {activeTab === 'overview' && (
          isLoading ? <OverviewSkeleton /> : (
            <OverviewTab 
              orders={orders} 
              onViewAll={() => setActiveTab('orders')} 
              onStartOrder={() => setActiveTab('services')} 
            />
          )
        )}
        
        {activeTab === 'services' && (
          <ServicesTab services={services} onSelectService={onSelectService} />
        )}
        
        {activeTab === 'profile' && (
          <ProfileTab userName={userName} userEmail={userEmail} />
        )}
        
        {activeTab === 'orders' && (
          isLoading ? <OrdersSkeleton /> : <OrdersTab orders={orders} />
        )}
      </main>

      {/* --- LOGOUT MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Confirm Logout</h2>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to end your session?</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleConfirmLogout} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95">Yes, Sign Out</button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold active:scale-95">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** --- SKELETON LOADERS --- **/
function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 rounded-xl w-48 mb-8" />
      <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-6 last:border-0">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-50 rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-white border border-slate-100 rounded-[24px] w-64 mb-8" />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 bg-white border border-slate-100 rounded-[32px]" />
      ))}
    </div>
  );
}