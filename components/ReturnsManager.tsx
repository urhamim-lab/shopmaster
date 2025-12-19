
import React, { useState, useMemo, useEffect } from 'react';
import { Search, RotateCcw, Fingerprint, ChevronRight, ShoppingBag, Calendar, AlertTriangle, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Customer, SaleRecord, SaleItem, UserRole, AIDraft } from '../types';

interface Props {
  customers: Customer[];
  sales: SaleRecord[];
  onReturn: (saleId: string, customerId: string, items: SaleItem[]) => void;
  role: UserRole;
  draft: AIDraft | null;
  onCancelDraft: () => void;
}

const ReturnsManager: React.FC<Props> = ({ customers, sales, onReturn, role, draft, onCancelDraft }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [returnItems, setReturnItems] = useState<{itemId: string, qty: number}[]>([]);

  useEffect(() => {
    if (draft && draft.intent === 'RETURN') {
      if (draft.customerId) {
        const cust = customers.find(c => c.id === draft.customerId);
        if (cust) setSelectedCustomer(cust);
      } else if (draft.customerName) {
        const cust = customers.find(c => c.name.toLowerCase().includes(draft.customerName!.toLowerCase()));
        if (cust) setSelectedCustomer(cust);
      }
      
      // Auto-populate quantity if product mentioned
      if (draft.productName && selectedSale) {
        const item = selectedSale.items.find(i => i.name.toLowerCase().includes(draft.productName!.toLowerCase()));
        if (item && draft.quantity) {
          updateQty(item.productId, item.quantity - item.returnedQuantity, draft.quantity);
        }
      }
    }
  }, [draft, customers, selectedSale]);

  const matchingCustomers = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.phone.includes(searchQuery) ||
      c.name.toLowerCase().includes(q)
    );
  }, [searchQuery, customers]);

  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(s => s.customer.id === selectedCustomer.id);
  }, [selectedCustomer, sales]);

  const handleConfirmReturn = () => {
    if (!selectedSale || !selectedCustomer || returnItems.length === 0) return;
    
    const formattedItems = returnItems.map(ri => {
      const original = selectedSale.items.find(i => i.productId === ri.itemId);
      return {
        ...original!,
        quantity: ri.qty,
        total: original!.price * ri.qty
      };
    });

    onReturn(selectedSale.id, selectedCustomer.id, formattedItems);
    reset();
  };

  const reset = () => {
    setSelectedCustomer(null);
    setSelectedSale(null);
    setReturnItems([]);
    setSearchQuery('');
  };

  const updateQty = (itemId: string, maxReturnable: number, targetQty: number) => {
    const nextReturnInput = Math.max(0, Math.min(maxReturnable, targetQty));
    setReturnItems(prev => {
      const filtered = prev.filter(i => i.itemId !== itemId);
      return nextReturnInput === 0 ? filtered : [...filtered, { itemId, qty: nextReturnInput }];
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 relative">
      {draft && (
        <div className="bg-amber-500 py-3 px-10 rounded-[2rem] flex items-center justify-between text-white font-black text-xs uppercase tracking-widest mb-6 animate-in slide-in-from-top-4">
          <span className="flex items-center"><Sparkles size={16} className="mr-2"/> AI Auto-Fill Active - Verify and Confirm</span>
          <button onClick={onCancelDraft} className="bg-white/20 px-3 py-1 rounded-lg">Clear</button>
        </div>
      )}

      {!selectedCustomer ? (
        <div className="max-w-3xl mx-auto space-y-10 py-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Return Authorization</h2>
            <p className="text-slate-500 font-medium">Scan ID or search to find orders eligible for return.</p>
          </div>

          <div className={`relative group ${draft && (draft.customerId || draft.customerName) ? 'ring-2 ring-amber-300 rounded-[3rem]' : ''}`}>
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
            <input 
              autoFocus
              type="text" 
              placeholder="Enter Customer ID or Name..." 
              className={`w-full pl-20 pr-8 py-8 bg-white border-2 rounded-[3rem] shadow-2xl text-2xl font-black text-slate-900 focus:border-amber-500 outline-none transition ${draft && (draft.customerId || draft.customerName) ? 'border-amber-400' : 'border-slate-100'}`}
              value={searchQuery || (draft?.customerName || '')}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchingCustomers.map(c => (
              <button 
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-amber-400 hover:bg-amber-50/30 transition-all shadow-sm group"
              >
                <div className="flex items-center space-x-5">
                  <div className="bg-slate-100 p-4 rounded-2xl text-slate-500 group-hover:bg-white group-hover:text-amber-600 transition shadow-sm"><Fingerprint size={28} /></div>
                  <div className="text-left">
                    <div className="font-black text-slate-900">{c.name}</div>
                    <div className="text-xs font-mono font-black text-slate-400 uppercase">{c.id}</div>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-amber-600 transition" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-6">
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center space-x-2 bg-amber-500/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-300">
                     <ShieldCheck size={14} />
                     <span>Verified: {selectedCustomer.id}</span>
                  </div>
                  <div>
                     <h3 className="text-3xl font-black tracking-tight">{selectedCustomer.name}</h3>
                     <p className="text-slate-400 font-bold text-sm mt-2">{customerSales.length} Historical Invoices</p>
                  </div>
                  <button onClick={reset} className="text-xs font-black text-amber-400 hover:text-white transition uppercase underline underline-offset-8">Change Identity</button>
               </div>
            </div>

            {returnItems.length > 0 && (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 animate-in zoom-in-95">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Refund Total</h4>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    ৳{returnItems.reduce((acc, ri) => {
                      const item = selectedSale?.items.find(i => i.productId === ri.itemId);
                      return acc + (item?.price || 0) * ri.qty;
                    }, 0).toFixed(2)}
                  </div>
                </div>
                <button 
                  onClick={handleConfirmReturn}
                  className="w-full py-5 bg-amber-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-amber-200 hover:bg-amber-700 transition"
                >
                  <RotateCcw size={24} className="inline mr-3"/>
                  Authorize Refund
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-8">
            {!selectedSale ? (
              <div className="grid gap-6">
                {customerSales.map(sale => (
                  <button 
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex justify-between items-center group text-left"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition"><ShoppingBag size={24} /></div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase mb-1 tracking-widest">{sale.id}</p>
                        <h5 className="text-xl font-black text-slate-900">৳{sale.totalAmount.toFixed(2)}</h5>
                        <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sale.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{sale.status}</div>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-amber-600 transition" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Invoiced Items</p>
                     <h5 className="font-black text-slate-900">{selectedSale.id}</h5>
                   </div>
                   <button onClick={() => setSelectedSale(null)} className="text-xs font-black text-amber-600 hover:underline">Change Invoice</button>
                </div>
                <div className="p-10 divide-y divide-slate-100">
                   {selectedSale.items.map(item => {
                     const maxReturnable = item.quantity - item.returnedQuantity;
                     const currentReturnInput = returnItems.find(i => i.itemId === item.productId)?.qty || 0;
                     const isNonReturnable = maxReturnable <= 0;

                     return (
                       <div key={item.productId} className={`py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 first:pt-0 last:pb-0 ${isNonReturnable ? 'opacity-50' : ''}`}>
                         <div className="flex-1">
                           <h6 className="font-black text-slate-900 text-lg">{item.name}</h6>
                           <p className="text-[10px] font-black text-slate-400 uppercase">{item.quantity} bought | {item.returnedQuantity} already returned</p>
                         </div>
                         <div className="flex items-center space-x-6">
                            {!isNonReturnable && (
                               <div className={`bg-white p-2 rounded-2xl flex items-center border shadow-sm ${draft && draft.productName?.toLowerCase().includes(item.name.toLowerCase()) ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                                  <button onClick={() => updateQty(item.productId, maxReturnable, currentReturnInput - 1)} className="w-10 h-10 bg-slate-50 rounded-xl text-lg font-black text-slate-400 hover:text-slate-900 transition">-</button>
                                  <span className="w-16 text-center font-black text-xl text-slate-900">{currentReturnInput}</span>
                                  <button onClick={() => updateQty(item.productId, maxReturnable, currentReturnInput + 1)} className="w-10 h-10 bg-slate-50 rounded-xl text-lg font-black text-slate-400 hover:text-slate-900 transition">+</button>
                               </div>
                            )}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsManager;
