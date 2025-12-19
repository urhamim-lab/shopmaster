
import React, { useState } from 'react';
import { History, Search, FileText, ChevronRight, User, Calendar, ShieldCheck } from 'lucide-react';
import { SaleRecord, UserRole } from '../types';

interface Props {
  sales: SaleRecord[];
  onViewReceipt: (sale: SaleRecord) => void;
  role: UserRole;
}

const SalesLog: React.FC<Props> = ({ sales, onViewReceipt, role }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Invoice No, CID, or Customer Name..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Fix: Changed invalid 'CASHIER' comparison to 'CLIENT' as 'CASHIER' is not a valid UserRole */}
        {role === 'CLIENT' && (
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center space-x-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition">
             <FileText size={18} />
             <span>Export Tax Audit (CSV)</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Invoice</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 mb-1">{sale.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center"><Calendar size={12} className="mr-1"/> {new Date(sale.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500"><User size={16} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{sale.customer.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-tighter">{sale.customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className="text-lg font-black text-slate-900">${sale.totalAmount.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Paid / Settlement</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sale.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${sale.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                      <span>{sale.status}</span>
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button 
                      onClick={() => onViewReceipt(sale)}
                      className="p-3 bg-white border border-slate-100 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all shadow-sm"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-24 text-center">
              <History className="mx-auto text-slate-100 mb-6" size={80} strokeWidth={1} />
              <p className="text-slate-400 font-bold text-lg">Digital Archive Empty</p>
              <p className="text-slate-400 text-sm">Waiting for first terminal settlement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesLog;
