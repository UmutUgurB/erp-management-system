import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
  };
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  actions,
  className
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination 
    ? filteredAndSortedData.slice(startIndex, startIndex + pageSize)
    : filteredAndSortedData;

  // Sort handler
  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null;
        }
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  // Export data
  const exportData = () => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...filteredAndSortedData.map(row =>
        columns.map(col => row[col.key]).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Veri Tablosu ({filteredAndSortedData.length} kayıt)
          </h3>
          
          <div className="flex items-center gap-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.width,
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'w-3 h-3',
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            'w-3 h-3 -mt-1',
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                  
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {actions.view && (
                          <button
                            onClick={() => actions.view!(row)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {actions.edit && (
                          <button
                            onClick={() => actions.edit!(row)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {actions.delete && (
                          <button
                            onClick={() => actions.delete!(row)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAndSortedData.length)} / {filteredAndSortedData.length} kayıt
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-1 border rounded',
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
