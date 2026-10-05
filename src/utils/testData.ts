import type { Transaction } from '@/types';
import { parseTransactionSMS } from '@/utils/parser';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

const SAMPLE_SMS: { body: string; sender: string; daysBack: number }[] = [
  {
    body: 'HDFC Bank: Rs.450.00 debited from a/c XX1234 on 04-10-2024 to ZOMATO via UPI. Avl Bal: Rs.23,400.50. UTR: 401234567890123.',
    sender: 'VM-HDFCBK',
    daysBack: 0,
  },
  {
    body: 'ICICI Bank: INR 249.00 debited from a/c XX5678 on 04-10-2024 to SWIGGY. Avl Bal: Rs.15,200.00. UPI Ref: 987654321012345.',
    sender: 'VM-ICICIB',
    daysBack: 0,
  },
  {
    body: 'SBI: Rs.15,000.00 credited to a/c XX9012 on 03-10-2024 from RAJESH KUMAR via NEFT. Avl Bal: Rs.45,600.00.',
    sender: 'VM-SBIIN',
    daysBack: 1,
  },
  {
    body: 'Axis Bank: Rs.1,250.00 debited from a/c XX3456 to AMAZON RETAIL on 02-10-2024. Card ending 3456. Avl Bal: Rs.8,900.00.',
    sender: 'VM-AXISBK',
    daysBack: 2,
  },
  {
    body: 'Kotak Mahindra: \u20B9199.00 spent on UBER CABS via UPI on 02-10-2024. Avl Bal: Rs.12,300.00. Txn: 556677889900123.',
    sender: 'VM-KOTAKB',
    daysBack: 2,
  },
  {
    body: 'HDFC Bank: Rs.649.00 debited to NETFLIX SUBSCRIPTION on 01-10-2024 from a/c XX1234. Avl Bal: Rs.22,950.50.',
    sender: 'VM-HDFCBK',
    daysBack: 4,
  },
  {
    body: 'SBI: Rs.2,500.00 withdrawn from a/c XX9012 at ATM BP PETROL PUMP on 30-09-2024. Avl Bal: Rs.30,600.00.',
    sender: 'VM-SBIIN',
    daysBack: 5,
  },
  {
    body: 'ICICI: Rs.5,000.00 credited from SALARY CREDIT on 30-09-2024 to a/c XX5678. Avl Bal: Rs.20,200.00.',
    sender: 'VM-ICICIB',
    daysBack: 5,
  },
  {
    body: 'Axis Bank: Rs.399.00 debited to AIRTEL BROADBAND on 28-09-2024 from a/c XX3456. Avl Bal: Rs.7,650.00.',
    sender: 'VM-AXISBK',
    daysBack: 7,
  },
  {
    body: 'HDFC: Rs.1,200.00 debited to APOLLO PHARMACY via UPI on 27-09-2024. A/c XX1234. Avl Bal: Rs.21,750.50. Ref: 401234567890456.',
    sender: 'VM-HDFCBK',
    daysBack: 8,
  },
  {
    body: 'Kotak: Rs.299.00 spent on SPOTIFY on 26-09-2024. Card ending 7890. Avl Bal: Rs.11,800.00.',
    sender: 'VM-KOTAKB',
    daysBack: 9,
  },
  {
    body: 'SBI: Rs.850.00 debited to DMRC METRO CARD topup on 25-09-2024 from a/c XX9012. Avl Bal: Rs.29,750.00.',
    sender: 'VM-SBIIN',
    daysBack: 10,
  },
  {
    body: 'ICICI Bank: Rs.7,500.00 debited to BYJUS LEARNING on 22-09-2024. A/c XX5678. Avl Bal: Rs.13,451.00. UTR: 998877665544123.',
    sender: 'VM-ICICIB',
    daysBack: 13,
  },
  {
    body: 'Axis: Rs.45.00 debited to CHAI POINT via UPI on 20-09-2024. A/c XX3456. Avl Bal: Rs.7,251.00.',
    sender: 'VM-AXISBK',
    daysBack: 15,
  },
  {
    body: 'HDFC Bank: Rs.10,000.00 debited to GROWW INVESTMENTS via UPI on 18-09-2024. A/c XX1234. Avl Bal: Rs.11,750.50. Ref: 401234567890789.',
    sender: 'VM-HDFCBK',
    daysBack: 17,
  },
];

export function generateTestData(): Transaction[] {
  return SAMPLE_SMS.map(({ body, sender, daysBack }) => {
    const txn = parseTransactionSMS(body, sender);
    txn.date = daysAgo(daysBack);
    txn.isTestData = true;
    return txn;
  });
}
