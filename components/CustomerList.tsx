
import React, { useState } from 'react';
import { Search, User, Phone, Mail, ShoppingBag, Calendar, ArrowRight, Fingerprint, RotateCcw } from 'lucide-react';
import { Customer, SaleRecord, ReturnRecord } from '../types';

interface Props {
  customers: Customer[];
  sales: SaleRecord[];
  returns: ReturnRecord[];
}

const CustomerList: React.FC<Props> = ({ customers, sales, returns }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getCustomerSales = (id: string) => sales.filter(s => s.customer.id === id);
  const getCustomerReturns = (id: string) => returns.filter(r => r.customerId === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-1 flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Unique CID..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm flex-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
          <div className="divide-y divide-slate-50">
            {filteredCustomers.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Fingerprint size={48} strokeWidth={1} className="mb-4 opacity-30" />
                <p className="font-bold">No Records Matched</p>
              </div>
            ) : (
              filteredCustomers.map(c => {
                const customerSales = getCustomerSales(c.id);
                return (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full p-6 text-left hover:bg-slate-50 transition flex items-center justify-between group ${selectedCustomer?.id === c.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                  >
                    <div>
                      <div className="text-[10px] font-black text-indigo-500 font-mono tracking-widest uppercase mb-1">{c.id}</div>
                      <h4 className="font-black text-slate-900 group-hover:text-indigo-600 leading-tight">{c.name}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-1 flex items-center"><Phone size={12} className="mr-1" /> {c.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{customerSales.length} Visit(s)</div>
                      <ArrowRight size={16} className={`text-slate-300 transition-transform mt-2 ml-auto ${selectedCustomer?.id === c.id ? 'translate-x-1 text-indigo-500' : ''}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedCustomer ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-10 space-y-10 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                   <Fingerprint size={12} />
                   <span>Unique Identifier: {selectedCustomer.id}</span>
                </div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedCustomer.name}</h3>
                <div className="flex items-center space-x-6 text-slate-500 text-sm font-bold">
                  <span className="flex items-center space-x-2"><Phone size={16} className="text-slate-300" /> <span>{selectedCustomer.phone}</span></span>
                  {selectedCustomer.email && <span className="flex items-center space-x-2"><Mail size={16} className="text-slate-300" /> <span>{selectedCustomer.email}</span></span>}
                </div>
              </div>
              <div className="bg-slate-900 text-white px-8 py-6 rounded-3xl text-center shadow-lg">
                <div className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Lifetime Value</div>
                <div className="text-3xl font-black text-emerald-400 tracking-tighter">
                  ${(
                    getCustomerSales(selectedCustomer.id).reduce((acc, s) => acc + s.totalAmount, 0) - 
                    getCustomerReturns(selectedCustomer.id).reduce((acc, r) => acc + r.refundAmount, 0)
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center space-x-2">
                  <ShoppingBag size={14} className="text-emerald-500" />
                  <span>Recent Sales</span>
                </h4>
                <div className="space-y-3">
                  {getCustomerSales(selectedCustomer.id).slice(0, 5).map(sale => (
                    <div key={sale.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{sale.items[0].name} {sale.items.length > 1 ? `+ ${sale.items.length - 1} more` : ''}</div>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center mt-1"><Calendar size={10} className="mr-1" /> {new Date(sale.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">${sale.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {getCustomerSales(selectedCustomer.id).length === 0 && <p className="text-slate-400 italic text-sm">No sales history.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center space-x-2">
                  <RotateCcw size={14} className="text-amber-500" />
                  <span>Return Log</span>
                </h4>
                <div className="space-y-3">
                  {getCustomerReturns(selectedCustomer.id).slice(0, 5).map(ret => (
                    <div key={ret.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-amber-900 text-sm">Return Processed</div>
                        <div className="text-[10px] text-amber-600 font-bold flex items-center mt-1"><Calendar size={10} className="mr-1" /> {new Date(ret.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-amber-700">-${ret.refundAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {getCustomerReturns(selectedCustomer.id).length === 0 && <p className="text-slate-400 italic text-sm">No return records.</p>}
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center italic">
              Record created on {new Date(selectedCustomer.createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
            <Fingerprint size={80} strokeWidth={1} className="mb-6 opacity-30" />
            <p className="font-bold text-lg">Select Profile to View Identification Records</p>
            <p className="text-sm">Comprehensive audit of sales and returns per Customer ID.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
