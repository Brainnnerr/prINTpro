import { useState } from "react";
import {
    ArrowRight,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    Image as ImageIcon,
    Layers,
    Mail,
    Phone,
    Printer,
    ShieldCheck,
    X,
    Zap,
    Loader2,
    CheckCircle2
} from "lucide-react";
import AuthModal from "../components/AuthModal";
import type { Service } from "../types";
import { supabase } from "../lib/supabase"; //

export default function LandingPage({ onSelectService, isAuthenticated }: {
    onSelectService: (service?: Service) => void;
    isAuthenticated: boolean;
}) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); //
    const [sampleIndex, setSampleIndex] = useState(0);

    // Contact Form States
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const samples = [
        "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=500",
        "https://images.unsplash.com/photo-1517639493569-5666a7b2f494?q=80&w=500",
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500",
    ];

   const services = [
  { 
    id: "s3", 
    name: "Document Printing", 
    desc: "High-resolution laser printing for academic and professional documents. Supports Standard A4 (8.27\" x 11.69\") and Letter (8.5\" x 11\") sizes in both monochrome and full color.", 
    price: 2.00, 
    icon: <FileText /> 
  },
  { 
    id: "s4", 
    name: "Rush ID Photos", 
    desc: "Express high-gloss ID processing with instant cutting. Available in standard Philippine government and school sizes: 2x2 inch (51x51mm), 1x1 inch (25x25mm), and Passport Size (35x45mm) with optional white background.", 
    price: 25.00, 
    icon: <Zap /> 
  },
  { 
    id: "s5", 
    name: "Photo Printing", 
    desc: "Premium inkjet photo printing on smudge-proof photographic paper. Choose from standard frame sizes: 3R (3.5\"x5\"), 4R (4\"x6\"), and 5R (5\"x7\"). Perfect for high-quality memorialization and portfolios.", 
    price: 15.00, 
    icon: <ImageIcon /> 
  },
];

    const handleStartOrder = (service?: Service) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            onSelectService(service);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const { error } = await supabase
                .from('messages')
                .insert([contactForm]);

            if (error) throw error;
            
            setShowSuccessModal(true);
            setContactForm({ name: '', email: '', message: '' });
        } catch (err: any) {
            console.error("Submission error:", err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
            {/* Navbar */}
            <nav className="hidden md:flex justify-between items-center px-12 py-5 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                        <Printer size={18} className="text-emerald-400" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Print<span className="text-emerald-600">Pro</span></span>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative px-6 md:px-12 py-16 md:py-32 overflow-hidden text-center lg:text-left">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-100/40 -z-40"></div>
                <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-emerald-100/50 px-3 py-1 rounded-full mb-6 border border-emerald-200/50">
                            <ShieldCheck className="text-emerald-700" size={14} />
                            <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Professional Lab Standards</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
                            Precision in <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-black">Every Fiber.</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-600 mb-10 max-w-md mx-auto lg:mx-0">High-fidelity document engineering. From luxury cards to archival thesis binding.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button onClick={() => handleStartOrder()} className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-xl">
                                Start My Order <ArrowRight size={18} />
                            </button>
                            <button onClick={() => setShowSampleModal(true)} className="border border-slate-300 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:text-emerald-600 hover:border-emerald-400 transition-all duration-300">
                                Browse Samples
                            </button>
                        </div>
                    </div>
                    {/* Feature Card Visual */}
                    <div className="relative h-[350px] md:h-[400px] w-full max-w-md mx-auto lg:mx-0 group">
                        <div className="absolute inset-0 bg-slate-200 rounded-[32px] transform translate-x-8 translate-y-8 -z-30 border border-slate-300"></div>
                        <div className="absolute inset-0 bg-slate-100 rounded-[32px] transform translate-x-4 translate-y-4 -z-20 border border-slate-200"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 rounded-[32px] shadow-2xl z-10 border border-white/10 flex flex-col justify-center overflow-hidden">
                            <Layers className="absolute -right-12 -bottom-12 text-emerald-500/10 transform -rotate-12 transition-transform group-hover:scale-110 duration-700" size={280} />
                            <div className="relative z-10">
                                <div className="bg-emerald-500/10 w-fit p-3 rounded-2xl mb-6">
                                    <Layers className="text-emerald-400" size={40} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Industrial Bulk Production</h3>
                                <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">High-volume printing for academic needs with 100% color accuracy.</p>
                                <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-xl text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                    <CheckCircle size={14} /> Available for 24hr Rush
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Services Section */}
            <section className="px-6 md:px-12 py-24 bg-white">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight text-slate-900">Services <span className="text-emerald-600">Offered</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((s) => (
                            <div key={s.id} onClick={() => handleStartOrder(s as any)} className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col h-full text-left">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    {s.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-700 transition-colors">{s.name}</h3>
                                <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed">{s.desc}</p>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-6">
                                    <span className="font-bold text-lg text-emerald-600">₱{s.price.toFixed(2)}</span>
                                    <div className="p-2 rounded-full bg-white group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm"><ChevronRight size={18} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="px-6 md:px-12 py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 tracking-tight text-slate-900">Contact Us</h2>
                            <p className="text-slate-600 mb-10 text-sm md:text-base leading-relaxed">Have a bulk order inquiry? Our team is here to assist with your custom needs.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Phone size={20} /></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Call Us</p><p className="font-bold text-slate-900">+63 912 345 6789</p></div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Mail size={20} /></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Support</p><p className="font-bold text-slate-900">support@printpro.tech</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Functional Form */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm font-medium" />
                                    <input required type="email" placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm font-medium" />
                                </div>
                                <textarea required rows={4} placeholder="Your Message" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm font-medium"></textarea>
                                <button type="submit" disabled={sending} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 disabled:bg-slate-400 transition-all shadow-lg flex items-center justify-center gap-2">
                                    {sending ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Message Sent!</h3>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">Thank you for reaching out. Our team will review your inquiry and get back to you shortly.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100">Got it, thanks!</button>
                    </div>
                </div>
            )}

            {/* SAMPLE MODAL */}
            {showSampleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <button onClick={() => setShowSampleModal(false)} aria-label="Close sample modal" className="absolute top-8 right-8 text-white hover:text-emerald-400 transition-colors"><X size={32} /></button>
                    <div className="relative flex items-center justify-center max-w-4xl w-full h-[60vh]">
                        <button onClick={() => setSampleIndex((p) => (p === 0 ? samples.length - 1 : p - 1))} aria-label="Previous sample" className="absolute left-4 p-4 text-white hover:bg-emerald-500 rounded-full transition shadow-xl"><ChevronLeft size={40} /></button>
                        <img src={samples[sampleIndex]} alt="Print sample" className="max-h-full rounded-2xl shadow-2xl object-contain border-4 border-white/10" />
                        <button onClick={() => setSampleIndex((p) => (p === samples.length - 1 ? 0 : p + 1))} aria-label="Next sample" className="absolute right-4 p-4 text-white hover:bg-emerald-500 rounded-full transition shadow-xl"><ChevronRight size={40} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
