import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, BarChart3, FileText, Calendar, Bell, Settings, Download,
  Plus, Eye, Sparkles, TrendingUp, Users, AlertTriangle, Target,
  Database, Zap, Crown, ShoppingCart, UserMinus, Monitor, Phone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIReportsDashboard from '@/components/reports/AIReportsDashboard';
import ProactiveCRMAutomation from '@/components/crm/ProactiveCRMAutomation';
import CustomerPredictiveAnalytics from '@/components/callcenter/CustomerPredictiveAnalytics';
import PredictiveCallAnalytics from '@/components/ai/PredictiveCallAnalytics';
import AICustomerProfileIntegration from '@/components/crm/AICustomerProfileIntegration';
import AdvancedPredictiveCallAnalytics from '@/components/callcenter/AdvancedPredictiveCallAnalytics';
import ChurnDriversAnalysis from '@/components/callcenter/ChurnDriversAnalysis';
import SmartPostCallAutomation from '@/components/callcenter/SmartPostCallAutomation';
import CustomReportBuilder from '@/components/reports/CustomReportBuilder';
import EnhancedCustomReportBuilder from '@/components/reports/EnhancedCustomReportBuilder';
import CustomerSegmentAnalysis from '@/components/analytics/CustomerSegmentAnalysis';

export default function AIReportsManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState({
    id: 'CUS-001',
    name: 'أحمد محمد الشمري',
    type: 'VIP',
    interactions: 25,
    lastContact: '2024-12-01',
    totalValue: 15000
  });

  const stats = [
    { label: 'تقارير منشأة', value: '1,245', icon: FileText, color: 'cyan', change: '+12%' },
    { label: 'تحليلات تنبؤية', value: '856', icon: Brain, color: 'purple', change: '+8%' },
    { label: 'عملاء محللون', value: '3,420', icon: Users, color: 'green', change: '+15%' },
    { label: 'تنبيهات مخاطر', value: '23', icon: AlertTriangle, color: 'red', change: '-5%' },
  ];

  const quickInsights = [
    { label: 'نية شراء عالية', value: 156, icon: ShoppingCart, color: 'green' },
    { label: 'خطر مغادرة', value: 34, icon: UserMinus, color: 'red' },
    { label: 'عملاء VIP', value: 89, icon: Crown, color: 'amber' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
            >
              <Brain className="w-8 h-8 text-purple-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                إدارة تقارير الذكاء الاصطناعي
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Advanced AI
                </Badge>
              </h1>
              <p className="text-slate-400 mt-1">
                تحليلات تنبؤية • نية العميل • خطر المغادرة • العملاء عالي القيمة • تكامل CRM
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600">
              <Calendar className="w-4 h-4 ml-2" />
              جدولة
            </Button>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
              <Database className="w-4 h-4 ml-2" />
              تحديث CRM
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              تقرير جديد
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </div>
                  <div className="text-left">
                    <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-1`} />
                    <Badge className={`text-xs ${stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick AI Insights */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickInsights.map((insight, i) => (
          <motion.div
            key={insight.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className={`bg-gradient-to-r from-${insight.color}-500/10 to-transparent border-${insight.color}-500/30`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${insight.color}-500/20`}>
                  <insight.icon className={`w-5 h-5 text-${insight.color}-400`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{insight.value}</p>
                  <p className="text-slate-400 text-xs">{insight.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 mb-6 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 ml-1" />
            لوحة التقارير
          </TabsTrigger>
          <TabsTrigger value="predictive" className="data-[state=active]:bg-cyan-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            التحليلات التنبؤية
          </TabsTrigger>
          <TabsTrigger value="customer" className="data-[state=active]:bg-green-500/20">
            <Users className="w-4 h-4 ml-1" />
            تحليل العملاء
          </TabsTrigger>
          <TabsTrigger value="crm" className="data-[state=active]:bg-amber-500/20">
            <Database className="w-4 h-4 ml-1" />
            تكامل CRM
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-pink-500/20">
            <Brain className="w-4 h-4 ml-1" />
            التحليلات المتقدمة
          </TabsTrigger>
          <TabsTrigger value="churn" className="data-[state=active]:bg-red-500/20">
            <UserMinus className="w-4 h-4 ml-1" />
            تحليل المغادرة
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-orange-500/20">
            <Zap className="w-4 h-4 ml-1" />
            الأتمتة
          </TabsTrigger>
          <TabsTrigger value="proactive" className="data-[state=active]:bg-cyan-500/20">
            <Target className="w-4 h-4 ml-1" />
            الأتمتة الاستباقية
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-pink-500/20">
            <FileText className="w-4 h-4 ml-1" />
            تقارير مخصصة
          </TabsTrigger>
          <TabsTrigger value="segments" className="data-[state=active]:bg-blue-500/20">
            <Users className="w-4 h-4 ml-1" />
            تحليل الشرائح
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AIReportsDashboard />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveCallAnalytics />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerPredictiveAnalytics
            customerData={{ name: 'تحليل شامل', type: 'جميع العملاء' }}
            conversationHistory="تحليل شامل لجميع المحادثات"
          />
        </TabsContent>

        <TabsContent value="crm">
          <div className="grid lg:grid-cols-2 gap-6">
            <AICustomerProfileIntegration
              customerId={selectedCustomer.id}
              customerData={selectedCustomer}
              onProfileUpdate={(data) => console.log('CRM Updated:', data)}
            />
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  تحديثات CRM التلقائية
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm font-medium">✓ تحديث نية الشراء</p>
                    <p className="text-slate-400 text-xs">يتم تحديث ملف العميل تلقائياً عند تحليل المكالمات</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">✓ تنبيه خطر المغادرة</p>
                    <p className="text-slate-400 text-xs">إشعارات فورية للفريق عند ارتفاع خطر المغادرة</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-400 text-sm font-medium">✓ علامة العميل VIP</p>
                    <p className="text-slate-400 text-xs">ترقية تلقائية للعملاء عالي القيمة</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 text-sm font-medium">✓ توصيات مخصصة</p>
                    <p className="text-slate-400 text-xs">توصيات AI للمبيعات والدعم</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedPredictiveCallAnalytics
            callData={{
              topic: 'استفسار عن الخدمات',
              duration: '8 دقائق',
              sentiment: 'إيجابي'
            }}
            customerData={selectedCustomer}
          />
        </TabsContent>

        <TabsContent value="churn">
          <ChurnDriversAnalysis
            conversationData="العميل يشكو من بطء الخدمة وتأخر الاستجابة"
            customerHistory="عميل منذ 3 سنوات، انخفض معدل الاستخدام مؤخراً"
          />
        </TabsContent>

        <TabsContent value="automation">
          <SmartPostCallAutomation
            callContext={{
              topic: 'استفسار عن الخدمة',
              duration: '5 دقائق',
              sentiment: 'محايد'
            }}
            callResult="تم حل الاستفسار"
            customerData={selectedCustomer}
          />
        </TabsContent>

        <TabsContent value="proactive">
          <ProactiveCRMAutomation />
        </TabsContent>

        <TabsContent value="custom">
          <EnhancedCustomReportBuilder />
        </TabsContent>

        <TabsContent value="segments">
          <CustomerSegmentAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}