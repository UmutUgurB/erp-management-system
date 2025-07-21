'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Loader2 } from 'lucide-react';

interface PDFExportProps {
  data: any[];
  filename?: string;
  title?: string;
  columns: Array<{
    key: string;
    label: string;
    export?: boolean;
    formatter?: (value: any) => string;
  }>;
  className?: string;
}

export default function PDFExport({
  data,
  filename = 'export',
  title = 'Rapor',
  columns,
  className = ''
}: PDFExportProps) {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`, 14, 32);
      
      // Filter columns for export
      const exportColumns = columns.filter(col => col.export !== false);
      
      // Prepare table data
      const tableData = data.map(item => 
        exportColumns.map(col => {
          const value = item[col.key];
          return col.formatter ? col.formatter(value) : value?.toString() || '';
        })
      );
      
      // Add table
      autoTable(doc, {
        head: [exportColumns.map(col => col.label)],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40 },
      });
      
      // Save the PDF
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={exporting || data.length === 0}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          PDF Oluşturuluyor...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          PDF'e Aktar
        </>
      )}
    </button>
  );
} 