
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Package, History, Calendar, AlertCircle, CheckCircle, Sparkles, Hash, TrendingUp } from 'lucide-react';
import { Product, PurchaseRecord, AIDraft } from '../types';

interface Props {
  inventory: Product[];
  onPurchase: (productId: string, quantity: number, cost: number, source?: string, newProdData?: Partial<Product>) => void;
  purchases: PurchaseRecord[];
  draft: AIDraft | null;
  onCancelDraft: () => void;
}

const PurchaseManager: React.FC<Props> = ({ inventory, onPurchase, purchases, draft, onCancelDraft }) => {
  const [selectedProdId, setSelectedProdId] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(20); // Default 20%
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [source, setSource] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('pcs');

  // Total calculated based on qty * unitPrice
  const calculatedTotal = qty * unitPrice;

  // Sync selling price when unit price or profit margin changes
  useEffect(() => {
    const calculatedSelling = unitPrice * (1 + profitMargin / 100);
    setSellingPrice(parseFloat(calculatedSelling.toFixed(2)));
  }, [unitPrice, profitMargin]);

  useEffect(() => {
    if (draft && draft.intent === 'PURCHASE') {
      if (draft.productId) setSelectedProdId(draft.productId);
      else if (draft.productName) {
        setSelectedProdId('');
        setNewProductName(draft.productName);
      }
      
      if (draft.quantity) setQty(draft.quantity);
      if (draft.price) setUnitPrice(draft.price);
      else if (draft.totalAmount && draft.quantity) setUnitPrice(draft.totalAmount / draft.quantity);
      
      if (draft.unit) setNewProductUnit(draft.unit);
      if (draft.source) setSource(draft.source);
    }
  }, [draft]);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedProdId && !newProductName) || qty <= 0 || unitPrice <= 0) return;
    
    onPurchase(
      selectedProdId, 
      qty, 
      calculatedTotal, 
      source, 
      { 
        name: newProductName, 
        unit: newProductUnit, 
        costPrice: unitPrice,
        price: sellingPrice // Manual or calculated selling price
      }
    );

    setSelectedProdId('');
    setQty(0);
    setUnitPrice(0);
    setProfitMargin(20);
    setSource('');
    setNewProductName('');
    setNewProductUnit('pcs');
  };

  const selectedProduct = inventory.find(p => p.id === selectedProdId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden">
          {draft && (
            <div className="absolute top-0 left-0 w-full bg-amber-500 py-2 px-10 flex items-center justify-between text-white font-black text-[10px] uppercase tracking-widest z-20">
              <span className="flex items-center"><Sparkles size={12} className="mr-2"/> Filled by AI Assistant</span>
              <button onClick={onCancelDraft} className="hover:underline">Clear Draft</button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-8 text-amber-600 pt-4">
             <Truck size={24}/>
             <h3 className="text-xl font-black uppercase tracking-tight">Purchase Entry</h3>
          </div>
          
          <form onSubmit={handleConfirm} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify Product</label>
              <select 
                className={`w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:border-amber-500 ${draft && draft.productId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'}`}
                value={selectedProdId}
                onChange={e => { 
                  setSelectedProdId(e.target.value); 
                  if(e.target.value && e.target.value !== 'NEW') {
                    setNewProductName('');
                    const prod = inventory.find(p => p.id === e.target.value);
                    if (prod) {
                        setNewProductUnit(prod.unit);
                    }
                  }
                }}
              >
                <option value="">Existing Products...</option>
                {inventory.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                ))}
                <option value="NEW">+ Manual New Product</option>
              </select>
            </div>

            {(selectedProdId === 'NEW' || (!selectedProdId && newProductName) || !selectedProdId) && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                   <Plus size={14} className="mr-2"/> Manual Product Details
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Product Name*</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-bold outline-none focus:border-indigo-500"
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    placeholder="e.g. Fresh Sugar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Unit (kg/pcs/Litre)*</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-bold outline-none focus:border-indigo-500"
                    value={newProductUnit}
                    onChange={e => setNewProductUnit(e.target.value)}
                    placeholder="pcs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity {selectedProduct ? `(${selectedProduct.unit})` : ''}</label>
                <input 
                  type="number" 
                  step="0.01"
                  className={`w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:border-amber-500 ${draft && draft.quantity ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'}`}
                  value={qty || ''}
                  placeholder="0"
                  onChange={e => setQty(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy Price per {selectedProduct?.unit || newProductUnit || 'Unit'}</label>
                <input 
                  type="number" 
                  step="0.01"
                  className={`w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:border-amber-500 ${draft && draft.price ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'}`}
                  value={unitPrice || ''}
                  placeholder="0.00"
                  onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
              <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                 <TrendingUp size={14} className="mr-2"/> Pricing Strategy
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Profit Margin (%)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl font-bold outline-none focus:border-emerald-500"
                    value={profitMargin}
                    onChange={e => setProfitMargin(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Selling Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl font-bold outline-none focus:border-emerald-500"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center shadow-lg">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</span>
               <span className="text-xl font-black text-emerald-400">৳ {calculatedTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name / Source</label>
              <input 
                type="text" 
                className={`w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:border-amber-500 ${draft && draft.source ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'}`}
                placeholder="Market or Supplier name"
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={(!selectedProdId && !newProductName) || qty <= 0 || unitPrice <= 0}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-5 rounded-3xl font-black text-lg transition transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-amber-200"
            >
              Complete Purchase
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Purchases</h4>
          <p className="text-xs text-slate-400 font-medium">Logged inventory restocking history.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                 <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Buy Price</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Selling Price</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Bill</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {purchases.slice(-10).reverse().map(p => (
                   <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Package size={16}/></div>
                          <div>
                            <p className="font-black text-slate-900">{p.productName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-slate-900">{p.quantity} {p.unit}</td>
                      <td className="px-10 py-6 text-right font-black text-slate-400">৳ {(p.totalCost / p.quantity).toLocaleString()}</td>
                      <td className="px-10 py-6 text-right font-black text-emerald-600">
                         ৳ {inventory.find(inv => inv.id === p.productId)?.price.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-amber-600">৳ {p.totalCost.toLocaleString()}</td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-bold text-slate-500">{p.source || 'N/A'}</span>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {purchases.length === 0 && (
               <div className="p-20 text-center">
                  <Truck size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold">No purchases recorded yet.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;
