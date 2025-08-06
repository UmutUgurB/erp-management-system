const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all tasks with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, type, project, assignedTo, search } = req.query;
    
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name code')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dependencies.task', 'title status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name code status')
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('dependencies.task', 'title status priority')
      .populate('comments.user', 'name email')
      .populate('timeEntries.user', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user.id
    });

    await task.save();

    // Populate references
    await task.populate('project', 'name code');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('project', 'name code')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task (soft delete)
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user.id,
      content
    });

    await task.save();
    await task.populate('comments.user', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start time tracking
router.post('/:id/time/start', auth, async (req, res) => {
  try {
    const { description } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Stop any active time entries for this user
    await Task.updateMany(
      { 'timeEntries.user': req.user.id, 'timeEntries.isActive': true },
      { 'timeEntries.$.isActive': false }
    );

    // Add new time entry
    task.timeEntries.push({
      user: req.user.id,
      startTime: new Date(),
      description,
      isActive: true
    });

    await task.save();
    await task.populate('timeEntries.user', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stop time tracking
router.post('/:id/time/stop', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const activeEntry = task.timeEntries.find(entry => 
      entry.user.toString() === req.user.id && entry.isActive
    );

    if (!activeEntry) {
      return res.status(400).json({ message: 'No active time entry found' });
    }

    const endTime = new Date();
    const duration = (endTime - activeEntry.startTime) / (1000 * 60 * 60); // hours

    activeEntry.endTime = endTime;
    activeEntry.duration = duration;
    activeEntry.isActive = false;

    await task.save();
    await task.populate('timeEntries.user', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress, status } = req.body;

    const updateData = {};
    if (progress !== undefined) updateData.progress = progress;
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedDate = new Date();
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('project', 'name code')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my tasks (tasks assigned to current user)
router.get('/my/tasks', auth, async (req, res) => {
  try {
    const { status, priority, project } = req.query;
    
    const query = { 
      isActive: true,
      assignedTo: req.user.id
    };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;

    const tasks = await Task.find(query)
      .populate('project', 'name code status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get task statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { project } = req.query;
    const query = { isActive: true };
    
    if (project) query.project = project;

    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                { $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'completed'] }
                ]},
                1,
                0
              ]
            }
          },
          totalEstimatedHours: { $sum: '$estimatedHours' },
          totalActualHours: { $sum: '$actualHours' }
        }
      }
    ]);

    const statusStats = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const overdueTasks = await Task.find({
      ...query,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    })
    .populate('project', 'name code')
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 })
    .limit(10);

    res.json({
      overview: stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        totalEstimatedHours: 0,
        totalActualHours: 0
      },
      statusStats,
      priorityStats,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 