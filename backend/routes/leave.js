const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all leave requests
router.get('/', auth, async (req, res) => {
  try {
    const { 
      employee, 
      department, 
      status, 
      leaveType, 
      startDate, 
      endDate, 
      year,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const skip = (page - 1) * limit;
    
    let leaves;
    
    if (department) {
      // If department filter is applied, we need to populate and filter
      leaves = await Leave.find(query)
        .populate('employee', 'firstName lastName email department position')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Filter by department after population
      leaves = leaves.filter(leave => leave.employee.department === department);
    } else {
      leaves = await Leave.find(query)
        .populate('employee', 'firstName lastName email department position')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }
    
    const total = await Leave.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single leave request
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    res.json({ success: true, data: leave });
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new leave request
router.post('/', auth, async (req, res) => {
  try {
    const {
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
      medicalCertificate,
      category,
      urgency,
      hours,
      startTime,
      endTime,
      location,
      contactInfo
    } = req.body;
    
    // Check for leave conflicts
    const conflicts = await Leave.checkConflicts(employee, startDate, endDate);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu tarih aralığında zaten bir izin talebi bulunuyor',
        conflicts
      });
    }
    
    const leaveData = {
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
      category,
      urgency,
      hours,
      startTime,
      endTime,
      location,
      contactInfo,
      createdBy: req.user.id
    };
    
    if (medicalCertificate) {
      leaveData.medicalCertificate = medicalCertificate;
    }
    
    const leave = new Leave(leaveData);
    await leave.save();
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json({ success: true, data: populatedLeave });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update leave request
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      medicalCertificate,
      category,
      urgency,
      hours,
      startTime,
      endTime,
      location,
      contactInfo
    } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    // Check for leave conflicts (excluding current leave)
    const conflicts = await Leave.checkConflicts(leave.employee, startDate, endDate, req.params.id);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu tarih aralığında zaten bir izin talebi bulunuyor',
        conflicts
      });
    }
    
    // Update fields
    if (leaveType !== undefined) leave.leaveType = leaveType;
    if (startDate !== undefined) leave.startDate = startDate;
    if (endDate !== undefined) leave.endDate = endDate;
    if (reason !== undefined) leave.reason = reason;
    if (category !== undefined) leave.category = category;
    if (urgency !== undefined) leave.urgency = urgency;
    if (hours !== undefined) leave.hours = hours;
    if (startTime !== undefined) leave.startTime = startTime;
    if (endTime !== undefined) leave.endTime = endTime;
    if (location !== undefined) leave.location = location;
    if (contactInfo !== undefined) leave.contactInfo = contactInfo;
    if (medicalCertificate !== undefined) leave.medicalCertificate = medicalCertificate;
    
    leave.updatedBy = req.user.id;
    
    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete leave request
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    await Leave.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve leave request
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    if (approvalNotes) leave.approvalNotes = approvalNotes;
    
    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('approvedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject leave request
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    if (approvalNotes) leave.approvalNotes = approvalNotes;
    
    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('approvedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel leave request
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    leave.status = 'cancelled';
    leave.updatedBy = req.user.id;
    
    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get leave statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { year, department, status } = req.query;
    
    const filters = {};
    if (year) filters.year = parseInt(year);
    if (department) filters.department = department;
    if (status) filters.status = status;
    
    const stats = await Leave.getLeaveStats(filters);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee leave balance
router.get('/balance/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year = new Date().getFullYear() } = req.query;
    
    const balance = await Leave.calculateLeaveBalance(employeeId, parseInt(year));
    
    // Get default leave allowances (can be configured per employee)
    const defaultAllowances = {
      annual: 14,
      sick: 10,
      personal: 5,
      maternity: 120,
      paternity: 10
    };
    
    const availableBalance = {
      annual: defaultAllowances.annual - balance.annual,
      sick: defaultAllowances.sick - balance.sick,
      personal: defaultAllowances.personal - balance.personal,
      maternity: defaultAllowances.maternity - balance.maternity,
      paternity: defaultAllowances.paternity - balance.paternity
    };
    
    res.json({
      success: true,
      data: {
        used: balance,
        available: availableBalance,
        total: defaultAllowances
      }
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee leave history
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 12 } = req.query;
    
    const leaves = await Leave.find({ employee: employeeId })
      .populate('employee', 'firstName lastName email department position')
      .populate('approvedBy', 'firstName lastName')
      .sort({ startDate: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Error fetching employee leave history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit return report
router.patch('/:id/return-report', auth, async (req, res) => {
  try {
    const { report } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    leave.returnReport = {
      submitted: true,
      submittedAt: new Date(),
      report
    };
    
    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department position');
    
    res.json({ success: true, data: updatedLeave });
  } catch (error) {
    console.error('Error submitting return report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 