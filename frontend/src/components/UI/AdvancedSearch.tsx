'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: any) => void;
  placeholder?: string;
  filters?: {
    status?: FilterOption[];
    category?: FilterOption[];
    dateRange?: boolean;
    priceRange?: boolean;
  };
  showAdvanced?: boolean;
}

export default function AdvancedSearch({
  onSearch,
  placeholder = 'Ara...',
  filters = {},
  showAdvanced = true,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const handleSearch = () => {
    const searchFilters = {
      ...selectedFilters,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      priceRange: priceRange.min || priceRange.max ? priceRange : undefined,
    };
    onSearch(query, searchFilters);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setDateRange({ start: '', end: '' });
    setPriceRange({ min: '', max: '' });
    setQuery('');
    onSearch('', {});
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0 || 
    dateRange.start || dateRange.end || 
    priceRange.min || priceRange.max;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query || hasActiveFilters) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedFilters, dateRange, priceRange]);

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {showAdvanced && (
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedFilters).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {key}: {value}
              <button
                onClick={() => handleFilterChange(key, '')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {(dateRange.start || dateRange.end) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Tarih: {dateRange.start} - {dateRange.end}
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(priceRange.min || priceRange.max) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Fiyat: {priceRange.min} - {priceRange.max}
              <button
                onClick={() => setPriceRange({ min: '', max: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Tümünü temizle
          </button>
        </div>
      )}

      {/* Advanced Filters */}
      {isAdvancedOpen && showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Gelişmiş Filtreler</h3>
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            {filters.status && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={selectedFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tümü</option>
                  {filters.status.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            {filters.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={selectedFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tümü</option>
                  {filters.category.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            {filters.dateRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih Aralığı
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Başlangıç"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Bitiş"
                  />
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            {filters.priceRange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat Aralığı
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 