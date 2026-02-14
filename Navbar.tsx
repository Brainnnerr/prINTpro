
import React, { useState } from 'react';
import { Menu, X, Printer, User as UserIcon, List, PlusCircle, Home, LogIn } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: 'home' | 'wizard' | 'orders' | 'profile') => void;
  currentUser: User | null;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, currentUser, onLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wizard', label: 'Start New Order', icon: PlusCircle },
    // Only show "My Orders" if logged in
    ...(currentUser ? [{ id: 'orders', label: 'My Orders', icon: List }] : []),
  ];

  const handleNavClick = (view: any) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavClick('home')}
          >
            <div className="bg-teal-600 p-2 rounded-lg">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 hidden sm:block">
              PrintPro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  currentView === item.id 
                    ? 'text-teal-600' 
                    : 'text-slate-600 hover:text-teal-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>

          {/* Profile & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <button 
                onClick={() => handleNavClick('profile')}
                className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 p-2 rounded-lg transition-colors"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">Customer</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                   <img src={currentUser.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                </div>
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-transform active:scale-95"
              >
                <LogIn size={16} /> Log In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentView === item.id 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-slate-600'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            
            {currentUser ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-3 p-3 rounded-lg text-slate-600 border-t border-slate-100 mt-2"
              >
                <UserIcon size={20} />
                <span className="font-medium">My Profile</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 text-white mt-2 justify-center"
              >
                <LogIn size={20} />
                <span className="font-medium">Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
