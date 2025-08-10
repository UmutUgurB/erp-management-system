const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all performance evaluations
router.get('/', auth, async (req, res) => {
  try {
    const { 
      employee, 
      department, 
      status, 
      evaluationType, 
      year, 
      quarter,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (evaluationType) query.evaluationType = evaluationType;
    if (year) query['period.year'] = parseInt(year);
    if (quarter) query['period.quarter'] = parseInt(quarter);
    
    const skip = (page - 1) * limit;
    
    let performances;
    
    if (department) {
      // If department filter is applied, we need to populate and filter
      performances = await Performance.find(query)
        .populate('employee', 'firstName lastName email department position')
        .populate('evaluator', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Filter by department after population
      performances = performances.filter(perf => perf.employee.department === department);
    } else {
      performances = await Performance.find(query)
        .populate('employee', 'firstName lastName email department position')
        .populate('evaluator', 'firstName lastName')
        .populate('createdBy', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }
    
    const total = await Performance.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        performances,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching performances:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single performance evaluation
router.get('/:id', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id)
      .populate('employee', 'firstName lastName email department position')
      .populate('evaluator', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('feedback360.evaluator', 'firstName lastName');
    
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Error fetching performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new performance evaluation
router.post('/', auth, async (req, res) => {
  try {
    const {
      employee,
      period,
      evaluationType,
      kpis,
      goals,
      dueDate,
      managerComments
    } = req.body;
    
    const performanceData = {
      employee,
      period,
      evaluationType,
      kpis: kpis || [],
      goals: goals || [],
      dueDate,
      evaluator: req.user.id,
      managerComments,
      createdBy: req.user.id
    };
    
    const performance = new Performance(performanceData);
    await performance.save();
    
    const populatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('evaluator', 'firstName lastName');
    
    res.status(201).json({ success: true, data: populatedPerformance });
  } catch (error) {
    console.error('Error creating performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update performance evaluation
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      kpis,
      goals,
      managerComments,
      employeeComments,
      status
    } = req.body;
    
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    // Update fields
    if (kpis !== undefined) performance.kpis = kpis;
    if (goals !== undefined) performance.goals = goals;
    if (managerComments !== undefined) performance.managerComments = managerComments;
    if (employeeComments !== undefined) performance.employeeComments = employeeComments;
    if (status !== undefined) performance.status = status;
    
    performance.updatedBy = req.user.id;
    
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('evaluator', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error updating performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete performance evaluation
router.delete('/:id', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    await Performance.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Performance evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit 360 feedback
router.post('/:id/feedback360', auth, async (req, res) => {
  try {
    const {
      evaluatorType,
      strengths,
      weaknesses,
      suggestions,
      overallRating
    } = req.body;
    
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    // Check if feedback already exists from this evaluator
    const existingFeedback = performance.feedback360.find(
      feedback => feedback.evaluator.toString() === req.user.id
    );
    
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted by this evaluator' });
    }
    
    const feedback = {
      evaluator: req.user.id,
      evaluatorType,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      suggestions: suggestions || [],
      overallRating,
      submittedAt: new Date()
    };
    
    performance.feedback360.push(feedback);
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('feedback360.evaluator', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error submitting 360 feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve performance evaluation
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    performance.status = 'approved';
    performance.approvedBy = req.user.id;
    performance.approvedAt = new Date();
    
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('approvedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error approving performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Complete performance evaluation
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    performance.status = 'completed';
    performance.completedDate = new Date();
    performance.updatedBy = req.user.id;
    
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error completing performance evaluation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get performance statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { year, quarter, department, status } = req.query;
    
    const filters = {};
    if (year) filters.year = parseInt(year);
    if (quarter) filters.quarter = parseInt(quarter);
    if (department) filters.department = department;
    if (status) filters.status = status;
    
    const stats = await Performance.getPerformanceStats(filters);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee performance history
router.get('/employee/:employeeId/history', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { years = 3 } = req.query;
    
    const history = await Performance.getEmployeeHistory(employeeId, parseInt(years));
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching employee performance history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get top performers
router.get('/top-performers', auth, async (req, res) => {
  try {
    const { year, quarter, department, limit = 10 } = req.query;
    
    const filters = {};
    if (year) filters.year = parseInt(year);
    if (quarter) filters.quarter = parseInt(quarter);
    if (department) filters.department = department;
    
    const topPerformers = await Performance.getTopPerformers(filters, parseInt(limit));
    
    res.json({ success: true, data: topPerformers });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add reward to performance evaluation
router.post('/:id/rewards', auth, async (req, res) => {
  try {
    const {
      type,
      description,
      amount,
      currency = 'TRY'
    } = req.body;
    
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    const reward = {
      type,
      description,
      amount,
      currency,
      grantedAt: new Date(),
      grantedBy: req.user.id
    };
    
    performance.rewards.push(reward);
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('rewards.grantedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error adding reward:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update development plan
router.put('/:id/development-plan', auth, async (req, res) => {
  try {
    const { areas, trainingNeeds } = req.body;
    
    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Performance evaluation not found' });
    }
    
    if (areas !== undefined) performance.developmentPlan.areas = areas;
    if (trainingNeeds !== undefined) performance.developmentPlan.trainingNeeds = trainingNeeds;
    
    performance.updatedBy = req.user.id;
    
    await performance.save();
    
    const updatedPerformance = await Performance.findById(performance._id)
      .populate('employee', 'firstName lastName email department position')
      .populate('updatedBy', 'firstName lastName');
    
    res.json({ success: true, data: updatedPerformance });
  } catch (error) {
    console.error('Error updating development plan:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 