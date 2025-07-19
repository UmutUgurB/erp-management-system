# ERP Yönetim Sistemi

Modern, kullanıcı dostu ve tam özellikli bir Enterprise Resource Planning (ERP) sistemi. Next.js, Tailwind CSS, Node.js Express.js ve MongoDB teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama & Yetkilendirme
- JWT tabanlı güvenli kimlik doğrulama
- Rol tabanlı erişim kontrolü (Admin, Manager, Employee)
- Şifre şifreleme (bcrypt)
- Oturum yönetimi

### 📦 Ürün Yönetimi
- Ürün CRUD operasyonları
- Stok takibi ve uyarı sistemi
- Kategori bazlı filtreleme
- Arama ve sayfalama
- SKU yönetimi
- Kar marjı hesaplama

### 🛒 Sipariş Yönetimi
- Sipariş oluşturma ve takibi
- Otomatik sipariş numarası oluşturma
- Sipariş durumu yönetimi (Beklemede, Onaylandı, İşleniyor, Kargoda, Teslim Edildi)
- Ödeme durumu takibi
- Stok otomatik güncellemesi

### 👥 Kullanıcı Yönetimi
- Kullanıcı CRUD operasyonları (Admin yetkisi)
- Departman bazlı organizasyon
- Kullanıcı aktivasyon/deaktivasyon
- Şifre değiştirme

### 📊 Dashboard & Raporlama
- Gerçek zamanlı istatistikler
- Stok uyarıları
- Sipariş durumu özeti
- Toplam ciro hesaplama
- Responsive tasarım

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL veritabanı
- **Mongoose** - MongoDB object modeling
- **JWT** - Token bazlı kimlik doğrulama
- **bcryptjs** - Şifre şifreleme
- **cors** - Cross-origin resource sharing

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - İkonlar
- **React Hot Toast** - Bildirimler

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB (v5 veya üzeri)
- npm veya yarn

## 🚀 Kurulum

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/kullanici-adi/erp-sistemi.git
cd erp-sistemi
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

Backend için environment dosyası oluşturun:
```bash
# .env dosyası oluşturun
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Frontend Kurulumu
```bash
cd ../frontend
npm install
```

Frontend için environment dosyası oluşturun:
```bash
# .env.local dosyası oluşturun
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. MongoDB'yi Başlatın
```bash
# MongoDB servisini başlatın (sistem ayarlarına göre)
mongod
```

### 5. Uygulamayı Çalıştırın

Backend'i başlatın:
```bash
cd backend
npm run dev
```

Frontend'i başlatın (yeni terminal):
```bash
cd frontend
npm run dev
```

## 🌐 Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👤 Demo Kullanıcılar

Sistemi test etmek için aşağıdaki demo hesapları kullanabilirsiniz:

```
Admin:
Email: admin@example.com
Şifre: 123456

Manager:
Email: manager@example.com
Şifre: 123456

Employee:
Email: employee@example.com
Şifre: 123456
```

## 📁 Proje Yapısı

```
erp-sistemi/
├── backend/
│   ├── models/          # MongoDB modelleri
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/          # API route'ları
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/      # Middleware fonksiyonları
│   │   └── auth.js
│   ├── server.js        # Ana sunucu dosyası
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (App Router)
│   │   ├── components/  # React bileşenleri
│   │   ├── context/     # Context providers
│   │   └── lib/         # Utility fonksiyonları
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri

### Users (Admin only)
- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/:id` - Kullanıcı detayı
- `PUT /api/users/:id` - Kullanıcı güncelle
- `DELETE /api/users/:id` - Kullanıcı sil
- `PATCH /api/users/:id/status` - Kullanıcı durumu güncelle

### Products
- `GET /api/products` - Ürünleri listele
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün oluştur (Admin/Manager)
- `PUT /api/products/:id` - Ürün güncelle (Admin/Manager)
- `DELETE /api/products/:id` - Ürün sil (Admin)
- `PATCH /api/products/:id/stock` - Stok güncelle

### Orders
- `GET /api/orders` - Siparişleri listele
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders` - Sipariş oluştur
- `PATCH /api/orders/:id/status` - Sipariş durumu güncelle
- `PATCH /api/orders/:id/payment` - Ödeme durumu güncelle
- `DELETE /api/orders/:id` - Sipariş sil (Admin)

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Şifre şifreleme (bcrypt)
- Rol tabanlı erişim kontrolü
- Input validation ve sanitization
- CORS koruması
- Environment variables kullanımı

## 📱 Responsive Tasarım

- Mobile-first yaklaşım
- Tablet ve desktop uyumlu
- Modern UI/UX tasarımı
- Tailwind CSS ile optimize edilmiş

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📧 İletişim

Proje sahibi: [İsim]
Email: [email@example.com]
GitHub: [https://github.com/kullanici-adi]

## 🙏 Teşekkürler

Bu projenin geliştirilmesinde kullanılan açık kaynak teknolojilere ve topluluğa teşekkürler.

---

**Not**: Bu sistem demo amaçlı geliştirilmiştir. Üretim ortamında kullanmadan önce güvenlik testlerini tamamlayın ve gerekli konfigürasyonları yapın. 