import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Sparkles, Lightbulb, TrendingUp, Star, Clock, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Settings, Zap, Target, BarChart3, FileText, Users, Car
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// بيانات سلوك المستخدم (محاكاة)
const userBehavior = {
  mostVisitedPages: ['FleetAdvanced', 'ReportsDashboard', 'WasteManagement'],
  recentActions: ['عرض تقرير الأسطول', 'تحديث إعدادات', 'إنشاء تنبيه'],
  preferredModules: ['fleet', 'reports'],
  activeHours: '08:00 - 16:00',
  avgSessionTime: '45 دقيقة',
};

// التوصيات
const initialRecommendations = [
  { id: 1, type: 'page', title: 'تحليلات الأسطول المتقدمة', description: 'بناءً على اهتمامك بإدارة الأسطول', page: 'FleetAdvanced', icon: Car, relevance: 95 },
  { id: 2, type: 'report', title: 'تقرير الأداء الأسبوعي', description: 'تقرير جديد متاح لمراجعتك', page: 'ReportsDashboard', icon: FileText, relevance: 88 },
  { id: 3, type: 'insight', title: 'فرصة تحسين المسارات', description: 'يمكن توفير 15% من الوقت', page: 'SmartRouting', icon: TrendingUp, relevance: 82 },
  { id: 4, type: 'feature', title: 'جرب مصمم اللوحات', description: 'ميزة جديدة قد تناسب احتياجاتك', page: 'CentralDashboard', icon: BarChart3, relevance: 75 },
];

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [preferences, setPreferences] = useState({
    showRecommendations: true,
    personalization: true,
    learningEnabled: true,
  });

  // تحديث التوصيات بالذكاء الاصطناعي
  const refreshRecommendations = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على سلوك المستخدم التالي، قدم توصيات مخصصة:

الصفحات الأكثر زيارة: ${userBehavior.mostVisitedPages.join(', ')}
الإجراءات الأخيرة: ${userBehavior.recentActions.join(', ')}
الوحدات المفضلة: ${userBehavior.preferredModules.join(', ')}
ساعات النشاط: ${userBehavior.activeHours}

قدم 4 توصيات مخصصة تشمل:
- صفحات مقترحة
- تقارير ذات صلة
- رؤى مفيدة
- ميزات جديدة`,
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
                  relevance: { type: "number" }
                }
              }
            }
          }
        }
      });
    },
    onSuccess: () => {
      toast.success('تم تحديث التوصيات');
    }
  });

  const provideFeedback = (id, positive) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
    toast.success(positive ? 'شكراً على التقييم!' : 'سنحسن التوصيات');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'page': return 'cyan';
      case 'report': return 'purple';
      case 'insight': return 'green';
      case 'feature': return 'amber';
      default: return 'slate';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'page': return 'صفحة';
      case 'report': return 'تقرير';
      case 'insight': return 'رؤية';
      case 'feature': return 'ميزة';
      default: return 'عام';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          توصيات ذكية لك
        </h3>
        <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={() => refreshRecommendations.mutate()} disabled={refreshRecommendations.isPending}>
          {refreshRecommendations.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-1" />}
          تحديث
        </Button>
      </div>

      {/* User Insights */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">ملخص نشاطك</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-purple-400 font-bold">{userBehavior.avgSessionTime}</p>
              <p className="text-slate-500 text-xs">متوسط الجلسة</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-cyan-400 font-bold">{userBehavior.mostVisitedPages.length}</p>
              <p className="text-slate-500 text-xs">صفحات متكررة</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-green-400 font-bold">{userBehavior.recentActions.length}</p>
              <p className="text-slate-500 text-xs">إجراءات اليوم</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded">
              <p className="text-amber-400 font-bold">{userBehavior.activeHours}</p>
              <p className="text-slate-500 text-xs">أوقات النشاط</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {preferences.showRecommendations && (
        <div className="space-y-3">
          <AnimatePresence>
            {recommendations.map(rec => (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card className={`glass-card border-${getTypeColor(rec.type)}-500/30 bg-[#0f1629]/80`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${getTypeColor(rec.type)}-500/20`}>
                          <rec.icon className={`w-5 h-5 text-${getTypeColor(rec.type)}-400`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{rec.title}</p>
                            <Badge className={`bg-${getTypeColor(rec.type)}-500/20 text-${getTypeColor(rec.type)}-400`}>
                              {getTypeLabel(rec.type)}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={rec.relevance} className="h-1.5 w-24" />
                            <span className="text-slate-500 text-xs">{rec.relevance}% ملاءمة</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(rec.page)}>
                          <Button size="sm" className={`bg-${getTypeColor(rec.type)}-600 hover:bg-${getTypeColor(rec.type)}-700 h-7`}>
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                        </Link>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400" onClick={() => provideFeedback(rec.id, true)}>
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => provideFeedback(rec.id, false)}>
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preferences */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            إعدادات التوصيات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'showRecommendations', label: 'عرض التوصيات', desc: 'إظهار التوصيات المخصصة' },
            { key: 'personalization', label: 'التخصيص', desc: 'تخصيص التوصيات بناءً على سلوكك' },
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
    </div>
  );
}