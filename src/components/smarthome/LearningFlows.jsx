import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, Sparkles, TrendingUp, Lightbulb, Clock, Zap, Target, RefreshCw,
  Check, X, ChevronRight, BarChart3, Activity, Eye, Settings, Play,
  ThumbsUp, ThumbsDown, Plus, Loader2, AlertTriangle, Calendar, Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Learning patterns detected
const mockPatterns = [
  {
    id: 'p1',
    name: 'نمط الصباح',
    confidence: 92,
    description: 'تشغيل الإضاءة والمكيف عند الاستيقاظ',
    triggers: ['الساعة 6:30 صباحاً', 'أيام العمل'],
    actions: ['إضاءة غرفة النوم 50%', 'مكيف 23°C'],
    frequency: 'يومي',
    status: 'suggested',
    savings: '12%'
  },
  {
    id: 'p2',
    name: 'مغادرة المنزل',
    confidence: 87,
    description: 'إطفاء جميع الأجهزة عند المغادرة',
    triggers: ['مغادرة المنزل', '8:00-9:00 صباحاً'],
    actions: ['إطفاء الإضاءة', 'قفل الباب', 'إيقاف المكيف'],
    frequency: 'يومي',
    status: 'active',
    savings: '25%'
  },
  {
    id: 'p3',
    name: 'وقت النوم',
    confidence: 78,
    description: 'تهيئة المنزل للنوم',
    triggers: ['الساعة 11:00 مساءً', 'يومياً'],
    actions: ['إضاءة خافتة', 'مكيف 22°C', 'قفل الأبواب'],
    frequency: 'يومي',
    status: 'learning',
    savings: '8%'
  },
  {
    id: 'p4',
    name: 'ضيوف في المنزل',
    confidence: 65,
    description: 'إعدادات الضيافة',
    triggers: ['جرس الباب', 'عطلة نهاية الأسبوع'],
    actions: ['إضاءة كاملة', 'تشغيل الموسيقى', 'مكيف 24°C'],
    frequency: 'أسبوعي',
    status: 'suggested',
    savings: '5%'
  }
];

const mockPredictions = [
  { time: '6:30 ص', event: 'استيقاظ', probability: 95, action: 'تشغيل الإضاءة' },
  { time: '8:15 ص', event: 'مغادرة', probability: 88, action: 'إطفاء الأجهزة' },
  { time: '6:00 م', event: 'عودة', probability: 72, action: 'تشغيل المكيف' },
  { time: '11:00 م', event: 'نوم', probability: 90, action: 'وضع الليل' },
];

const mockInsights = [
  { type: 'saving', title: 'توفير محتمل', value: '45%', desc: 'بتفعيل 3 أنماط مقترحة' },
  { type: 'pattern', title: 'أنماط مكتشفة', value: '12', desc: 'هذا الشهر' },
  { type: 'accuracy', title: 'دقة التنبؤ', value: '89%', desc: 'معدل النجاح' },
  { type: 'active', title: 'أتمتة نشطة', value: '8', desc: 'من أصل 15 مقترح' },
];

