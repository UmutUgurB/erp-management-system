'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Building,
  FileText,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'employee' | 'product' | 'order' | 'customer' | 'project';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  relevance: number;
  lastAccessed?: Date;
  tags: string[];
}

interface SearchFilter {
  type: string[];
  dateRange: { start: Date | null; end: Date | null };
  tags: string[];
  relevance: 'all' | 'high' | 'medium' | 'low';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onResultSelect,
  placeholder = 'Gelişmiş arama yapın...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    type: [],
    dateRange: { start: null, end: null },
    tags: [],
    relevance: 'all'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'employee',
      title: 'Ahmet Yılmaz',
      description: 'Senior Developer - Yazılım Geliştirme Departmanı',
      icon: Users,
      relevance: 95,
      lastAccessed: new Date('2024-01-15'),
      tags: ['developer', 'senior', 'yazılım']
    },
    {
      id: '2',
      type: 'product',
      title: 'Laptop Dell XPS 13',
      description: 'Yüksek performanslı iş laptopu - Stok: 15',
      icon: Package,
      relevance: 88,
      lastAccessed: new Date('2024-01-14'),
      tags: ['laptop', 'dell', 'xps', 'iş']
    },
    {
      id: '3',
      type: 'order',
      title: 'Sipariş #12345',
      description: 'ABC Şirketi - ₺35,000 - Tamamlandı',
      icon: ShoppingCart,
      relevance: 82,
      lastAccessed: new Date('2024-01-13'),
      tags: ['sipariş', 'tamamlandı', 'abc']
    },
    {
      id: '4',
      type: 'customer',
      title: 'ABC Şirketi',
      description: 'Kurumsal müşteri - Premium üye',
      icon: Building,
      relevance: 78,
      lastAccessed: new Date('2024-01-12'),
      tags: ['kurumsal', 'premium', 'müşteri']
    },
    {
      id: '5',
      type: 'project',
      title: 'ERP Sistemi Geliştirme',
      description: 'Aktif proje - %75 tamamlandı',
      icon: FileText,
      relevance: 75,
      lastAccessed: new Date('2024-01-11'),
      tags: ['proje', 'erp', 'geliştirme', 'aktif']
    }
  ];

  // Search suggestions
  const searchSuggestions = [
    'çalışan arama',
    'ürün stok',
    'sipariş durumu',
    'müşteri bilgileri',
    'proje raporu',
    'finansal analiz',
    'performans metrikleri'
  ];

  // Popular tags
  const popularTags = [
    'aktif', 'tamamlandı', 'beklemede', 'acil',
    'senior', 'junior', 'yönetici', 'geliştirici',
    'elektronik', 'giyim', 'gıda', 'hizmet',
    'kurumsal', 'bireysel', 'premium', 'standart'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('erp-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }

    // Handle click outside to close results
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Generate suggestions based on query
    if (query.length > 2) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter results based on query and filters
    let filteredResults = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                          result.description.toLowerCase().includes(query.toLowerCase()) ||
                          result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesType = filters.type.length === 0 || filters.type.includes(result.type);
      const matchesTags = filters.tags.length === 0 || 
                         filters.tags.some(tag => result.tags.includes(tag));
      
      return matchesQuery && matchesType && matchesTags;
    });

    // Sort by relevance
    filteredResults.sort((a, b) => b.relevance - a.relevance);

    setSearchResults(filteredResults);
    setIsSearching(false);

    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('erp-recent-searches', JSON.stringify(newRecentSearches));

    // Call parent search handler
    onSearch(query, filters);
  };

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect(result);
    setShowResults(false);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setIsExpanded(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      dateRange: { start: null, end: null },
      tags: [],
      relevance: 'all'
    });
  };

  const toggleFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return Users;
      case 'product': return Package;
      case 'order': return ShoppingCart;
      case 'customer': return Building;
      case 'project': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'product': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'order': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'customer': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'project': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-md transition-colors ${
                showFilters || filters.type.length > 0 || filters.tags.length > 0
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Filtreler"
            >
              <Filter className="w-4 h-4" />
            </button>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                title="Temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded Search Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Filters Section */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filtreler</h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Temizle
                  </button>
                </div>

                {/* Type Filters */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tür
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['employee', 'product', 'order', 'customer', 'project'].map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleFilter(type)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                          filters.type.includes(type)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type === 'employee' && 'Çalışan'}
                        {type === 'product' && 'Ürün'}
                        {type === 'order' && 'Sipariş'}
                        {type === 'customer' && 'Müşteri'}
                        {type === 'project' && 'Proje'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Popüler Etiketler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggestions & Recent Searches */}
            <div className="p-4">
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Öneriler
                  </h3>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Son Aramalar
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-2">
              {searchResults.map((result) => {
                const Icon = result.icon;
                return (
                  <motion.button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.relevance}%
                            </span>
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {result.lastAccessed && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {result.lastAccessed.toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch; 