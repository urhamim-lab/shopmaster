
import React, { useState } from 'react';
import { TrendingUp, DollarSign, BrainCircuit, Mic, Send, AlertCircle, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { Product, SaleRecord, PurchaseRecord, Customer } from '../types';
import { interpretPOSCommand } from '../services/geminiService';

interface Props {
  openingCash: number;
  totalSales: number;
  totalPurchases: number;
  totalReturns: number;
  cashBalance: number;
  inventory: Product[];
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  customers: Customer[];
  onAIAction: (data: any) => void;
}

const Dashboard: React.FC<Props> = ({ openingCash, totalSales, totalPurchases, totalReturns, cashBalance, inventory, sales, purchases, customers, onAIAction }) => {
  const [command, setCommand] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const inventoryValue = inventory.reduce((acc, p) => acc + (p.price * p.stock), 0);

  const handleSmartTerminal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    const result = await interpretPOSCommand(command, inventory, customers);
    setAiResult(result);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Smart Terminal - AI Assistant */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-xl"><BrainCircuit size={24} /></div>
              <h3 className="text-2xl font-black tracking-tight">Smart Terminal</h3>
            </div>
            <p className="text-slate-400 text-lg font-medium">Type or speak your transaction. AI will automatically prepare the entry for you.</p>
            
            <form onSubmit={handleSmartTerminal} className="relative mt-8">
              <input 
                type="text" 
                placeholder="Ex: 'I purchased 10kg sugar at 20 taka per kg from City Group'..." 
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-3xl py-6 pl-8 pr-36 text-white text-lg placeholder-slate-500 focus:border-emerald-500 outline-none transition font-bold"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                <button type="button" className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition"><Mic size={24}/></button>
                <button type="submit" className="p-4 bg-emerald-600 hover:bg-emerald-700 rounded-full transition shadow-lg shadow-emerald-600/20"><Send size={24}/></button>
              </div>
            </form>

            {isProcessing && <div className="text-sm text-emerald-400 font-bold animate-pulse">Analyzing command...</div>}
            
            {aiResult && (
              <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start space-x-6">
                  <div className="bg-amber-100/10 p-3 rounded-xl text-amber-400"><AlertCircle size={28}/></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white mb-2 uppercase tracking-widest">{aiResult.intent} Detected</p>
                    <p className="text-slate-300 text-lg mb-6 leading-relaxed font-medium">{aiResult.summary}</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => { onAIAction(aiResult); setAiResult(null); setCommand(''); }}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
                      >Verify & Autofill</button>
                      <button onClick={() => setAiResult(null)} className="bg-slate-700 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-600 transition">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
           <BrainCircuit size={450} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard icon={<DollarSign className="text-indigo-600" />} label="Opening Cash" value={`৳${openingCash.toLocaleString()}`} color="bg-indigo-50" />
        <MetricCard icon={<ShoppingBag className="text-emerald-600" />} label="Total Sales" value={`৳${totalSales.toLocaleString()}`} color="bg-emerald-50" />
        <MetricCard icon={<Truck className="text-amber-600" />} label="Total Purchases" value={`৳${totalPurchases.toLocaleString()}`} color="bg-amber-50" />
        <MetricCard icon={<RotateCcw className="text-red-600" />} label="Total Returns" value={`৳${totalReturns.toLocaleString()}`} color="bg-red-50" />
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1 space-y-3">
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Available Cash Balance</h4>
          <h5 className="text-6xl font-black text-slate-900 tracking-tighter">৳ {cashBalance.toLocaleString()}</h5>
          <p className="text-sm font-bold text-slate-400">Total liquid cash available in the shop registry.</p>
        </div>
        <div className="h-32 w-px bg-slate-100 hidden md:block"></div>
        <div className="flex-1 space-y-3">
          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Stock Asset Valuation</h4>
          <h5 className="text-5xl font-black text-indigo-600 tracking-tighter">৳ {inventoryValue.toLocaleString()}</h5>
          <p className="text-sm font-bold text-slate-400">Estimated value of current inventory in stock.</p>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-inner`}>{icon}</div>
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
  </div>
);

export default Dashboard;