export default function LearningFlows({ devices = [], analyticsData = {} }) {
  const [patterns, setPatterns] = useState(mockPatterns);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [learningEnabled, setLearningEnabled] = useState(true);

  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `تحليل أنماط استخدام المنزل الذكي بناءً على البيانات التالية:
        
        الأجهزة: ${devices.map(d => `${d.name} (${d.category})`).join(', ')}
        
        بيانات الاستخدام:
        - متوسط الاستهلاك: 15.5 كيلوواط/يوم
        - ساعات الذروة: 6-8 صباحاً، 6-10 مساءً
        - أنماط درجة الحرارة: 23°C نهاراً، 22°C ليلاً
        
        اقترح 3 أنماط أتمتة جديدة مع نسبة الثقة والتوفير المتوقع.`,
        response_json_schema: {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  confidence: { type: 'number' },
                  triggers: { type: 'array', items: { type: 'string' } },
                  actions: { type: 'array', items: { type: 'string' } },
                  savings: { type: 'string' }
                }
              }
            },
            insights: { type: 'string' }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.patterns) {
        const newPatterns = data.patterns.map((p, i) => ({
          ...p,
          id: `ai-${Date.now()}-${i}`,
          status: 'suggested',
          frequency: 'يومي'
        }));
        setPatterns([...patterns, ...newPatterns]);
      }
      toast.success('تم اكتشاف أنماط جديدة!');
    },
    onError: () => toast.error('فشل في التحليل')
  });

  const activatePattern = (patternId) => {
    setPatterns(patterns.map(p => 
      p.id === patternId ? { ...p, status: 'active' } : p
    ));
    toast.success('تم تفعيل النمط');
  };

  const dismissPattern = (patternId) => {
    setPatterns(patterns.map(p => 
      p.id === patternId ? { ...p, status: 'dismissed' } : p
    ));
    toast.success('تم تجاهل النمط');
  };

  const statusConfig = {
    active: { color: 'green', label: 'نشط', icon: Check },
    suggested: { color: 'amber', label: 'مقترح', icon: Lightbulb },
    learning: { color: 'purple', label: 'قيد التعلم', icon: Brain },
    dismissed: { color: 'slate', label: 'متجاهل', icon: X },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            مسارات التعلم الذكية
          </h3>
          <p className="text-slate-400 text-sm">النظام يتعلم من أنماط استخدامك ويقترح أتمتة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">التعلم التلقائي</span>
            <Switch checked={learningEnabled} onCheckedChange={setLearningEnabled} />
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => analyzePatternsMutation.mutate()}
            disabled={analyzePatternsMutation.isPending}
          >
            {analyzePatternsMutation.isPending ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-2" />
            )}
            تحليل الأنماط
          </Button>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockInsights.map((insight, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{insight.value}</p>
              <p className="text-slate-400 text-sm">{insight.title}</p>
              <p className="text-slate-500 text-xs mt-1">{insight.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictions Timeline */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            التنبؤات لليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mockPredictions.map((pred, i) => (
              <div key={i} className="flex-shrink-0 p-3 bg-slate-800/50 rounded-lg min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{pred.time}</span>
                  <Badge className={`text-xs ${pred.probability > 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {pred.probability}%
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">{pred.event}</p>
                <p className="text-purple-400 text-xs mt-1">{pred.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patterns Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {patterns.filter(p => p.status !== 'dismissed').map((pattern, i) => {
          const status = statusConfig[pattern.status];
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 ${
                pattern.status === 'suggested' ? 'ring-1 ring-amber-500/30' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${status.color}-500/20`}>
                        <StatusIcon className={`w-5 h-5 text-${status.color}-400`} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{pattern.name}</h4>
                        <p className="text-slate-400 text-xs">{pattern.description}</p>
                      </div>
                    </div>
                    <Badge className={`bg-${status.color}-500/20 text-${status.color}-400 text-xs`}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">نسبة الثقة</span>
                      <span className="text-white">{pattern.confidence}%</span>
                    </div>
                    <Progress value={pattern.confidence} className="h-1.5" />
                  </div>

                  {/* Triggers & Actions Preview */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pattern.triggers.slice(0, 2).map((t, j) => (
                      <Badge key={j} variant="outline" className="border-slate-600 text-slate-300 text-[10px]">
                        {t}
                      </Badge>
                    ))}
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                    {pattern.actions.slice(0, 2).map((a, j) => (
                      <Badge key={j} className="bg-cyan-500/20 text-cyan-400 text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        توفير {pattern.savings}
                      </Badge>
                      <span className="text-slate-500 text-xs">{pattern.frequency}</span>
                    </div>
                    
                    {pattern.status === 'suggested' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-red-400" onClick={() => dismissPattern(pattern.id)}>
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700" onClick={() => activatePattern(pattern.id)}>
                          <ThumbsUp className="w-3 h-3 ml-1" />
                          تفعيل
                        </Button>
                      </div>
                    )}
                    
                    {pattern.status === 'active' && (
                      <Button size="sm" variant="outline" className="h-7 border-slate-600" onClick={() => { setSelectedPattern(pattern); setShowDetailDialog(true); }}>
                        <Settings className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                    )}
                    
                    {pattern.status === 'learning' && (
                      <div className="flex items-center gap-1 text-purple-400 text-xs">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        جاري التعلم...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل النمط</DialogTitle>
          </DialogHeader>
          {selectedPattern && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">{selectedPattern.name}</h4>
                <p className="text-slate-400 text-sm">{selectedPattern.description}</p>
              </div>
              
              <div>
                <p className="text-slate-300 text-sm mb-2">المشغلات:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.triggers.map((t, i) => (
                    <Badge key={i} variant="outline" className="border-amber-500/50 text-amber-400">{t}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-slate-300 text-sm mb-2">الإجراءات:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.actions.map((a, i) => (
                    <Badge key={i} className="bg-cyan-500/20 text-cyan-400">{a}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4 ml-2" />
                  تشغيل الآن
                </Button>
                <Button variant="outline" className="border-slate-600">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}