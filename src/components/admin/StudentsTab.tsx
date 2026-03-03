import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Search, Mail, Trash2,
  Loader2, UserCheck, Ban,  AlertTriangle, CheckCircle
} from 'lucide-react';

export default function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'disabled', isOpen: boolean} | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles') 
      .select('*')
      .order('full_name');
    
    if (!error && data) setStudents(data);
    setLoading(false);
  };

  const toggleAccountStatus = async (id: string, currentStatus: boolean) => {
    // 1. Database Update
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_disabled: !currentStatus })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Update Blocked:", error.message);
      alert("Permission Denied: Ensure your account has admin metadata set to true.");
      return;
    }

    // 2. State Sync
    if (data && data.length > 0) {
      setStudents(prev => prev.map(s => 
        s.id === id ? { ...s, is_disabled: !currentStatus } : s
      ));
      
      setFeedback({ type: 'disabled', isOpen: true });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      alert("Update failed. The database did not return a confirmation.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    const { error } = await supabase.from('profiles').delete().eq('id', deleteId);
    
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
      setConfirmText('');
      setFeedback({ type: 'success', isOpen: true });
      setTimeout(() => setFeedback(null), 2000);
    }
    setIsDeleting(false);
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Student Database</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Manage access and violations</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text"
            placeholder="Search student..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-xs transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Student List */}
      <div className="grid gap-3">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className={`bg-white border ${student.is_disabled ? 'border-red-100 opacity-75' : 'border-slate-100'} rounded-2xl p-5 flex items-center justify-between group transition-all shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${student.is_disabled ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className={`font-bold ${student.is_disabled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {student.full_name || 'Anonymous Student'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail size={10} className="text-slate-300"/>
                    <p className="text-[11px] text-slate-400 font-medium">{student.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right px-4">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Status</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${student.is_disabled ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {student.is_disabled ? 'Disabled' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleAccountStatus(student.id, student.is_disabled)}
                    title={student.is_disabled ? "Enable Account" : "Disable Account"}
                    className={`p-2.5 rounded-xl transition-all ${student.is_disabled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                  >
                    <Ban size={18} />
                  </button>
                  <button 
                    onClick={() => setDeleteId(student.id)}
                    title="Delete Account Permanently"
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <Users className="mx-auto text-slate-100 mb-4" size={64} />
            <p className="text-slate-400 font-bold tracking-tight">No students found matching your search.</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
              <AlertTriangle size={40}/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Serious Action</h3>
            <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
              Deleting this account will remove all their history and pending orders. This cannot be undone.
            </p>
            
            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type <span className="text-red-500 underline">DELETE</span> to confirm</p>
              <input 
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-red-500 rounded-2xl outline-none text-center font-black tracking-widest transition-all"
                placeholder="CONFIRMATION"
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => { setDeleteId(null); setConfirmText(''); }} 
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-200 transition-all"
              >
                CANCEL
              </button>
              <button 
                disabled={confirmText !== 'DELETE' || isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isDeleting ? <Loader2 className="animate-spin mx-auto"/> : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback?.isOpen && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-slate-800">
            <div className="bg-emerald-500 p-1.5 rounded-full text-white">
              <CheckCircle size={18} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">
              {feedback.type === 'success' ? 'Account Removed' : 'Access Status Updated'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
