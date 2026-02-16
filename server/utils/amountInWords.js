/**
 * Convert a numeric amount to Indian Rupee words.
 * Uses the Indian numbering system (lakh, crore).
 *
 * Examples:
 *   769    → "Rupees Seven Hundred Sixty Nine Only"
 *   1250.50 → "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only"
 *   0      → "Rupees Zero Only"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/**
 * Convert a number (0-99) to words.
 */
function twoDigitWords(n) {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o] : '');
}

/**
 * Convert a number to Indian-system words (handles up to 99,99,99,999).
 * Indian grouping: ones, hundreds, thousands, lakhs, crores.
 */
function numberToWords(num) {
  if (num === 0) return 'Zero';

  let result = '';

  // Crores (1,00,00,000+)
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    result += numberToWords(crores) + ' Crore ';
    num %= 10000000;
  }

  // Lakhs (1,00,000+)
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    result += twoDigitWords(lakhs) + ' Lakh ';
    num %= 100000;
  }

  // Thousands (1,000+)
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    result += twoDigitWords(thousands) + ' Thousand ';
    num %= 1000;
  }

  // Hundreds
  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    result += ones[hundreds] + ' Hundred ';
    num %= 100;
  }

  // Tens and ones
  if (num > 0) {
    result += twoDigitWords(num);
  }

  return result.trim();
}

/**
 * Convert an amount in INR to words.
 *
 * @param {number} amount - The amount in rupees (e.g., 769.50)
 * @returns {string} Amount in words (e.g., "Rupees Seven Hundred Sixty Nine and Fifty Paise Only")
 */
export function amountInWords(amount) {
  if (amount < 0) {
    return 'Negative ' + amountInWords(Math.abs(amount));
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = 'Rupees ' + numberToWords(rupees);

  if (paise > 0) {
    result += ' and ' + numberToWords(paise) + ' Paise';
  }

  result += ' Only';

  return result;
}
