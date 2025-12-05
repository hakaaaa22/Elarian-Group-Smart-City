import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import PredictiveResourceAllocation from '@/components/resource/PredictiveResourceAllocation';

export default function ResourceAllocation() {
  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              تخصيص الموارد التنبؤي
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-400">تحليل ذكي للبيانات التاريخية والتنبؤ باحتياجات الموارد المستقبلية</p>
          </div>
        </div>
      </motion.div>

      <PredictiveResourceAllocation />
    </div>
  );
}