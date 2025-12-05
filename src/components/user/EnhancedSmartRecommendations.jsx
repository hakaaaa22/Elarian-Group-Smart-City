import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lightbulb, TrendingUp, Star, Clock, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Settings, Zap, Target, BarChart3, FileText, Users, Car, Shield,
  AlertTriangle, Sun, Droplets, Brain, MessageSquare, CheckCircle, XCircle,
  Bell, Activity, Building2, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// أنواع التوصيات
const recommendationTypes = {
  content: { label: 'محتوى', icon: FileText, color: 'cyan' },
  service: { label: 'خدمة', icon: Zap, color: 'purple' },
  safety: { label: 'سلامة', icon: Shield, color: 'red' },
  energy: { label: 'طاقة', icon: Sun, color: 'amber' },
  opportunity: { label: 'فرصة', icon: TrendingUp, color: 'green' },
  alert: { label: 'تنبيه', icon: AlertTriangle, color: 'orange' },
};

// التوصيات الاستباقية
const proactiveAlerts = [
  { id: 'p1', type: 'safety', title: 'تحذير: ازدحام متوقع', description: 'تشير البيانات إلى ازدحام مروري خلال ساعتين في المنطقة الشرقية', severity: 'high', action: 'SmartTrafficMobility' },
  { id: 'p2', type: 'energy', title: 'فرصة توفير الطاقة', description: 'يمكن تقليل استهلاك الطاقة بنسبة 12% بتعديل جدول التكييف', severity: 'medium', action: 'SmartEnergy' },
  { id: 'p3', type: 'alert', title: 'صيانة وقائية مقترحة', description: '3 مركبات تحتاج صيانة خلال الأسبوع القادم', severity: 'low', action: 'FleetAdvanced' },
];

// التوصيات المخصصة
const personalizedRecommendations = [
  { id: 'r1', type: 'content', title: 'تقرير أداء الأسطول الشهري', description: 'تقرير جديد يناسب اهتماماتك', page: 'ReportsDashboard', relevance: 95, reason: 'بناءً على سجل التقارير المفضلة' },
  { id: 'r2', type: 'service', title: 'تحليلات AI متقدمة', description: 'اكتشف رؤى جديدة من بياناتك', page: 'AIVisionHub', relevance: 88, reason: 'استخدامك المتكرر لتحليلات البيانات' },
  { id: 'r3', type: 'opportunity', title: 'تحسين مسارات التوصيل', description: 'وفر 18% من تكاليف النقل', page: 'SmartRouting', relevance: 82, reason: 'فرصة محددة من AI' },
  { id: 'r4', type: 'content', title: 'لوحة تحكم مخصصة جديدة', description: 'قالب لوحة تحكم يناسب دورك', page: 'CentralDashboard', relevance: 75, reason: 'توصية بناءً على دورك' },
];

