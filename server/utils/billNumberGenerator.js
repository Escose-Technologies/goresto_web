/**
 * Atomic bill number generator for Indian GST-compliant invoicing.
 *
 * Format: {prefix}/{FY shortcode}/{padded sequence}
 * Example: INV/2526/0001
 *
 * Rules:
 * - Sequential with no gaps (cancellations keep their number)
 * - Max 16 characters (GST requirement)
 * - Resets every financial year (April 1)
 * - Atomic increment via Prisma $transaction
 */

/**
 * Get the current Indian financial year.
 * Indian FY: April 1 to March 31.
 *
 * @returns {{ label: string, shortCode: string }}
 *   label: "2025-26", shortCode: "2526"
 */
export function getCurrentFinancialYear() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (0=Jan, 3=Apr)
  const year = now.getFullYear();

  if (month >= 3) {
    // April onwards — current year starts the FY
    return {
      label: `${year}-${(year + 1).toString().slice(2)}`,
      shortCode: `${year.toString().slice(2)}${(year + 1).toString().slice(2)}`,
    };
  } else {
    // Jan-March — previous year started the FY
    return {
      label: `${year - 1}-${year.toString().slice(2)}`,
      shortCode: `${(year - 1).toString().slice(2)}${year.toString().slice(2)}`,
    };
  }
}

/**
 * Generate the next bill number atomically.
 * MUST be called inside a Prisma $transaction to prevent race conditions.
 *
 * @param {string} restaurantId
 * @param {import('@prisma/client').PrismaClient} tx - Prisma transaction client
 * @returns {Promise<{ billNumber: string, financialYear: string, sequenceNumber: number }>}
 */
export async function getNextBillNumber(restaurantId, tx) {
  const fy = getCurrentFinancialYear();

  // Fetch bill prefix from settings
  const settings = await tx.settings.findUnique({
    where: { restaurantId },
    select: { billPrefix: true },
  });
  const prefix = settings?.billPrefix || 'INV';

  // Atomic upsert + increment within the same transaction as bill creation
  const sequence = await tx.billSequence.upsert({
    where: {
      restaurantId_financialYear: { restaurantId, financialYear: fy.label },
    },
    create: {
      restaurantId,
      financialYear: fy.label,
      lastSequence: 1,
    },
    update: {
      lastSequence: { increment: 1 },
    },
  });

  const paddedSeq = String(sequence.lastSequence).padStart(4, '0');
  const billNumber = `${prefix}/${fy.shortCode}/${paddedSeq}`;

  // Validate GST 16-character limit
  if (billNumber.length > 16) {
    throw new Error(
      `Bill number "${billNumber}" exceeds 16 characters (GST limit). Shorten the bill prefix in Settings.`
    );
  }

  return {
    billNumber,
    financialYear: fy.label,
    sequenceNumber: sequence.lastSequence,
  };
}
