const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateInvoice } = require('../utils/validation');

// Get all invoices with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, customer, startDate, endDate, search } = req.query;
    
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customer) query.customer = customer;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('customer', 'name email phone company')
      .populate('order', 'orderNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone company address')
      .populate('order', 'orderNumber items total')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name sku price');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get payments for this invoice
    const payments = await Payment.find({ invoice: req.params.id })
      .populate('processedBy', 'name email')
      .sort({ paymentDate: -1 });

    res.json({ invoice, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new invoice
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { error } = validateInvoice(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user.id
    });

    await invoice.save();

    // Populate references
    await invoice.populate('customer', 'name email phone company');
    await invoice.populate('order', 'orderNumber');
    await invoice.populate('createdBy', 'name email');

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update invoice
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { error } = validateInvoice(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('customer', 'name email phone company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invoice (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record payment for invoice
router.post('/:id/payments', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDate, reference, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payment = new Payment({
      invoice: req.params.id,
      customer: invoice.customer,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      reference,
      notes,
      processedBy: req.user.id
    });

    await payment.save();

    // Update invoice payment status
    const totalPaid = await Payment.aggregate([
      { $match: { invoice: invoice._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
    let paymentStatus = 'unpaid';
    
    if (paidAmount >= invoice.totalAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partially_paid';
    }

    await Invoice.findByIdAndUpdate(req.params.id, {
      paymentStatus,
      paidDate: paymentStatus === 'paid' ? new Date() : invoice.paidDate
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invoice statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { isActive: true };
    
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: {
            $sum: {
              $cond: [
                { $in: ['$paymentStatus', ['paid', 'partially_paid']] },
                '$totalAmount',
                0
              ]
            }
          },
          overdueAmount: {
            $sum: {
              $cond: [
                { $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$paymentStatus', 'paid'] }
                ]},
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const statusStats = await Invoice.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const paymentStatusStats = await Invoice.aggregate([
      { $match: query },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const overdueInvoices = await Invoice.find({
      ...query,
      dueDate: { $lt: new Date() },
      paymentStatus: { $ne: 'paid' }
    })
    .populate('customer', 'name email')
    .sort({ dueDate: 1 })
    .limit(10);

    res.json({
      overview: stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        overdueAmount: 0
      },
      statusStats,
      paymentStatusStats,
      overdueInvoices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send invoice (update status to sent)
router.patch('/:id/send', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'sent' },
      { new: true }
    )
    .populate('customer', 'name email phone company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark invoice as paid
router.patch('/:id/mark-paid', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'paid',
        paymentStatus: 'paid',
        paidDate: new Date()
      },
      { new: true }
    )
    .populate('customer', 'name email phone company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 