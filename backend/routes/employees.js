const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');

// Get all employees with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const employees = await Employee.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .populate('subordinates', 'firstName lastName employeeId')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEmployees: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName employeeId email phone')
      .populate('subordinates', 'firstName lastName employeeId email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new employee
router.post('/', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      department,
      position,
      salary,
      address,
      emergencyContact,
      skills,
      education,
      workExperience,
      manager
    } = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employee = new Employee({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      department,
      position,
      salary,
      address,
      emergencyContact,
      skills,
      education,
      workExperience,
      manager,
      createdBy: req.user.id
    });

    await employee.save();

    // If manager is assigned, update manager's subordinates
    if (manager) {
      await Employee.findByIdAndUpdate(manager, {
        $push: { subordinates: employee._id }
      });
    }

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      department,
      position,
      salary,
      status,
      address,
      emergencyContact,
      skills,
      education,
      workExperience,
      manager,
      notes
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if email already exists (excluding current employee)
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Handle manager change
    const oldManager = employee.manager;
    if (manager && manager !== oldManager?.toString()) {
      // Remove from old manager's subordinates
      if (oldManager) {
        await Employee.findByIdAndUpdate(oldManager, {
          $pull: { subordinates: employee._id }
        });
      }
      // Add to new manager's subordinates
      await Employee.findByIdAndUpdate(manager, {
        $push: { subordinates: employee._id }
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        hireDate,
        department,
        position,
        salary,
        status,
        address,
        emergencyContact,
        skills,
        education,
        workExperience,
        manager,
        notes,
        updatedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName employeeId');

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Remove from manager's subordinates
    if (employee.manager) {
      await Employee.findByIdAndUpdate(employee.manager, {
        $pull: { subordinates: employee._id }
      });
    }

    // Update subordinates to remove manager reference
    if (employee.subordinates && employee.subordinates.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employee.subordinates } },
        { $unset: { manager: 1 } }
      );
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employee statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          terminatedEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'terminated'] }, 1, 0] }
          },
          onLeaveEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'on_leave'] }, 1, 0] }
          },
          averageSalary: { $avg: '$salary' },
          totalSalary: { $sum: '$salary' }
        }
      }
    ]);

    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          averageSalary: { $avg: '$salary' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentHires = await Employee.find({ status: 'active' })
      .sort({ hireDate: -1 })
      .limit(5)
      .select('firstName lastName hireDate department position');

    res.json({
      overview: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        terminatedEmployees: 0,
        onLeaveEmployees: 0,
        averageSalary: 0,
        totalSalary: 0
      },
      departmentStats,
      recentHires
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employees by department
router.get('/department/:department', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ 
      department: req.params.department,
      status: 'active'
    })
    .populate('manager', 'firstName lastName employeeId')
    .select('firstName lastName employeeId position email phone hireDate');

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search employees
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const employees = await Employee.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName employeeId email department position status')
    .limit(10);

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 