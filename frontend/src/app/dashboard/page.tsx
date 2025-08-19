'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, DollarSign, TrendingUp, Calendar, Activity, Target, Award, Download, MessageCircle, Search, Bell, Zap, Brain, Workflow } from 'lucide-react';
import WidgetSystem from '@/components/Dashboard/WidgetSystem';
import DataExport from '@/components/UI/DataExport';
import AdvancedSearch from '@/components/UI/AdvancedSearch';
import ChatSupport from '@/components/UI/ChatSupport';
import AdvancedNotificationSystem from '@/components/UI/AdvancedNotificationSystem';
import RealTimeUpdates from '@/components/Dashboard/RealTimeUpdates';
import AdvancedAnalytics from '@/components/Dashboard/AdvancedAnalytics';
import SmartWorkflow from '@/components/Dashboard/SmartWorkflow';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'widgets' | 'realtime' | 'analytics' | 'workflow'>('overview');
  const [showDataExport, setShowDataExport] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>({});

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    console.log('Search:', query, filters);
  };

  const handleSearchResultSelect = (result: any) => {
    console.log('Selected result:', result);
    // Navigate to the selected item
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Genel Bakış
              </button>
              <button
                onClick={() => setActiveTab('widgets')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'widgets'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Widgets
              </button>
              <button
                onClick={() => setActiveTab('realtime')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'realtime'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Gerçek Zamanlı
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-1" />
                Analitik
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === 'workflow'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Workflow className="w-4 h-4 inline mr-1" />
                İş Akışı
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Advanced Search */}
            <AdvancedSearch
              onSearch={handleSearch}
              onResultSelect={handleSearchResultSelect}
              placeholder="Dashboard'da ara..."
              className="w-80"
            />
            
            {/* Advanced Notifications */}
            <AdvancedNotificationSystem />
            
            {/* Theme Toggle */}
            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Hızlı İşlemler
              </h2>
              <div className="grid grid-cols-5 gap-4">
                <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Çalışanlar</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Raporlar</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Takvim</span>
                </button>
                <button 
                  onClick={() => setShowDataExport(true)}
                  className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <Download className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Veri Export</span>
                </button>
                <button className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Activity className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">Aktivite</span>
                </button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Çalışan</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aylık Gelir</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₺45,678</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Büyüme</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">+12.5%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hedef</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">89%</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Yardıma mı ihtiyacınız var?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Canlı destek ekibimiz size yardımcı olmaya hazır
                  </p>
                </div>
                <button
                  onClick={() => setShowChatSupport(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Canlı Destek</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <WidgetSystem />
        )}

        {activeTab === 'realtime' && (
          <RealTimeUpdates />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics />
        )}

        {activeTab === 'workflow' && (
          <SmartWorkflow />
        )}
      </div>

      {/* Data Export Modal */}
      <AnimatePresence>
        {showDataExport && (
          <DataExport
            onClose={() => setShowDataExport(false)}
            onExportComplete={(result) => {
              console.log('Export completed:', result);
              setShowDataExport(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat Support */}
      <ChatSupport
        isOpen={showChatSupport}
        onClose={() => setShowChatSupport(false)}
        onMinimize={() => setShowChatSupport(false)}
      />
    </div>
  );
} 