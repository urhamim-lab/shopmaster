
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Layers, ChevronRight, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { Product, UserRole } from '../types';

interface Props {
  inventory: Product[];
  onUpdate: (newInventory: Product[]) => void;
  role: UserRole;
}

const Inventory: React.FC<Props> = ({ inventory, onUpdate, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    category: 'General',
    unit: 'pcs'
  });
  const [profitMargin, setProfitMargin] = useState<number>(20);

  // Sync price when costPrice or profitMargin changes
  useEffect(() => {
    if (newProduct.costPrice !== undefined) {
      const calculatedSelling = newProduct.costPrice * (1 + profitMargin / 100);
      setNewProduct(prev => ({ ...prev, price: parseFloat(calculatedSelling.toFixed(2)) }));
    }
  }, [newProduct.costPrice, profitMargin]);

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name || (newProduct.price ?? 0) < 0) return;
    
    const prod: Product = {
      id: Date.now().toString(),
      sku: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: newProduct.name!,
      unit: newProduct.unit || 'pcs',
      price: newProduct.price ?? 0,
      costPrice: newProduct.costPrice ?? 0,
      stock: newProduct.stock ?? 0,
      category: newProduct.category || 'General'
    };
    onUpdate([...inventory, prod]);
    setNewProduct({ name: '', price: 0, costPrice: 0, stock: 0, category: 'General', unit: 'pcs' });
    setProfitMargin(20);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onUpdate(inventory.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products or categories..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-emerald-200 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center space-x-3 mb-8">
             <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><Tag size={24}/></div>
             <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Manual Inventory Entry</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name*</label>
              <input type="text" placeholder="e.g. Rice Bag" className="w-full px-5 py-4 border rounded-2xl font-bold bg-slate-50 outline-none focus:border-emerald-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit (kg/pcs/Litre)</label>
              <input type="text" placeholder="pcs" className="w-full px-5 py-4 border rounded-2xl font-bold bg-slate-50 outline-none focus:border-emerald-500" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <input type="text" placeholder="General" className="w-full px-5 py-4 border rounded-2xl font-bold bg-slate-50 outline-none focus:border-emerald-500" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Stock</label>
              <input type="number" placeholder="0" className="w-full px-5 py-4 border rounded-2xl font-bold bg-slate-50 outline-none focus:border-emerald-500" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="mt-8 bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row gap-8 items-end">
             <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center"><TrendingUp size={12} className="mr-2"/> Buying Price (per unit)</label>
               <input type="number" placeholder="0.00" className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl font-black bg-white outline-none focus:border-indigo-500 text-xl" value={newProduct.costPrice || ''} onChange={e => setNewProduct({...newProduct, costPrice: parseFloat(e.target.value)})} />
             </div>
             <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Profit Margin (%)</label>
               <input type="number" className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl font-black bg-white outline-none focus:border-indigo-500 text-xl" value={profitMargin} onChange={e => setProfitMargin(parseFloat(e.target.value) || 0)} />
             </div>
             <div className="flex-1 space-y-2">
               <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Calculated Selling Price</label>
               <input type="number" className="w-full px-5 py-4 border-2 border-emerald-500 rounded-2xl font-black bg-emerald-100 outline-none text-emerald-700 text-xl" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
             </div>
          </div>

          <div className="mt-10 flex space-x-4">
            <button onClick={handleAddProduct} className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition transform active:scale-95">Register Product</button>
            <button onClick={() => setIsAdding(false)} className="px-10 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-3xl transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Level</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost Price</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Selling Price</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.map(prod => (
              <tr key={prod.id} className="hover:bg-gray-50 transition">
                <td className="px-10 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400"><Layers size={18}/></div>
                    <div>
                      <p className="font-black text-slate-900 leading-tight">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{prod.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{prod.category}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <span className={`text-sm font-black ${prod.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                    {prod.stock} <span className="text-[10px] uppercase text-slate-400 font-bold">{prod.unit}</span>
                  </span>
                </td>
                <td className="px-10 py-6 text-right font-bold text-slate-400">৳ {prod.costPrice.toLocaleString()}</td>
                <td className="px-10 py-6 text-right font-black text-emerald-600">৳ {prod.price.toLocaleString()}</td>
                <td className="px-10 py-6 text-center">
                  <div className="flex justify-center space-x-2">
                    <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInventory.length === 0 && (
            <div className="p-24 text-center">
                <Layers className="mx-auto text-slate-100 mb-6" size={80} strokeWidth={1} />
                <p className="text-slate-400 font-bold text-lg">Inventory Ledger Empty</p>
                <p className="text-slate-400 text-sm">Add your first products manually or via purchases.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
