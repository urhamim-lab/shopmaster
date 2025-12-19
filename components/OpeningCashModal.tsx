
import React, { useState } from 'react';
import { DollarSign, Store, ArrowRight, Wallet } from 'lucide-react';

interface Props {
  onConfirm: (val: number) => void;
}

const OpeningCashModal: React.FC<Props> = ({ onConfirm }) => {
  const [value, setValue] = useState<string>('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onConfirm(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900 p-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="bg-white/20 p-3 rounded-2xl w-fit mb-6">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Daily Store Setup</h1>
            <p className="text-indigo-100 leading-relaxed">
              Welcome back to your business dashboard. Before we start processing sales, please enter your opening cash balance for today.
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-indigo-300 font-medium">© 2024 SHOPMASTER PRO - V1.0</p>
          </div>
        </div>

        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Opening Cash ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input 
                  autoFocus
                  type="number" 
                  step="0.01"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-gray-900 focus:border-indigo-500 outline-none transition shadow-inner"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <p className="text-xs text-gray-400">This balance will be the basis for today's cash tracking.</p>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition transform active:scale-95 shadow-xl shadow-indigo-200"
            >
              <Wallet size={20} />
              <span>Open Store</span>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpeningCashModal;
