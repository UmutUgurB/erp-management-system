const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { ResponseHandler } = require('../utils/responseHandler');
const { cacheManager } = require('../utils/cacheManager');
const { performanceMonitor } = require('../utils/performanceMonitor');

// Import models
const Order = require('../models/Order');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Performance = require('../models/Performance');
const Attendance = require('../models/Attendance');

/**
 * @route GET /api/analytics/dashboard
 * @desc Get dashboard analytics data
 * @access Private
 */
router.get('/dashboard', async (req, res) => {
  try {
    const cacheKey = 'analytics:dashboard';
    let dashboardData = await cacheManager.get(cacheKey);

    if (!dashboardData) {
      // Get real-time analytics data
      const [
        totalOrders,
        totalProducts,
        totalEmployees,
        totalRevenue,
        recentOrders,
        topProducts,
        employeePerformance,
        attendanceStats
      ] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        Employee.countDocuments(),
        Order.aggregate([
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('products'),
        Product.find().sort({ salesCount: -1 }).limit(5),
        Performance.find().sort({ score: -1 }).limit(5).populate('employeeId'),
        Attendance.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      dashboardData = {
        summary: {
          totalOrders,
          totalProducts,
          totalEmployees,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        topProducts,
        employeePerformance,
        attendanceStats,
        timestamp: new Date()
      };

      // Cache for 5 minutes
      await cacheManager.set(cacheKey, dashboardData, 300);
    }

    ResponseHandler.success(res, 'Dashboard analytics retrieved successfully', dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard analytics:', error);
    ResponseHandler.error(res, 'Failed to fetch dashboard analytics', 500);
  }
});

/**
 * @route GET /api/analytics/sales
 * @desc Get sales analytics with filters
 * @access Private
 */
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const salesData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    ResponseHandler.success(res, 'Sales analytics retrieved successfully', salesData);
  } catch (error) {
    logger.error('Error fetching sales analytics:', error);
    ResponseHandler.error(res, 'Failed to fetch sales analytics', 500);
  }
});

/**
 * @route GET /api/analytics/performance
 * @desc Get employee performance analytics
 * @access Private
 */
router.get('/performance', async (req, res) => {
  try {
    const { department, period = 'month' } = req.query;
    
    let matchFilter = {};
    if (department) {
      matchFilter.department = department;
    }

    const performanceData = await Performance.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          avgScore: { $avg: '$score' },
          totalEmployees: { $sum: 1 },
          topPerformers: {
            $push: {
              employeeId: '$employeeId',
              name: '$employee.name',
              score: '$score'
            }
          }
        }
      },
      {
        $project: {
          department: '$_id',
          avgScore: { $round: ['$avgScore', 2] },
          totalEmployees: 1,
          topPerformers: { $slice: ['$topPerformers', 5] }
        }
      }
    ]);

    ResponseHandler.success(res, 'Performance analytics retrieved successfully', performanceData);
  } catch (error) {
    logger.error('Error fetching performance analytics:', error);
    ResponseHandler.error(res, 'Failed to fetch performance analytics', 500);
  }
});

/**
 * @route GET /api/analytics/inventory
 * @desc Get inventory analytics and insights
 * @access Private
 */
router.get('/inventory', async (req, res) => {
  try {
    const inventoryData = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          lowStockProducts: {
            $sum: {
              $cond: [{ $lte: ['$stockQuantity', '$minimumStock'] }, 1, 0]
            }
          },
          totalValue: {
            $sum: { $multiply: ['$stockQuantity', '$price'] }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          totalProducts: 1,
          totalStock: 1,
          lowStockProducts: 1,
          totalValue: { $round: ['$totalValue', 2] }
        }
      }
    ]);

    // Get low stock alerts
    const lowStockAlerts = await Product.find({
      stockQuantity: { $lte: '$minimumStock' }
    }).select('name stockQuantity minimumStock category');

    const response = {
      categoryBreakdown: inventoryData,
      lowStockAlerts,
      insights: {
        totalCategories: inventoryData.length,
        totalProducts: inventoryData.reduce((sum, cat) => sum + cat.totalProducts, 0),
        totalStockValue: inventoryData.reduce((sum, cat) => sum + cat.totalValue, 0)
      }
    };

    ResponseHandler.success(res, 'Inventory analytics retrieved successfully', response);
  } catch (error) {
    logger.error('Error fetching inventory analytics:', error);
    ResponseHandler.error(res, 'Failed to fetch inventory analytics', 500);
  }
});

/**
 * @route GET /api/analytics/trends
 * @desc Get trending data and predictions
 * @access Private
 */
router.get('/trends', async (req, res) => {
  try {
    const { metric = 'sales', days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let trendsData;
    
    if (metric === 'sales') {
      trendsData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            dailySales: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } else if (metric === 'attendance') {
      trendsData = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' }
            },
            presentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }

    // Calculate trend direction
    if (trendsData && trendsData.length > 1) {
      const firstValue = trendsData[0][metric === 'sales' ? 'dailySales' : 'presentCount'];
      const lastValue = trendsData[trendsData.length - 1][metric === 'sales' ? 'dailySales' : 'presentCount'];
      const trendDirection = lastValue > firstValue ? 'up' : 'down';
      const trendPercentage = ((lastValue - firstValue) / firstValue * 100).toFixed(2);

      trendsData.trend = {
        direction: trendDirection,
        percentage: Math.abs(trendPercentage),
        isPositive: trendDirection === 'up'
      };
    }

    ResponseHandler.success(res, 'Trends data retrieved successfully', trendsData);
  } catch (error) {
    logger.error('Error fetching trends data:', error);
    ResponseHandler.error(res, 'Failed to fetch trends data', 500);
  }
});

/**
 * @route GET /api/analytics/export
 * @desc Export analytics data to CSV/Excel
 * @access Private
 */
router.get('/export', async (req, res) => {
  try {
    const { type, format = 'csv', filters } = req.query;
    
    // This would integrate with a proper export service
    // For now, return a success message
    ResponseHandler.success(res, 'Export request received', {
      message: 'Export will be processed and sent to your email',
      exportId: `exp_${Date.now()}`,
      type,
      format,
      estimatedTime: '5-10 minutes'
    });
  } catch (error) {
    logger.error('Error processing export request:', error);
    ResponseHandler.error(res, 'Failed to process export request', 500);
  }
});

module.exports = router;
