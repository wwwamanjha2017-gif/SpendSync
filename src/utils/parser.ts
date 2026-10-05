import type { Transaction, TransactionType } from '@/types';
import { categorizeTransaction } from '@/utils/categorization';

const DEBIT_KEYWORDS = [
  'debited', 'spent', 'withdrawn', 'payment', 'purchase', 'paid',
];
const CREDIT_KEYWORDS = ['credited', 'deposited', 'received'];

const BANK_KEYWORDS = [
  'debited', 'credited', 'spent', 'withdrawn', 'deposited', 'inr', 'rs.',
  '\u20B9', 'upi', 'transaction', 'payment', 'purchase',
];

const BANK_SENDER_IDS = [
  'bk-', 'vm-', 'am-', 'bp-', 'ad-', 'ax-', 'hdfc', 'sbi', 'icici', 'axis',
  'kotak', 'pnb', 'bob', 'union', 'canara', 'idbi', 'yesbank', 'indusind',
  'federal', 'bandhan', 'rbl', 'citi', 'hsbc', 'scb', 'dbs', 'paytm',
  'phonepe', 'gpay', 'amazon', 'flipkart',
];

export function isBankSMS(body: string, sender: string): boolean {
  const text = body.toLowerCase();
  if (BANK_KEYWORDS.some((kw) => text.includes(kw))) return true;
  const senderUpper = sender.toUpperCase();
  if (BANK_SENDER_IDS.some((id) => senderUpper.includes(id.toUpperCase()))) {
    return true;
  }
  return false;
}

function extractAmount(text: string): number | null {
  const patterns = [
    /(?:rs\.?|inr|\u20B9)\s*([0-9][0-9,]*\.?[0-9]*)/i,
    /([0-9][0-9,]*\.[0-9]{2})\s*\/?-?/i,
    /([0-9][0-9,]*\.?[0-9]*)\s*(?:debited|credited|spent|withdrawn|paid)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

function extractBalance(text: string): number | null {
  const patterns = [
    /(?:avl|available|bal|balance)\s*(?:bal(?:ance)?)?\s*[:.]?\s*(?:rs\.?|inr|\u20B9)?\s*([0-9][0-9,]*\.?[0-9]*)/i,
    /(?:rs\.?|inr|\u20B9)\s*([0-9][0-9,]*\.?[0-9]*)\s*(?:is your )?(?:available )?balance/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) return num;
    }
  }
  return null;
}

function extractTransactionType(text: string): TransactionType {
  const lower = text.toLowerCase();
  if (CREDIT_KEYWORDS.some((kw) => lower.includes(kw))) return 'credit';
  if (DEBIT_KEYWORDS.some((kw) => lower.includes(kw))) return 'debit';
  return 'debit';
}

function extractMerchant(text: string, type: TransactionType): string {
  const preposition = type === 'credit' ? 'from' : 'to';

  const patterns = [
    new RegExp(`\\b${preposition}\\b\\s+([\\w@.\\s&'-]{2,40}?)(?:\\s+(?:on|via|through|at|using|upi|ref|txn|if|for|$|\\.))`, 'i'),
    /\bat\b\s+([\w@\.\s&'-]{2,40}?)(?:\s+(?:on|via|through|using|upi|ref|txn|for|inr|rs|\u20B9|$|\.))/i,
    /\bto\b\s+([\w@\.\s&'-]{2,40}?)(?:\s+(?:on|via|through|using|upi|ref|txn|for|inr|rs|\u20B9|$|\.))/i,
    /\bfrom\b\s+([\w@\.\s&'-]{2,40}?)(?:\s+(?:on|via|through|using|upi|ref|txn|for|inr|rs|\u20B9|$|\.))/i,
    /\b(?:at|to)\b\s+([\w@\.\s&'-]{2,40}?)(?:\s+upi[:\s])/i,
    /\b(?:vpa|upi id)[:\s]+([\w@.\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let merchant = match[1].trim();
      merchant = cleanMerchantName(merchant);
      if (merchant.length >= 2) return merchant;
    }
  }

  return 'Unknown';
}

function cleanMerchantName(name: string): string {
  let cleaned = name.trim().replace(/\s+/g, ' ');
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@')[0];
  }
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
  if (cleaned.length === 0) return 'Unknown';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function extractAccountMask(text: string): string | null {
  const patterns = [
    /a\/c\s*(?:xx\*?\*?)*\s*(\d{4})/i,
    /a\/c\s*(?:no\.?\s*)?(\d{4})/i,
    /account\s*(?:no\.?\s*)?(?:\*+\s*)?(\d{4})/i,
    /card\s*(?:ending|no\.?|no:)\s*(\d{4})/i,
    /(?:xx\*{2,})+(\d{4})/i,
    /(?:ending\s+in|ending)\s+(\d{4})/i,
    /a\/c\s*\*+\s*(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return `*${match[1]}`;
    }
  }
  return null;
}

function extractTransactionId(text: string): string | null {
  const patterns = [
    /(?:utr|upi\s*ref|ref(?:erence)?(?:\s*no)?)[:\s]+([A-Z0-9]{10,22})/i,
    /\b(\d{12,20})\b/,
    /(?:txn|transaction)\s*(?:id|no)?:?\s*([A-Z0-9]{10,22})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function extractDate(text: string): string {
  const patterns = [
    /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let day: string, month: string, year: string;
      if (match.length === 4 && isNaN(parseInt(match[2]))) {
        day = match[1];
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        };
        month = monthMap[match[2].toLowerCase().slice(0, 3)];
        year = match[3];
      } else {
        day = match[1];
        month = match[2];
        year = match[3];
      }

      if (year.length === 2) year = `20${year}`;
      if (day.length === 1) day = `0${day}`;
      if (month.length === 1) month = `0${month}`;

      const dateStr = `${year}-${month}-${day}T12:00:00.000Z`;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date.toISOString();
    }
  }

  return new Date().toISOString();
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function parseTransactionSMS(
  smsBody: string,
  sender: string
): Transaction {
  const amount = extractAmount(smsBody) ?? 0;
  const type = extractTransactionType(smsBody);
  const merchantName = extractMerchant(smsBody, type);
  const accountMask = extractAccountMask(smsBody);
  const transactionId = extractTransactionId(smsBody);
  const date = extractDate(smsBody);
  const balance = extractBalance(smsBody);
  const { name: category, color: categoryColor } = categorizeTransaction(
    merchantName,
    smsBody
  );

  return {
    id: generateId(),
    amount,
    type,
    merchantName,
    category,
    categoryColor,
    accountMask,
    transactionId,
    date,
    rawSms: smsBody,
    sender,
    balance,
    isRead: false,
  };
}

export function isDuplicateTransaction(
  newTxn: Transaction,
  existing: Transaction[],
  windowMs: number = 60000
): boolean {
  return existing.some((txn) => {
    if (txn.transactionId && newTxn.transactionId) {
      if (txn.transactionId === newTxn.transactionId) return true;
    }
    if (
      txn.amount === newTxn.amount &&
      txn.merchantName.toLowerCase() === newTxn.merchantName.toLowerCase()
    ) {
      const timeDiff = Math.abs(
        new Date(txn.date).getTime() - new Date(newTxn.date).getTime()
      );
      if (timeDiff < windowMs) return true;
    }
    return false;
  });
}
