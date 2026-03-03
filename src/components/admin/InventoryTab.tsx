import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, AlertTriangle, Plus, Minus, RefreshCw, Loader2 } from 'lucide-react'; // Removed unused 'Save'

export default function InventoryTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('item_name');
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const updateStock = async (id: string, newLevel: number) => {
    setIsUpdating(id);
    const { error } = await supabase
      .from('inventory')
      .update({ stock_level: Math.max(0, newLevel), updated_at: new Date() })
      .eq('id', id);
    
    if (!error) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, stock_level: Math.max(0, newLevel) } : item));
    }
    setIsUpdating(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Supply Inventory</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Monitor and restock materials</p>
          </div>
        </div>
        {/* Added title and aria-label for accessibility */}
        <button 
          onClick={fetchInventory} 
          title="Refresh Inventory"
          aria-label="Refresh Inventory"
          className="p-3 text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const isLow = item.stock_level <= item.min_threshold;
            return (
              <div key={item.id} className={`bg-white border ${isLow ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'} rounded-3xl p-6 shadow-sm transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                    <h4 className="font-bold text-slate-800 text-lg">{item.item_name}</h4>
                  </div>
                  {isLow && (
                    <div className="text-amber-500 animate-pulse">
                      <AlertTriangle size={20} />
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-3xl font-black ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                      {item.stock_level}
                      <span className="text-sm font-bold text-slate-400 ml-1">{item.unit}</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Available Stock</p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {/* Added title and aria-label for accessibility */}
                    <button 
                      disabled={isUpdating === item.id}
                      onClick={() => updateStock(item.id, item.stock_level - 10)}
                      title="Decrease Stock by 10"
                      aria-label="Decrease Stock"
                      className="p-2 hover:bg-white hover:text-red-500 rounded-xl transition-all text-slate-400 shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    {/* Added title and aria-label for accessibility */}
                    <button 
                      disabled={isUpdating === item.id}
                      onClick={() => updateStock(item.id, item.stock_level + 50)}
                      title="Increase Stock by 50"
                      aria-label="Increase Stock"
                      className="p-2 hover:bg-white hover:text-emerald-500 rounded-xl transition-all text-slate-400 shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {isLow && (
                  <div className="mt-4 p-2 bg-amber-100/50 rounded-xl text-center">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-tighter">Low Stock Warning</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="mx-auto text-slate-100 mb-4" size={64} />
            <p className="text-slate-400 font-bold">No inventory items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}