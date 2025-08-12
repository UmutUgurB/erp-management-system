'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center app-container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white"
        >
          <Search className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
        </p>
        <div className="mt-6">
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            Dashboard'a dön
          </Link>
        </div>
      </div>
    </div>
  );
}


