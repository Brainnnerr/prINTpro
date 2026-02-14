
import React from 'react';
import { ArrowRight, CreditCard, Image, Book, Sticker, Files, Flag, Check, ChevronRight, Crown, Star, Zap, Shield, Clock } from 'lucide-react';
import { SERVICES, STATUS_STEPS } from '../constants';
import { Service, Order } from '../types';

interface ServiceCatalogProps {
  onSelectService: (service?: Service) => void;
  orders: Order[];
  onViewOrders: () => void;
  isAuthenticated: boolean;
}

const IconMap: Record<string, React.ElementType> = {
  CreditCard,
  Image,
  Book,
  Sticker,
  Files,
  Flag
};

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService, orders, onViewOrders, isAuthenticated }) => {
  // Filter active orders (not completed) to show in the tracking section
  const activeOrders = orders.filter(o => o.status !== 'Completed');

  const getProgress = (status: string) => {
    const index = STATUS_STEPS.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / STATUS_STEPS.length) * 100;
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      {/* Modern Hero Section */}
      <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden shadow-2xl isolate">
        {/* Background Gradients/Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-teal-600 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
            <div className="space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-700/50 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                    <Zap size={12} fill="currentColor" /> Premium Printing Service
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                    Print your vision, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                        delivered fast.
                    </span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed">
                    From business cards to large-format banners, we bring your digital designs into the physical world with pixel-perfect precision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => onSelectService()}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/50 flex items-center justify-center gap-2"
                    >
                        Start New Order <ArrowRight size={20} />
                    </button>
                    {!isAuthenticated && (
                        <button 
                            onClick={() => onSelectService()}
                            className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            View Services
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-6 pt-4 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-white overflow-hidden">
                                   <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-slate-400 pl-2">1k+ Happy Clients</span>
                    </div>
                </div>
            </div>

            {/* Abstract 3D Representation */}
            <div className="hidden lg:block relative h-full min-h-[400px]">
                {/* Floating Cards Illustration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl rotate-[-6deg] z-10 flex flex-col p-6">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-6">
                        <Image size={24} className="text-teal-400" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 w-3/4 bg-slate-700 rounded-full"></div>
                        <div className="h-4 w-1/2 bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="mt-auto h-32 bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden relative">
                        <div className="absolute inset-0 bg-teal-500/10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-teal-900/50 to-transparent"></div>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-white rounded-2xl shadow-2xl rotate-[6deg] z-20 p-6 flex flex-col hover:scale-105 transition-transform duration-500">
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                            <Flag size={20} />
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Ready</div>
                     </div>
                     <h3 className="text-2xl font-bold text-slate-800 mb-2">Marketing Banner</h3>
                     <p className="text-slate-500 text-sm mb-6">High quality vinyl, weather resistant.</p>
                     
                     <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Price</p>
                            <p className="text-xl font-bold text-slate-900">₱45.00</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <ArrowRight size={16} />
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Active Orders Dashboard Widget */}
      {isAuthenticated && activeOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Clock className="text-teal-600" /> 
                In Progress
                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">{activeOrders.length}</span>
            </h2>
            <button 
              onClick={onViewOrders} 
              className="group text-slate-500 hover:text-teal-600 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              Track all
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.slice(0, 3).map(order => {
              const progress = getProgress(order.status);
              
              return (
                <div key={order.id} className="group bg-slate-50 hover:bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-teal-100">
                        {order.serviceName.includes('Card') ? <CreditCard size={20} className="text-slate-600 group-hover:text-teal-600"/> : <Files size={20} className="text-slate-600 group-hover:text-teal-600"/>}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                        order.status === 'Printing' ? 'bg-teal-100 text-teal-700' : 
                        order.status === 'Quality Check' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {order.status}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 mb-1">{order.serviceName}</h3>
                  <p className="text-xs text-slate-500 mb-4">Order #{order.id}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-600 rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Select a Service</h2>
            <p className="text-slate-500 text-lg">Choose from our most popular printing options below. High quality guaranteed.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = IconMap[service.iconName] || Files;
            const isPremium = service.tier === 'Premium';
            
            return (
              <div 
                key={service.id}
                onClick={() => onSelectService(service)}
                className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-100 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden transform hover:-translate-y-1"
              >
                {/* Hover Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6 duration-300 ${
                            isPremium ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white border border-slate-100 text-teal-600'
                        }`}>
                            <Icon size={28} />
                        </div>
                        {isPremium && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-1 rounded-full border border-amber-100">
                                <Crown size={10} fill="currentColor" /> Premium
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{service.name}</h3>
                    <p className="text-slate-500 leading-relaxed mb-8 flex-grow">{service.description}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-medium uppercase">Starting at</span>
                            <span className="text-lg font-bold text-slate-900">₱{service.basePrice.toFixed(2)}<span className="text-xs text-slate-400 font-normal">/unit</span></span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators / Features */}
      <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600 mb-6 transform rotate-3">
                    <Shield size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Quality Guarantee</h4>
                <p className="text-slate-500 leading-relaxed">
                    If you're not 100% satisfied with the print quality, we'll reprint it for free.
                </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600 mb-6 transform -rotate-2">
                    <Clock size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Next Day Delivery</h4>
                <p className="text-slate-500 leading-relaxed">
                    Order before 2 PM and get your standard prints delivered the very next day.
                </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-teal-600 mb-6 transform rotate-1">
                    <Star size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Premium Materials</h4>
                <p className="text-slate-500 leading-relaxed">
                    We source the finest paper stocks and inks to ensure your brand stands out.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