export default function EnhancedSmartRecommendations() {
  const [activeTab, setActiveTab] = useState('personalized');
  const [recommendations, setRecommendations] = useState(personalizedRecommendations);
  const [alerts, setAlerts] = useState(proactiveAlerts);
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, item: null });
  const [feedbackText, setFeedbackText] = useState('');
  const [preferences, setPreferences] = useState({
    showRecommendations: true,
    proactiveAlerts: true,
    personalization: true,
    learningEnabled: true,
    categories: {
      content: true, service: true, safety: true, energy: true, opportunity: true, alert: true
    }
  });

  // تحديث التوصيات بالذكاء الاصطناعي
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `أنت نظام توصيات ذكي لمنصة مدينة ذكية. حلل سلوك المستخدم وقدم توصيات مخصصة:

سجل الاستخدام:
- الصفحات الأكثر زيارة: FleetAdvanced, ReportsDashboard, SmartCity
- الإجراءات الأخيرة: عرض تقارير، تحديث إعدادات، إنشاء تنبيهات
- وقت النشاط: 08:00 - 16:00
- الدور: مدير العمليات

قدم 5 توصيات تشمل:
1. توصية محتوى (تقرير أو صفحة)
2. توصية خدمة (ميزة جديدة)
3. تنبيه سلامة استباقي
4. فرصة توفير (طاقة/تكلفة)
5. تحسين أداء`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  relevance: { type: "number" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('تم تحديث التوصيات بنجاح');
    }
  });

  // تقديم ملاحظة على التوصية
  const submitFeedback = (itemId, positive, feedbackText) => {
    // في التطبيق الحقيقي، سيتم حفظ الملاحظة في قاعدة البيانات
    toast.success(positive ? 'شكراً! سنحسن التوصيات بناءً على ملاحظتك' : 'تم تسجيل ملاحظتك');
    setRecommendations(prev => prev.filter(r => r.id !== itemId));
    setFeedbackDialog({ open: false, item: null });
    setFeedbackText('');
  };

  // تجاهل تنبيه
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.info('تم تجاهل التنبيه');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </motion.div>
          نظام التوصيات الذكي
        </h3>
        <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={() => generateRecommendations.mutate()} disabled={generateRecommendations.isPending}>
          {generateRecommendations.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Brain className="w-4 h-4 ml-1" />}
          تحديث AI
        </Button>
      </motion.div>

      {/* Proactive Alerts */}
      {preferences.proactiveAlerts && alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-card border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                تنبيهات استباقية
                <Badge className="bg-red-500/20 text-red-400">{alerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border bg-${getSeverityColor(alert.severity)}-500/10 border-${getSeverityColor(alert.severity)}-500/30`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${getSeverityColor(alert.severity)}-500/20`}>
                          {recommendationTypes[alert.type]?.icon && React.createElement(recommendationTypes[alert.type].icon, { className: `w-4 h-4 text-${getSeverityColor(alert.severity)}-400` })}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{alert.title}</p>
                          <p className="text-slate-400 text-xs mt-1">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link to={createPageUrl(alert.action)}>
                          <Button size="sm" variant="ghost" className={`h-7 text-${getSeverityColor(alert.severity)}-400`}>
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="h-7 text-slate-400" onClick={() => dismissAlert(alert.id)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="personalized" className="data-[state=active]:bg-cyan-500/20">
            <Target className="w-4 h-4 ml-1" />
            توصيات مخصصة
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-green-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            الفرص
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20">
            <Settings className="w-4 h-4 ml-1" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* Personalized Tab */}
        <TabsContent value="personalized" className="mt-4 space-y-3">
          <AnimatePresence>
            {recommendations.filter(r => preferences.categories[r.type]).map((rec, index) => {
              const typeConfig = recommendationTypes[rec.type] || recommendationTypes.content;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className={`glass-card border-${typeConfig.color}-500/30 bg-[#0f1629]/80 overflow-hidden`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <motion.div 
                            className={`p-2 rounded-lg bg-${typeConfig.color}-500/20`}
                            whileHover={{ rotate: 10 }}
                          >
                            <typeConfig.icon className={`w-5 h-5 text-${typeConfig.color}-400`} />
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-medium">{rec.title}</p>
                              <Badge className={`bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">{rec.description}</p>
                            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              {rec.reason}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={rec.relevance} className="h-1.5 w-24" />
                              <span className="text-slate-500 text-xs">{rec.relevance}% ملاءمة</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link to={createPageUrl(rec.page)}>
                            <Button size="sm" className={`bg-${typeConfig.color}-600 hover:bg-${typeConfig.color}-700 h-7`}>
                              <Eye className="w-3 h-3 ml-1" />
                              عرض
                            </Button>
                          </Link>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20" onClick={() => submitFeedback(rec.id, true, '')}>
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20" onClick={() => setFeedbackDialog({ open: true, item: rec })}>
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="mt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: 'توفير الوقود', value: '18%', icon: Car, color: 'green', desc: 'بتحسين المسارات' },
              { title: 'كفاءة الطاقة', value: '12%', icon: Sun, color: 'amber', desc: 'بجدولة ذكية' },
              { title: 'تقليل التكاليف', value: '25K', icon: BarChart3, color: 'cyan', desc: 'ر.س شهرياً' },
              { title: 'تحسين الأمان', value: '+15%', icon: Shield, color: 'purple', desc: 'بالصيانة الوقائية' },
            ].map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`glass-card border-${opp.color}-500/30 bg-${opp.color}-500/5`}>
                  <CardContent className="p-4 text-center">
                    <opp.icon className={`w-8 h-8 text-${opp.color}-400 mx-auto mb-2`} />
                    <p className={`text-2xl font-bold text-${opp.color}-400`}>{opp.value}</p>
                    <p className="text-white font-medium">{opp.title}</p>
                    <p className="text-slate-500 text-xs">{opp.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إعدادات التوصيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'showRecommendations', label: 'عرض التوصيات', desc: 'إظهار التوصيات المخصصة' },
                { key: 'proactiveAlerts', label: 'التنبيهات الاستباقية', desc: 'تنبيهات المخاطر والفرص' },
                { key: 'personalization', label: 'التخصيص', desc: 'تخصيص بناءً على سلوكك' },
                { key: 'learningEnabled', label: 'التعلم المستمر', desc: 'تحسين التوصيات تلقائياً' },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{pref.label}</p>
                    <p className="text-slate-500 text-xs">{pref.desc}</p>
                  </div>
                  <Switch checked={preferences[pref.key]} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, [pref.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">فئات التوصيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(recommendationTypes).map(([key, config]) => (
                  <div key={key} className={`flex items-center justify-between p-2 rounded-lg ${preferences.categories[key] ? `bg-${config.color}-500/10 border border-${config.color}-500/30` : 'bg-slate-800/50'}`}>
                    <div className="flex items-center gap-2">
                      <config.icon className={`w-4 h-4 text-${config.color}-400`} />
                      <span className="text-white text-sm">{config.label}</span>
                    </div>
                    <Switch checked={preferences.categories[key]} onCheckedChange={(v) => setPreferences(prev => ({ ...prev, categories: { ...prev.categories, [key]: v } }))} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog({ open, item: null })}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              أخبرنا برأيك
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-400 text-sm">لماذا لم تكن هذه التوصية مناسبة لك؟</p>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="ملاحظاتك تساعدنا في تحسين التوصيات..."
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-slate-600" onClick={() => setFeedbackDialog({ open: false, item: null })}>إلغاء</Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => submitFeedback(feedbackDialog.item?.id, false, feedbackText)}>
              <CheckCircle className="w-4 h-4 ml-2" />
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}