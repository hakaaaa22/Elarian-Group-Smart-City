import React, { useState } from 'react';
import DeveloperInfo from '@/components/developer/DeveloperInfo';
import { motion } from 'framer-motion';
import {
  Code, Key, BookOpen, Webhook, Terminal, Shield, Activity,
  Zap, Settings, Clock, BarChart3, Eye, Building2, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicAPIDocumentation from '@/components/api/PublicAPIDocumentation';
import AdvancedAlertRules from '@/components/notifications/AdvancedAlertRules';

const apiStats = [
  { label: 'طلبات اليوم', value: '12,456', icon: Activity, color: 'cyan' },
  { label: 'متوسط وقت الاستجابة', value: '45ms', icon: Clock, color: 'green' },
  { label: 'نسبة النجاح', value: '99.8%', icon: Shield, color: 'purple' },
  { label: 'Webhooks نشطة', value: '8', icon: Webhook, color: 'amber' },
];

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState('developer');

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Code className="w-8 h-8 text-cyan-400" />
              بوابة المطورين
            </h1>
            <p className="text-slate-400 mt-1">API Documentation & Developer Tools</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
              <Key className="w-4 h-4 ml-2" />
              إدارة API Keys
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Terminal className="w-4 h-4 ml-2" />
              API Console
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {apiStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`glass-card border-${stat.color}-500/30 bg-${stat.color}-500/5`}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
          <TabsTrigger value="developer" className="data-[state=active]:bg-purple-500/20">
            <Code className="w-4 h-4 ml-1" />
            معلومات المطور
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-cyan-500/20">
            <BookOpen className="w-4 h-4 ml-1" />
            API Documentation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500/20">
            <Zap className="w-4 h-4 ml-1" />
            قواعد التنبيه
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-500/20">
            <Webhook className="w-4 h-4 ml-1" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            تحليلات API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="developer">
          <DeveloperInfo />
        </TabsContent>

        <TabsContent value="api">
          <PublicAPIDocumentation />
        </TabsContent>

        <TabsContent value="alerts">
          <AdvancedAlertRules />
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Webhook className="w-5 h-5 text-purple-400" />
                إعداد Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-center py-8">
                قم بإعداد Webhooks لاستقبال إشعارات فورية عند حدوث أحداث معينة في النظام
              </p>
              <div className="flex justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 ml-2" />
                  إضافة Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                تحليلات استخدام API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">5,234</p>
                  <p className="text-slate-400 text-sm">AI Vision API</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <Building2 className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3,456</p>
                  <p className="text-slate-400 text-sm">Municipality API</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3,766</p>
                  <p className="text-slate-400 text-sm">Hospital API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}