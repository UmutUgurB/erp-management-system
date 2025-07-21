'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardBuilder from '@/components/Dashboard/DashboardBuilder';
import { DashboardWidget } from '@/types/dashboard';
import { useNotification } from '@/context/NotificationContext';

export default function DashboardBuilderPage() {
  const [savedLayout, setSavedLayout] = useState<DashboardWidget[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Load saved layout from localStorage
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        setSavedLayout(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved layout:', error);
      }
    }
  }, []);

  const handleSave = (layout: DashboardWidget[]) => {
    setSavedLayout(layout);
    showNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Dashboard düzeni kaydedildi!'
    });
  };

  const handleExport = (layout: DashboardWidget[]) => {
    showNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Dashboard düzeni dışa aktarıldı!'
    });
  };

  const handleImport = (layout: DashboardWidget[]) => {
    setSavedLayout(layout);
    showNotification({
      type: 'success',
      title: 'Başarılı',
      message: 'Dashboard düzeni içe aktarıldı!'
    });
  };

  return (
    <DashboardLayout>
      <div className="h-full">
        <DashboardBuilder
          initialLayout={savedLayout}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>
    </DashboardLayout>
  );
} 