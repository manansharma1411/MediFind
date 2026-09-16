/**
 * Calculate stock availability status based on quantity
 * @param {number} quantity 
 * @returns {'available' | 'low_stock' | 'out_of_stock'}
 */
function calculateStockStatus(quantity) {
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return 'out_of_stock';
  }
  if (qty > 10) {
    return 'available';
  }
  return 'low_stock';
}

module.exports = {
  calculateStockStatus
};
