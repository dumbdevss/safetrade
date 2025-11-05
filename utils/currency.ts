// Currency utility functions for NGN (Nigerian Naira)

export const DEFAULT_CURRENCY = 'NGN';
export const CURRENCY_SYMBOL = '₦';

/**
 * Format amount in Nigerian Naira
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the ₦ symbol (default: true)
 * @returns Formatted currency string
 */
export function formatNaira(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `₦${formatted}` : formatted;
}

/**
 * Format amount with currency code
 * @param amount - The amount to format
 * @param currency - Currency code (defaults to NGN)
 * @returns Formatted string with currency code
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  if (currency === 'NGN') {
    return formatNaira(amount);
  }
  
  // Fallback for other currencies
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Parse currency string to number
 * @param currencyString - String like "₦50,000.00" or "50000"
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and commas, then parse
  const cleaned = currencyString.replace(/[₦,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @returns True if valid amount
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 999999999.99;
}

/**
 * Get currency display info
 * @param currency - Currency code
 * @returns Object with symbol and name
 */
export function getCurrencyInfo(currency: string = DEFAULT_CURRENCY) {
  const currencies = {
    NGN: { symbol: '₦', name: 'Nigerian Naira' },
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
  };
  
  return currencies[currency as keyof typeof currencies] || currencies.NGN;
}

/**
 * Format amount for input fields (no symbol, with commas)
 * @param amount - Amount to format
 * @returns Formatted string for input
 */
export function formatForInput(amount: number): string {
  if (isNaN(amount)) return '';
  return amount.toLocaleString('en-NG');
}

/**
 * Convert amount to kobo (smallest unit of NGN)
 * @param naira - Amount in Naira
 * @returns Amount in kobo
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert amount from kobo to naira
 * @param kobo - Amount in kobo
 * @returns Amount in Naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}
