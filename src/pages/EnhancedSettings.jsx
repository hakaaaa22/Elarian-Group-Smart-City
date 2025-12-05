import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Bell, Sliders, Shield, Brain, FileText,
  Layout, Globe, Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeCustomizer from '@/components/settings/ThemeCustomizer';
import UserPreferencesManager from '@/components/settings/UserPreferencesManager';
import AdvancedReportBuilder from '@/components/reports/AdvancedReportBuilder';
import AIAssistantEnhanced from '@/components/ai/AIAssistantEnhanced';
import ContinuousLearningAI from '@/components/ai/ContinuousLearningAI';

export default function EnhancedSettings() {
  const [activeTab, setActiveTab] = useState('theme');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
            <Settings className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              الإعدادات والتخصيص المتقدم
            </h1>
            <p className="text-slate-400">المظهر • التفضيلات • التقارير • الذكاء الاصطناعي</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-6 flex-wrap">
          <TabsTrigger value="theme" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Palette className="w-4 h-4 ml-1" />
            المظهر والسمات
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Sliders className="w-4 h-4 ml-1" />
            التفضيلات
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <FileText className="w-4 h-4 ml-1" />
            منشئ التقارير
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Brain className="w-4 h-4 ml-1" />
            المساعد الذكي
          </TabsTrigger>
          <TabsTrigger value="ai-learning" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
            <Zap className="w-4 h-4 ml-1" />
            التعلم المستمر
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeCustomizer />
        </TabsContent>

        <TabsContent value="preferences">
          <UserPreferencesManager />
        </TabsContent>

        <TabsContent value="reports">
          <AdvancedReportBuilder />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-[600px]">
                <AIAssistantEnhanced
                  context={{
                    currentPage: 'Settings',
                    userRole: 'admin',
                    timestamp: new Date().toISOString(),
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-2">قدرات المساعد</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    تحليل البيانات
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    إنشاء التقارير
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    التنبؤ بالاتجاهات
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    اقتراحات التحسين
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    فهم السياق
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-learning">
          <ContinuousLearningAI />
        </TabsContent>
      </Tabs>
    </div>
  );
}