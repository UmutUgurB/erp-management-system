'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Search, 
  BookOpen, 
  Video, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Zap, 
  Shield, 
  Headphones,
  Send,
  Plus,
  Minus,
  ChevronDown,
  ExternalLink,
  Download,
  Play,
  Calendar,
  MapPin
} from 'lucide-react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('help');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Canlı Sohbet',
      description: '7/24 canlı destek ekibimizle anında iletişime geçin',
      status: 'online',
      responseTime: '2-5 dakika',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Phone,
      title: 'Telefon Desteği',
      description: 'Teknik destek ekibimizi arayın',
      status: 'available',
      responseTime: '5-15 dakika',
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Mail,
      title: 'E-posta Desteği',
      description: 'Detaylı sorunlarınızı e-posta ile gönderin',
      status: 'available',
      responseTime: '2-4 saat',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: Users,
      title: 'Topluluk Forumu',
      description: 'Diğer kullanıcılarla deneyimlerinizi paylaşın',
      status: 'active',
      responseTime: '1-24 saat',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const faqCategories = [
    {
      title: 'Genel Sorular',
      icon: HelpCircle,
      faqs: [
        {
          question: 'ERP sistemini nasıl kullanmaya başlayabilirim?',
          answer: 'Sisteme giriş yaptıktan sonra Dashboard sayfasından başlayabilirsiniz. Sol menüden istediğiniz modülü seçerek işlemlerinizi gerçekleştirebilirsiniz.'
        },
        {
          question: 'Şifremi unuttum, ne yapmalıyım?',
          answer: 'Login sayfasında "Şifremi Unuttum" linkine tıklayarak e-posta adresinize sıfırlama linki gönderebiliriz.'
        },
        {
          question: 'Sistemde kaç kullanıcı çalışabilir?',
          answer: 'Lisansınıza bağlı olarak sınırsız kullanıcı ekleyebilirsiniz. Her kullanıcı için ayrı rol ve yetki tanımlayabilirsiniz.'
        }
      ]
    },
    {
      title: 'Teknik Destek',
      icon: Zap,
      faqs: [
        {
          question: 'Tarayıcı uyumluluğu nasıl?',
          answer: 'Modern tarayıcılar (Chrome, Firefox, Safari, Edge) ile tam uyumludur. En iyi deneyim için güncel tarayıcı kullanmanızı öneririz.'
        },
        {
          question: 'Mobil cihazlarda kullanabilir miyim?',
          answer: 'Evet, sistem tamamen responsive tasarıma sahiptir ve tüm mobil cihazlarda kullanılabilir.'
        },
        {
          question: 'Veri yedekleme nasıl yapılıyor?',
          answer: 'Sistem otomatik olarak günlük yedekleme yapar. Manuel yedekleme için Dashboard > Backup menüsünü kullanabilirsiniz.'
        }
      ]
    },
    {
      title: 'Özellikler',
      icon: Star,
      faqs: [
        {
          question: 'Hangi raporları oluşturabilirim?',
          answer: 'Satış, stok, müşteri, çalışan, finansal ve özel raporlar oluşturabilirsiniz. Tüm raporlar PDF, Excel ve CSV formatlarında dışa aktarılabilir.'
        },
        {
          question: 'API entegrasyonu mevcut mu?',
          answer: 'Evet, GraphQL API ile tüm sistem fonksiyonlarına programatik erişim sağlayabilirsiniz.'
        },
        {
          question: 'Çoklu dil desteği var mı?',
          answer: 'Şu anda Türkçe ve İngilizce dil desteği mevcuttur. Daha fazla dil eklenmesi planlanmaktadır.'
        }
      ]
    }
  ];

  const resources = [
    {
      icon: BookOpen,
      title: 'Kullanıcı Kılavuzu',
      description: 'Detaylı kullanım kılavuzu ve örnekler',
      type: 'PDF',
      size: '2.4 MB',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Video,
      title: 'Video Eğitimler',
      description: 'Adım adım video eğitimler',
      type: 'Video',
      size: '45 dakika',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: FileText,
      title: 'API Dokümantasyonu',
      description: 'Teknik API referansı ve örnekler',
      type: 'HTML',
      size: 'Online',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Download,
      title: 'Entegrasyon Şablonları',
      description: 'Hazır entegrasyon kodları',
      type: 'ZIP',
      size: '15.2 MB',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const handleFaqToggle = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"
          >
            <Headphones className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          >
            Destek Merkezi
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Size nasıl yardımcı olabileceğimizi öğrenin. Canlı destek, dokümantasyon ve topluluk forumumuz ile her zaman yanınızdayız.
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sorununuzu veya sorunuzu arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Support Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {supportChannels.map((channel, index) => (
            <motion.div
              key={channel.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`${channel.bgColor} p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${channel.color}`}>
                  <channel.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  channel.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  channel.status === 'available' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {channel.status === 'online' ? 'Çevrimiçi' : 
                   channel.status === 'available' ? 'Mevcut' : 'Aktif'}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {channel.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {channel.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Yanıt süresi:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {channel.responseTime}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-2xl mx-auto"
        >
          {[
            { id: 'help', label: 'Yardım & SSS', icon: HelpCircle },
            { id: 'resources', label: 'Kaynaklar', icon: BookOpen },
            { id: 'contact', label: 'İletişim', icon: MessageCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'help' && (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* FAQ Categories */}
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {category.faqs.map((faq, faqIndex) => {
                      const isExpanded = expandedFaq === (categoryIndex * 10 + faqIndex);
                      return (
                        <motion.div
                          key={faqIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: faqIndex * 0.1 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => handleFaqToggle(categoryIndex * 10 + faqIndex)}
                            className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <span className="font-medium text-gray-900 dark:text-white">
                              {faq.question}
                            </span>
                            {isExpanded ? (
                              <Minus className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-4 pb-4"
                              >
                                <p className="text-gray-600 dark:text-gray-300">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${resource.color}`}>
                      <resource.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Boyut: {resource.size}
                    </span>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                      {resource.type === 'Video' ? (
                        <>
                          <Play className="w-4 h-4" />
                          İzle
                        </>
                      ) : resource.type === 'HTML' ? (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          Görüntüle
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          İndir
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Bize Ulaşın
                  </h3>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Konu
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                        <option>Genel Soru</option>
                        <option>Teknik Destek</option>
                        <option>Özellik Talebi</option>
                        <option>Hata Bildirimi</option>
                        <option>Diğer</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mesaj
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Mesajınızı buraya yazın..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Mesaj Gönder
                    </button>
                  </form>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      İletişim Bilgileri
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Telefon</p>
                          <p className="text-gray-600 dark:text-gray-300">+90 (212) 555 0123</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">E-posta</p>
                          <p className="text-gray-600 dark:text-gray-300">destek@erpsistem.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Adres</p>
                          <p className="text-gray-600 dark:text-gray-300">İstanbul, Türkiye</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Çalışma Saatleri</p>
                          <p className="text-gray-600 dark:text-gray-300">Pazartesi - Cuma: 09:00 - 18:00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Response Time Info */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Yanıt Süreleri
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Canlı Sohbet</span>
                        <span className="font-medium text-green-600">2-5 dakika</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Telefon</span>
                        <span className="font-medium text-blue-600">5-15 dakika</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">E-posta</span>
                        <span className="font-medium text-orange-600">2-4 saat</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Forum</span>
                        <span className="font-medium text-purple-600">1-24 saat</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Hala yardıma mı ihtiyacınız var?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Destek ekibimiz her zaman yanınızda. Hızlı ve etkili çözümler için hemen iletişime geçin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium">
              <MessageCircle className="w-4 h-4" />
              Canlı Sohbet Başlat
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium">
              <Phone className="w-4 h-4" />
              Bizi Arayın
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
