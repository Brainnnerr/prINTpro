import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderWizard from './components/OrderWizard';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
// Corrected imports to include all icons used in the SERVICES array
import { 
  FileText, Check, Loader2, CreditCard, 
  BookOpen, Image as ImageIcon, ScrollText, Zap 
} from 'lucide-react';
import type { Service } from './types';

// src/App.tsx (Lines 16-23)
const SERVICES: Service[] = [
  { 
    id: 's1', 
    name: 'Business Cards', 
    description: 'Standard business cards.', 
    desc: 'Standard business cards.', // Keep this for now to satisfy old components
    price: 5.00, 
    icon: <CreditCard size={20}/> 
  },
  { 
    id: 's2', 
    name: 'Thesis Hardbound', 
    description: 'Gold-leaf lettering on leatherette.', 
    desc: 'Gold-leaf lettering on leatherette.', 
    price: 300.00, 
    icon: <BookOpen size={20}/> 
  },
  { 
    id: 's3', 
    name: 'Document Printing', 
    description: 'Standard A4 black & white or color.', 
    desc: 'Standard A4 black & white or color.', 
    price: 5.00, 
    icon: <FileText size={20}/> 
  },
  { 
    id: 's4', 
    name: 'ID Photos', 
    description: 'Rush ID sets and combos.', 
    desc: 'Rush ID sets and combos.', 
    price: 35.00, 
    icon: <ImageIcon size={20}/> 
  },
  { 
    id: 's5', 
    name: 'Marketing Flyers', 
    description: 'Full-color brochures.', 
    desc: 'Full-color brochures.', 
    price: 150.00, 
    icon: <ScrollText size={20}/> 
  },
  { 
    id: 's6', 
    name: 'Custom Stickers', 
    description: 'Waterproof vinyl stickers.', 
    desc: 'Waterproof vinyl stickers.', 
    price: 30.00, 
    icon: <Zap size={18}/> 
  },
];


function App() {
  const [view, setView] = useState<'home' | 'dashboard' | 'wizard' | 'admin'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

// Inside handleUserRouting in App.tsx
const handleUserRouting = async (user: any) => {
  try {
    if (user) {
      setIsAuthenticated(true);
      setShowAuth(false);
      
      // We check user_metadata instead of the profiles table
      // This matches the metadata seen in your session: { is_admin: true }
      const isAdmin = user.user_metadata?.is_admin === true;

      if (isAdmin) {
        setView('admin');
      } else {
        setView('dashboard');
      }
    } else {
      setIsAuthenticated(false);
      setView('home');
      setShowAuth(false);
    }
  } catch (err) {
    console.error("Routing error:", err);
    setView('dashboard'); 
  } finally {
    setIsInitializing(false); 
  }
};


  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            await handleUserRouting(session.user);
          } else {
            setIsInitializing(false);
          }
        }
      } catch (error) {
        if (isMounted) setIsInitializing(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserRouting(session.user);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setView('home');
        setIsInitializing(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setView('wizard');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-emerald-500" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="text-emerald-200" size={20} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">
            Verifying Identity
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Synchronizing with PrintPro Secure Servers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      {view === 'home' && (
        <LandingPage 
          onSelectService={(s) => {
            if (s) setSelectedService(s);
            if (!isAuthenticated) setShowAuth(true);
            else setView('wizard');
          }} 
          isAuthenticated={isAuthenticated} 
        />
      )}

      {view === 'dashboard' && (
        <Dashboard services={SERVICES} onSelectService={handleSelectService} />
      )}

      {view === 'admin' && (
        <AdminDashboard />
      )}

      {view === 'wizard' && (
        <OrderWizard 
          service={selectedService} 
          onBack={() => setView('dashboard')} 
        />
      )}

      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}

export default App;
