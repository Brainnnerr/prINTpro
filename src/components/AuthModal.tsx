import { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        // Brief delay before reload to ensure session is stored
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } 
      else if (mode === 'register') {
        // Updated sign-up logic to include admin metadata
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              full_name: fullName,
              is_admin: email.toLowerCase() === 'admin@printpro.com' // Hardcoded logic for admin email
            },
            emailRedirectTo: window.location.origin 
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user && !data.session) {
          setIsSuccess(true);
          setMessage("A confirmation link has been sent to your email. Please verify your account to continue.");
        } else if (data?.session) {
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      } 
      else if (mode === 'forgot_password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setIsSuccess(true);
        setMessage("Password reset link sent! Check your inbox.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMessage(null);
    setError(null);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 relative text-left">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        <div className="p-8 md:p-10">
          {isSuccess ? (
            <div className="text-center py-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-500" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Check your Email</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                {message}
              </p>
              <button 
                onClick={handleReset}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }} 
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${mode === 'login' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
                  >
                    LOGIN
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }} 
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${mode === 'register' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
                  >
                    REGISTER
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400" title="Close"><X size={20} /></button>
              </div>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join PrintPro' : 'Reset Password'}
                </h2>
                {error && <p className="text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl mb-4 border border-red-100 uppercase tracking-wide">{error}</p>}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold" />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold" />
                </div>

                {mode !== 'forgot_password' && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm font-bold" />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot_password')}
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full group mt-4 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all duration-300 shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Link')}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}