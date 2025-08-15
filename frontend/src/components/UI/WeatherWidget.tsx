'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  MapPin,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'windy';
  description: string;
  city: string;
  country: string;
  lastUpdated: string;
}

interface WeatherWidgetProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
}

export default function WeatherWidget({ 
  className = '', 
  autoRefresh = true, 
  refreshInterval = 30 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock weather data - in real app, this would come from a weather API
  const mockWeatherData: WeatherData = {
    temperature: 24,
    feelsLike: 26,
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    condition: 'sunny',
    description: 'Güneşli',
    city: 'İstanbul',
    country: 'Türkiye',
    lastUpdated: new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    const iconProps = { className: "w-8 h-8" };
    
    switch (condition) {
      case 'sunny':
        return <Sun {...iconProps} className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
        return <Cloud {...iconProps} className="w-8 h-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'snowy':
        return <CloudSnow {...iconProps} className="w-8 h-8 text-blue-300" />;
      case 'stormy':
        return <CloudLightning {...iconProps} className="w-8 h-8 text-purple-500" />;
      case 'windy':
        return <Wind {...iconProps} className="w-8 h-8 text-gray-400" />;
      default:
        return <Sun {...iconProps} className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getWeatherGradient = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 via-orange-400 to-red-400';
      case 'cloudy':
        return 'from-gray-400 via-gray-500 to-gray-600';
      case 'rainy':
        return 'from-blue-400 via-blue-500 to-indigo-500';
      case 'snowy':
        return 'from-blue-200 via-blue-300 to-blue-400';
      case 'stormy':
        return 'from-purple-500 via-purple-600 to-purple-700';
      case 'windy':
        return 'from-gray-300 via-gray-400 to-gray-500';
      default:
        return 'from-blue-400 via-blue-500 to-indigo-500';
    }
  };

  const getWeatherAdvice = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'Güneş kremi kullanmayı unutmayın!';
      case 'cloudy':
        return 'Hafif bir ceket giyebilirsiniz.';
      case 'rainy':
        return 'Şemsiye almayı unutmayın!';
      case 'snowy':
        return 'Kalın giyin ve dikkatli olun!';
      case 'stormy':
        return 'Mümkünse dışarı çıkmayın!';
      case 'windy':
        return 'Rüzgara karşı dikkatli olun!';
      default:
        return 'Güzel bir gün!';
    }
  };

  const fetchWeather = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would be an actual API call
      // const response = await fetch(`/api/weather?city=Istanbul`);
      // const data = await response.json();
      
      setWeather(mockWeatherData);
      setIsLoading(false);
    } catch (err) {
      setError('Hava durumu bilgisi alınamadı');
      setIsLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWeather();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchWeather();
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-3">{error}</p>
          <motion.button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tekrar Dene
          </motion.button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {weather.city}, {weather.country}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={showDetails ? 'Detayları Gizle' : 'Detayları Göster'}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {getWeatherIcon(weather.condition)}
            </motion.div>
            
            <div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 dark:text-gray-100"
              >
                {weather.temperature}°C
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                {weather.description}
              </motion.div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Hissedilen: {weather.feelsLike}°C
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Son güncelleme: {weather.lastUpdated}
            </div>
          </div>
        </div>

        {/* Weather Advice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              💡 {getWeatherAdvice(weather.condition)}
            </span>
          </div>
        </motion.div>

        {/* Detailed Weather Info */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Nem: {weather.humidity}%
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rüzgar: {weather.windSpeed} km/h
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Görüş: {weather.visibility} km
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Yağış: %{Math.floor(Math.random() * 30)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient(weather.condition)}`} />
      </div>
    </div>
  );
}
