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

### 📦 Inventory Management
- **Stock tracking** with real-time updates
- **Inventory transactions** (stock-in, stock-out, transfer, adjustment)
- **Stock count** operations with variance tracking
- **Low stock alerts** and notifications
- **Inventory analytics** and reporting
- **Barcode/QR code** support (planned)

### 👥 Customer Management (CRM)
- **Customer profiles** with detailed information
- **Customer interactions** and communication history
- **Lead management** and conversion tracking
- **Customer analytics** and reporting
- **Contact management** with multiple contacts per customer

### 💰 Financial Management
- **Invoice generation** and management
- **Payment tracking** with multiple payment methods
- **Financial reporting** and analytics
- **Overdue payment** monitoring
- **Currency support** (TRY, USD, EUR, GBP)
- **Tax calculation** and management

### 📋 Project Management
- **Project lifecycle** management
- **Team collaboration** with role assignments
- **Project progress** tracking
- **Budget management** and cost tracking
- **Project analytics** and reporting
- **Document management** for projects

### ✅ Task Management
- **Task creation** and assignment
- **Time tracking** with start/stop functionality
- **Task dependencies** and relationships
- **Progress tracking** with percentage completion
- **Task comments** and collaboration
- **Time analytics** and reporting

### 🏢 Asset Management
- **Asset lifecycle** tracking
- **Maintenance scheduling** and history
- **Asset depreciation** and value tracking
- **Warranty management** with expiry alerts
- **Asset assignment** to employees
- **Asset analytics** and reporting

### 📊 Dashboard & Analytics
- **Real-time statistics** and KPIs
- **Advanced analytics** with interactive charts
- **Sales analytics** and reporting
- **Stock alerts** and notifications
- **System status** monitoring
- **Performance metrics** and monitoring
- **Custom reports** with PDF export

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Dark/Light mode** support
- **Advanced notifications** with sound and animations
- **Interactive forms** with validation
- **Loading states** and error handling
- **Multi-language support** (Turkish/English)
- **Real-time notifications** with WebSocket
- **Advanced search** and filtering
- **File upload** with drag & drop
- **Data export/import** (CSV, Excel, PDF)

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
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time communication
- **Next-intl** - Internationalization
- **jsPDF** - PDF generation
- **ExcelJS** - Excel file handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **Winston** - Logging system
- **Nodemailer** - Email service
- **Swagger** - API documentation
- **Helmet** - Security headers
- **Rate Limiting** - API protection

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
   - Health Check: http://localhost:5000/health

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

