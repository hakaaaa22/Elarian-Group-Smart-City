import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Settings, Save, Plus, X, Grip, Eye, EyeOff, RefreshCw,
  TrendingUp, TrendingDown, Target, Award, Clock, Phone, MessageSquare,
  Star, Zap, Brain, BarChart3, Users, CheckCircle, AlertTriangle, Loader2,
  Maximize2, Minimize2, Move, Palette, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Available widgets
const availableWidgets = [
  { id: 'calls_today', name: 'المكالمات اليوم', icon: Phone, category: 'performance', size: 'small' },
  { id: 'avg_handle_time', name: 'متوسط وقت المعالجة', icon: Clock, category: 'performance', size: 'small' },
  { id: 'satisfaction_score', name: 'درجة الرضا', icon: Star, category: 'quality', size: 'small' },
  { id: 'resolution_rate', name: 'معدل الحل', icon: CheckCircle, category: 'quality', size: 'small' },
  { id: 'daily_goal', name: 'الهدف اليومي', icon: Target, category: 'goals', size: 'medium' },
  { id: 'performance_trend', name: 'اتجاه الأداء', icon: TrendingUp, category: 'analytics', size: 'large' },
  { id: 'queue_status', name: 'حالة الانتظار', icon: Users, category: 'realtime', size: 'medium' },
  { id: 'ai_insights', name: 'رؤى AI', icon: Brain, category: 'ai', size: 'medium' },
  { id: 'achievements', name: 'الإنجازات', icon: Award, category: 'gamification', size: 'medium' },
  { id: 'alerts', name: 'التنبيهات', icon: Bell, category: 'alerts', size: 'small' },
];

// Default layout
const defaultLayout = {
  widgets: [
    { id: 'calls_today', visible: true, position: 0 },
    { id: 'avg_handle_time', visible: true, position: 1 },
    { id: 'satisfaction_score', visible: true, position: 2 },
    { id: 'resolution_rate', visible: true, position: 3 },
    { id: 'daily_goal', visible: true, position: 4 },
    { id: 'ai_insights', visible: true, position: 5 },
  ],
  theme: 'dark',
  refreshInterval: 30,
  showAnimations: true,
};

// Mock real-time data
const generateRealtimeData = () => ({
  calls_today: Math.floor(Math.random() * 20) + 30,
  avg_handle_time: (Math.random() * 2 + 3).toFixed(1),
  satisfaction_score: (Math.random() * 0.5 + 4.5).toFixed(1),
  resolution_rate: Math.floor(Math.random() * 10) + 88,
  queue_waiting: Math.floor(Math.random() * 10),
  daily_goal_progress: Math.floor(Math.random() * 30) + 60,
});

export default function PersonalizedAgentDashboard({ agentId }) {
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem(`agent_dashboard_${agentId}`);
    return saved ? JSON.parse(saved) : defaultLayout;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData());
  const [aiInsights, setAiInsights] = useState([]);
  const [goals, setGoals] = useState({
    daily: { target: 50, current: 42 },
    weekly: { target: 250, current: 198 },
    satisfaction: { target: 4.8, current: 4.6 }
  });

  // Refresh real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(generateRealtimeData());
    }, layout.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [layout.refreshInterval]);

  // Save layout
  useEffect(() => {
    localStorage.setItem(`agent_dashboard_${agentId}`, JSON.stringify(layout));
  }, [layout, agentId]);

  // AI Insights
  const fetchAIInsightsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على أداء الوكيل، قدم 3-5 رؤى وتوصيات مخصصة:

بيانات الأداء:
- المكالمات اليوم: ${realtimeData.calls_today}
- متوسط وقت المعالجة: ${realtimeData.avg_handle_time} دقيقة
- درجة الرضا: ${realtimeData.satisfaction_score}
- معدل الحل: ${realtimeData.resolution_rate}%
- تقدم الهدف اليومي: ${goals.daily.current}/${goals.daily.target}

