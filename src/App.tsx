import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderWizard from './components/OrderWizard';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { FileText, Loader2, Image as ImageIcon, Zap } from 'lucide-react';
import type { Service } from './types';

const SERVICES: Service[] = [
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
    name: 'RushID Photos', 
    description: 'Rush ID sets and combos.', 
    desc: 'Rush ID sets and combos.', 
    price: 35.00, 
    icon: <Zap size={20}/> 
  },
  { 
    id: 's5', 
    name: 'Photo Printing', 
    description: 'Premium inkjet photo printing on smudge-proof photographic paper.', 
    desc: 'Premium inkjet photo printing on smudge-proof photographic paper.', 
    price: 150.00, 
    icon: <ImageIcon size={20}/> 
  },
];

function App() {
  // Persistence: Check localStorage for the last active view
  const [view, setView] = useState<'home' | 'dashboard' | 'wizard' | 'admin'>(() => {
    return (localStorage.getItem('printpro_current_view') as any) || 'home';
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync view state to localStorage
  useEffect(() => {
    localStorage.setItem('printpro_current_view', view);
  }, [view]);

  const handleUserRouting = async (user: any) => {
    try {
      if (user) {
        setIsAuthenticated(true);
        setShowAuth(false);
        const isAdmin = user.user_metadata?.is_admin === true;
        if (isAdmin) {
          setView('admin');
        } else if (view === 'home') {
          setView('dashboard');
        }
      } else {
        setIsAuthenticated(false);
        setView('home');
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
        localStorage.removeItem('printpro_current_view'); // Clear on logout
        setView('home');
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
        <Loader2 className="animate-spin text-emerald-500" size={56} />
        <p className="text-[11px] font-black uppercase tracking-[0.4em]">Verifying Identity</p>
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
      {view === 'dashboard' && <Dashboard services={SERVICES} onSelectService={handleSelectService} />}
      {view === 'admin' && <AdminDashboard />}
      {view === 'wizard' && (
        <OrderWizard 
          service={selectedService} 
          onBack={() => setView('dashboard')} 
        />
      )}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default App;
