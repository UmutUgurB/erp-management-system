<div align="center">
  <img src="https://via.placeholder.com/800x200/1f2937/ffffff?text=ERP+System" alt="ERP System Banner" width="100%">
  
  # 🏢 Modern ERP System
  
  *Full-stack enterprise resource planning system built with modern technologies*
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-blue.svg)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://mongodb.com/)
  [![Express](https://img.shields.io/badge/Express-4.18-gray.svg)](https://expressjs.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  
  [🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Request Feature](#)
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📚 API Documentation](#-api-documentation)
- [🎨 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Manager, User)
- **Protected routes** and middleware
- **Session management** with automatic logout

### 👥 User Management
- **User registration** and profile management
- **Role assignment** and permissions
- **User status** (Active/Inactive)
- **Password hashing** with bcrypt

### 📦 Product Management
- **Product catalog** with categories and SKU management
- **Stock tracking** with minimum stock alerts
- **Price management** with cost and profit calculations
- **Product status** (Active/Inactive)
- **Advanced search** and filtering

### 🛒 Order Management
- **Order creation** with product selection
- **Real-time calculations** (tax, discount, totals)
- **Order status tracking** (Pending, Confirmed, Processing, Shipped, Delivered)
- **Payment status** management
- **Order history** and analytics

### 📊 Dashboard & Analytics
- **Real-time statistics** and KPIs
- **Sales analytics** and reporting
- **Stock alerts** and notifications
- **System status** monitoring

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Dark/Light mode** support
- **Advanced notifications** with sound and animations
- **Interactive forms** with validation
- **Loading states** and error handling

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Postman** - API testing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/erp-system.git
   cd erp-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/erp-system
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api-docs

### Demo Users
```
Admin: admin@erp.com / admin123
Manager: manager@erp.com / manager123
User: user@erp.com / user123
```

---

## 📁 Project Structure

```
erp-system/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── server.js          # Express server
│   └── package.json
│
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── lib/           # Utilities and API
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
│
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp-system
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Database Configuration
- **MongoDB Local**: Install and run MongoDB locally
- **MongoDB Atlas**: Use cloud MongoDB service
- **Connection String**: Update `MONGODB_URI` in backend `.env`

---

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/profile        # Get user profile
```

### User Management
```
GET    /api/users             # Get all users
GET    /api/users/:id         # Get user by ID
POST   /api/users             # Create user
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user
```

### Product Management
```
GET    /api/products          # Get all products
GET    /api/products/:id      # Get product by ID
POST   /api/products          # Create product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id      # Delete product
```

### Order Management
```
GET    /api/orders            # Get all orders
GET    /api/orders/:id        # Get order by ID
POST   /api/orders            # Create order
PUT    /api/orders/:id        # Update order
DELETE /api/orders/:id        # Delete order
PATCH  /api/orders/:id/status # Update order status
```

---

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=Dashboard+Screenshot)

### Product Management
![Products](https://via.placeholder.com/800x400/1f2937/ffffff?text=Product+Management)

### Order Creation
![Orders](https://via.placeholder.com/800x400/1f2937/ffffff?text=Order+Creation)

### User Management
![Users](https://via.placeholder.com/800x400/1f2937/ffffff?text=User+Management)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by [Your Name]</p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)
  [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourusername)
</div> 