import { TrendingUp, Store, Truck, Clock, Calendar, ChevronRight, AlertCircle, ClipboardList, User } from 'lucide-react';

interface OverviewProps {
  orders: any[];
  onViewQueue: () => void;
}

export default function Overview({ orders, onViewQueue }: OverviewProps) {
  // 1. ROBUST DATE MATCHING
  // Generates "YYYY-MM-DD" based on the user's local timezone (e.g., "2026-03-03")
  const todayDateStr = new Date().toLocaleDateString('en-CA'); 

  // 2. Filter using date objects to avoid timezone mismatches
  // Converts each record's created_at into the same "YYYY-MM-DD" format before checking match
  const todaysOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at).toLocaleDateString('en-CA');
    return orderDate === todayDateStr && !o.is_manual;
  });
  
  const completedPickupsToday = todaysOrders.filter(o => o.status === 'Completed' && o.fulfillment === 'pickup').length;
  const completedDeliveriesToday = todaysOrders.filter(o => o.status === 'Completed' && o.fulfillment === 'delivery').length;
  const pendingToday = todaysOrders.filter(o => o.status === 'pending').length;

  // 3. Today's Pending Feed (Online Orders only)
  const pendingSubmissions = todaysOrders
    .filter(o => o.status === 'pending') 
    .slice(0, 5);

  // 4. Daily History Logic (Calculates total volume/revenue for all days)
  const dailyHistory = orders.reduce((acc: any, order) => {
    const date = new Date(order.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = { 
        date, 
        count: 0, 
        revenue: 0, 
        lastCustomer: order.customer_name, 
        lastService: order.service_name
      };
    }
    acc[date].count += 1;
    acc[date].revenue += Number(order.total_price || 0);
    return acc;
  }, {});

  const historyArray = Object.values(dailyHistory).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
            <Calendar size={20} className="text-emerald-500"/> Daily Monitor
          </h3>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Local Time</span>
             <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
               {new Date().toDateString()}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MonitorCard label="Today's Volume" value={todaysOrders.length} sub="Online Submissions" icon={<TrendingUp size={16}/>} color="emerald" />
          <MonitorCard label="Daily Pickups" value={completedPickupsToday} sub="Completed today" icon={<Store size={16}/>} color="blue" />
          <MonitorCard label="Daily Delivered" value={completedDeliveriesToday} sub="Completed today" icon={<Truck size={16}/>} color="purple" />
          <MonitorCard label="Today's Pending" value={pendingToday} sub="Awaiting action" icon={<Clock size={16}/>} color="amber" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Pending Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} className="text-emerald-500"/> Today's Pending Feed
            </h3>
            <button onClick={onViewQueue} className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
              Full Queue <ChevronRight size={14}/>
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-700">{order.customer_name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{order.service_name} • {order.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-emerald-600">₱{Number(order.total_price).toFixed(2)}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <p className="text-xs font-bold uppercase tracking-widest">No New Orders Yet for Today</p>
              </div>
            )}
          </div>
        </div>

        {/* History Summary */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest">History Summary</h3>
          </div>
          <div className="p-4 space-y-3">
            {historyArray.length > 0 ? (
              historyArray.map((day: any) => (
                <div key={day.date} className="p-3 border border-slate-100 rounded-lg bg-slate-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{day.date}</p>
                    <p className="text-xs font-black text-emerald-600">₱{day.revenue.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                      <User size={10} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-600 truncate">Latest: {day.lastCustomer}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-medium">{day.lastService}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <ClipboardList className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No History Yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorCard({ label, value, sub, icon, color }: any) {
  const themes: any = {
    emerald: 'text-emerald-600 border-emerald-100 bg-emerald-50/50',
    blue: 'text-blue-600 border-blue-100 bg-blue-50/50',
    purple: 'text-purple-600 border-purple-100 bg-purple-50/50',
    amber: 'text-amber-600 border-amber-100 bg-amber-50/50'
  };
  return (
    <div className={`p-5 rounded-xl border ${themes[color]} transition-all shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-medium opacity-60 mt-1">{sub}</p>
    </div>
  );
}