const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// Get all attendance records with filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employeeId,
      startDate,
      endDate,
      status,
      department,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Employee filter
    if (employeeId) {
      query.employee = employeeId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Department filter (join with employee)
    let populateOptions = [
      {
        path: 'employee',
        select: 'firstName lastName employeeId email department position'
      }
    ];

    if (department) {
      populateOptions[0].match = { department };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const attendance = await Attendance.find(query)
      .populate(populateOptions)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email department position')
      .populate('approvedBy', 'firstName lastName employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { employeeId, location, method, notes } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Get current location if not provided
    let checkInLocation = location;
    if (!checkInLocation) {
      checkInLocation = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      };
    }

    const attendance = new Attendance({
      employee: employeeId,
      checkIn: {
        time: new Date(),
        location: checkInLocation,
        method: method || 'manual',
        notes
      },
      createdBy: req.user.id
    });

    await attendance.save();

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { employeeId, location, method, notes } = req.body;

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Get current location if not provided
    let checkOutLocation = location;
    if (!checkOutLocation) {
      checkOutLocation = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      };
    }

    attendance.checkOut = {
      time: new Date(),
      location: checkOutLocation,
      method: method || 'manual',
      notes
    };

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start break
router.post('/break/start', auth, async (req, res) => {
  try {
    const { employeeId, breakType = 'lunch' } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    // Check if already on break
    const activeBreak = attendance.breakTime.find(break_ => !break_.endTime);
    if (activeBreak) {
      return res.status(400).json({ message: 'Already on break' });
    }

    attendance.breakTime.push({
      startTime: new Date(),
      type: breakType
    });

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// End break
router.post('/break/end', auth, async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No attendance record found for today' });
    }

    // Find active break
    const activeBreak = attendance.breakTime.find(break_ => !break_.endTime);
    if (!activeBreak) {
      return res.status(400).json({ message: 'No active break found' });
    }

    activeBreak.endTime = new Date();
    activeBreak.duration = (activeBreak.endTime - activeBreak.startTime) / (1000 * 60); // Convert to minutes

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      checkIn,
      checkOut,
      breakTime,
      status,
      overtime,
      lateMinutes,
      earlyLeaveMinutes,
      workFromHome,
      notes,
      approvalStatus,
      approvalNotes
    } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        checkIn,
        checkOut,
        breakTime,
        status,
        overtime,
        lateMinutes,
        earlyLeaveMinutes,
        workFromHome,
        notes,
        approvalStatus,
        approvalNotes,
        approvedBy: req.user.id,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId');

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete attendance record
router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (employeeId) {
      query.employee = employeeId;
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          workFromHomeDays: {
            $sum: { $cond: [{ $eq: ['$workFromHome', true] }, 1, 0] }
          },
          totalWorkHours: { $sum: '$totalWorkHours' },
          totalOvertime: { $sum: '$overtime' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          averageWorkHours: { $avg: '$totalWorkHours' }
        }
      }
    ]);

    const statusDistribution = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const dailyStats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          totalWorkHours: { $sum: '$totalWorkHours' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalRecords: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        workFromHomeDays: 0,
        totalWorkHours: 0,
        totalOvertime: 0,
        totalLateMinutes: 0,
        averageWorkHours: 0
      },
      statusDistribution,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employee attendance statistics
router.get('/employee/:employeeId/stats', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Attendance.getStats(employeeId, start, end);

    const monthlyStats = await Attendance.aggregate([
      {
        $match: {
          employee: require('mongoose').Types.ObjectId(employeeId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          totalWorkHours: { $sum: '$totalWorkHours' },
          totalOvertime: { $sum: '$overtime' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: stats,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk import attendance
router.post('/bulk-import', auth, async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' });
    }

    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const { employeeId, date, checkIn, checkOut, status } = record;

        // Validate employee exists
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
          errors.push({ record, error: 'Employee not found' });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          employee: employee._id,
          date: new Date(date)
        });

        if (existingAttendance) {
          errors.push({ record, error: 'Attendance record already exists' });
          continue;
        }

        const attendance = new Attendance({
          employee: employee._id,
          date: new Date(date),
          checkIn: checkIn ? {
            time: new Date(checkIn),
            location: { type: 'Point', coordinates: [0, 0] },
            method: 'manual'
          } : undefined,
          checkOut: checkOut ? {
            time: new Date(checkOut),
            location: { type: 'Point', coordinates: [0, 0] },
            method: 'manual'
          } : undefined,
          status: status || 'present',
          createdBy: req.user.id
        });

        await attendance.save();
        results.push(attendance);
      } catch (error) {
        errors.push({ record, error: error.message });
      }
    }

    res.json({
      success: results.length,
      errors: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 