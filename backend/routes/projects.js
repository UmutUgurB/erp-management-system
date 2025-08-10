const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all projects with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, type, manager, customer, search } = req.query;
    
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (manager) query.manager = manager;
    if (customer) query.customer = customer;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('customer', 'name email company')
      .populate('manager', 'name email')
      .populate('team.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customer', 'name email phone company address')
      .populate('manager', 'name email phone')
      .populate('team.user', 'name email phone')
      .populate('documents.uploadedBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id, isActive: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new project
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      manager: req.body.manager || req.user.id
    });

    await project.save();

    // Populate references
    await project.populate('customer', 'name email company');
    await project.populate('manager', 'name email');
    await project.populate('team.user', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('customer', 'name email company')
    .populate('manager', 'name email')
    .populate('team.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project (soft delete)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add team member to project
router.post('/:id/team', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already in team
    const existingMember = project.team.find(member => member.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.team.push({
      user: userId,
      role: role || 'other'
    });

    await project.save();
    await project.populate('team.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove team member from project
router.delete('/:id/team/:userId', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.team = project.team.filter(member => member.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('team.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project progress
router.patch('/:id/progress', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { progress, actualStartDate, actualEndDate } = req.body;

    const updateData = {};
    if (progress !== undefined) updateData.progress = progress;
    if (actualStartDate) updateData.actualStartDate = actualStartDate;
    if (actualEndDate) updateData.actualEndDate = actualEndDate;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('customer', 'name email company')
    .populate('manager', 'name email')
    .populate('team.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get project statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          overdueProjects: {
            $sum: {
              $cond: [
                { $and: [
                  { $lt: ['$endDate', new Date()] },
                  { $ne: ['$status', 'completed'] }
                ]},
                1,
                0
              ]
            }
          },
          totalBudget: { $sum: '$budget' },
          totalActualCost: { $sum: '$actualCost' }
        }
      }
    ]);

    const statusStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const overdueProjects = await Project.find({
      isActive: true,
      endDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    })
    .populate('manager', 'name email')
    .populate('customer', 'name email')
    .sort({ endDate: 1 })
    .limit(10);

    res.json({
      overview: stats[0] || {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overdueProjects: 0,
        totalBudget: 0,
        totalActualCost: 0
      },
      statusStats,
      priorityStats,
      overdueProjects
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my projects (projects where user is manager or team member)
router.get('/my/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      isActive: true,
      $or: [
        { manager: req.user.id },
        { 'team.user': req.user.id }
      ]
    })
    .populate('customer', 'name email company')
    .populate('manager', 'name email')
    .populate('team.user', 'name email')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 