import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Settings, Add, Edit, Trash2, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: ActionItem[];
  mainIcon?: React.ReactNode;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  mainIcon = <Plus className="w-6 h-6" />,
  className,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Action items */}
      <AnimatePresence>
        {isOpen && (
          <div className="mb-4 space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={action.onClick}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg text-gray-700 hover:shadow-xl transition-all duration-200',
                    action.color && `hover:${action.color} hover:text-white`
                  )}
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {action.icon}
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : mainIcon}
        </motion.div>
      </motion.button>
    </div>
  );
};

// Predefined action sets
export const CommonActions = {
  CRUD: [
    {
      id: 'add',
      icon: <Add className="w-4 h-4" />,
      label: 'Ekle',
      onClick: () => console.log('Add clicked'),
      color: 'hover:bg-green-500'
    },
    {
      id: 'edit',
      icon: <Edit className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: () => console.log('Edit clicked'),
      color: 'hover:bg-blue-500'
    },
    {
      id: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Sil',
      onClick: () => console.log('Delete clicked'),
      color: 'hover:bg-red-500'
    }
  ],
  ImportExport: [
    {
      id: 'import',
      icon: <Upload className="w-4 h-4" />,
      label: 'İçe Aktar',
      onClick: () => console.log('Import clicked'),
      color: 'hover:bg-green-500'
    },
    {
      id: 'export',
      icon: <Download className="w-4 h-4" />,
      label: 'Dışa Aktar',
      onClick: () => console.log('Export clicked'),
      color: 'hover:bg-blue-500'
    }
  ]
};
