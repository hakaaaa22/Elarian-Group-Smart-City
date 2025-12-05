import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart3, TrendingUp, Users, Target, Brain, Settings, Eye, Sparkles,
  Award, Clock, Phone, Star, CheckCircle, ArrowUp, ArrowDown, Grip, X, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { toast } from 'sonner';

const availableWidgets = [
  { id: 'calls', name: 'المكالمات', icon: Phone, category: 'performance' },
  { id: 'satisfaction', name: 'رضا العملاء', icon: Star, category: 'quality' },
  { id: 'resolution', name: 'معدل الحل', icon: CheckCircle, category: 'quality' },
  { id: 'handle_time', name: 'وقت المعالجة', icon: Clock, category: 'efficiency' },
  { id: 'peer_comparison', name: 'مقارنة الأقران', icon: Users, category: 'comparison' },
  { id: 'predictions', name: 'التنبؤات', icon: Brain, category: 'ai' },
  { id: 'goals', name: 'الأهداف', icon: Target, category: 'goals' },
  { id: 'trends', name: 'الاتجاهات', icon: TrendingUp, category: 'analytics' },
];

const peerData = [
  { name: 'أنت', calls: 47, satisfaction: 4.7, resolution: 89, score: 87 },
  { name: 'الفريق', calls: 42, satisfaction: 4.3, resolution: 82, score: 78 },
  { name: 'القسم', calls: 38, satisfaction: 4.1, resolution: 79, score: 74 },
  { name: 'الأفضل', calls: 55, satisfaction: 4.9, resolution: 95, score: 94 },
];

const trendData = [
  { week: 'أسبوع 1', performance: 72, target: 80 },
  { week: 'أسبوع 2', performance: 76, target: 80 },
  { week: 'أسبوع 3', performance: 79, target: 80 },
  { week: 'أسبوع 4', performance: 85, target: 80 },
  { week: 'أسبوع 5', performance: 87, target: 85 },
];

const radarData = [
  { skill: 'التواصل', you: 85, team: 70, subject: 'التواصل' },
  { skill: 'الحل', you: 78, team: 75, subject: 'الحل' },
  { skill: 'السرعة', you: 90, team: 72, subject: 'السرعة' },
  { skill: 'المعرفة', you: 70, team: 68, subject: 'المعرفة' },
  { skill: 'البيع', you: 65, team: 60, subject: 'البيع' },
];

