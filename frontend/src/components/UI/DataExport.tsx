'use client';

import { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface DataExportProps {
  data: any[];
  filename?: string;
  onImport?: (data: any[]) => void;
  exportFormats?: ('csv' | 'excel')[];
  importFormats?: ('csv' | 'excel')[];
  columns?: Array<{
    key: string;
    label: string;
    export?: boolean;
  }>;
}

export default function DataExport({
  data,
  filename = 'export',
  onImport,
  exportFormats = ['csv', 'excel'],
  importFormats = ['csv'],
  columns = [],
}: DataExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const exportToCSV = () => {
    if (data.length === 0) return;

    const exportColumns = columns.length > 0 
      ? columns.filter(col => col.export !== false)
      : Object.keys(data[0]).map(key => ({ key, label: key }));

    const headers = exportColumns.map(col => col.label).join(',');
    const rows = data.map(item => 
      exportColumns.map(col => {
        const value = item[col.key];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportToExcel = async () => {
    if (data.length === 0) return;

    try {
      // Dynamic import for ExcelJS
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      const exportColumns = columns.length > 0 
        ? columns.filter(col => col.export !== false)
        : Object.keys(data[0]).map(key => ({ key, label: key }));

      // Add headers
      worksheet.addRow(exportColumns.map(col => col.label));

      // Add data
      data.forEach(item => {
        const row = exportColumns.map(col => item[col.key] || '');
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(
          column.header?.length || 10,
          ...column.values?.slice(1).map(v => String(v).length) || []
        );
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      downloadFile(buffer, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel export hatası oluştu. CSV formatını deneyin.');
    }
  };

  const downloadFile = (content: any, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const importedData = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

        onImport(importedData);
      } else if (fileExtension === 'xlsx') {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error('Worksheet bulunamadı');

        const headers = worksheet.getRow(1).values as string[];
        const importedData = worksheet.getRows(2)?.map(row => {
          const rowData: any = {};
          headers.forEach((header, index) => {
            if (header) {
              rowData[header] = row.getCell(index).value || '';
            }
          });
          return rowData;
        }) || [];

        onImport(importedData);
      } else {
        throw new Error('Desteklenmeyen dosya formatı');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError('Dosya import edilirken hata oluştu. Lütfen dosya formatını kontrol edin.');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Export Section */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Dışa Aktar:</span>
        {exportFormats.includes('csv') && (
          <button
            onClick={exportToCSV}
            disabled={data.length === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </button>
        )}
        {exportFormats.includes('excel') && (
          <button
            onClick={exportToExcel}
            disabled={data.length === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </button>
        )}
      </div>

      {/* Import Section */}
      {onImport && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">İçe Aktar:</span>
          <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Yükleniyor...' : 'Dosya Seç'}
            <input
              type="file"
              accept={importFormats.map(format => 
                format === 'csv' ? '.csv' : '.xlsx'
              ).join(',')}
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      )}

      {/* Import Error */}
      {importError && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {importError}
        </div>
      )}

      {/* Data Count */}
      <div className="text-sm text-gray-500">
        {data.length} kayıt
      </div>
    </div>
  );
} 