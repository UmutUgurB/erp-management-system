const nodemailer = require('nodemailer');
const { logger } = require('./logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email service initialization failed', { error: error.message });
      } else {
        logger.info('Email service initialized successfully');
      }
    });
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'ERP Sistemine Hoş Geldiniz!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">ERP Sistemine Hoş Geldiniz!</h2>
          <p>Merhaba ${user.name},</p>
          <p>ERP sistemine başarıyla kayıt oldunuz. Hesabınız şu bilgilerle oluşturuldu:</p>
          <ul>
            <li><strong>E-posta:</strong> ${user.email}</li>
            <li><strong>Rol:</strong> ${user.role}</li>
            <li><strong>Kayıt Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</li>
          </ul>
          <p>Sisteme giriş yapmak için <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">buraya tıklayın</a>.</p>
          <p>Herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Şifre Sıfırlama</h2>
          <p>Merhaba ${user.name},</p>
          <p>ERP sisteminde şifre sıfırlama talebinde bulundunuz.</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p>Bu link 1 saat boyunca geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(user, order) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: `Sipariş Onayı - #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Sipariş Onayı</h2>
          <p>Merhaba ${user.name},</p>
          <p>Siparişiniz başarıyla oluşturuldu. Sipariş detayları aşağıdadır:</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Sipariş Bilgileri</h3>
            <p><strong>Sipariş No:</strong> #${order.orderNumber}</p>
            <p><strong>Tarih:</strong> ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
            <p><strong>Durum:</strong> ${order.status}</p>
            <p><strong>Toplam Tutar:</strong> ₺${order.totalAmount.toLocaleString('tr-TR')}</p>
          </div>

          <h3>Sipariş Ürünleri</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #d1d5db;">Ürün</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">Adet</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #d1d5db;">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #d1d5db;">${item.product.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #d1d5db;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #d1d5db;">₺${item.price.toLocaleString('tr-TR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p>Siparişinizi takip etmek için <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders">siparişler sayfasını</a> ziyaret edin.</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Send order status update email
  async sendOrderStatusUpdateEmail(user, order) {
    const statusMessages = {
      'confirmed': 'Siparişiniz onaylandı ve işleme alındı.',
      'processing': 'Siparişiniz hazırlanıyor.',
      'shipped': 'Siparişiniz kargoya verildi.',
      'delivered': 'Siparişiniz teslim edildi.',
      'cancelled': 'Siparişiniz iptal edildi.'
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: `Sipariş Durumu Güncellendi - #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Sipariş Durumu Güncellendi</h2>
          <p>Merhaba ${user.name},</p>
          <p>Siparişinizin durumu güncellendi:</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Sipariş Bilgileri</h3>
            <p><strong>Sipariş No:</strong> #${order.orderNumber}</p>
            <p><strong>Yeni Durum:</strong> ${order.status}</p>
            <p><strong>Güncelleme Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            <p><strong>Açıklama:</strong> ${statusMessages[order.status] || 'Durum güncellendi.'}</p>
          </div>

          <p>Siparişinizi takip etmek için <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders">siparişler sayfasını</a> ziyaret edin.</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Send stock alert email
  async sendStockAlertEmail(admins, product) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: admins.map(admin => admin.email).join(','),
      subject: 'Stok Uyarısı',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Stok Uyarısı</h2>
          <p>Aşağıdaki ürünün stok seviyesi kritik seviyeye düştü:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>Ürün Bilgileri</h3>
            <p><strong>Ürün Adı:</strong> ${product.name}</p>
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p><strong>Mevcut Stok:</strong> ${product.stock}</p>
            <p><strong>Minimum Stok:</strong> ${product.minStock}</p>
            <p><strong>Kategori:</strong> ${product.category}</p>
          </div>

          <p>Lütfen stok seviyesini kontrol edin ve gerekli önlemleri alın.</p>
          <p>Ürünü düzenlemek için <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/products">ürünler sayfasını</a> ziyaret edin.</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Send system notification email
  async sendSystemNotificationEmail(user, notification) {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${notification.title}</h2>
          <p>Merhaba ${user.name},</p>
          <p>${notification.message}</p>
          ${notification.data.details ? `<p><strong>Detaylar:</strong> ${notification.data.details}</p>` : ''}
          <p>Tarih: ${new Date(notification.timestamp).toLocaleDateString('tr-TR')}</p>
          <p>Saygılarımızla,<br>ERP Sistemi</p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  }

  // Generic email sending method
  async sendEmail(mailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed', {
        error: error.message,
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      throw error;
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is working correctly' };
    } catch (error) {
      logger.error('Email service test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService; 