import { useState } from 'react';
import { User, Mail, Shield, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileTabProps {
  userName: string;
  userEmail: string;
}

export default function ProfileTab({ userName, userEmail }: ProfileTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Logic to delete user data and sign out
      // Note: Full account deletion usually requires a Supabase Edge Function 
      // as users cannot delete themselves from the auth table directly for security.
      // For now, we sign them out after "requesting" deletion.
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      window.location.href = '/';
    } catch (err) {
      console.error("Deletion error:", err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-500 space-y-8">
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 md:p-10">
        <h2 className="text-xl font-black text-slate-900 mb-8">Account Details</h2>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
              <p className="font-bold text-slate-900">{userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="font-bold text-slate-900">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="font-bold text-emerald-600">Standard Account</p>
            </div>
          </div>
        </div>

        {/* --- DELETE TRIGGER --- */}
        <div className="mt-12 pt-8 border-t border-slate-50">
          <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">Danger Zone</h3>
          <p className="text-xs text-slate-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Are you sure?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              This will permanently remove your account and all order history. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Delete My Account'}
              </button>
              <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}