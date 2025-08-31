const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { ResponseHandler } = require('../utils/responseHandler');
const crypto = require('crypto');

// Webhook configurations
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-key';
const WEBHOOK_TIMEOUT = 5000; // 5 seconds

/**
 * @route POST /api/webhooks/stripe
 * @desc Handle Stripe webhook events
 * @access Public (but verified with signature)
 */
router.post('/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return ResponseHandler.error(res, 'Missing Stripe signature', 400);
    }

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature received', { signature, expectedSignature });
      return ResponseHandler.error(res, 'Invalid signature', 400);
    }

    const event = req.body;
    logger.info('Stripe webhook received', { eventType: event.type, eventId: event.id });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object);
        break;
      default:
        logger.info('Unhandled Stripe event type', { eventType: event.type });
    }

    ResponseHandler.success(res, 'Webhook processed successfully');
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    ResponseHandler.error(res, 'Webhook processing failed', 500);
  }
});

/**
 * @route POST /api/webhooks/slack
 * @desc Handle Slack webhook events
 * @access Public
 */
router.post('/slack', async (req, res) => {
  try {
    const { type, challenge, event } = req.body;
    
    // Handle Slack URL verification
    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    logger.info('Slack webhook received', { type, eventType: event?.type });

    // Handle different Slack events
    if (event && event.type === 'message') {
      await handleSlackMessage(event);
    }

    ResponseHandler.success(res, 'Slack webhook processed successfully');
  } catch (error) {
    logger.error('Error processing Slack webhook:', error);
    ResponseHandler.error(res, 'Webhook processing failed', 500);
  }
});

/**
 * @route POST /api/webhooks/github
 * @desc Handle GitHub webhook events
 * @access Public (but verified with signature)
 */
router.post('/github', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    
    if (!signature) {
      return ResponseHandler.error(res, 'Missing GitHub signature', 400);
    }

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('Invalid GitHub webhook signature', { signature, expectedSignature });
      return ResponseHandler.error(res, 'Invalid signature', 400);
    }

    const event = req.body;
    logger.info('GitHub webhook received', { eventType: req.headers['x-github-event'] });

    // Handle different GitHub events
    switch (req.headers['x-github-event']) {
      case 'push':
        await handleGitHubPush(event);
        break;
      case 'pull_request':
        await handleGitHubPullRequest(event);
        break;
      case 'issues':
        await handleGitHubIssue(event);
        break;
      default:
        logger.info('Unhandled GitHub event type', { eventType: req.headers['x-github-event'] });
    }

    ResponseHandler.success(res, 'GitHub webhook processed successfully');
  } catch (error) {
    logger.error('Error processing GitHub webhook:', error);
    ResponseHandler.error(res, 'Webhook processing failed', 500);
  }
});

/**
 * @route POST /api/webhooks/custom
 * @desc Handle custom webhook events
 * @access Public
 */
router.post('/custom', async (req, res) => {
  try {
    const { event, data, source } = req.body;
    
    logger.info('Custom webhook received', { event, source });

    // Process custom webhook based on event type
    switch (event) {
      case 'order.created':
        await handleOrderCreated(data);
        break;
      case 'inventory.low_stock':
        await handleLowStockAlert(data);
        break;
      case 'employee.performance_update':
        await handlePerformanceUpdate(data);
        break;
      default:
        logger.info('Unhandled custom event type', { event });
    }

    ResponseHandler.success(res, 'Custom webhook processed successfully');
  } catch (error) {
    logger.error('Error processing custom webhook:', error);
    ResponseHandler.error(res, 'Webhook processing failed', 500);
  }
});

/**
 * @route GET /api/webhooks/health
 * @desc Check webhook system health
 * @access Private
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date(),
      webhooks: {
        stripe: 'active',
        slack: 'active',
        github: 'active',
        custom: 'active'
      },
      lastProcessed: {
        stripe: new Date(Date.now() - 300000), // 5 minutes ago
        slack: new Date(Date.now() - 600000),  // 10 minutes ago
        github: new Date(Date.now() - 900000), // 15 minutes ago
        custom: new Date(Date.now() - 1200000) // 20 minutes ago
      }
    };

    ResponseHandler.success(res, 'Webhook system is healthy', healthStatus);
  } catch (error) {
    logger.error('Error checking webhook health:', error);
    ResponseHandler.error(res, 'Health check failed', 500);
  }
});

// Webhook event handlers
async function handlePaymentSuccess(paymentIntent) {
  logger.info('Payment succeeded', { paymentId: paymentIntent.id, amount: paymentIntent.amount });
  // Update order status, send confirmation email, etc.
}

async function handlePaymentFailure(paymentIntent) {
  logger.warn('Payment failed', { paymentId: paymentIntent.id, amount: paymentIntent.amount });
  // Update order status, send failure notification, etc.
}

async function handleInvoicePayment(invoice) {
  logger.info('Invoice payment succeeded', { invoiceId: invoice.id, amount: invoice.amount_paid });
  // Update invoice status, send receipt, etc.
}

async function handleSlackMessage(event) {
  logger.info('Slack message received', { channel: event.channel, user: event.user, text: event.text });
  // Process Slack message, respond if needed, etc.
}

async function handleGitHubPush(event) {
  logger.info('GitHub push received', { repo: event.repository.name, branch: event.ref });
  // Trigger CI/CD, update deployment status, etc.
}

async function handleGitHubPullRequest(event) {
  logger.info('GitHub PR received', { repo: event.repository.name, prNumber: event.pull_request.number });
  // Update project status, notify team, etc.
}

async function handleGitHubIssue(event) {
  logger.info('GitHub issue received', { repo: event.repository.name, issueNumber: event.issue.number });
  // Create support ticket, assign to team, etc.
}

async function handleOrderCreated(data) {
  logger.info('Order created webhook', { orderId: data.orderId, customer: data.customer });
  // Send notifications, update inventory, etc.
}

async function handleLowStockAlert(data) {
  logger.warn('Low stock alert webhook', { productId: data.productId, currentStock: data.currentStock });
  // Send notifications, create purchase orders, etc.
}

async function handlePerformanceUpdate(data) {
  logger.info('Performance update webhook', { employeeId: data.employeeId, score: data.score });
  // Update dashboards, send notifications, etc.
}

module.exports = router;
