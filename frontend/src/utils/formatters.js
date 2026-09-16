/**
 * Format price into Indian Rupees (INR)
 * @param {number} amount 
 * @returns {string} e.g. ₹32.50
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Get visual styling configuration for stock availability status
 * @param {'available' | 'low_stock' | 'out_of_stock'} status 
 * @returns {{ label: string, badgeBg: string, badgeText: string, border: string, pinColor: string }}
 */
export function getStockStatusConfig(status) {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badgeText: 'text-emerald-700',
        badgeBgSolid: 'bg-emerald-600 text-white',
        pinColor: '#16a34a', // Emerald Green
        dotColor: 'bg-emerald-500'
      };
    case 'low_stock':
      return {
        label: 'Low Stock',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        badgeText: 'text-amber-700',
        badgeBgSolid: 'bg-amber-500 text-white',
        pinColor: '#d97706', // Amber Yellow
        dotColor: 'bg-amber-500'
      };
    case 'out_of_stock':
    default:
      return {
        label: 'Out of Stock',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        badgeText: 'text-rose-700',
        badgeBgSolid: 'bg-rose-600 text-white',
        pinColor: '#dc2626', // Rose Red
        dotColor: 'bg-rose-500'
      };
  }
}
