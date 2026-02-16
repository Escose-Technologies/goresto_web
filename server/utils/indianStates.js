/**
 * Indian states and union territories with GST state codes.
 * Used for Place of Supply in GST invoicing.
 *
 * Reference: GSTN state code list (ISO 3166-2:IN based)
 */

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
];

/**
 * Get state name by GST state code.
 * @param {string} code - 2-digit state code
 * @returns {string|null}
 */
export function getStateByCode(code) {
  const state = INDIAN_STATES.find(s => s.code === code);
  return state ? state.name : null;
}

/**
 * Get GST state code by state name (case-insensitive partial match).
 * @param {string} name - State name
 * @returns {string|null}
 */
export function getCodeByState(name) {
  const lower = name.toLowerCase();
  const state = INDIAN_STATES.find(s => s.name.toLowerCase() === lower);
  return state ? state.code : null;
}

/**
 * Validate a GSTIN format.
 * Format: 2-digit state code + 10-char PAN + 1-char entity + Z + 1-char check
 * Example: 29AADCB2230M1ZP
 *
 * @param {string} gstin
 * @returns {{ valid: boolean, error?: string, stateCode?: string }}
 */
export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') {
    return { valid: false, error: 'GSTIN is required' };
  }

  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!pattern.test(gstin)) {
    return { valid: false, error: 'Invalid GSTIN format' };
  }

  const stateCode = gstin.substring(0, 2);
  const validState = INDIAN_STATES.some(s => s.code === stateCode);
  if (!validState) {
    return { valid: false, error: `Invalid state code "${stateCode}" in GSTIN` };
  }

  return { valid: true, stateCode };
}

/**
 * Validate an FSSAI license number.
 * Must be exactly 14 digits.
 *
 * @param {string} fssai
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFSSAI(fssai) {
  if (!fssai || typeof fssai !== 'string') {
    return { valid: false, error: 'FSSAI number is required' };
  }

  const pattern = /^[0-9]{14}$/;
  if (!pattern.test(fssai)) {
    return { valid: false, error: 'FSSAI number must be exactly 14 digits' };
  }

  return { valid: true };
}
