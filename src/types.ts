export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  merchantName: string;
  category: string;
  categoryColor: string;
  accountMask: string | null;
  transactionId: string | null;
  date: string; // ISO string
  rawSms: string;
  sender: string;
  balance: number | null;
  isRead: boolean;
  isTestData?: boolean;
}

export interface MonthlyStats {
  month: string; // "2024-01"
  totalSpent: number;
  totalReceived: number;
  transactionCount: number;
  categoryBreakdown: Record<string, number>;
}

export interface AppState {
  transactions: Transaction[];
  monthlyStats: MonthlyStats[];
  totalBalance: number;
  unreadCount: number;
}

export interface CategoryInfo {
  name: string;
  color: string;
}
