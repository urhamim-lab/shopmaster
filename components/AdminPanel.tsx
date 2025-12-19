
import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, CreditCard, Search, MapPin, Store, 
  User, Phone, Lock, Calendar, DollarSign, History as HistoryIcon, ChevronRight, X, Printer, CheckCircle, Info
} from 'lucide-react';
import { AdminTab, Client } from '../types';
import { locationData } from '../data/locationData';

interface Props {
  clients: Client[];
  onCreateClient: (client: Client) => void;
  onUpdateClient: (updatedClient: Client) => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const AdminPanel: React.FC<Props> = ({ clients, onCreateClient, onUpdateClient, activeTab, setActiveTab }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    division: '',
    district: '',
    thana: '',
    shopName: '',
    marketName: '',
    ownerName: '',
    shopSerialNumber: '',
    phone: '',
    password: '',
    billing: {
      rentAmount: 0,
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'UNPAID',
      history: []
    }
  });

  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, client: Client | null, amount: number }>({
    isOpen: false,
    client: null,
    amount: 0
  });

  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, client: Client | null }>({
    isOpen: false,
    client: null
  });

  const [receiptToShow, setReceiptToShow] = useState<{ client: Client, amount: number, date: string, invoiceId: string } | null>(null);

  const [searchPhone, setSearchPhone] = useState('');

  const divisions = Object.keys(locationData);
  const districts = formData.division ? Object.keys(locationData[formData.division]) : [];
  const thanas = (formData.division && formData.district) ? locationData[formData.division][formData.district] : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password || !formData.shopName || (formData.billing?.rentAmount || 0) <= 0) {
      alert("Please fill all fields including a valid rent amount.");
      return;
    }
    
    const newClient: Client = {
      ...formData as Client,
      id: `CLIENT-${Date.now()}`,
      createdAt: Date.now()
    };
    onCreateClient(newClient);
    setActiveTab('admin-dashboard');
    setFormData({
      division: '', district: '', thana: '', shopName: '', marketName: '', 
      ownerName: '', shopSerialNumber: '', phone: '', password: '',
      billing: { rentAmount: 0, billingDate: '', dueDate: '', paymentStatus: 'UNPAID', history: [] }
    });
  };

  const handleRecordPayment = () => {
    if (!paymentModal.client || paymentModal.amount <= 0) return;

    const updatedClient = { ...paymentModal.client };
    const invoiceId = `INV-PAY-${Date.now()}`;
    const paymentDate = new Date().toLocaleString();

    // Add this transaction to history
    updatedClient.billing.history = [
      ...updatedClient.billing.history,
      { 
        date: paymentDate, 
        amount: paymentModal.amount, 
        status: 'PAID', 
        invoiceId: invoiceId 
      }
    ];
    
    // Update status logic
    if (paymentModal.amount >= updatedClient.billing.rentAmount) {
      updatedClient.billing.paymentStatus = 'PAID';
    }

    onUpdateClient(updatedClient);
    setReceiptToShow({
      client: updatedClient,
      amount: paymentModal.amount,
      date: paymentDate,
      invoiceId: invoiceId
    });
    setPaymentModal({ isOpen: false, client: null, amount: 0 });
  };

  const filteredClients = useMemo(() => {
    if (!searchPhone) return clients;
    return clients.filter(c => c.phone.includes(searchPhone));
  }, [clients, searchPhone]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {activeTab === 'admin-dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard icon={<Users className="text-blue-500" />} label="Total Clients" value={clients.length} />
            <StatsCard icon={<DollarSign className="text-emerald-500" />} label="Monthly Rent Pipeline" value={`৳${clients.reduce((acc, c) => acc + c.billing.rentAmount, 0)}`} />
            <StatsCard icon={<CreditCard className="text-amber-500" />} label="Pending Invoices" value={clients.filter(c => c.billing.paymentStatus === 'UNPAID').length} />
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Shop Registry</h3>
              <button onClick={() => setActiveTab('create-client')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold hover:bg-slate-800 transition">
                <Plus size={20} />
                <span>Add New Shop</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop & ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Rent</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 leading-tight">{c.shopName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SN: {c.shopSerialNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(c.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900">{c.ownerName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{c.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900">৳{c.billing.rentAmount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.billing.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {c.billing.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && (
                <div className="p-20 text-center">
                  <Users size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold">No shops registered in the system.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-client' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-12">
            <div className="flex items-center space-x-3 mb-10">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Plus size={24} /></div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Register New Client</h3>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPin size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Location Selection (Bangladesh)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Division</label>
                    <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.division} onChange={e => setFormData({ ...formData, division: e.target.value, district: '', thana: '' })}>
                      <option value="">Select Division</option>
                      {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">District</label>
                    <select required disabled={!formData.division} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value, thana: '' })}>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thana / Upazila</label>
                    <select required disabled={!formData.district} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" value={formData.thana} onChange={e => setFormData({ ...formData, thana: e.target.value })}>
                      <option value="">Select Thana</option>
                      {thanas.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Store size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Shop & Billing Setup</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Shop Name" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                  <input type="text" placeholder="Market Name" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.marketName} onChange={e => setFormData({...formData, marketName: e.target.value})} />
                  <input type="text" placeholder="Shop Serial Number" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.shopSerialNumber} onChange={e => setFormData({...formData, shopSerialNumber: e.target.value})} />
                  <input type="text" placeholder="Shop Owner Name" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  
                  <div className="relative md:col-span-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Monthly Rent Amount (৳)*</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                      <input 
                        type="number" 
                        placeholder="Enter Rent Manually (e.g. 1500)" 
                        required 
                        className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-black text-xl text-blue-900 outline-none focus:border-blue-500" 
                        value={formData.billing?.rentAmount || ''} 
                        onChange={e => setFormData({...formData, billing: { ...formData.billing!, rentAmount: parseFloat(e.target.value) || 0 }})} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Lock size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Access Credentials</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="tel" placeholder="Phone Number (Login ID)" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  <input type="password" placeholder="Account Password" required className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95">
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'manage-billing' && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Billing & Collections</h3>
            <div className="grid gap-6">
              {clients.map(c => (
                <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-md transition">
                  <div className="flex items-center space-x-6">
                    <div className="bg-white p-4 rounded-2xl text-slate-400 shadow-sm"><CreditCard size={24} /></div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{c.shopName}</h4>
                      <p className="text-xs font-bold text-slate-400">Owner: {c.ownerName} | Rent: ৳{c.billing.rentAmount}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-12">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payments</p>
                      <p className="text-xs font-bold text-slate-900">{c.billing.history.length} Transactions</p>
                    </div>
                    <div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.billing.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {c.billing.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <button 
                        onClick={() => setHistoryModal({ isOpen: true, client: c })}
                        className="bg-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-300 transition"
                        title="View Payment History"
                      >
                        <HistoryIcon size={20} />
                      </button>
                      <button 
                        onClick={() => setPaymentModal({ isOpen: true, client: c, amount: c.billing.rentAmount })}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                      >
                        Receive Money
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search-clients' && (
        <div className="space-y-10">
          <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl space-y-6">
              <h3 className="text-3xl font-black text-white tracking-tight">Client Directory Search</h3>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input type="tel" placeholder="Search by Phone Number..." className="w-full bg-slate-800 border-2 border-slate-700 rounded-3xl py-6 pl-14 pr-8 text-white text-xl font-bold focus:border-blue-500 outline-none transition" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredClients.map(c => (
              <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8 animate-in slide-in-from-bottom-4 transition hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{c.shopName}</h4>
                    <p className="text-sm font-bold text-blue-600">Registered: {new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setHistoryModal({ isOpen: true, client: c })} className="bg-slate-100 p-4 rounded-2xl text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition"><HistoryIcon size={24} /></button>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Store size={24} /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InfoItem icon={<MapPin size={16}/>} label="Location" value={`${c.thana}, ${c.district}`} />
                  <InfoItem icon={<User size={16}/>} label="Owner" value={c.ownerName} />
                  <InfoItem icon={<Phone size={16}/>} label="Contact" value={c.phone} />
                  <InfoItem icon={<Calendar size={16}/>} label="Market" value={c.marketName} />
                </div>
                
                <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serial Record</p>
                     <p className="font-bold text-slate-900 tracking-widest text-lg">#{c.shopSerialNumber}</p>
                   </div>
                   <button 
                    onClick={() => setHistoryModal({ isOpen: true, client: c })}
                    className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                   >
                     <HistoryIcon size={14} />
                     <span>View Payment History</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Receive Money</h3>
              <button onClick={() => setPaymentModal({ isOpen: false, client: null, amount: 0 })} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shop Details</p>
                <p className="font-black text-slate-900">{paymentModal.client?.shopName}</p>
                <p className="text-xs text-slate-500">{paymentModal.client?.ownerName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Import (৳)</label>
                <input 
                  autoFocus
                  type="number" 
                  className="w-full p-4 bg-slate-50 border-2 border-emerald-100 rounded-2xl font-black text-2xl text-emerald-700 outline-none focus:border-emerald-500"
                  value={paymentModal.amount || ''}
                  onChange={e => setPaymentModal({ ...paymentModal, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <button 
                onClick={handleRecordPayment}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition"
              >
                Save & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyModal.isOpen && historyModal.client && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl animate-in slide-in-from-bottom-6 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-10 shrink-0">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm"><HistoryIcon size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Ledger</h3>
                  <p className="text-sm font-bold text-slate-400">{historyModal.client.shopName}</p>
                </div>
              </div>
              <button onClick={() => setHistoryModal({ isOpen: false, client: null })} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition"><X size={26}/></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
              {historyModal.client.billing.history.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No transaction history found</p>
                </div>
              ) : (
                [...historyModal.client.billing.history].reverse().map((pay, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-400 transition group">
                    <div className="flex items-center space-x-5">
                       <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition"><CreditCard size={20} /></div>
                       <div>
                         <p className="font-black text-slate-900 text-lg">৳{pay.amount.toLocaleString()}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pay.date}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-tighter mb-1">ID: {pay.invoiceId}</p>
                       <button 
                        onClick={() => setReceiptToShow({ 
                          client: historyModal.client!, 
                          amount: pay.amount, 
                          date: pay.date, 
                          invoiceId: pay.invoiceId 
                        })}
                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                       >View Invoice</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 shrink-0 flex justify-between items-center text-slate-400">
               <p className="text-[10px] font-black uppercase tracking-widest">Lifetime Collected</p>
               <p className="text-xl font-black text-slate-900">৳{historyModal.client.billing.history.reduce((acc, h) => acc + h.amount, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Receipt (Invoice) Modal */}
      {receiptToShow && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950 p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-xl max-h-[90vh] overflow-y-auto no-print">
            <div className="receipt-content font-mono space-y-8">
              <div className="text-center pb-8 border-b-2 border-dashed border-slate-200">
                 <h2 className="text-2xl font-black uppercase tracking-tighter">ShopMaster Billing</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Official Payment Receipt</p>
                 <p className="text-[9px] text-slate-400 font-bold mt-1">Invoice: {receiptToShow.invoiceId}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-1">
                  <p className="font-black text-slate-400 uppercase text-[9px]">Bill To:</p>
                  <p className="font-black text-slate-900 text-sm uppercase">{receiptToShow.client.shopName}</p>
                  <p className="font-bold text-slate-500">{receiptToShow.client.ownerName}</p>
                  <p className="text-slate-500">{receiptToShow.client.phone}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-black text-slate-400 uppercase text-[9px]">Payment Date:</p>
                  <p className="font-bold text-slate-900">{receiptToShow.date.split(',')[0]}</p>
                  <p className="text-slate-500">{receiptToShow.date.split(',')[1]}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                    <p className="text-4xl font-black text-emerald-600">৳{receiptToShow.amount.toLocaleString()}</p>
                 </div>
                 <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><CheckCircle size={32} /></div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Shop SN</p>
                    <p className="text-xs font-black">#{receiptToShow.client.shopSerialNumber}</p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Current Status</p>
                    <p className="text-xs font-black text-emerald-600 uppercase">{receiptToShow.client.billing.paymentStatus}</p>
                 </div>
              </div>

              <div className="text-center pt-8">
                 <p className="text-[9px] font-bold text-slate-400 italic">This is a digitally generated invoice for payment received. No signature required.</p>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
               <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2">
                 <Printer size={20} />
                 <span>Print Invoice</span>
               </button>
               <button onClick={() => setReceiptToShow(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-6">
    <div className="bg-slate-50 p-4 rounded-2xl text-slate-900 shadow-inner">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  </div>
);

const InfoItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
      {icon} <span>{label}</span>
    </p>
    <p className="font-bold text-slate-900">{value}</p>
  </div>
);

export default AdminPanel;
