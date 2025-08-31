'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CogIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        // Kısa bir süre sonra landing page'i göster
        const timer = setTimeout(() => setShowLanding(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user && showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 transform -skew-y-6 origin-top-left"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <SparklesIcon className="h-12 w-12 text-white mr-3" />
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                  ERP Pro
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                Modern işletme yönetimi için gelişmiş ERP çözümü. 
                Verimliliği artırın, maliyetleri düşürün.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                >
                  Giriş Yap
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-105">
                  Demo İncele
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Neden ERP Pro?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                İşletmenizi dijital dünyada bir adım öne taşıyın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analitik</h3>
                <p className="text-gray-600">Gerçek zamanlı veri analizi ile akıllı kararlar alın</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ekip Yönetimi</h3>
                <p className="text-gray-600">Çalışanlarınızı verimli bir şekilde yönetin</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                  <CogIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Otomasyon</h3>
                <p className="text-gray-600">Tekrarlayan işleri otomatikleştirin</p>
              </div>

              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenlik</h3>
                <p className="text-gray-600">Verileriniz güvende, işiniz kesintisiz</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              ERP Pro ile işletmenizi dijital dönüşüme hazırlayın. 
              Ücretsiz deneme sürümü ile başlayın.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-10 py-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 text-lg"
            >
              Ücretsiz Deneme
              <ArrowRightIcon className="ml-2 h-6 w-6" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              © 2024 ERP Pro. Tüm hakları saklıdır. Modern işletme yönetimi için tasarlandı.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return null;
}
