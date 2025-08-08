'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = shortcut.ctrl === ctrlKey;
      const shiftMatch = shortcut.shift === shiftKey;
      const altMatch = shortcut.alt === altKey;
      const metaMatch = shortcut.meta === metaKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return shortcuts;
}

// Predefined shortcuts for ERP system
export const ERP_SHORTCUTS: ShortcutConfig[] = [
  {
    key: '1',
    description: 'Dashboard',
    action: () => {
      // Navigate to dashboard
      console.log('Navigate to Dashboard');
    }
  },
  {
    key: '2',
    description: 'Products',
    action: () => {
      console.log('Navigate to Products');
    }
  },
  {
    key: '3',
    description: 'Orders',
    action: () => {
      console.log('Navigate to Orders');
    }
  },
  {
    key: '4',
    description: 'Customers',
    action: () => {
      console.log('Navigate to Customers');
    }
  },
  {
    key: '5',
    description: 'Employees',
    action: () => {
      console.log('Navigate to Employees');
    }
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New Item',
    action: () => {
      console.log('Create New Item');
    }
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save',
    action: () => {
      console.log('Save Current Item');
    }
  },
  {
    key: 'f',
    ctrl: true,
    description: 'Search',
    action: () => {
      console.log('Open Search');
    }
  },
  {
    key: 'r',
    ctrl: true,
    description: 'Refresh',
    action: () => {
      console.log('Refresh Data');
    }
  },
  {
    key: 'h',
    description: 'Help',
    action: () => {
      console.log('Show Help');
    }
  },
  {
    key: '?',
    description: 'Shortcuts Help',
    action: () => {
      console.log('Show Shortcuts Help');
    }
  },
  {
    key: 'Escape',
    description: 'Close Modal',
    action: () => {
      console.log('Close Modal');
    }
  },
  {
    key: 'Enter',
    description: 'Confirm',
    action: () => {
      console.log('Confirm Action');
    }
  },
  {
    key: 'Delete',
    description: 'Delete Item',
    action: () => {
      console.log('Delete Selected Item');
    }
  },
  {
    key: 'ArrowUp',
    description: 'Previous Item',
    action: () => {
      console.log('Previous Item');
    }
  },
  {
    key: 'ArrowDown',
    description: 'Next Item',
    action: () => {
      console.log('Next Item');
    }
  }
]; 