function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

function validateInvoice(payload) {
  const errors = [];
  if (!payload) errors.push('İstek gövdesi boş olamaz');

  if (!payload.customer || !isValidObjectId(payload.customer)) {
    errors.push('Geçerli bir müşteri (customer) ID zorunludur');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('En az bir satır (items) zorunludur');
  } else {
    payload.items.forEach((item, idx) => {
      if (!item || !isValidObjectId(item.product)) {
        errors.push(`Öğe ${idx + 1}: geçerli product ID zorunludur`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Öğe ${idx + 1}: quantity > 0 olmalıdır`);
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        errors.push(`Öğe ${idx + 1}: unitPrice >= 0 olmalıdır`);
      }
    });
  }

  if (typeof payload.subtotal !== 'number' || payload.subtotal < 0) {
    errors.push('subtotal >= 0 olmalıdır');
  }
  if (typeof payload.totalAmount !== 'number' || payload.totalAmount < 0) {
    errors.push('totalAmount >= 0 olmalıdır');
  }
  if (!payload.dueDate || isNaN(Date.parse(payload.dueDate))) {
    errors.push('Geçerli bir dueDate zorunludur');
  }

  if (errors.length > 0) {
    return { error: { details: [{ message: errors[0] } ] } };
  }

  return { value: payload };
}

module.exports = {
  validateInvoice,
};


