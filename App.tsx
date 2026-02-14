
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ServiceCatalog } from './components/ServiceCatalog';
import { OrderWizard } from './components/OrderWizard';
import { OrderList } from './components/OrderList';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminOrderManagement } from './components/AdminOrderManagement';
import { AdminInventory } from './components/AdminInventory';
import { Modal } from './components/Modal';
import { Service, Order, OrderStatus, InventoryItem, User } from './types';
import { MOCK_ORDERS, MOCK_INVENTORY, CURRENT_USER, SERVICES } from './constants';
import { Repeat, Lock, User as UserIcon, Mail, Loader2, AlertCircle, Check, ArrowRight, Eye, EyeOff, Briefcase, GraduationCap, Palette, ArrowLeft, Github, Globe } from 'lucide-react';

type CustomerView = 'home' | 'wizard' | 'orders' | 'profile';
type AdminView = 'dashboard' | 'orders' | 'inventory';
type AuthView = 'signin' | 'signup' | 'forgot' | 'onboarding';

const App: React.FC = () => {
  // --- PERSISTENCE & INITIALIZATION ---
  // Load state from localStorage if available, else use Mock constants
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pp_orders');
      return saved ? JSON.parse(saved) : MOCK_ORDERS;
    } catch (e) { return MOCK_ORDERS; }
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pp_inventory');
      return saved ? JSON.parse(saved) : MOCK_INVENTORY;
    } catch (e) { return MOCK_INVENTORY; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pp_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  // Mock Database for Registered Users (persisted to simulate real backend)
  const [usersDB, setUsersDB] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('pp_users_db');
      // Initialize with the Demo User
      const defaultUser = { 
        email: CURRENT_USER.email, 
        password: 'password123', 
        name: CURRENT_USER.name, 
        avatarUrl: CURRENT_USER.avatarUrl 
      };
      return saved ? JSON.parse(saved) : [defaultUser];
    } catch (e) { return []; }
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('pp_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('pp_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('pp_user', JSON.stringify(currentUser));
    else localStorage.removeItem('pp_user');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('pp_users_db', JSON.stringify(usersDB)); }, [usersDB]);
  
  // App Logic State
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerView, setCustomerView] = useState<CustomerView>('home');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // State for re-ordering flow
  const [wizardInitialData, setWizardInitialData] = useState<Order | null>(null);
  
  // Auth & Gatekeeper State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingService, setPendingService] = useState<Service | null>(null);
  
  // Enhanced Auth Form State
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  // --- AUTH ACTIONS ---

  const openAuthModal = (service?: Service) => {
    setPendingService(service || null);
    setIsLoginModalOpen(true);
    setAuthView('signin');
    setAuthError('');
    setResetSent(false);
    setSelectedPersona('');
    setAuthForm({ name: '', email: '', password: '' });
  };
  
  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    setTimeout(() => {
        // --- FORGOT PASSWORD FLOW ---
        if (authView === 'forgot') {
            if (!authForm.email) {
                setAuthError('Please enter your email address.');
                setAuthLoading(false);
                return;
            }
            setResetSent(true);
            setAuthLoading(false);
            return;
        }

        // --- ONBOARDING FLOW (Finish Sign Up) ---
        if (authView === 'onboarding') {
            finalizeLogin(); // Creates new user
            return;
        }

        // --- VALIDATION ---
        if (!authForm.email || !authForm.password) {
            setAuthError('Please fill in all required fields.');
            setAuthLoading(false);
            return;
        }

        // --- SIGN UP FLOW ---
        if (authView === 'signup') {
            if (!authForm.name) {
                setAuthError('Please enter your full name.');
                setAuthLoading(false);
                return;
            }
            if (!termsAccepted) {
                setAuthError('You must accept the Terms & Conditions.');
                setAuthLoading(false);
                return;
            }
            // Check if user already exists
            if (usersDB.find(u => u.email.toLowerCase() === authForm.email.toLowerCase())) {
                setAuthError('An account with this email already exists.');
                setAuthLoading(false);
                return;
            }

            // Move to Onboarding (Persona selection)
            setAuthView('onboarding');
            setAuthLoading(false);
            return;
        }

        // --- SIGN IN FLOW ---
        if (authView === 'signin') {
            const foundUser = usersDB.find(u => 
                u.email.toLowerCase() === authForm.email.toLowerCase() && 
                u.password === authForm.password
            );

            if (foundUser) {
                finalizeLogin(foundUser);
            } else {
                setAuthError('Invalid email or password.');
                setAuthLoading(false);
            }
        }

    }, 1000); 
  };

  const finalizeLogin = (existingUser?: any) => {
    let userToSet: User;

    if (existingUser) {
        // Logging in existing user
        userToSet = {
            id: existingUser.id || `u-${Math.random().toString(36).substr(2, 9)}`,
            name: existingUser.name,
            email: existingUser.email,
            avatarUrl: existingUser.avatarUrl
        };
    } else {
        // Completing Sign Up (Onboarding)
        const avatarUrl = `https://ui-avatars.com/api/?name=${authForm.name}&background=random&color=fff`;
        
        // Save to Mock DB
        const newUserEntry = {
            id: `u-${Date.now()}`,
            email: authForm.email,
            password: authForm.password,
            name: authForm.name,
            avatarUrl: avatarUrl,
            persona: selectedPersona
        };
        
        setUsersDB(prev => [...prev, newUserEntry]);

        userToSet = {
            id: newUserEntry.id,
            name: newUserEntry.name,
            email: newUserEntry.email,
            avatarUrl: newUserEntry.avatarUrl
        };
    }

    setCurrentUser(userToSet);
    setAuthLoading(false);
    setIsLoginModalOpen(false);
    
    // Post-Login Redirect Logic
    if (pendingService) {
        setSelectedService(pendingService);
        setCustomerView('wizard');
        setPendingService(null);
    } else if (authView === 'onboarding') {
        // Just signed up? Maybe go to profile or home
        setCustomerView('home'); 
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerView('home');
    setWizardInitialData(null);
  };

  // --- ORDER ACTIONS ---

  const handleStartOrder = (service?: Service) => {
    // Clear any previous re-order data when starting fresh
    setWizardInitialData(null);

    if (!service) {
      setCustomerView('wizard');
      return;
    }

    // THE GATEKEEPER LOGIC
    if (service.tier === 'Premium' && !currentUser) {
      openAuthModal(service);
      return;
    }

    // If Standard or User Logged In -> Proceed
    setSelectedService(service || null);
    setCustomerView('wizard');
  };

  const handleReorder = (order: Order) => {
    const service = SERVICES.find(s => s.id === order.serviceId);
    if (service) {
        // Pre-fill wizard with old order data
        setWizardInitialData(order);
        setSelectedService(service);
        setCustomerView('wizard');
    }
  };

  const handleOrderSubmit = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCustomerView('orders');
    setSelectedService(null);
    setWizardInitialData(null);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    // --- AUTOMATED INVENTORY DEDUCTION LOGIC ---
    // If we are moving an order to 'Printing', we deduct the stock.
    if (newStatus === 'Printing') {
        const orderToProcess = orders.find(o => o.id === orderId);
        
        // Ensure we only deduct if the order wasn't *already* in Printing state (prevents double deduction)
        if (orderToProcess && orderToProcess.status !== 'Printing') {
            const inventoryItem = inventory.find(i => i.name === orderToProcess.paperType);
            
            if (inventoryItem) {
                const deductionAmount = orderToProcess.quantity;
                
                // Optional: Alert if stock is insufficient
                if (inventoryItem.quantity < deductionAmount) {
                    alert(`⚠️ Warning: Insufficient stock for ${inventoryItem.name}. \nRequired: ${deductionAmount}, Available: ${inventoryItem.quantity}. \nStock will be set to 0.`);
                }

                setInventory(prev => prev.map(item => {
                    if (item.id === inventoryItem.id) {
                        return { ...item, quantity: Math.max(0, item.quantity - deductionAmount) };
                    }
                    return item;
                }));
                
                console.log(`[Auto-Deduction] Removed ${deductionAmount} units from ${inventoryItem.name}`);
            }
        }
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleDeductInventory = (itemId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
    ));
  };

  const handleAddInventory = (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
  };
  
  const handleBulkUpdateInventory = (updatedItems: InventoryItem[]) => {
    setInventory(prev => {
        const updateMap = new Map(updatedItems.map(i => [i.id, i]));
        return prev.map(item => updateMap.get(item.id) || item);
    });
  };

  // --- RENDER HELPERS ---

  const renderCustomerContent = () => {
    switch (customerView) {
      case 'home': return (
        <ServiceCatalog 
          onSelectService={handleStartOrder} 
          orders={currentUser ? orders.filter(o => o.customerEmail === currentUser.email) : []} // Only show own orders
          onViewOrders={() => setCustomerView('orders')}
          isAuthenticated={!!currentUser}
        />
      );
      case 'wizard': return (
        <OrderWizard 
          preSelectedService={selectedService} 
          initialData={wizardInitialData}
          inventory={inventory}
          currentUser={currentUser}
          onCancel={() => {
              setCustomerView('home');
              setWizardInitialData(null);
          }} 
          onSubmit={handleOrderSubmit}
          onRequireAuth={(service) => openAuthModal(service)}
        />
      );
      case 'orders': return (
        <OrderList 
            orders={currentUser ? orders.filter(o => o.customerEmail === currentUser.email) : []} 
            onReorder={handleReorder}
        />
      );
      case 'profile': return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-slate-800">User Profile</h2>
          {currentUser ? (
             <div className="mt-4">
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-100" />
                <p className="text-xl font-medium">{currentUser.name}</p>
                <p className="text-slate-500">{currentUser.email}</p>
                <div className="mt-4 py-3 px-6 bg-slate-50 rounded-lg inline-block border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Member ID</p>
                    <p className="font-mono text-slate-700">{currentUser.id}</p>
                </div>
                <div className="mt-8">
                    <button 
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                    >
                    Sign Out
                    </button>
                </div>
             </div>
          ) : (
             <p>Please log in to view profile.</p>
          )}
        </div>
      );
      default: return null;
    }
  };

  const renderAdminContent = () => {
    switch (adminView) {
      case 'dashboard': return <AdminDashboard orders={orders} />;
      case 'orders': return <AdminOrderManagement orders={orders} onUpdateStatus={handleUpdateStatus} onUpdateOrder={handleUpdateOrder} />;
      case 'inventory': return (
         <AdminInventory 
            inventory={inventory} 
            onDeductStock={handleDeductInventory} 
            onAddItem={handleAddInventory}
            onBulkUpdate={handleBulkUpdateInventory}
         />
      );
      default: return <AdminDashboard orders={orders} />;
    }
  };

  const getModalTitle = () => {
    if (pendingService) return `Unlock ${pendingService.name}`;
    if (authView === 'forgot') return 'Reset Password';
    if (authView === 'onboarding') return 'Welcome to PrintPro!';
    return authView === 'signin' ? "Welcome Back" : "Create Account";
  };

  return (
    <>
      {/* Role Switcher Button (Fixed) */}
      <button 
        onClick={() => setIsAdmin(!isAdmin)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 font-medium border-2 border-slate-700"
      >
        <Repeat size={18} />
        Switch to {isAdmin ? 'Customer' : 'Admin'} View
      </button>

      {isAdmin ? (
        // Admin View
        <AdminLayout currentView={adminView} onViewChange={setAdminView}>
          {renderAdminContent()}
        </AdminLayout>
      ) : (
        // Customer View
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar 
            currentView={customerView} 
            onViewChange={setCustomerView} 
            currentUser={currentUser}
            onLogin={() => openAuthModal()}
          />
          <main className="flex-grow container mx-auto px-4 py-8">
            {renderCustomerContent()}
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-auto">
            <p>© 2024 PrintPro Shop. All rights reserved.</p>
          </footer>
        </div>
      )}

      {/* Auth Modal */}
      <Modal 
        isOpen={isLoginModalOpen} 
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingService(null);
        }}
        title={getModalTitle()}
      >
        <div className="w-full max-w-md mx-auto min-h-[400px]">
          
          {/* VIEW: FORGOT PASSWORD */}
          {authView === 'forgot' ? (
             <div className="animate-in slide-in-from-left-4">
                {!resetSent ? (
                    <form onSubmit={handleAuthAction} className="space-y-4 pt-4">
                        <p className="text-slate-500 mb-4 text-sm">
                           Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="email" 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="name@example.com"
                                    value={authForm.email}
                                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        {authError && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2">
                                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> 
                                <span>{authError}</span>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
                        >
                            {authLoading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setAuthView('signin')}
                            className="w-full text-slate-500 py-2 font-medium hover:text-slate-800 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back to Sign In
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8 animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Check your email</h4>
                        <p className="text-slate-500 mb-6">
                            We've sent a password reset link to <strong>{authForm.email}</strong>
                        </p>
                        <button 
                            onClick={() => setAuthView('signin')}
                            className="text-teal-600 font-bold hover:underline"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}
             </div>
          ) : authView === 'onboarding' ? (
             /* VIEW: ONBOARDING / PERSONA */
             <div className="animate-in slide-in-from-right-4 pt-2">
                <p className="text-slate-500 mb-6 text-center">
                   Help us personalize your experience. How will you primarily use PrintPro?
                </p>
                
                <div className="space-y-3 mb-8">
                   {[
                       { id: 'business', label: 'Business Owner', icon: Briefcase, desc: 'Marketing materials & cards' },
                       { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Thesis, reports & projects' },
                       { id: 'creative', label: 'Creative / Artist', icon: Palette, desc: 'Stickers, art prints & merch' }
                   ].map((persona) => (
                       <button
                          key={persona.id}
                          onClick={() => setSelectedPersona(persona.id)}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                              selectedPersona === persona.id 
                                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                       >
                          <div className={`p-3 rounded-full ${selectedPersona === persona.id ? 'bg-teal-200 text-teal-700' : 'bg-white text-slate-500 shadow-sm'}`}>
                              <persona.icon size={20} />
                          </div>
                          <div>
                              <p className={`font-bold ${selectedPersona === persona.id ? 'text-teal-900' : 'text-slate-700'}`}>{persona.label}</p>
                              <p className="text-xs text-slate-400">{persona.desc}</p>
                          </div>
                          {selectedPersona === persona.id && <Check size={20} className="ml-auto text-teal-600" />}
                       </button>
                   ))}
                </div>

                <button 
                    onClick={handleAuthAction}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
                >
                    {authLoading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                    {!authLoading && <ArrowRight size={18} />}
                </button>
             </div>
          ) : (
             /* VIEW: SIGN IN / SIGN UP */
             <div className="animate-in fade-in">
                {/* Header Message */}
                <p className="text-center text-slate-500 mb-6 text-sm">
                    {pendingService 
                        ? "Access premium features, track history, and faster checkout." 
                        : "Manage your orders and save your preferences."}
                </p>

                {/* Mode Switcher Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                    <button
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        authView === 'signin' 
                        ? 'bg-white text-teal-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => {
                        setAuthView('signin');
                        setAuthError('');
                    }}
                    >
                    Sign In
                    </button>
                    <button
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        authView === 'signup' 
                        ? 'bg-white text-teal-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    onClick={() => {
                        setAuthView('signup');
                        setAuthError('');
                    }}
                    >
                    Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuthAction} className="space-y-4">
                    {authView === 'signup' && (
                    <div className="space-y-1 animate-in slide-in-from-left-2 fade-in">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="John Doe"
                                value={authForm.name}
                                onChange={e => setAuthForm({...authForm, name: e.target.value})}
                            />
                        </div>
                    </div>
                    )}

                    <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="name@example.com"
                            value={authForm.email}
                            onChange={e => setAuthForm({...authForm, email: e.target.value})}
                        />
                    </div>
                    </div>

                    <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                        {authView === 'signin' && (
                            <button 
                                type="button"
                                onClick={() => setAuthView('forgot')}
                                className="text-xs text-teal-600 hover:underline font-medium"
                            >
                                Forgot?
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={authForm.password}
                            onChange={e => setAuthForm({...authForm, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    </div>

                    {authView === 'signin' ? (
                        <div className="flex items-center gap-2 ml-1">
                            <input type="checkbox" id="remember" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</label>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 ml-1">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                                className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500" 
                            />
                            <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                                I agree to the <span className="text-teal-600 hover:underline">Terms of Service</span> and <span className="text-teal-600 hover:underline">Privacy Policy</span>.
                            </label>
                        </div>
                    )}

                    {authError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> 
                        <span>{authError}</span>
                    </div>
                    )}

                    <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center justify-center gap-2 mt-4"
                    >
                    {authLoading ? <Loader2 className="animate-spin" /> : (authView === 'signin' ? 'Sign In' : 'Create Account')}
                    {!authLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                {/* Social Login Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-400">Or continue with</span>
                    </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700">
                        <Globe size={18} className="text-blue-500" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700">
                        <Github size={18} className="text-slate-800" /> Apple
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                    {authView === 'signin' && (
                    <button 
                        type="button"
                        onClick={() => {
                            // Demo helper
                            setAuthForm({ name: '', email: 'alex.j@example.com', password: 'password123' });
                        }}
                        className="text-xs text-slate-400 hover:text-teal-600 font-medium transition-colors"
                    >
                        Demo: Fill with Test User
                    </button>
                    )}
                    
                    {pendingService && (
                        <div className="mt-4">
                        <button 
                            onClick={() => {
                            setIsLoginModalOpen(false);
                            setPendingService(null);
                            }}
                            className="text-sm text-slate-400 hover:text-slate-600"
                        >
                            No thanks, I'll stick to Standard services
                        </button>
                        </div>
                    )}
                </div>
             </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default App;