### System Management
```
GET    /api/metrics           # Get performance metrics
POST   /api/metrics/reset     # Reset metrics
GET    /api/metrics/system    # Get system information
GET    /api/backup/stats      # Get backup statistics
GET    /api/backup/list       # List backups
POST   /api/backup/create     # Create backup
POST   /api/backup/restore/:filename # Restore backup
DELETE /api/backup/delete/:filename # Delete backup
GET    /api/backup/download/:filename # Download backup
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

# 🏢 Modern ERP Management System

Modern, full-stack ERP (Enterprise Resource Planning) sistemi. React, Node.js, MongoDB ve TypeScript kullanılarak geliştirilmiştir.

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- **Kullanıcı kayıt** ve giriş sistemi
- **Rol tabanlı** yetkilendirme (admin, manager, user)
- **JWT token** tabanlı kimlik doğrulama
- **Şifre hashleme** ve güvenlik

### 📦 Ürün Yönetimi
- **Ürün kataloğu** yönetimi
- **Kategori** ve **marka** organizasyonu
- **Stok takibi** ve **minimum stok** uyarıları
- **Ürün arama** ve filtreleme
- **Toplu işlemler** (import/export)

### 🛒 Sipariş Yönetimi
- **Sipariş oluşturma** ve takibi
- **Müşteri bilgileri** entegrasyonu
- **Ödeme durumu** yönetimi
- **Sipariş geçmişi** ve analitik

### 📦 Envanter Yönetimi
- **Stok takibi** gerçek zamanlı güncellemeler
- **Envanter işlemleri** (stok-giriş, stok-çıkış, transfer, düzeltme)
- **Stok sayımı** işlemleri varyans takibi
- **Düşük stok uyarıları** ve bildirimler
- **Envanter analitik** ve raporlama
- **Barkod/QR kod** desteği (planlanan)

### 👥 Müşteri Yönetimi (CRM)
- **Müşteri profilleri** detaylı bilgilerle
- **Müşteri etkileşimleri** ve iletişim geçmişi
- **Lead yönetimi** ve dönüşüm takibi
- **Müşteri analitik** ve raporlama
- **İletişim yönetimi** müşteri başına birden fazla kişi

### 💰 Finansal Yönetim
- **Fatura oluşturma** ve yönetimi
- **Ödeme takibi** birden fazla ödeme yöntemiyle
- **Finansal raporlama** ve analitik
- **Gecikmiş ödeme** izleme
- **Para birimi desteği** (TRY, USD, EUR, GBP)
- **Vergi hesaplama** ve yönetimi

### 📋 Proje Yönetimi
- **Proje yaşam döngüsü** yönetimi
- **Ekip işbirliği** rol atamalarıyla
- **Proje ilerleme** takibi
- **Bütçe yönetimi** ve maliyet takibi
- **Proje analitik** ve raporlama
- **Proje doküman yönetimi**

### ✅ Görev Yönetimi
- **Görev oluşturma** ve atama
- **Zaman takibi** başlat/durdur işlevselliği
- **Görev bağımlılıkları** ve ilişkiler
- **İlerleme takibi** yüzde tamamlanma
- **Görev yorumları** ve işbirliği
- **Zaman analitik** ve raporlama

### 🏢 Varlık Yönetimi
- **Varlık yaşam döngüsü** takibi
- **Bakım planlama** ve geçmişi
- **Varlık amortismanı** ve değer takibi
- **Garanti yönetimi** süre dolumu uyarıları
- **Varlık atama** çalışanlara
- **Varlık analitik** ve raporlama

### 📊 Dashboard & Analitik
- **Gerçek zamanlı** istatistikler
- **Grafik ve** chart'lar
- **Özelleştirilebilir** widget'lar
- **Raporlama** sistemi
- **Export** özellikleri (PDF, Excel)

### 🔔 Bildirim Sistemi
- **Gerçek zamanlı** bildirimler
- **Farklı bildirim türleri** (başarı, hata, uyarı, bilgi)
- **Otomatik kapanma** ve manuel kapatma
- **Animasyonlu** bildirimler
- **İlerleme çubuğu** gösterimi

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Modern UI
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validasyonu
- **Lucide React** - İkonlar
- **Axios** - HTTP istekleri
- **Recharts** - Veri görselleştirme
- **Socket.IO Client** - Gerçek zamanlı iletişim
- **Next-intl** - Çoklu dil desteği
- **jsPDF** - PDF oluşturma
- **ExcelJS** - Excel dosya işleme

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Veritabanı
- **Mongoose** - ODM
- **JWT** - Kimlik doğrulama
- **bcrypt** - Şifre hashleme
- **CORS** - Cross-origin resource sharing
- **Socket.IO** - Gerçek zamanlı iletişim
- **Multer** - Dosya yükleme
- **Winston** - Loglama
- **Nodemailer** - Email gönderimi
- **Swagger** - API dokümantasyonu
- **Helmet** - Güvenlik
- **Rate Limiting** - API koruması

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **Redis** - Caching (opsiyonel)
- **Health checks** - Servis sağlığı kontrolü

## 🐳 Docker ile Kurulum

### Gereksinimler
- Docker
- Docker Compose

### Hızlı Başlangıç

```bash
# Projeyi klonlayın
git clone https://github.com/yourusername/erp-management-system.git
cd erp-management-system

# Docker ile başlatın
npm run docker:up

# Veya manuel olarak
docker-compose up -d
```

### Docker Komutları

```bash
# Tüm servisleri başlat
npm run docker:up

# Servisleri durdur
npm run docker:down

# Logları görüntüle
npm run docker:logs

# Servisleri yeniden başlat
npm run docker:restart

# Temizlik (volumes dahil)
npm run docker:clean
```

### Servisler
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379 (opsiyonel)
- **Nginx**: http://localhost:80 (opsiyonel)

## 🛠️ Geliştirme Kurulumu

### Gereksinimler
- Node.js 18+
- MongoDB 6.0+
- npm veya yarn

### Kurulum Adımları

```bash
# Projeyi klonlayın
git clone https://github.com/yourusername/erp-management-system.git
cd erp-management-system

# Tüm bağımlılıkları yükleyin
npm run install:all

# Geliştirme sunucularını başlatın
npm run dev
```

### Ortam Değişkenleri

Backend için `.env` dosyası oluşturun:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp_system
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

Frontend için `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📝 API Dokümantasyonu

API dokümantasyonu Swagger ile sağlanmaktadır:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

## 🔧 Geliştirme Komutları

```bash
# Geliştirme
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Docker
npm run docker:up
```

## 📊 Demo Hesaplar

- **Admin**: admin@example.com / 123456
- **Manager**: manager@example.com / 123456

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Email**: your.email@example.com
- **LinkedIn**: [Your Name](https://linkedin.com/in/yourprofile)
- **GitHub**: [@yourusername](https://github.com/yourusername)

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projelerin kullanımıyla mümkün olmuştur:
- Next.js
- Express.js
- MongoDB
- Tailwind CSS
- Ve diğer tüm bağımlılıklar

