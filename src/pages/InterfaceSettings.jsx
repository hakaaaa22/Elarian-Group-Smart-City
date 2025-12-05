import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette } from 'lucide-react';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';

export default function InterfaceSettings() {
  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 20%, rgba(10, 184, 255, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(141, 65, 255, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(10, 184, 255, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0"
        />
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(circle at 80% 30%, rgba(255, 61, 187, 0.1) 0%, transparent 40%)',
              'radial-gradient(circle at 20% 70%, rgba(93, 255, 244, 0.1) 0%, transparent 40%)',
              'radial-gradient(circle at 80% 30%, rgba(255, 61, 187, 0.1) 0%, transparent 40%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute inset-0"
        />
      </div>

      {/* Header */}
      <motion.div 
        className="relative z-10 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(10, 184, 255, 0.5)',
                '0 0 40px rgba(141, 65, 255, 0.5)',
                '0 0 20px rgba(10, 184, 255, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, rgba(10, 184, 255, 0.2), rgba(141, 65, 255, 0.2))' }}
          >
            <Palette className="w-8 h-8 text-cyan-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              إعدادات الواجهة والمظهر
            </h1>
            <p className="text-slate-400 mt-1">
              تخصيص ألوان ومؤثرات ELARIAN GROUP
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <ThemeCustomizer />
      </motion.div>
    </div>
  );
}