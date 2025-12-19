
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, User, X, CheckCircle2, UserPlus, Fingerprint, Sparkles, AlertCircle } from 'lucide-react';
import { Product, SaleItem, Customer, AIDraft } from '../types';

interface Props {
  inventory: Product[];
  customers: Customer[];
  onCompleteSale: (items: SaleItem[], customer: Customer) => void;
  registerCustomer: (data: Partial<Customer>) => Customer;
  draft: AIDraft | null;
  onCancelDraft: () => void;
}

const POS: React.FC<Props> = ({ inventory, customers, onCompleteSale, registerCustomer, draft, onCancelDraft }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState<Product | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [qty, setQty] = useState(1);
  
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '', phone: '', email: '', address: ''
  });

  useEffect(() => {
    if (draft && draft.intent === 'SALE') {
      if (draft.productId) {
        const item = inventory.find(i => i.id === draft.productId);
        if (item) setActiveItem(item);
      } else if (draft.productName) {
        const item = inventory.find(i => i.name.toLowerCase().includes(draft.productName!.toLowerCase()));
        if (item) setActiveItem(item);
      }
      
      if (draft.quantity) setQty(draft.quantity);
      if (draft.customerId) setCustSearch(draft.customerId);
      else if (draft.customerName) {
        setCustSearch(draft.customerName);
        setCustomerForm(f => ({ ...f, name: draft.customerName }));
      }
    }
  }, [draft, inventory]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return inventory.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 12);
  }, [inventory, searchTerm]);

  const matchingCustomers = useMemo(() => {
    if (!custSearch) return [];
    const q = custSearch.toLowerCase();
    return customers.filter(c => c.id.toLowerCase().includes(q) || c.phone.includes(q) || c.name.toLowerCase().includes(q));
  }, [custSearch, customers]);

  const handleCheckout = (selectedCustomer?: Customer) => {
    if (!activeItem) return;
    
    let finalCustomer: Customer;
    if (selectedCustomer) {
      finalCustomer = selectedCustomer;
    } else {
      finalCustomer = registerCustomer(customerForm);
    }

    const saleItems: SaleItem[] = [{
      productId: activeItem.id,
      name: activeItem.name,
      quantity: qty,
      returnedQuantity: 0,
      price: activeItem.price,
      total: activeItem.price * qty,
      unit: activeItem.unit
    }];

    onCompleteSale(saleItems, finalCustomer);
    setActiveItem(null);
    setCustSearch('');
    setIsNewCustomer(false);
    setCustomerForm({ name: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="h-full flex flex-col space-y-8 max-w-7xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors" size={26} />
        <input 
          type="text" 
          placeholder="Search items or scan barcode..." 
          className="w-full pl-18 pr-6 py-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl text-xl font-bold focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map(prod => (
          <button 
            key={prod.id}
            onClick={() => { setActiveItem(prod); setQty(1); setIsNewCustomer(false); }}
            className={`p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm text-left transition-all transform hover:scale-[1.03] hover:shadow-2xl hover:border-emerald-200 relative group overflow-hidden ${prod.stock <= 0 ? 'opacity-40 grayscale' : ''}`}
            disabled={prod.stock <= 0}
          >
            <div className="text-[10px] text-emerald-500 font-black uppercase mb-3 tracking-widest">{prod.category}</div>
            <div className="font-black text-slate-900 mb-6 h-12 line-clamp-2 text-xl tracking-tight">{prod.name}</div>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">৳{prod.price.toFixed(2)}</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${prod.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{prod.stock} {prod.unit} left</span>
            </div>
            {prod.stock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <span className="bg-red-600 text-white text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-xl">OUT OF STOCK</span>
              </div>
            )}
          </button>
        ))}
        {inventory.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-bold text-lg">Inventory is currently empty.</p>
             <p className="text-slate-400">Add products manually or use the Smart Terminal to record purchases.</p>
          </div>
        )}
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row relative">
            {draft && (
              <div className="absolute top-0 left-0 w-full bg-emerald-600 py-2 px-12 flex items-center justify-between text-white font-black text-[10px] uppercase tracking-widest z-20">
                <span className="flex items-center"><Sparkles size={12} className="mr-2"/> AI Draft Prepared</span>
                <button onClick={onCancelDraft} className="hover:underline">Clear Draft</button>
              </div>
            )}

            <div className="md:w-1/3 bg-slate-50 p-12 border-r border-slate-100 flex flex-col justify-between pt-16">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Checkout Details</h3>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-4">{activeItem.name}</h4>
                <div className="flex flex-col space-y-4 pt-8 border-t border-slate-200">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Adjust Quantity</span>
                  <div className={`flex items-center space-x-6 bg-white p-2 rounded-3xl border shadow-sm w-fit ${draft && draft.quantity ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-100'}`}>
                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 rounded-2xl bg-slate-50 text-2xl font-black text-slate-400 hover:text-emerald-600 transition">-</button>
                    <span className="text-2xl font-black text-slate-900 w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(activeItem.stock, qty+1))} className="w-12 h-12 rounded-2xl bg-slate-50 text-2xl font-black text-slate-400 hover:text-emerald-600 transition">+</button>
                  </div>
                </div>
              </div>
              <div className="pt-10 border-t-2 border-dashed border-slate-200">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Order Total</p>
                 <p className="text-5xl font-black text-emerald-600 tracking-tighter">৳{(activeItem.price * qty).toFixed(2)}</p>
              </div>
            </div>

            <div className="md:w-2/3 p-16 relative bg-white pt-24">
              <button onClick={() => setActiveItem(null)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition"><X size={26}/></button>
              <div className="max-w-md">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Customer Identification</h2>
                  <p className="text-slate-500 font-medium">Verify or create a profile to finish the sale.</p>
                </div>

                {!isNewCustomer ? (
                  <div className="space-y-8">
                    <div className={`relative group ${draft && (draft.customerId || draft.customerName) ? 'ring-2 ring-emerald-100' : ''}`}>
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                      <input 
                        type="text" 
                        placeholder="Search by Name or Phone..." 
                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-3xl focus:border-emerald-500 outline-none transition font-bold ${draft && (draft.customerId || draft.customerName) ? 'border-emerald-300' : 'border-slate-100'}`}
                        value={custSearch}
                        onChange={(e) => setCustSearch(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {matchingCustomers.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => handleCheckout(c)}
                          className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm"
                        >
                          <div className="flex items-center space-x-5">
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Fingerprint size={22} /></div>
                            <div className="text-left">
                              <p className="font-black text-slate-900">{c.name}</p>
                              <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{c.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-bold text-slate-900">{c.phone}</p>
                             <p className="text-[9px] font-black text-emerald-500 uppercase">Select</p>
                          </div>
                        </button>
                      ))}
                      {custSearch && matchingCustomers.length === 0 && (
                        <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                           <p className="text-slate-400 font-bold mb-4">No profile for "{custSearch}" found.</p>
                           <button onClick={() => { setIsNewCustomer(true); setCustomerForm({...customerForm, name: custSearch})}} className="text-emerald-600 font-black text-sm hover:underline">Register New Customer Profile?</button>
                        </div>
                      )}
                      {!custSearch && (
                        <button onClick={() => setIsNewCustomer(true)} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:bg-slate-50 transition">
                           + Register New Profile
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-left-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name*</label>
                        <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-emerald-400 outline-none font-bold" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number*</label>
                        <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-emerald-400 outline-none font-bold" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button onClick={() => setIsNewCustomer(false)} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-[2rem] transition">Back</button>
                      <button onClick={() => handleCheckout()} disabled={!customerForm.name || !customerForm.phone} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-200 disabled:opacity-30 transition transform active:scale-95">Complete Sale</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
