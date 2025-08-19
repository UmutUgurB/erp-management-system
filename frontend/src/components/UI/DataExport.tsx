'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface DataType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  endpoint: string;
}

interface DataExportProps {
  onClose: () => void;
  onExportComplete?: (result: any) => void;
}

const DataExport: React.FC<DataExportProps> = ({ onClose, onExportComplete }) => {
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      name: 'JSON',
      extension: '.json',
      icon: FileText,
      description: 'Structured data format, ideal for APIs and development'
    },
    {
      id: 'csv',
      name: 'CSV',
      extension: '.csv',
      icon: FileText,
      description: 'Comma-separated values, perfect for spreadsheet applications'
    },
    {
      id: 'excel',
      name: 'Excel',
      extension: '.xlsx',
      icon: BarChart3,
      description: 'Microsoft Excel format with formatting and multiple sheets'
    },
    {
      id: 'pdf',
      name: 'PDF',
      extension: '.pdf',
      icon: FileText,
      description: 'Portable document format, great for reports and printing'
    },
    {
      id: 'zip',
      name: 'ZIP',
      extension: '.zip',
      icon: Package,
      description: 'Multiple formats in a compressed archive'
    }
  ];

  const dataTypes: DataType[] = [
    {
      id: 'employees',
      name: 'Çalışanlar',
      icon: Users,
      description: 'Çalışan bilgileri, departmanlar ve pozisyonlar',
      endpoint: '/api/export/employees'
    },
    {
      id: 'products',
      name: 'Ürünler',
      icon: Package,
      description: 'Ürün kataloğu, stok bilgileri ve fiyatlar',
      endpoint: '/api/export/products'
    },
    {
      id: 'orders',
      name: 'Siparişler',
      icon: ShoppingCart,
      description: 'Müşteri siparişleri ve satış verileri',
      endpoint: '/api/export/orders'
    }
  ];

  const handleExport = async () => {
    if (!selectedDataType || !selectedFormat) {
      setError('Lütfen veri türü ve format seçin');
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      const dataType = dataTypes.find(dt => dt.id === selectedDataType);
      if (!dataType) throw new Error('Geçersiz veri türü');

      const response = await fetch(dataType.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          format: selectedFormat,
          options: {
            pretty: selectedFormat === 'json',
            creator: 'ERP System',
            modifiedBy: 'User'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Export işlemi başarısız');
      }

      const result = await response.json();
      setExportResult(result);
      onExportComplete?.(result);

      // Auto-download if successful
      if (result.data?.downloadUrl) {
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${result.data.downloadUrl}`;
        window.open(downloadUrl, '_blank');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export işlemi sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setSelectedDataType('');
    setSelectedFormat('');
    setExportResult(null);
    setError('');
  };

  const canExport = selectedDataType && selectedFormat && !isExporting;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Veri Dışa Aktarma
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Verilerinizi farklı formatlarda dışa aktarın
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          <AnimatePresence>
            {exportResult && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Export başarılı!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {exportResult.data?.recordCount || 0} kayıt başarıyla dışa aktarıldı
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Hata oluştu
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Veri Türü Seçin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dataTypes.map((dataType) => (
                <motion.div
                  key={dataType.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedDataType === dataType.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedDataType(dataType.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <dataType.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {dataType.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dataType.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Format Seçin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportFormats.map((format) => (
                <motion.div
                  key={format.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFormat === format.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <format.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {format.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format.extension}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Sıfırla
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                İptal
              </button>
              
              <button
                onClick={handleExport}
                disabled={!canExport}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  canExport
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Export ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DataExport; 