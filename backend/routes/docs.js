const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { ResponseHandler } = require('../utils/responseHandler');

/**
 * @route GET /api/docs
 * @desc Get API documentation overview
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const apiDocs = {
      name: 'ERP Management System API',
      version: '2.1.0',
      description: 'Comprehensive ERP system API with advanced features',
      baseUrl: '/api',
      endpoints: {
        authentication: {
          base: '/auth',
          endpoints: [
            { path: '/login', method: 'POST', description: 'User login' },
            { path: '/register', method: 'POST', description: 'User registration' },
            { path: '/refresh', method: 'POST', description: 'Refresh access token' },
            { path: '/logout', method: 'POST', description: 'User logout' }
          ]
        },
        users: {
          base: '/users',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get all users' },
            { path: '/:id', method: 'GET', description: 'Get user by ID' },
            { path: '/', method: 'POST', description: 'Create new user' },
            { path: '/:id', method: 'PUT', description: 'Update user' },
            { path: '/:id', method: 'DELETE', description: 'Delete user' }
          ]
        },
        employees: {
          base: '/employees',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get all employees' },
            { path: '/:id', method: 'GET', description: 'Get employee by ID' },
            { path: '/', method: 'POST', description: 'Create new employee' },
            { path: '/:id', method: 'PUT', description: 'Update employee' },
            { path: '/:id', method: 'DELETE', description: 'Delete employee' }
          ]
        },
        products: {
          base: '/products',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get all products' },
            { path: '/:id', method: 'GET', description: 'Get product by ID' },
            { path: '/', method: 'POST', description: 'Create new product' },
            { path: '/:id', method: 'PUT', description: 'Update product' },
            { path: '/:id', method: 'DELETE', description: 'Delete product' }
          ]
        },
        orders: {
          base: '/orders',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get all orders' },
            { path: '/:id', method: 'GET', description: 'Get order by ID' },
            { path: '/', method: 'POST', description: 'Create new order' },
            { path: '/:id', method: 'PUT', description: 'Update order' },
            { path: '/:id', method: 'DELETE', description: 'Delete order' }
          ]
        },
        analytics: {
          base: '/analytics',
          endpoints: [
            { path: '/dashboard', method: 'GET', description: 'Get dashboard analytics' },
            { path: '/sales', method: 'GET', description: 'Get sales analytics' },
            { path: '/performance', method: 'GET', description: 'Get performance analytics' },
            { path: '/inventory', method: 'GET', description: 'Get inventory analytics' },
            { path: '/trends', method: 'GET', description: 'Get trending data' },
            { path: '/export', method: 'GET', description: 'Export analytics data' }
          ]
        },
        webhooks: {
          base: '/webhooks',
          endpoints: [
            { path: '/stripe', method: 'POST', description: 'Handle Stripe webhooks' },
            { path: '/slack', method: 'POST', description: 'Handle Slack webhooks' },
            { path: '/github', method: 'POST', description: 'Handle GitHub webhooks' },
            { path: '/custom', method: 'POST', description: 'Handle custom webhooks' },
            { path: '/health', method: 'GET', description: 'Check webhook system health' }
          ]
        },
        attendance: {
          base: '/attendance',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get attendance records' },
            { path: '/:id', method: 'GET', description: 'Get attendance by ID' },
            { path: '/', method: 'POST', description: 'Create attendance record' },
            { path: '/:id', method: 'PUT', description: 'Update attendance' },
            { path: '/:id', method: 'DELETE', description: 'Delete attendance' }
          ]
        },
        performance: {
          base: '/performance',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get performance records' },
            { path: '/:id', method: 'GET', description: 'Get performance by ID' },
            { path: '/', method: 'POST', description: 'Create performance record' },
            { path: '/:id', method: 'PUT', description: 'Update performance' },
            { path: '/:id', method: 'DELETE', description: 'Delete performance' }
          ]
        },
        leave: {
          base: '/leave',
          endpoints: [
            { path: '/', method: 'GET', description: 'Get leave requests' },
            { path: '/:id', method: 'GET', description: 'Get leave by ID' },
            { path: '/', method: 'POST', description: 'Create leave request' },
            { path: '/:id', method: 'PUT', description: 'Update leave request' },
            { path: '/:id', method: 'DELETE', description: 'Delete leave request' }
          ]
        },
        export: {
          base: '/export',
          endpoints: [
            { path: '/data', method: 'POST', description: 'Export data in various formats' },
            { path: '/reports', method: 'GET', description: 'Get available report templates' },
            { path: '/schedule', method: 'POST', description: 'Schedule automated exports' }
          ]
        }
      },
      authentication: {
        type: 'JWT',
        header: 'Authorization: Bearer <token>',
        endpoints: ['/auth/login', '/auth/register']
      },
      rateLimiting: {
        windowMs: '15 minutes',
        maxRequests: 100,
        message: 'Too many requests from this IP'
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
        queryParams: ['page', 'limit', 'sort', 'filter']
      },
      errorCodes: {
        400: 'Bad Request - Invalid input data',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Resource not found',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - Server error occurred'
      },
      examples: {
        login: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            email: 'user@example.com',
            password: 'password123'
          },
          response: {
            success: true,
            message: 'Login successful',
            data: {
              user: { id: '123', email: 'user@example.com', role: 'user' },
              token: 'jwt_token_here'
            }
          }
        },
        createProduct: {
          method: 'POST',
          url: '/api/products',
          headers: {
            'Authorization': 'Bearer <token>',
            'Content-Type': 'application/json'
          },
          body: {
            name: 'Sample Product',
            description: 'Product description',
            price: 99.99,
            category: 'Electronics',
            stockQuantity: 100
          },
          response: {
            success: true,
            message: 'Product created successfully',
            data: {
              id: 'product_id',
              name: 'Sample Product',
              price: 99.99,
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      },
      changelog: [
        {
          version: '2.1.0',
          date: '2024-01-01',
          changes: [
            'Added comprehensive analytics API',
            'Added webhook system for external integrations',
            'Added scheduled job system',
            'Enhanced security features',
            'Improved error handling and logging'
          ]
        },
        {
          version: '2.0.0',
          date: '2023-12-01',
          changes: [
            'Complete API redesign',
            'Added real-time WebSocket support',
            'Enhanced authentication system',
            'Added role-based access control'
          ]
        }
      ],
      support: {
        email: 'support@erpsystem.com',
        documentation: 'https://docs.erpsystem.com',
        github: 'https://github.com/erpsystem/api',
        status: 'https://status.erpsystem.com'
      }
    };

    ResponseHandler.success(res, 'API documentation retrieved successfully', apiDocs);
  } catch (error) {
    logger.error('Error generating API documentation:', error);
    ResponseHandler.error(res, 'Failed to generate API documentation', 500);
  }
});

/**
 * @route GET /api/docs/swagger
 * @desc Get Swagger/OpenAPI specification
 * @access Public
 */
router.get('/swagger', async (req, res) => {
  try {
    const swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'ERP Management System API',
        version: '2.1.0',
        description: 'Comprehensive ERP system API with advanced features',
        contact: {
          name: 'ERP Development Team',
          email: 'support@erpsystem.com'
        }
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
          description: 'Development server'
        },
        {
          url: 'https://api.erpsystem.com/api',
          description: 'Production server'
        }
      ],
      paths: {
        '/auth/login': {
          post: {
            summary: 'User login',
            tags: ['Authentication'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string', minLength: 6 }
                    },
                    required: ['email', 'password']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                          type: 'object',
                          properties: {
                            user: { type: 'object' },
                            token: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    };

    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  } catch (error) {
    logger.error('Error generating Swagger specification:', error);
    ResponseHandler.error(res, 'Failed to generate Swagger specification', 500);
  }
});

/**
 * @route GET /api/docs/health
 * @desc Get API health status
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      endpoints: {
        total: 45,
        active: 45,
        deprecated: 0
      }
    };

    ResponseHandler.success(res, 'API health check successful', healthStatus);
  } catch (error) {
    logger.error('Error checking API health:', error);
    ResponseHandler.error(res, 'Health check failed', 500);
  }
});

module.exports = router;
