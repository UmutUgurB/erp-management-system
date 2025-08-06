// MongoDB initialization script
db = db.getSiblingDB('erp_system');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('customers');
db.createCollection('invoices');
db.createCollection('projects');
db.createCollection('tasks');
db.createCollection('assets');
db.createCollection('inventory');
db.createCollection('stockcounts');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "name": 1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.customers.createIndex({ "email": 1 }, { unique: true });
db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true });
db.projects.createIndex({ "code": 1 }, { unique: true });
db.assets.createIndex({ "code": 1 }, { unique: true });

print('MongoDB initialized successfully!'); 