export default function AdvancedAgentKPIDashboard({ agentId }) {
  const [activeWidgets, setActiveWidgets] = useState(['calls', 'satisfaction', 'resolution', 'peer_comparison', 'predictions', 'goals']);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [goals, setGoals] = useState([
    { id: 1, title: 'رفع رضا العملاء', target: 4.8, current: 4.7, unit: '/5', deadline: '2024-12-31' },
    { id: 2, title: 'تقليل وقت المعالجة', target: 4, current: 4.5, unit: ' دقيقة', deadline: '2024-12-15' },
    { id: 3, title: '50 مكالمة يومياً', target: 50, current: 47, unit: '', deadline: '2024-12-10' },
  ]);

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل أداء الوكيل وقدم تنبؤات مستقبلية:

الأداء الحالي: 87%
المكالمات اليومية: 47
رضا العملاء: 4.7/5
معدل الحل: 89%

قدم:
1. تنبؤات الأداء للأسبوع القادم
2. المجالات المتوقع تحسنها
3. المخاطر المحتملة
4. توصيات للتحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_score: { type: "number" },
            score_change: { type: "number" },
            confidence: { type: "number" },
            improvements: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            weekly_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  predicted_calls: { type: "number" },
                  predicted_satisfaction: { type: "number" }
                }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('تم تحديث التنبؤات');
    }
  });

  const toggleWidget = (widgetId) => {
    setActiveWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(w => w !== widgetId)
        : [...prev, widgetId]
    );
  };

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'calls':
        return (
          <Card className="bg-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Phone className="w-5 h-5 text-cyan-400" />
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <ArrowUp className="w-3 h-3 ml-1" />+12%
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white">47</p>
              <p className="text-slate-400 text-sm">مكالمة اليوم</p>
              <Progress value={94} className="h-1 mt-2" />
              <p className="text-slate-500 text-xs mt-1">الهدف: 50</p>
            </CardContent>
          </Card>
        );

      case 'satisfaction':
        return (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-amber-400" />
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <ArrowUp className="w-3 h-3 ml-1" />+0.3
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white">4.7</p>
              <p className="text-slate-400 text-sm">رضا العملاء</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'resolution':
        return (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400 text-xs">+5%</Badge>
              </div>
              <p className="text-3xl font-bold text-white">89%</p>
              <p className="text-slate-400 text-sm">معدل الحل الأول</p>
              <Progress value={89} className="h-1 mt-2" />
            </CardContent>
          </Card>
        );

      case 'peer_comparison':
        return (
          <Card className="bg-slate-800/30 border-slate-700/50 col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                مقارنة الأقران (مجهولة)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="أنت" dataKey="you" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                    <Radar name="الفريق" dataKey="team" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-slate-400 text-xs">أنت</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-slate-400 text-xs">متوسط الفريق</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'predictions':
        return (
          <Card className="bg-purple-500/10 border-purple-500/30 col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  التنبؤات الذكية
                </CardTitle>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => generatePredictionsMutation.mutate()}>
                  <Sparkles className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {predictions ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{predictions.predicted_score}%</p>
                      <p className="text-slate-400 text-xs">الأداء المتوقع</p>
                    </div>
                    <div className={`flex items-center gap-1 ${predictions.score_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {predictions.score_change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span>{Math.abs(predictions.score_change)}%</span>
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">ثقة: {predictions.confidence}%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-500/10 rounded">
                      <p className="text-green-400 text-xs mb-1">متوقع التحسن:</p>
                      {predictions.improvements?.slice(0, 2).map((imp, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {imp}</p>
                      ))}
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded">
                      <p className="text-amber-400 text-xs mb-1">نقاط اهتمام:</p>
                      {predictions.risks?.slice(0, 2).map((risk, i) => (
                        <p key={i} className="text-slate-300 text-xs">• {risk}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">اضغط للحصول على تنبؤات AI</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'goals':
        return (
          <Card className="bg-slate-800/30 border-slate-700/50 col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                تتبع الأهداف الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goals.map(goal => {
                  const progress = (goal.current / goal.target) * 100;
                  const isAchieved = progress >= 100;
                  return (
                    <div key={goal.id} className="p-2 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{goal.title}</span>
                        <Badge className={isAchieved ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}>
                          {goal.current}{goal.unit} / {goal.target}{goal.unit}
                        </Badge>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <p className="text-slate-500 text-xs mt-1">الموعد: {goal.deadline}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 'trends':
        return (
          <Card className="bg-slate-800/30 border-slate-700/50 col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                اتجاه الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 100]} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="performance" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="الأداء" />
                    <Line type="monotone" dataKey="target" stroke="#a855f7" strokeDasharray="5 5" name="الهدف" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">لوحة مؤشرات الأداء المتقدمة</h4>
            <p className="text-slate-400 text-xs">قابلة للتخصيص • تنبؤات AI • مقارنات</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setShowCustomizer(true)}>
          <Settings className="w-4 h-4 ml-1" />
          تخصيص
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activeWidgets.map(widgetId => (
          <React.Fragment key={widgetId}>
            {renderWidget(widgetId)}
          </React.Fragment>
        ))}
      </div>

      {/* Customizer Dialog */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تخصيص لوحة التحكم
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {availableWidgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <widget.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{widget.name}</span>
                </div>
                <Switch
                  checked={activeWidgets.includes(widget.id)}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-cyan-600" onClick={() => setShowCustomizer(false)}>
            حفظ التخصيص
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}