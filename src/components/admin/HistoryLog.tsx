import { useState } from 'react';
import { 
  ChevronDown, ChevronUp, User, 
  Calendar, Plus, X, Loader2, Trash2, Edit3, CheckCircle, AlertTriangle
} from 'lucide-react'; 
import { supabase } from '../../lib/supabase';

interface HistoryLogProps {
  orders: any[];
  onRefresh: () => void;
}

export default function HistoryLog({ orders, onRefresh }: HistoryLogProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback & Confirmation States
  const [feedback, setFeedback] = useState<{type: 'success' | 'deleted', isOpen: boolean} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, id: string | null}>({
    isOpen: false,
    id: null
  });

  const [manualName, setManualName] = useState('');
  const [manualService, setManualService] = useState('Document Printing');
  const [manualAmount, setManualAmount] = useState('');

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleAddManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: manualName,
        service_name: manualService,
        total_price: parseFloat(manualAmount),
        status: 'completed',
        is_manual: true
      }]);
      
      if (error) throw error;
      
      setManualName('');
      setManualService('Document Printing');
      setManualAmount('');
      setShowManualModal(false);
      onRefresh();
      setFeedback({ type: 'success', isOpen: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', deleteConfirmation.id);
    if (!error) {
      onRefresh();
      setDeleteConfirmation({ isOpen: false, id: null });
      setFeedback({ type: 'deleted', isOpen: true });
    }
  };

  const dailyGroups = orders.reduce((acc: any, order) => {
    const dateObj = new Date(order.created_at);
    if (dateObj.getMonth() === selectedMonth) {
      const dateKey = dateObj.toDateString();
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, totalRevenue: 0, customerCount: 0, items: [] };
      acc[dateKey].totalRevenue += Number(order.total_price || 0);
      acc[dateKey].customerCount += 1;
      acc[dateKey].items.push(order);
    }
    return acc;
  }, {});

  const historyArray = Object.values(dailyGroups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">Financial Records</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Manage face-to-face logs</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            title="Filter by Month"
            aria-label="Filter records by month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 md:w-40 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 outline-none"
          >
            {months.map((name, index) => <option key={name} value={index}>{name}</option>)}
          </select>
          <button 
            title="Add Manual Transaction"
            aria-label="Add a new manual transaction"
            onClick={() => setShowManualModal(true)}
            className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 text-xs font-black shadow-lg"
          >
            <Plus size={18} /> <span className="hidden md:block">ADD LOG</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddManualLog} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 uppercase">New Transaction</h2>
              <button 
                title="Close" 
                aria-label="Close modal"
                type="button" 
                onClick={() => setShowManualModal(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="space-y-4">
              <input required value={manualName} onChange={(e) => setManualName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" placeholder="Customer Name" />
              <select 
                title="Service Type"
                value={manualService} 
                onChange={(e) => setManualService(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm"
              >
                <option>Document Printing</option>
                <option>Thesis Hardbound</option>
                <option>ID Photos</option>
                <option>Photocopy</option>
              </select>
              <input required type="number" step="0.01" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" placeholder="Amount (₱)" />
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin"/> : 'SAVE TRANSACTION'}
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle size={32}/>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase">Confirm Delete</h3>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Are you sure you want to remove this log? This action cannot be undone.
            </p>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setDeleteConfirmation({ isOpen: false, id: null })} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
              >
                CANCEL
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-200"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Deleted Feedback Modal */}
      {feedback?.isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in">
          <div className="bg-white rounded-[32px] p-8 max-w-xs w-full text-center shadow-2xl">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
              {feedback.type === 'success' ? <CheckCircle size={32}/> : <Trash2 size={32}/>}
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase">
              {feedback.type === 'success' ? 'Recorded!' : 'Removed!'}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
              {feedback.type === 'success' ? 'Transaction saved to history.' : 'The log has been permanently deleted.'}
            </p>
            <button onClick={() => setFeedback(null)} className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs tracking-widest">CONTINUE</button>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {historyArray.map((day: any) => (
          <div key={day.date} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button 
              title="Expand Details"
              aria-label={`View details for ${day.date}`}
              onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)} 
              className="w-full p-5 flex justify-between items-center hover:bg-slate-50"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{day.date}</p>
                <p className="text-sm font-black text-slate-700">{day.customerCount} Transactions</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-black text-emerald-600 tracking-tighter">₱{day.totalRevenue.toFixed(2)}</p>
                {expandedDay === day.date ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
              </div>
            </button>

            {expandedDay === day.date && (
              <div className="p-4 bg-slate-50/50 space-y-2 border-t border-slate-100">
                {day.items.map((item: any) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.is_manual ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                        {item.is_manual ? <Edit3 size={16}/> : <User size={16}/>}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.customer_name}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.service_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs font-black text-slate-600 tracking-tight">₱{Number(item.total_price).toFixed(2)}</p>
                      {item.is_manual && (
                        <button 
                          title="Delete Transaction"
                          aria-label={`Delete manual entry for ${item.customer_name}`}
                          onClick={() => setDeleteConfirmation({ isOpen: true, id: item.id })} 
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}