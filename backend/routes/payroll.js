const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// Get all payroll records
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, employee, department, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employee) query.employee = employee;
    if (status) query.paymentStatus = status;
    
    // If department is specified, find employees in that department
    if (department) {
      const employees = await User.find({ department, role: 'employee' }).select('_id');
      query.employee = { $in: employees.map(emp => emp._id) };
    }
    
    const skip = (page - 1) * limit;
    
    const payroll = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Payroll.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        payroll,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single payroll record
router.get('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName email department position baseSalary allowance')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    
    res.json({ success: true, data: payroll });
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new payroll record
router.post('/', auth, async (req, res) => {
  try {
    const { employee, month, year, baseSalary, bonus, allowance, notes } = req.body;
    
    // Check if payroll already exists for this employee and month
    const existingPayroll = await Payroll.findOne({ employee, month, year });
    if (existingPayroll) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payroll record already exists for this employee and month' 
      });
    }
    
    // Calculate payroll automatically
    const calculatedData = await Payroll.calculatePayroll(employee, month, year);
    
    const payrollData = {
      ...calculatedData,
      bonus: bonus || 0,
      allowance: allowance || 0,
      notes,
      createdBy: req.user.id
    };
    
    const payroll = new Payroll(payrollData);
    await payroll.save();
    
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({ success: true, data: populatedPayroll });
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update payroll record
router.put('/:id', auth, async (req, res) => {
  try {
    const { baseSalary, bonus, allowance, notes, paymentStatus, paymentDate, paymentMethod } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    
    // Update fields
    if (baseSalary !== undefined) payroll.baseSalary = baseSalary;
    if (bonus !== undefined) payroll.bonus = bonus;
    if (allowance !== undefined) payroll.allowance = allowance;
    if (notes !== undefined) payroll.notes = notes;
    if (paymentStatus !== undefined) payroll.paymentStatus = paymentStatus;
    if (paymentDate !== undefined) payroll.paymentDate = paymentDate;
    if (paymentMethod !== undefined) payroll.paymentMethod = paymentMethod;
    
    payroll.updatedBy = req.user.id;
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPayroll });
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete payroll record
router.delete('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    
    await Payroll.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve payroll
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    
    payroll.approvedBy = req.user.id;
    payroll.approvedAt = new Date();
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('approvedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPayroll });
  } catch (error) {
    console.error('Error approving payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark as paid
router.patch('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentMethod, paymentDate } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    
    payroll.paymentStatus = 'paid';
    payroll.paymentMethod = paymentMethod || payroll.paymentMethod;
    payroll.paymentDate = paymentDate || new Date();
    payroll.updatedBy = req.user.id;
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPayroll });
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk create payroll for all employees
router.post('/bulk-create', auth, async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month and year are required' 
      });
    }
    
    // Get all employees
    const employees = await User.find({ role: 'employee' });
    
    const results = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        // Check if payroll already exists
        const existingPayroll = await Payroll.findOne({ 
          employee: employee._id, 
          month, 
          year 
        });
        
        if (existingPayroll) {
          errors.push(`Payroll already exists for ${employee.firstName} ${employee.lastName}`);
          continue;
        }
        
        // Calculate payroll
        const calculatedData = await Payroll.calculatePayroll(employee._id, month, year);
        
        const payrollData = {
          ...calculatedData,
          createdBy: req.user.id
        };
        
        const payroll = new Payroll(payrollData);
        await payroll.save();
        
        results.push(payroll);
      } catch (error) {
        errors.push(`Error creating payroll for ${employee.firstName} ${employee.lastName}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      data: {
        created: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    console.error('Error bulk creating payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payroll statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    
    const payroll = await Payroll.find(query);
    
    const stats = {
      totalRecords: payroll.length,
      totalGrossSalary: payroll.reduce((sum, p) => sum + p.grossSalary, 0),
      totalOvertimePay: payroll.reduce((sum, p) => sum + p.overtimePay, 0),
      totalBonus: payroll.reduce((sum, p) => sum + p.bonus, 0),
      totalAllowance: payroll.reduce((sum, p) => sum + p.allowance, 0),
      totalDeductions: payroll.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalNetSalary: payroll.reduce((sum, p) => sum + p.netSalary, 0),
      paidRecords: payroll.filter(p => p.paymentStatus === 'paid').length,
      pendingRecords: payroll.filter(p => p.paymentStatus === 'pending').length,
      cancelledRecords: payroll.filter(p => p.paymentStatus === 'cancelled').length
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching payroll stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee payroll history
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 12 } = req.query;
    
    const payroll = await Payroll.find({ employee: employeeId })
      .populate('employee', 'firstName lastName email department position')
      .sort({ year: -1, month: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: payroll });
  } catch (error) {
    console.error('Error fetching employee payroll history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 