import { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, Upload, Check, 
  Settings, Loader2, X, CheckCircle,
  Truck, Store, Hash, User as UserIcon, Clock, Info, Printer, Ban
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import type { Service } from '../types';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

interface OrderWizardProps {
  service: Service | null;
  onBack: () => void;
}

export default function OrderWizard({ service, onBack }: OrderWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); //
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeInputType, setTimeInputType] = useState<'text' | 'time'>('text');
  
  const [config, setConfig] = useState({
    customerName: '',
    address: '',
    pickupTime: '',
    paperSize: 'A4',
    sideMode: 'single',
    fulfillment: 'pickup',
    description: '',
    file: null as File | null,
    pageCount: 0,
    calculatedPrice: 0
  });

  // 1. Check account status on component mount
  useEffect(() => {
    const verifyAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_disabled')
        .eq('id', user.id)
        .single();

      if (profile?.is_disabled) {
        setIsBlocked(true); //
      }
    };
    verifyAccess();
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  useEffect(() => {
    if (!service) return;
    let basePrice = service.price;
    let pages = config.pageCount || 1;

    switch (service.id) {
      case 's3': basePrice = 35.00; pages = 1; break;
      case 's5': basePrice = 30.00; break;
      case 's2': basePrice = 300.00; break;
    }

    const sheetsUsed = config.sideMode === 'double' ? Math.ceil(pages / 2) : pages;
    setConfig(prev => ({ ...prev, calculatedPrice: sheetsUsed * basePrice }));
  }, [config.pageCount, config.sideMode, config.paperSize, service]);

  const countPages = async (file: File) => {
    try {
      if (file.type === 'application/pdf') {
        const doc = await PDFDocument.load(await file.arrayBuffer());
        return doc.getPageCount();
      }
      if (file.name.endsWith('.docx')) {
        const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        return Math.ceil(res.value.split(/\s+/).length / 250) || 1;
      }
    } catch { return 1; }
    return 1;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const pages = await countPages(file);
    setConfig(prev => ({ ...prev, file, pageCount: pages }));
    setLoading(false);
  };

  const formatTimeAMPM = (time: string) => {
    if (!time) return '--:-- --';
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to place an order.");

      // 2. Final Security Check before DB Insert
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_disabled')
        .eq('id', user.id)
        .single();

      if (profile?.is_disabled) {
        setIsBlocked(true);
        throw new Error("This account is restricted. Requisition denied."); //
      }

      let fileUrl = '';
      if (config.file) {
        const fileExt = config.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('print-files')
          .upload(fileName, config.file);
        if (uploadError) throw uploadError;
        fileUrl = uploadData.path;
      }

      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        service_id: service?.id,
        service_name: service?.name,
        customer_name: config.customerName,
        address: config.fulfillment === 'delivery' ? config.address : null,
        pickup_time: config.fulfillment === 'pickup' ? config.pickupTime : null,
        paper_size: config.paperSize,
        side_mode: config.sideMode,
        fulfillment: config.fulfillment,
        description: config.description,
        file_url: fileUrl,
        page_count: config.pageCount,
        total_price: config.calculatedPrice,
        status: 'pending'
      }).select().single();

      if (error) throw error;
      setOrderReceipt(data);
      setStep(4);
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // 3. Blocked UI View
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl border border-red-100 text-center animate-in zoom-in duration-300">
           <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Ban size={40}/>
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</h2>
           <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
             Your PrintPro account has been disabled by the administrator due to violations or outstanding issues.
           </p>
           <button 
             onClick={onBack}
             className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest"
           >
             Go Back
           </button>
        </div>
      </div>
    );
  }

  const isStep1Disabled = !config.customerName || (config.fulfillment === 'delivery' ? !config.address : !config.pickupTime);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
               {service?.icon || <Settings size={24}/>}
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none mb-1">{service?.name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {step < 4 ? `Step ${step} of 3` : 'Official Requisition'}
              </p>
            </div>
          </div>
          {step < 4 && (
            <button onClick={onBack} title="Close Wizard" className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={20}/>
            </button>
          )}
        </div>

        <div className="p-8">
          {/* STEP 1: Personal & Fulfillment */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" placeholder="Full Name" title="Enter your full name"
                  value={config.customerName} onChange={(e) => setConfig({...config, customerName: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setConfig({...config, fulfillment: 'pickup'})} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${config.fulfillment === 'pickup' ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' : 'border-slate-50 text-slate-400'}`}>
                  <Store size={18}/> <span className="font-bold text-xs">Pick-up</span>
                </button>
                <button type="button" onClick={() => setConfig({...config, fulfillment: 'delivery'})} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${config.fulfillment === 'delivery' ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' : 'border-slate-50 text-slate-400'}`}>
                  <Truck size={18}/> <span className="font-bold text-xs">Delivery</span>
                </button>
              </div>

              {config.fulfillment === 'delivery' ? (
                <textarea 
                  placeholder="Complete Delivery Address" title="Delivery Address"
                  value={config.address} onChange={(e) => setConfig({...config, address: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm min-h-[100px]"
                />
              ) : (
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                    type={timeInputType}
                    onFocus={() => setTimeInputType('time')}
                    onBlur={() => !config.pickupTime && setTimeInputType('text')}
                    placeholder="Preferred Pickup Time" title="Choose pickup time"
                    value={config.pickupTime} onChange={(e) => setConfig({...config, pickupTime: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Service-Specific Options */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Size / Variant</label>
                    <select title="Select size" value={config.paperSize} onChange={(e) => setConfig({...config, paperSize: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none">
                    {service?.id === 's3' ? (
                        <>
                          <option value="2x2 (6pcs)">2x2 Set (6pcs) - ₱35</option>
                          <option value="1x1 (6pcs)">1x1 Set (6pcs) - ₱35</option>
                          <option value="Passport Size (6pcs)">Passport Size (6pcs) - ₱35</option>
                          <option value="Combo (3x 2x2 + 3x Any)">Combo (3 2x2 + 3 Mixed) - ₱35</option>
                        </>
                    ) : service?.id === 's4' ? (
                        <>
                          <option value="Standard (3.5 x 2)">Standard (3.5" x 2")</option>
                          <option value="Square (2.5 x 2.5)">Square (2.5" x 2.5")</option>
                          <option value="Custom Size">Custom Size</option>
                        </>
                    ) : service?.id === 's5' ? (
                         <>
                          <option value="A4 Sheet">Full A4 Sheet - ₱30</option>
                          <option value="Machine Cut">Die-Cut Set - ₱30</option>
                        </>
                    ) : (
                        <><option value="A4">A4</option><option value="Short">Short (8.5x11)</option><option value="Long">Long (8.5x13)</option></>
                    )}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Sides</label>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        <button type="button" onClick={() => setConfig({...config, sideMode: 'single'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${config.sideMode === 'single' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>SINGLE</button>
                        <button type="button" onClick={() => setConfig({...config, sideMode: 'double'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${config.sideMode === 'double' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>DOUBLE</button>
                    </div>
                </div>
              </div>

              <textarea 
                placeholder="Description / Additional Instructions" title="Additional instructions"
                value={config.description} onChange={(e) => setConfig({...config, description: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-xs"
              />
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.docx,.jpg,.png" 
                title="Upload your document"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full border-2 border-dashed rounded-[32px] p-10 transition-all ${config.file ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 hover:border-emerald-400'}`}>
                {loading ? <Loader2 className="mx-auto animate-spin text-emerald-500" size={32}/> : (
                  <>
                    <Upload className={`mx-auto mb-2 ${config.file ? 'text-emerald-500' : 'text-slate-300'}`} size={32} />
                    <p className="text-xs font-bold text-slate-600 truncate px-4">{config.file ? config.file.name : "Upload Assets"}</p>
                    {config.pageCount > 0 && <span className="mt-2 inline-block text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded shadow-sm">{config.pageCount} PAGES DETECTED</span>}
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Summary */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 space-y-4">
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Client</span><span className="text-slate-900">{config.customerName}</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Variant</span><span className="text-slate-900">{config.paperSize}</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">Fulfillment</span><span className="text-slate-900 capitalize">{config.fulfillment}</span></div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">Total Amount Due</span>
                  <span className="text-2xl font-black text-emerald-600">₱{config.calculatedPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 p-4 bg-blue-50 rounded-2xl text-blue-700">
                <Info size={18} className="shrink-0"/>
                <p className="text-[10px] font-bold leading-tight uppercase">Manual Payment: Pay personally to the admin upon arrival.</p>
              </div>
            </div>
          )}

          {/* STEP 4: Official Requisition Receipt */}
          {step === 4 && orderReceipt && (
            <div className="animate-in zoom-in duration-500">
              <div className="bg-white border-2 border-slate-900 rounded-[32px] p-6 mb-6 shadow-xl relative text-left">
                <div className="absolute top-4 right-6 text-slate-100"><Printer size={40}/></div>
                
                <div className="text-center border-b border-slate-100 pb-4 mb-4">
                    <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32}/>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter">Official Requisition</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Ref: #{orderReceipt.id.slice(0,8).toUpperCase()}
                    </p>
                </div>
                
                <div className="space-y-2.5 text-[11px] font-bold uppercase text-slate-600 mb-6">
                    <div className="flex justify-between items-center">
                      <span>Date & Time:</span>
                      <span className="text-slate-900">
                        {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Service Type:</span>
                      <span className="text-slate-900">{service?.name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Fulfillment:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] ${config.fulfillment === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {config.fulfillment === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                      </span>
                    </div>

                    {config.fulfillment === 'pickup' ? (
                      <div className="flex justify-between items-center">
                        <span>Pickup Schedule:</span>
                        <span className="text-slate-900 font-black">
                          {config.pickupTime ? formatTimeAMPM(config.pickupTime) : '--:-- --'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span>Delivery Address:</span>
                        <span className="text-slate-900 normal-case font-medium line-clamp-2">{config.address}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 mt-2 text-sm font-black text-slate-900">
                        <span>Amount to Pay:</span>
                        <span className="text-emerald-600 text-lg font-black">₱{orderReceipt.total_price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <QRCodeSVG 
                    value={orderReceipt.id} 
                    size={140}
                    level={"H"} 
                    includeMargin={false}
                    className="rounded-lg shadow-sm"
                  />
                  <p className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Scan for Admin Verification
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 text-left mb-6 border border-amber-100">
                  <Hash className="text-amber-600 shrink-0" size={18} />
                  <p className="text-[10px] font-bold text-amber-800 uppercase leading-tight tracking-wide">
                    Important: Take a screenshot of this receipt. The QR Code must be clear for the admin to verify your requisition and manual payment.
                  </p>
              </div>

              <button 
                onClick={onBack} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="mt-8 flex gap-3">
              <button type="button" disabled={step === 1 || loading} onClick={prevStep} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-xs">BACK</button>
              <button 
                type="button"
                onClick={step === 3 ? handleFinish : nextStep} 
                disabled={loading || (step === 1 && isStep1Disabled) || (step === 2 && !config.file)} 
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 text-xs"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : (
                  <span className="flex items-center justify-center gap-2">
                    {step === 3 ? 'PLACE REQUISITION' : 'CONTINUE'} 
                    {step === 3 ? <Check size={16}/> : <ArrowRight size={16}/>}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}