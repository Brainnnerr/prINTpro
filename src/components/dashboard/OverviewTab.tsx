import { Clock } from 'lucide-react';

interface Order {
  id: string;
  service_name: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface OverviewTabProps {
  orders: Order[];
  onViewAll: () => void;
  onStartOrder: () => void;
}

export default function OverviewTab({ orders, onViewAll, onStartOrder }: OverviewTabProps) {
  // Helper function to handle dynamic status coloring
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'printing':
        return 'bg-blue-500'; // Active work
      case 'ready for pickup':
      case 'in transit':
        return 'bg-emerald-500'; // Actionable/Ready for student
      case 'completed':
        return 'bg-slate-400'; // Finished transaction
      case 'pending':
      default:
        return 'bg-amber-400'; // Awaiting admin
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-900">Recent Projects</h2>
          <button onClick={onViewAll} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-4 font-black">Project</th>
                  <th className="px-8 py-4 font-black">Status</th>
                  <th className="px-8 py-4 font-black text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{order.service_name}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {/* Dynamic Dot Color */}
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                        <span className="text-xs font-bold capitalize text-slate-700">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">₱{Number(order.total_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <Clock className="text-slate-200 mx-auto mb-6" size={48} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Clean Slate</h3>
              <p className="text-slate-400 text-sm mb-8">You haven't placed any orders yet.</p>
              <button onClick={onStartOrder} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all">
                Start Printing
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}