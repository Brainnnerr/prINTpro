import { ChevronRight } from 'lucide-react';
import type { Service } from '../../types';

interface ServicesTabProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export default function ServicesTab({ services, onSelectService }: ServicesTabProps) {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Available Print Labs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((s) => (
          <button 
            key={s.id}
            onClick={() => onSelectService(s)}
            className="bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all text-left group flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-600 group-hover:text-white transition-all mb-6">
              {s.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700">{s.name}</h3>
            <p className="text-sm text-slate-500 flex-grow mb-6 leading-relaxed">{s.desc}</p>
            <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-auto">
              <span className="font-black text-emerald-600">₱{s.price.toFixed(2)}</span>
              <div className="p-2 rounded-full bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}