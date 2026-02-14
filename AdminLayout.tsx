
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'orders' | 'inventory') => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentView, onViewChange, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-lg">P</div>
            PrintPro Admin
          </h1>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400">
            <div className="h-8 w-8 rounded-full bg-teal-900 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-white font-medium">Admin User</p>
              <p className="text-xs">Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
           <span className="font-bold">PrintPro Admin</span>
           <div className="flex gap-4">
             {navItems.map(item => (
               <button 
                 key={item.id}
                 onClick={() => onViewChange(item.id as any)}
                 className={`${currentView === item.id ? 'text-teal-400' : 'text-slate-400'}`}
               >
                 <item.icon size={20} />
               </button>
             ))}
           </div>
        </div>

        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
