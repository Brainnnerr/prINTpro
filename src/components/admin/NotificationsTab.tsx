import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Bell, Trash2, Check, Clock, Info, 
  AlertTriangle, CheckCircle, XCircle, Loader2
} from 'lucide-react';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'error': return 'bg-red-50 text-red-600 border-red-100';
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} />;
      case 'error': return <XCircle size={18} />;
      case 'success': return <CheckCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Activity Alerts</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Real-time system updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{notifications.filter(n => !n.is_read).length} New</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className={`bg-white border ${n.is_read ? 'border-slate-100 opacity-60' : 'border-emerald-100 shadow-sm shadow-emerald-500/5'} rounded-2xl p-5 flex items-start justify-between transition-all`}>
              <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-xl border ${getTypeStyles(n.type)}`}>
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <h4 className={`font-bold ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{n.message}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock size={10}/> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!n.is_read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    title="Mark as Read"
                    aria-label="Mark notification as read"
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(n.id)}
                  title="Delete"
                  aria-label="Delete notification"
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <Bell className="mx-auto text-slate-100 mb-4" size={64} />
            <p className="text-slate-400 font-bold tracking-tight">No notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}