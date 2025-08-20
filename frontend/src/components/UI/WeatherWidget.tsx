'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  RefreshCw, 
  Settings, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  Sunrise,
  Sunset,
  Navigation
} from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }>;
}

interface WeatherWidgetProps {
  className?: string;
  showForecast?: boolean;
  showDetails?: boolean;
  autoLocation?: boolean;
  defaultLocation?: string;
  units?: 'metric' | 'imperial';
  refreshInterval?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  className = '',
  showForecast = true,
  showDetails = true,
  autoLocation = true,
  defaultLocation = 'İstanbul',
  units = 'metric',
  refreshInterval = 300000 // 5 minutes
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(defaultLocation);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock weather data for demonstration
  const generateMockWeather = (city: string): WeatherData => {
    const conditions = [
      { description: 'Güneşli', icon: 'sun', temp: 25, feels: 27 },
      { description: 'Parçalı Bulutlu', icon: 'cloud', temp: 22, feels: 24 },
      { description: 'Yağmurlu', icon: 'rain', temp: 18, feels: 19 },
      { description: 'Karlı', icon: 'snow', temp: -2, feels: -5 },
      { description: 'Rüzgarlı', icon: 'wind', temp: 20, feels: 18 }
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      location: city,
      temperature: randomCondition.temp,
      feelsLike: randomCondition.feels,
      description: randomCondition.description,
      icon: randomCondition.icon,
      humidity: Math.floor(Math.random() * 30) + 50,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      visibility: Math.floor(Math.random() * 10) + 5,
      pressure: Math.floor(Math.random() * 20) + 1000,
      sunrise: '06:30',
      sunset: '19:45',
      forecast: Array.from({ length: 5 }, (_, i) => {
        const dayTemp = randomCondition.temp + Math.floor(Math.random() * 10) - 5;
        const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
        return {
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { weekday: 'short' }),
          high: dayTemp + 3,
          low: dayTemp - 3,
          description: dayCondition.description,
          icon: dayCondition.icon
        };
      })
    };
  };

  const fetchWeather = async (city: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const weatherData = generateMockWeather(city);
      setWeather(weatherData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Hava durumu bilgisi alınamadı');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Konum servisi desteklenmiyor');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // In a real app, you would reverse geocode the coordinates
          // For now, we'll use a default city
          const city = 'Konumunuz';
          setLocation(city);
          await fetchWeather(city);
        } catch (err) {
          setError('Konum belirlenemedi');
        }
      },
      (err) => {
        setError('Konum erişimi reddedildi');
        console.error('Geolocation error:', err);
      }
    );
  };

  const handleRefresh = () => {
    fetchWeather(location);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    fetchWeather(newLocation);
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloud':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-blue-300" />;
      case 'wind':
        return <Wind className="w-8 h-8 text-gray-400" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const formatTemperature = (temp: number) => {
    if (units === 'imperial') {
      return `${Math.round((temp * 9/5) + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  };

  const formatWindSpeed = (speed: number) => {
    if (units === 'imperial') {
      return `${Math.round(speed * 2.237)} mph`;
    }
    return `${Math.round(speed * 3.6)} km/h`;
  };

  useEffect(() => {
    if (autoLocation) {
      getCurrentLocation();
    } else {
      fetchWeather(location);
    }
  }, [autoLocation, location]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchWeather(location);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, location]);

  if (error && !weather) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {weather?.location || location}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Weather Display */}
      {weather && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTemperature(weather.temperature)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {weather.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Hissedilen: {formatTemperature(weather.feelsLike)}
                </div>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-500 text-right">
                <div>Son güncelleme</div>
                <div>{lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            )}
          </div>

          {/* Weather Details */}
          {showDetails && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Nem:</span>
                <span className="font-medium text-gray-900 dark:text-white">{weather.humidity}%</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Rüzgar:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatWindSpeed(weather.windSpeed)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Görüş:</span>
                <span className="font-medium text-gray-900 dark:text-white">{weather.visibility} km</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Basınç:</span>
                <span className="font-medium text-gray-900 dark:text-white">{weather.pressure} hPa</span>
              </div>
            </div>
          )}

          {/* Sunrise/Sunset */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-2">
              <Sunrise className="w-4 h-4 text-orange-500" />
              <span>Gün doğumu: {weather.sunrise}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sunset className="w-4 h-4 text-orange-600" />
              <span>Gün batımı: {weather.sunset}</span>
            </div>
          </div>

          {/* Forecast */}
          {showForecast && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">5 Günlük Tahmin</h4>
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {day.date}
                    </div>
                    <div className="mb-1">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatTemperature(day.high)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTemperature(day.low)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationChange(location)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Şehir adı girin"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLocationChange(location)}
                  className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
                
                <button
                  onClick={getCurrentLocation}
                  className="px-3 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Konumumu Bul</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherWidget;
