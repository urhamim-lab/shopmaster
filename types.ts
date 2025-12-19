
export type UserRole = 'ADMIN' | 'CLIENT';

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  sku: string;
  isAutoCreated?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: number;
  totalSpent: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  returnedQuantity: number;
  price: number;
  total: number;
  unit: string;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  items: SaleItem[];
  totalAmount: number;
  status: 'COMPLETED' | 'RETURNED' | 'PARTIAL_RETURN';
  customer: Customer;
  cashierId: string;
}

export interface PurchaseRecord {
  id: string;
  timestamp: number;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  source?: string;
}

export interface ReturnRecord {
  id: string;
  saleId: string;
  customerId: string;
  timestamp: number;
  items: SaleItem[];
  refundAmount: number;
  managerApprovalId?: string;
}

export interface CashSession {
  id: string;
  startTime: number;
  endTime?: number;
  openingCash: number;
  closingCash?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface AIDraft {
  intent: 'SALE' | 'PURCHASE' | 'RETURN' | 'OPENING_CASH';
  productName?: string;
  productId?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  totalAmount?: number;
  customerId?: string;
  customerName?: string;
  source?: string;
  summary: string;
}

export interface ClientBilling {
  rentAmount: number;
  billingDate: string;
  dueDate: string;
  paymentStatus: 'PAID' | 'UNPAID' | 'OVERDUE';
  history: { date: string; amount: number; status: string; invoiceId: string }[];
}

export interface Client {
  id: string;
  ownerName: string;
  shopName: string;
  shopSerialNumber: string;
  marketName: string;
  phone: string;
  password?: string;
  division: string;
  district: string;
  thana: string;
  billing: ClientBilling;
  createdAt: number;
}

export type AppTab = 'dashboard' | 'pos' | 'purchases' | 'returns' | 'inventory' | 'customers' | 'sales-log';
export type AdminTab = 'admin-dashboard' | 'create-client' | 'manage-billing' | 'search-clients';
