'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center app-container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto h-16 w-16 rounded-xl bg-red-600/90 flex items-center justify-center text-white"
        >
          <AlertTriangle className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Bir hata oluştu</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Beklenmedik bir sorunla karşılaştık. Tekrar denemek için aşağıdaki butona tıklayın.
        </p>
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    </div>
  );
}


