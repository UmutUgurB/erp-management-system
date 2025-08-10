'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-3xl app-container">
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-medium"
          >
            Yükleniyor
          </motion.div>
          <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Veriler getiriliyor...
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lütfen bekleyin. Bu işlem sadece birkaç saniye sürecek.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="rounded-xl p-[1px] bg-gradient-to-br from-indigo-200/60 via-transparent to-pink-200/60 dark:from-indigo-500/20 dark:to-pink-500/20">
              <div className="rounded-xl bg-white/70 dark:bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-white/60 dark:border-white/10 p-4">
                <div className="h-4 w-32 bg-gray-200/80 dark:bg-gray-700/60 rounded animate-pulse" />
                <div className="mt-4 h-32 bg-gray-200/60 dark:bg-gray-700/40 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


