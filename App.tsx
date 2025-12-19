
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  RotateCcw,
  Store,
  Users,
  LogOut,
  Plus,
  Truck,
  ShieldAlert,
  Search,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { 
  Product, SaleRecord, ReturnRecord, AppTab, SaleItem, 
  Customer, UserRole, CashSession, PurchaseRecord, AIDraft,
  Client, AdminTab 
} from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import SalesLog from './components/SalesLog';
import CustomerList from './components/CustomerList';
import ReturnsManager from './components/ReturnsManager';
import PurchaseManager from './components/PurchaseManager';
import OpeningCashModal from './components/OpeningCashModal';
import Receipt from './components/Receipt';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  
  // Shared Admin state
  const [clients, setClients] = useState<Client[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('admin-dashboard');

  // Shared Client state
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [clientTab, setClientTab] = useState<AppTab>('dashboard');
  const [currentReceipt, setCurrentReceipt] = useState<SaleRecord | null>(null);
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null);

  // Stats calculation for active client
  const totalSalesAmount = useMemo(() => sales.reduce((acc, s) => acc + s.totalAmount, 0), [sales]);
  const totalPurchaseCost = useMemo(() => purchases.reduce((acc, p) => acc + p.totalCost, 0), [purchases]);
  const totalReturnsAmount = useMemo(() => returns.reduce((acc, r) => acc + r.refundAmount, 0), [returns]);
  const currentCashBalance = (cashSession?.openingCash || 0) + totalSalesAmount - totalPurchaseCost - totalReturnsAmount;

  // Invoice generators
  const generateCustomerId = () => `CUST-${(1000 + customers.length + 1).toString().padStart(6, '0')}`;
  const generateSaleInvoice = () => `SALE-${new Date().getFullYear()}-${(sales.length + 1).toString().padStart(5, '0')}`;
  const generatePurchaseInvoice = () => `PUR-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(5, '0')}`;
  const generateReturnInvoice = () => `RET-${new Date().getFullYear()}-${(returns.length + 1).toString().padStart(5, '0')}`;

  const handleLogin = (role: UserRole, client?: Client) => {
    setUserRole(role);
    if (client) setActiveClient(client);
  };

  const handleCreateClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const registerCustomer = (data: Partial<Customer>): Customer => {
    const existing = customers.find(c => (data.phone && c.phone === data.phone));
    if (existing) return existing;
    const newCustomer: Customer = {
      id: generateCustomerId(),
      name: data.name || 'Anonymous',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      createdAt: Date.now(),
      totalSpent: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const handleSale = (items: SaleItem[], customer: Customer) => {
    const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
    const newSale: SaleRecord = {
      id: generateSaleInvoice(),
      timestamp: Date.now(),
      items,
      totalAmount,
      status: 'COMPLETED',
      customer,
      cashierId: activeClient?.ownerName || 'Admin'
    };
    setSales(prev => [...prev, newSale]);
    setInventory(prev => prev.map(prod => {
      const soldItem = items.find(i => i.productId === prod.id);
      return soldItem ? { ...prod, stock: prod.stock - soldItem.quantity } : prod;
    }));
    setCurrentReceipt(newSale);
    setAiDraft(null);
  };

  const handlePurchase = (productId: string, quantity: number, cost: number, source?: string, newProdData?: Partial<Product>) => {
    let finalProductId = productId;
    const unitCostPrice = cost / quantity;
    if ((productId === 'NEW' || !productId) && newProdData) {
      const newId = `p-${Date.now()}`;
      const newProd: Product = {
        id: newId,
        sku: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        name: newProdData.name || 'New Product',
        unit: newProdData.unit || 'pcs',
        costPrice: unitCostPrice,
        price: newProdData.price || unitCostPrice * 1.2,
        stock: quantity,
        category: 'General',
        isAutoCreated: !!aiDraft
      };
      setInventory(prev => [...prev, newProd]);
      finalProductId = newId;
    } else {
      setInventory(prev => prev.map(p => {
        if (p.id === finalProductId) {
          return {
            ...p,
            stock: p.stock + quantity,
            costPrice: unitCostPrice,
            price: newProdData?.price ? newProdData.price : p.price 
          };
        }
        return p;
      }));
    }
    const currentProduct = inventory.find(p => p.id === finalProductId) || newProdData;
    const newPurchase: PurchaseRecord = {
      id: generatePurchaseInvoice(),
      timestamp: Date.now(),
      productId: finalProductId,
      productName: currentProduct?.name || 'Unknown Item',
      quantity,
      unit: currentProduct?.unit || 'pcs',
      totalCost: cost,
      source
    };
    setPurchases(prev => [...prev, newPurchase]);
    setAiDraft(null);
  };

  const handleReturn = (saleId: string, customerId: string, itemsToReturn: SaleItem[]) => {
    const refundAmount = itemsToReturn.reduce((acc, i) => acc + i.total, 0);
    const newReturn: ReturnRecord = {
      id: generateReturnInvoice(),
      saleId,
      customerId,
      timestamp: Date.now(),
      items: itemsToReturn,
      refundAmount
    };
    setReturns(prev => [...prev, newReturn]);
    setSales(prev => prev.map(s => {
      if (s.id !== saleId) return s;
      const updatedItems = s.items.map(origItem => {
        const ret = itemsToReturn.find(r => r.productId === origItem.productId);
        return ret ? { ...origItem, returnedQuantity: (origItem.returnedQuantity || 0) + ret.quantity } : origItem;
      });
      return { ...s, items: updatedItems, status: 'PARTIAL_RETURN' };
    }));
    setInventory(prev => prev.map(prod => {
      const ret = itemsToReturn.find(i => i.productId === prod.id);
      return ret ? { ...prod, stock: prod.stock + ret.quantity } : prod;
    }));
    setAiDraft(null);
  };

  const handleAIInterpret = (draft: AIDraft) => {
    setAiDraft(draft);
    if (draft.intent === 'SALE') setClientTab('pos');
    else if (draft.intent === 'PURCHASE') setClientTab('purchases');
    else if (draft.intent === 'RETURN') setClientTab('returns');
    else if (draft.intent === 'OPENING_CASH') setClientTab('dashboard');
  };

  // Login Gate
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 p-6">
        <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
          <div className="bg-indigo-600 p-16 text-white flex flex-col justify-between">
            <div>
              <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl backdrop-blur-md">
                <Store size={36} />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-4">ShopMaster Pro</h1>
              <p className="text-indigo-100 font-medium leading-relaxed">Unified Business Intelligence & POS. Access your shop dashboard or manage your shop network from one secure portal.</p>
            </div>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">System Release v2.5.0</p>
          </div>
          <div className="p-16 flex flex-col justify-center space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Portal Login</h2>
            <div className="grid gap-4">
              <button onClick={() => handleLogin('ADMIN')} className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-3xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition"><ShieldAlert size={24} /></div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Admin Access</p>
                    <p className="text-sm font-bold text-slate-500">System Management</p>
                  </div>
                </div>
                <Plus size={20} className="text-slate-300" />
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-slate-300">Or Client Login</span></div>
              </div>
              {clients.length > 0 ? (
                clients.map(c => (
                  <button key={c.id} onClick={() => handleLogin('CLIENT', c)} className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-3xl hover:border-emerald-600 hover:bg-emerald-50 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition"><Store size={24} /></div>
                      <div className="text-left">
                        <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{c.shopName}</p>
                        <p className="text-sm font-bold text-slate-500">{c.ownerName}</p>
                      </div>
                    </div>
                    <Plus size={20} className="text-slate-300" />
                  </button>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Clients Created Yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session Gate for Client
  if (userRole === 'CLIENT' && !cashSession) {
    return <OpeningCashModal onConfirm={(val) => setCashSession({ id: `SESS-${Date.now()}`, startTime: Date.now(), openingCash: val, status: 'OPEN' })} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      <nav className="w-64 bg-slate-900 text-white flex flex-col no-print shrink-0 border-r border-slate-800">
        <div className="p-8 flex items-center space-x-3 bg-slate-950/20">
          <div className={`${userRole === 'ADMIN' ? 'bg-blue-600' : 'bg-emerald-600'} p-2 rounded-xl shadow-lg`}>
            {userRole === 'ADMIN' ? <ShieldAlert size={26} /> : <Store size={26} />}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">ShopMaster</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{userRole === 'ADMIN' ? 'Admin Portal' : 'Cloud Terminal'}</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {userRole === 'ADMIN' ? (
            <>
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Admin Dashboard" active={adminTab === 'admin-dashboard'} onClick={() => setAdminTab('admin-dashboard')} />
              <SidebarItem icon={<Users size={20} />} label="Register Client" active={adminTab === 'create-client'} onClick={() => setAdminTab('create-client')} />
              <SidebarItem icon={<CreditCard size={20} />} label="Manage Billing" active={adminTab === 'manage-billing'} onClick={() => setAdminTab('manage-billing')} />
              <SidebarItem icon={<Search size={20} />} label="Client Search" active={adminTab === 'search-clients'} onClick={() => setAdminTab('search-clients')} />
            </>
          ) : (
            <>
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={clientTab === 'dashboard'} onClick={() => setClientTab('dashboard')} />
              <SidebarItem icon={<ShoppingCart size={20} />} label="POS / Sales" active={clientTab === 'pos'} onClick={() => setClientTab('pos')} />
              <SidebarItem icon={<Truck size={20} />} label="Purchases" active={clientTab === 'purchases'} onClick={() => setClientTab('purchases')} />
              <SidebarItem icon={<RotateCcw size={20} />} label="Returns" active={clientTab === 'returns'} onClick={() => setClientTab('returns')} />
              <SidebarItem icon={<Package size={20} />} label="Inventory" active={clientTab === 'inventory'} onClick={() => setClientTab('inventory')} />
              <SidebarItem icon={<Users size={20} />} label="Customers" active={clientTab === 'customers'} onClick={() => setClientTab('customers')} />
              <SidebarItem icon={<History size={20} />} label="Sales Log" active={clientTab === 'sales-log'} onClick={() => setClientTab('sales-log')} />
            </>
          )}
        </div>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800">
          <div className={`${userRole === 'ADMIN' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-emerald-600/10 border-emerald-500/20'} border rounded-xl p-4`}>
             <p className={`text-[10px] ${userRole === 'ADMIN' ? 'text-blue-400' : 'text-emerald-400'} font-black uppercase tracking-widest mb-1`}>
              {userRole === 'ADMIN' ? 'System Users' : 'Cash Balance'}
             </p>
             <p className="text-xl font-black text-white">
              {userRole === 'ADMIN' ? clients.length : `৳ ${currentCashBalance.toLocaleString()}`}
             </p>
          </div>
          <button onClick={() => { setUserRole(null); setActiveClient(null); }} className="w-full mt-4 flex items-center justify-center space-x-2 p-3 text-slate-500 hover:text-white hover:bg-red-600/10 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-10 no-print">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {userRole === 'ADMIN' ? adminTab.replace('-', ' ') : (activeClient?.shopName || 'Dashboard')}
          </h2>
          <div className="flex items-center space-x-4">
            {aiDraft && (
              <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center animate-pulse">
                <Plus size={14} className="mr-2"/>
                AI Draft Prepared
              </div>
            )}
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <UserCheck size={18} className="text-slate-400" />
              <span className="text-xs font-black text-slate-700 uppercase">{userRole === 'ADMIN' ? 'Root Admin' : activeClient?.ownerName}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 no-print">
          {userRole === 'ADMIN' ? (
            <AdminPanel 
              clients={clients} 
              onCreateClient={handleCreateClient} 
              onUpdateClient={handleUpdateClient}
              activeTab={adminTab} 
              setActiveTab={setAdminTab} 
            />
          ) : (
            <>
              {clientTab === 'dashboard' && <Dashboard 
                openingCash={cashSession?.openingCash || 0} 
                totalSales={totalSalesAmount} 
                totalPurchases={totalPurchaseCost}
                totalReturns={totalReturnsAmount} 
                cashBalance={currentCashBalance} 
                inventory={inventory} 
                sales={sales} 
                purchases={purchases}
                customers={customers}
                onAIAction={handleAIInterpret}
              />}
              {clientTab === 'pos' && <POS inventory={inventory} customers={customers} onCompleteSale={handleSale} registerCustomer={registerCustomer} draft={aiDraft} onCancelDraft={() => setAiDraft(null)} />}
              {clientTab === 'purchases' && <PurchaseManager inventory={inventory} onPurchase={handlePurchase} purchases={purchases} draft={aiDraft} onCancelDraft={() => setAiDraft(null)} />}
              {clientTab === 'returns' && <ReturnsManager customers={customers} sales={sales} onReturn={handleReturn} role="CLIENT" draft={aiDraft} onCancelDraft={() => setAiDraft(null)} />}
              {clientTab === 'inventory' && <Inventory inventory={inventory} onUpdate={setInventory} role="CLIENT" />}
              {clientTab === 'customers' && <CustomerList customers={customers} sales={sales} returns={returns} />}
              {clientTab === 'sales-log' && <SalesLog sales={sales} onViewReceipt={setCurrentReceipt} role="CLIENT" />}
            </>
          )}
        </div>

        {currentReceipt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm no-print p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Sales Receipt</h3>
                <button onClick={() => setCurrentReceipt(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><Plus className="rotate-45" size={24} /></button>
              </div>
              <Receipt sale={currentReceipt} />
              <div className="mt-8 flex space-x-4">
                <button onClick={() => window.print()} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black">Print</button>
                <button onClick={() => setCurrentReceipt(null)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}<span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
