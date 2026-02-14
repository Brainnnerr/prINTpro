
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, CheckCircle2, FileType, ChevronLeft, Loader2, Palette, MessageSquare, Droplets, BookOpen, Layers, RectangleVertical, RectangleHorizontal, User, Truck, ShieldCheck, Calendar as CalendarIcon, MapPin, Sparkles, AlertCircle, ArrowRight, Tag, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { SERVICES } from '../constants';
import { Service, PaperType, Order, InventoryItem, User as UserType } from '../types';
import { FileUpload } from './FileUpload';

interface OrderWizardProps {
  preSelectedService: Service | null;
  initialData?: Order | null;
  inventory: InventoryItem[];
  currentUser: UserType | null;
  onCancel: () => void;
  onSubmit: (order: Order) => void;
  onRequireAuth: (service: Service) => void;
}

type PaymentMethod = 'gcash' | 'grabpay' | 'maya' | 'card';

export const OrderWizard: React.FC<OrderWizardProps> = ({ preSelectedService, initialData, inventory, currentUser, onCancel, onSubmit, onRequireAuth }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Inventory Filtering
  const paperOptions = useMemo(() => {
    return inventory.filter(item => 
      (item.unit.toLowerCase().includes('sheet') || 
       item.name.toLowerCase().includes('paper') || 
       item.name.toLowerCase().includes('card') || 
       item.name.toLowerCase().includes('vinyl'))
    );
  }, [inventory]);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preSelectedService?.id || '');
  const [paperType, setPaperType] = useState<PaperType>(paperOptions[0]?.name || 'Standard Paper');
  const [quantity, setQuantity] = useState<number>(50);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Customization State
  const [printColor, setPrintColor] = useState<'Color' | 'B&W'>('Color');
  const [printSides, setPrintSides] = useState<'Single-Sided' | 'Double-Sided'>('Single-Sided');
  const [orientation, setOrientation] = useState<'Portrait' | 'Landscape'>('Portrait');
  const [notes, setNotes] = useState<string>('');

  // Guest/Shipping State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Paymongo State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');

  // Derived Logic
  const activeService = useMemo(() => SERVICES.find(s => s.id === selectedServiceId), [selectedServiceId]);
  
  // Calculate Discounts & Total
  const pricing = useMemo(() => {
    if (!activeService) return { total: 0, base: 0, discountRate: 0, discountAmount: 0 };
    
    let base = activeService.basePrice * quantity;
    
    // Spec Multipliers
    if (paperType.toLowerCase().includes('premium') || paperType.toLowerCase().includes('cardstock')) base *= 1.5; 
    else if (paperType.toLowerCase().includes('glossy')) base *= 1.2; 

    if (printColor === 'B&W') base *= 0.8;
    if (printSides === 'Double-Sided') base *= 1.5;

    // Volume Discount Logic
    let discountRate = 0;
    if (quantity >= 500) discountRate = 0.15;      // 15% off
    else if (quantity >= 200) discountRate = 0.10; // 10% off
    else if (quantity >= 50) discountRate = 0.05;  // 5% off

    const discountAmount = base * discountRate;
    const total = base - discountAmount;

    return { total, base, discountRate, discountAmount };
  }, [activeService, quantity, paperType, printColor, printSides]);

  // Effects
  useEffect(() => {
    if (!preSelectedService && !selectedServiceId) {
      setSelectedServiceId(SERVICES[0].id);
    }
  }, [preSelectedService, selectedServiceId]);

  // Sync prop changes (e.g. after login)
  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
    }
  }, [preSelectedService]);

  // Hydrate form from Initial Data (Re-order)
  useEffect(() => {
    if (initialData) {
        setQuantity(initialData.quantity);
        setPaperType(initialData.paperType);
        setPrintColor(initialData.printColor);
        setPrintSides(initialData.printSides);
        setOrientation(initialData.orientation);
        setNotes(initialData.notes);
        // Note: We deliberately do not carry over the File or Payment info for security/freshness
    }
  }, [initialData]);

  useEffect(() => {
    if (paperOptions.length > 0 && !paperOptions.find(p => p.name === paperType)) {
      setPaperType(paperOptions[0].name);
    }
  }, [paperOptions, paperType]);

  // Handlers
  const handleServiceSelect = (service: Service) => {
    if (service.tier === 'Premium' && !currentUser) {
        onRequireAuth(service);
    } else {
        setSelectedServiceId(service.id);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedServiceId) return;
    if (step === 2 && !uploadedFile) return;
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    if (!address || !city || !zipCode) {
       alert("Please fill in all shipping details.");
       return;
    }
    setLoading(true);
    
    // Simulate Paymongo Redirect / Processing
    setTimeout(() => {
      const newOrder: Order = {
        id: `ord-${Math.floor(Math.random() * 10000)}`,
        serviceId: activeService!.id,
        serviceName: activeService!.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        quantity,
        paperType,
        printColor,
        printSides,
        orientation,
        notes,
        totalPrice: pricing.total,
        fileName: uploadedFile!.name,
        customerName: currentUser ? currentUser.name : guestName,
        customerEmail: currentUser ? currentUser.email : guestEmail,
      };
      onSubmit(newOrder);
      setLoading(false);
    }, 2500); // Slightly longer delay to simulate "Redirecting to Paymongo..."
  };

  // --- UI Components ---

  const SelectionCard = ({ 
    selected, 
    onClick, 
    title, 
    description, 
    icon: Icon,
    badge 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    title: string; 
    description?: string; 
    icon?: React.ElementType;
    badge?: string;
  }) => (
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 hover:shadow-md ${
        selected 
          ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600' 
          : 'border-slate-100 bg-white hover:border-teal-200'
      }`}
    >
      {Icon && (
        <div className={`p-2 rounded-lg ${selected ? 'bg-teal-200 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
           <h4 className={`font-bold text-sm ${selected ? 'text-teal-900' : 'text-slate-800'}`}>{title}</h4>
           {selected && <CheckCircle2 size={18} className="text-teal-600" />}
        </div>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full border border-amber-200 shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );

  const ProgressHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
         <span>Step {step} of 4</span>
         <span className="text-teal-600">{
             step === 1 ? 'Configuration' : step === 2 ? 'Upload & Settings' : step === 3 ? 'Review' : 'Payment'
         }</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
         <div className="h-full bg-teal-600 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-2 lg:px-8 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">
                {initialData ? 'Re-order Items' : 'Start New Order'}
            </h1>
            <p className="text-slate-500 text-sm">
                {initialData ? 'Review details and re-upload artwork' : 'Customize your print job specifications'}
            </p>
         </div>
         <button onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel Order
         </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: FORM */}
        <div className="flex-1 w-full">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
              <ProgressHeader />

              {/* Step 1: Configuration */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* Service Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Select Service</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SERVICES.map(s => (
                        <SelectionCard 
                          key={s.id}
                          selected={selectedServiceId === s.id}
                          onClick={() => handleServiceSelect(s)}
                          title={s.name}
                          description={`Starting at ₱${s.basePrice.toFixed(2)} / unit`}
                          badge={s.tier === 'Premium' ? 'Premium' : undefined}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Paper Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Paper Material</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {paperOptions.map(item => (
                         <SelectionCard
                           key={item.id}
                           selected={paperType === item.name}
                           onClick={() => setPaperType(item.name)}
                           title={item.name}
                           description={item.quantity <= item.threshold ? 'Low Stock - Order Soon' : 'In Stock'}
                           badge={item.name.toLowerCase().includes('premium') ? 'Premium' : undefined}
                         />
                       ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Quantity</label>
                        {pricing.discountRate > 0 && (
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Tag size={10} /> {pricing.discountRate * 100}% Bulk Saving Applied
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" 
                         min="1" 
                         max="1000" 
                         value={quantity} 
                         onChange={e => setQuantity(parseInt(e.target.value))}
                         className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                       />
                       <div className="relative">
                          <input 
                            type="number" 
                            min="1" 
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-24 p-2 text-center font-bold text-lg border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none"
                          />
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">units</span>
                       </div>
                    </div>
                    {/* Bulk Pricing Indicators */}
                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                        <span className={quantity >= 50 ? 'text-teal-600 font-bold' : ''}>50+ (5% off)</span>
                        <span className={quantity >= 200 ? 'text-teal-600 font-bold' : ''}>200+ (10% off)</span>
                        <span className={quantity >= 500 ? 'text-teal-600 font-bold' : ''}>500+ (15% off)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Customization */}
              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {initialData ? 'Re-upload Artwork' : 'Upload Artwork'}
                    </label>
                    {initialData && !uploadedFile && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mb-2 flex items-center gap-2">
                            <AlertCircle size={14} /> For security, please re-upload your file for this new order.
                        </div>
                    )}
                    <FileUpload onFileSelect={setUploadedFile} currentFile={uploadedFile} />
                  </div>

                  {/* Print Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Color Mode</label>
                        <div className="grid grid-cols-2 gap-3">
                            <SelectionCard selected={printColor === 'Color'} onClick={() => setPrintColor('Color')} title="Color" icon={Palette} />
                            <SelectionCard selected={printColor === 'B&W'} onClick={() => setPrintColor('B&W')} title="B&W" icon={Droplets} />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Sides</label>
                        <div className="grid grid-cols-2 gap-3">
                            <SelectionCard selected={printSides === 'Single-Sided'} onClick={() => setPrintSides('Single-Sided')} title="Single" icon={Layers} />
                            <SelectionCard selected={printSides === 'Double-Sided'} onClick={() => setPrintSides('Double-Sided')} title="Double" icon={BookOpen} />
                        </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Layout</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <SelectionCard selected={orientation === 'Portrait'} onClick={() => setOrientation('Portrait')} title="Portrait" icon={RectangleVertical} />
                            <SelectionCard selected={orientation === 'Landscape'} onClick={() => setOrientation('Landscape')} title="Landscape" icon={RectangleHorizontal} />
                        </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Instructions</label>
                        <textarea 
                           className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none h-24 bg-slate-50 focus:bg-white transition-colors"
                           placeholder="Any special requests? (e.g. trim marks, bleed area...)"
                           value={notes}
                           onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && activeService && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                     {!currentUser && (
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                           <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-4">
                              <User size={18} /> Guest Checkout
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Full Name</label>
                                 <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" placeholder="Jane Doe" />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Email</label>
                                 <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white" placeholder="jane@example.com" />
                              </div>
                           </div>
                        </div>
                     )}
                     
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Order Specification</h4>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="text-slate-500">Service</div>
                            <div className="font-semibold text-slate-900 text-right">{activeService.name}</div>
                            
                            <div className="text-slate-500">Paper Stock</div>
                            <div className="font-semibold text-slate-900 text-right">{paperType}</div>

                            <div className="text-slate-500">Quantity</div>
                            <div className="font-semibold text-slate-900 text-right">{quantity} units</div>

                            <div className="text-slate-500">Print Options</div>
                            <div className="font-semibold text-slate-900 text-right">{printColor}, {orientation}, {printSides}</div>
                        </div>
                     </div>
                 </div>
              )}

              {/* Step 4: Paymongo Payment */}
              {step === 4 && (
                 <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                           <Truck className="text-teal-600" /> Shipping Address
                        </h3>
                        <div className="space-y-4">
                           <input 
                              type="text" 
                              placeholder="Street Address" 
                              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                           />
                           <div className="grid grid-cols-2 gap-4">
                              <input 
                                 type="text" 
                                 placeholder="City" 
                                 className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                 value={city}
                                 onChange={e => setCity(e.target.value)}
                              />
                              <input 
                                 type="text" 
                                 placeholder="ZIP Code" 
                                 className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                 value={zipCode}
                                 onChange={e => setZipCode(e.target.value)}
                              />
                           </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="text-teal-600" /> Secure Payment via Paymongo
                            </h3>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Encrypted</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SelectionCard 
                                selected={paymentMethod === 'gcash'} 
                                onClick={() => setPaymentMethod('gcash')} 
                                title="GCash" 
                                description="Pay securely via GCash"
                                icon={Smartphone}
                             />
                             <SelectionCard 
                                selected={paymentMethod === 'grabpay'} 
                                onClick={() => setPaymentMethod('grabpay')} 
                                title="GrabPay" 
                                description="Pay securely via GrabPay"
                                icon={Wallet}
                             />
                             <SelectionCard 
                                selected={paymentMethod === 'maya'} 
                                onClick={() => setPaymentMethod('maya')} 
                                title="Maya" 
                                description="Pay securely via Maya Wallet"
                                icon={Smartphone}
                             />
                             <SelectionCard 
                                selected={paymentMethod === 'card'} 
                                onClick={() => setPaymentMethod('card')} 
                                title="Credit/Debit Card" 
                                description="Visa / Mastercard"
                                icon={CreditCard}
                             />
                        </div>

                        <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100 flex gap-3 text-sm text-teal-800">
                            <ShieldCheck className="flex-shrink-0" size={20} />
                            <p>You will be redirected to Paymongo to complete your secure payment. No card details are stored on our servers.</p>
                        </div>
                    </div>
                 </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
                  <button 
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                       step === 1 ? 'invisible' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                     <ChevronLeft size={20} /> Back
                  </button>

                  {step < 4 ? (
                    <button 
                      onClick={handleNext}
                      disabled={(!selectedServiceId && step === 1) || (!uploadedFile && step === 2) || (step === 3 && (!currentUser && (!guestName || !guestEmail)))}
                      className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-200 disabled:shadow-none"
                    >
                       {step === 3 ? 'Proceed to Payment' : 'Next Step'} <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-200 transition-all shadow-lg shadow-green-200 w-full md:w-auto justify-center"
                    >
                       {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                       {loading ? 'Redirecting...' : `Pay ₱${pricing.total.toFixed(2)}`}
                    </button>
                  )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: STICKY SUMMARY */}
        <div className="w-full lg:w-96 flex-shrink-0 sticky top-24">
           <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl overflow-hidden relative">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
              
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                 <Sparkles size={18} className="text-yellow-400" /> Live Estimate
              </h3>
              
              <div className="space-y-4 relative z-10">
                 {activeService ? (
                    <>
                       <div className="flex justify-between items-start text-sm pb-4 border-b border-slate-700">
                          <span className="text-slate-400">Service</span>
                          <span className="font-semibold text-right max-w-[150px]">{activeService.name}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-700">
                          <span className="text-slate-400">Unit Price</span>
                          <span className="font-semibold">₱{activeService.basePrice.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-700">
                          <span className="text-slate-400">Quantity</span>
                          <span className="font-semibold">x {quantity}</span>
                       </div>
                       
                       {/* Modifiers Visualization */}
                       <div className="space-y-2 text-xs text-slate-400 pt-2">
                          <div className="flex justify-between">
                            <span>Paper ({paperType.split(' ')[0]})</span>
                            <span>{paperType.toLowerCase().includes('premium') ? '+50%' : 'Standard'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Color Mode</span>
                            <span>{printColor === 'Color' ? 'Standard' : '-20%'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sides</span>
                            <span>{printSides === 'Double-Sided' ? '+50%' : 'Standard'}</span>
                          </div>
                          {pricing.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-400 font-bold">
                                <span>Bulk Discount</span>
                                <span>-₱{pricing.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                       </div>
                    </>
                 ) : (
                    <div className="text-center py-8 text-slate-500">
                       <AlertCircle className="mx-auto mb-2 opacity-50" />
                       <p className="text-sm">Select a service to see pricing</p>
                    </div>
                 )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700 relative z-10">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-sm font-medium">Estimated Total</span>
                    <span className="text-3xl font-bold tracking-tight">₱{pricing.total.toFixed(2)}</span>
                 </div>
                 {activeService?.tier === 'Premium' && (
                    <div className="mt-4 bg-teal-900/50 border border-teal-700/50 rounded-lg p-3 flex items-center gap-2 text-xs text-teal-300">
                       <Sparkles size={12} />
                       Premium Service Handling Included
                    </div>
                 )}
              </div>
           </div>

           {/* File Preview Card (Only Step 2+) */}
           {step >= 2 && uploadedFile && (
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 p-4 animate-in slide-in-from-bottom-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">File Attached</h4>
                 <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center text-teal-600">
                       <FileType size={20} />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-sm font-bold text-slate-800 truncate">{uploadedFile.name}</p>
                       <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