قدم رؤى قصيرة ومحددة وقابلة للتنفيذ.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            overall_status: { type: "string" },
            focus_area: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setAiInsights(data.insights || []);
    }
  });

  useEffect(() => {
    fetchAIInsightsMutation.mutate();
  }, []);

  const toggleWidget = (widgetId) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    }));
  };

  const addWidget = (widgetId) => {
    if (layout.widgets.find(w => w.id === widgetId)) {
      toggleWidget(widgetId);
    } else {
      setLayout(prev => ({
        ...prev,
        widgets: [...prev.widgets, { id: widgetId, visible: true, position: prev.widgets.length }]
      }));
    }
  };

  const getWidgetContent = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget) return null;

    switch (widgetId) {
      case 'calls_today':
        return (
          <div className="text-center">
            <Phone className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{realtimeData.calls_today}</p>
            <p className="text-slate-400 text-sm">مكالمة اليوم</p>
            <div className="flex items-center justify-center gap-1 mt-1 text-green-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              +12% من الأمس
            </div>
          </div>
        );

      case 'avg_handle_time':
        return (
          <div className="text-center">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{realtimeData.avg_handle_time}</p>
            <p className="text-slate-400 text-sm">دقيقة/مكالمة</p>
            <div className="flex items-center justify-center gap-1 mt-1 text-green-400 text-xs">
              <TrendingDown className="w-3 h-3" />
              -0.5 من الأمس
            </div>
          </div>
        );

      case 'satisfaction_score':
        return (
          <div className="text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{realtimeData.satisfaction_score}</p>
            <p className="text-slate-400 text-sm">درجة الرضا</p>
            <div className="flex justify-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.floor(realtimeData.satisfaction_score) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
              ))}
            </div>
          </div>
        );

      case 'resolution_rate':
        return (
          <div className="text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{realtimeData.resolution_rate}%</p>
            <p className="text-slate-400 text-sm">معدل الحل</p>
            <Progress value={realtimeData.resolution_rate} className="mt-2 h-2" />
          </div>
        );

      case 'daily_goal':
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Target className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">
                {goals.daily.current}/{goals.daily.target}
              </Badge>
            </div>
            <p className="text-white font-medium mb-2">الهدف اليومي</p>
            <Progress value={(goals.daily.current / goals.daily.target) * 100} className="h-3 mb-2" />
            <p className="text-slate-400 text-xs">
              {goals.daily.target - goals.daily.current} مكالمة متبقية
            </p>
            <div className="mt-3 p-2 bg-slate-900/50 rounded">
              <p className="text-slate-400 text-xs">الهدف الأسبوعي</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white text-sm">{goals.weekly.current}/{goals.weekly.target}</span>
                <Progress value={(goals.weekly.current / goals.weekly.target) * 100} className="w-20 h-2" />
              </div>
            </div>
          </div>
        );

      case 'ai_insights':
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">رؤى AI</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => fetchAIInsightsMutation.mutate()}
                disabled={fetchAIInsightsMutation.isPending}
              >
                {fetchAIInsightsMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2">
                {aiInsights.map((insight, i) => (
                  <div key={i} className={`p-2 rounded text-sm ${
                    insight.priority === 'high' ? 'bg-red-500/10 border border-red-500/30' :
                    insight.priority === 'medium' ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-slate-900/50'
                  }`}>
                    <p className="text-white">{insight.message}</p>
                    {insight.action && (
                      <p className="text-cyan-400 text-xs mt-1">💡 {insight.action}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'queue_status':
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">حالة الانتظار</span>
            </div>
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-cyan-400">{realtimeData.queue_waiting}</p>
              <p className="text-slate-400 text-sm">في الانتظار</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-slate-900/50 rounded text-center">
                <p className="text-white font-medium">~2:30</p>
                <p className="text-slate-500 text-xs">متوسط الانتظار</p>
              </div>
              <div className="p-2 bg-slate-900/50 rounded text-center">
                <p className="text-white font-medium">8</p>
                <p className="text-slate-500 text-xs">وكلاء متاحين</p>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">الإنجازات</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'نجم اليوم', icon: '⭐', unlocked: true },
                { name: '50 مكالمة', icon: '📞', unlocked: goals.daily.current >= 50 },
                { name: 'رضا 5 نجوم', icon: '🏆', unlocked: parseFloat(realtimeData.satisfaction_score) >= 5 },
              ].map((achievement, i) => (
                <div key={i} className={`p-2 rounded flex items-center gap-2 ${
                  achievement.unlocked ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900/50 opacity-50'
                }`}>
                  <span className="text-xl">{achievement.icon}</span>
                  <span className={achievement.unlocked ? 'text-amber-400' : 'text-slate-500'}>{achievement.name}</span>
                  {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-400 mr-auto" />}
                </div>
              ))}
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="text-center">
            <Bell className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-slate-400 text-sm">تنبيهات جديدة</p>
          </div>
        );

      default:
        return null;
    }
  };

  const visibleWidgets = layout.widgets.filter(w => w.visible).sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <LayoutDashboard className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">لوحة التحكم الشخصية</h4>
            <p className="text-slate-400 text-xs">قابلة للتخصيص • تحديث مباشر</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-600"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4 ml-2" />
            تخصيص
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <AnimatePresence>
          {visibleWidgets.map((w, i) => {
            const widget = availableWidgets.find(aw => aw.id === w.id);
            const colSpan = widget?.size === 'large' ? 'col-span-2' : widget?.size === 'medium' ? 'col-span-1 md:col-span-1' : '';

            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className={colSpan}
              >
                <Card className="bg-slate-800/30 border-slate-700/50 h-full">
                  <CardContent className="p-4">
                    {getWidgetContent(w.id)}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              تخصيص لوحة التحكم
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Widget Selection */}
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">الأدوات المعروضة</Label>
              <ScrollArea className="h-[200px] border border-slate-700 rounded-lg p-2">
                <div className="space-y-2">
                  {availableWidgets.map(widget => {
                    const isVisible = layout.widgets.find(w => w.id === widget.id)?.visible;
                    return (
                      <div key={widget.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                        <div className="flex items-center gap-2">
                          <widget.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-white text-sm">{widget.name}</span>
                          <Badge className="bg-slate-700 text-slate-400 text-xs">{widget.category}</Badge>
                        </div>
                        <Switch
                          checked={isVisible}
                          onCheckedChange={() => addWidget(widget.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Refresh Interval */}
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">فترة التحديث</Label>
              <Select
                value={String(layout.refreshInterval)}
                onValueChange={(v) => setLayout(prev => ({ ...prev, refreshInterval: Number(v) }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="10">10 ثواني</SelectItem>
                  <SelectItem value="30">30 ثانية</SelectItem>
                  <SelectItem value="60">دقيقة</SelectItem>
                  <SelectItem value="300">5 دقائق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animations Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-sm">تأثيرات الحركة</Label>
              <Switch
                checked={layout.showAnimations}
                onCheckedChange={(v) => setLayout(prev => ({ ...prev, showAnimations: v }))}
              />
            </div>

            {/* Reset */}
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400"
                onClick={() => {
                  setLayout(defaultLayout);
                  toast.success('تم إعادة التعيين');
                }}
              >
                إعادة التعيين
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={() => {
                  setShowSettings(false);
                  toast.success('تم حفظ التخصيصات');
                }}
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}