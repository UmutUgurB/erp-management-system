'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Filter, 
  SortAsc, 
  SortDesc, 
  History, 
  TrendingUp,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'customer' | 'order' | 'user';
  relevance: number;
  lastAccessed?: Date;
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
}

interface SearchFilters {
  type: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'date' | 'name' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export default function AdvancedSearch({
  placeholder = "Arama yapın...",
  onSearch,
  onResultSelect,
  className = "",
  showFilters = true,
  showHistory = true,
  showTrending = true
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    dateRange: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    setTrendingSearches(['laptop', 'müşteri', 'sipariş', 'ürün', 'rapor']);
    setSearchHistory(['admin', 'kullanıcı', 'dashboard', 'analytics']);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowResults(true);

    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Laptop Pro 2024',
        description: 'Yüksek performanslı iş bilgisayarı',
        type: 'product',
        relevance: 95,
        lastAccessed: new Date()
      },
      {
        id: '2',
        title: 'Ahmet Yılmaz',
        description: 'Müşteri - Premium üye',
        type: 'customer',
        relevance: 88,
        lastAccessed: new Date(Date.now() - 86400000)
      },
      {
        id: '3',
        title: 'Sipariş #ORD-2024-001',
        description: 'Bekleyen sipariş - 2 ürün',
        type: 'order',
        relevance: 82,
        lastAccessed: new Date(Date.now() - 172800000)
      }
    ];

    setResults(mockResults);
    setIsLoading(false);
    onSearch?.(searchQuery, filters);
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
    setIsExpanded(false);
    setQuery(result.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setIsExpanded(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'customer': return '👤';
      case 'order': return '🛒';
      case 'user': return '👨‍💼';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'customer': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'order': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'user': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={toggleFilters}
              className={`p-1 rounded transition-colors ${
                isExpanded 
                  ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => handleSearch()}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tür
                </label>
                <div className="space-y-2">
                  {['product', 'customer', 'order', 'user'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                          } else {
                            setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {type === 'product' ? 'Ürün' : type === 'customer' ? 'Müşteri' : type === 'order' ? 'Sipariş' : 'Kullanıcı'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih Aralığı
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tümü</option>
                  <option value="today">Bugün</option>
                  <option value="week">Bu Hafta</option>
                  <option value="month">Bu Ay</option>
                  <option value="year">Bu Yıl</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sıralama
                </label>
                <div className="space-y-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="relevance">Alaka Düzeyi</option>
                    <option value="date">Tarih</option>
                    <option value="name">İsim</option>
                    <option value="popularity">Popülerlik</option>
                  </select>
                  
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    <span className="text-sm">
                      {filters.sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aranıyor...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleResultSelect(result)}
                  >
                    <div className="text-2xl">{getTypeIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}>
                        {result.type === 'product' ? 'Ürün' : result.type === 'customer' ? 'Müşteri' : result.type === 'order' ? 'Sipariş' : 'Kullanıcı'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.relevance}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sonuç bulunamadı</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Search History */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <History className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Arama Geçmişi</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(term);
                            handleSearch(term);
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {showTrending && trendingSearches.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trend Aramalar</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(term);
                            handleSearch(term);
                          }}
                          className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 