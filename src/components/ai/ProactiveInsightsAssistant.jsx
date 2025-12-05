import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, RefreshCw,
  Send, Zap, Target, Activity, Clock, Eye, ChevronRight, ThumbsUp,
  ThumbsDown, Bell, Settings, Play, MessageSquare, Sparkles, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// رؤى استباقية محاكاة
const initialInsights = [
  {
    id: 1,
    type: 'prediction',
    category: 'waste',
    title: 'توقع ارتفاع النفايات',
    description: 'بناءً على تحليل البيانات التاريخية، نتوقع زيادة 25% في النفايات خلال الأسبوع القادم بسبب العطلة',
    confidence: 92,
    impact: 'high',
    action: 'WasteManagement',
    suggestedActions: ['زيادة عدد الشاحنات', 'تعديل جداول الجمع'],
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    type: 'anomaly',
    category: 'fleet',
    title: 'شذوذ في استهلاك الوقود',
    description: 'شاحنة TRK-002 تستهلك 18% وقود أكثر من المعتاد - قد تحتاج صيانة',
    confidence: 87,
    impact: 'medium',
    action: 'FleetAdvanced',
    suggestedActions: ['جدولة فحص المحرك', 'مراجعة سلوك السائق'],
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    type: 'optimization',
    category: 'routes',
    title: 'فرصة تحسين المسارات',
    description: 'يمكن توفير 45 دقيقة و12 لتر وقود يومياً بإعادة ترتيب المسارات الصباحية',
    confidence: 94,
    impact: 'high',
    action: 'SmartRouting',
    suggestedActions: ['تطبيق المسار المحسن', 'مراجعة مع السائقين'],
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    type: 'maintenance',
    category: 'devices',
    title: 'صيانة تنبؤية',
    description: '3 حساسات في المنطقة الشمالية ستحتاج استبدال خلال أسبوعين',
    confidence: 85,
    impact: 'medium',
    action: 'MaintenanceTracker',
    suggestedActions: ['طلب القطع مسبقاً', 'جدولة الصيانة'],
    timestamp: new Date(Date.now() - 14400000).toISOString()
  }
];

export default function ProactiveInsightsAssistant() {
  const [insights, setInsights] = useState(initialInsights);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعد الرؤى الاستباقية. أحلل البيانات باستمرار لتقديم توصيات ذكية. كيف يمكنني مساعدتك؟' }
  ]);
  const [inputText, setInputText] = useState('');
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [showDismissed, setShowDismissed] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // تحليل البيانات وتوليد رؤى جديدة
  const generateInsights = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كمساعد ذكي متخصص في تحليل بيانات إدارة المدن الذكية، قم بتوليد رؤى استباقية جديدة:

البيانات المتاحة:
- معدل جمع النفايات: 94%
- كفاءة الأسطول: 87%
- صحة الأجهزة: 91%
- تنبيهات نشطة: 12
- معدل الصيانة التنبؤية: 85%

الرؤى الحالية: ${insights.length}

قم بتوليد 2-3 رؤى جديدة تشمل:
1. تنبؤات مستقبلية
2. فرص تحسين
3. شذوذ مكتشف
4. توصيات صيانة

كل رؤية يجب أن تتضمن:
- عنوان واضح
- وصف تفصيلي
- نسبة الثقة
- مستوى التأثير
- إجراءات مقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            newInsights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["prediction", "anomaly", "optimization", "maintenance"] },
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" },
                  impact: { type: "string", enum: ["high", "medium", "low"] },
                  suggestedActions: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      if (data.newInsights) {
        const newInsightsWithIds = data.newInsights.map((insight, i) => ({
          ...insight,
          id: Date.now() + i,
          timestamp: new Date().toISOString(),
          action: getActionPage(insight.category)
        }));
        setInsights(prev => [...newInsightsWithIds, ...prev]);
        toast.success(`تم اكتشاف ${data.newInsights.length} رؤى جديدة`);
      }
    }
  });

  // التفاعل مع المساعد
  const chatWithAssistant = useMutation({
    mutationFn: async (question) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كمساعد ذكي متخصص في تحليل البيانات وتقديم الرؤى الاستباقية، أجب على السؤال التالي:

السؤال: ${question}

الرؤى الحالية:
${insights.slice(0, 5).map(i => `- ${i.title}: ${i.description}`).join('\n')}

قدم إجابة مفيدة ومختصرة مع توصيات عملية إن أمكن.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            relatedInsights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data, variables) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: variables },
        { role: 'assistant', content: data.answer, recommendations: data.recommendations }
      ]);
    }
  });

  const getActionPage = (category) => {
    const categoryPages = {
      waste: 'WasteManagement',
      fleet: 'FleetAdvanced',
      routes: 'SmartRouting',
      devices: 'DeviceManagement',
      traffic: 'TrafficIntelligence'
    };
    return categoryPages[category] || 'Home';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    chatWithAssistant.mutate(inputText);
    setInputText('');
  };

  const applyInsight = (insight) => {
    toast.success(`تم تطبيق: ${insight.suggestedActions?.[0] || 'الإجراء المقترح'}`);
  };

  const dismissInsight = (insightId) => {
    const insight = insights.find(i => i.id === insightId);
    setInsights(prev => prev.filter(i => i.id !== insightId));
    if (insight) setDismissedInsights(prev => [...prev, insight]);
    toast.info('تم تجاهل الرؤية');
  };

  const feedbackInsight = (insightId, isPositive) => {
    toast.success(isPositive ? 'شكراً على التقييم الإيجابي!' : 'سنحسن من دقة التنبؤات');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'optimization': return Zap;
      case 'maintenance': return Settings;
      default: return Lightbulb;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'prediction': return 'purple';
      case 'anomaly': return 'red';
      case 'optimization': return 'green';
      case 'maintenance': return 'amber';
      default: return 'cyan';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'amber';
      default: return 'green';
    }
  };

  const stats = {
    total: insights.length,
    high: insights.filter(i => i.impact === 'high').length,
    applied: 12,
    avgConfidence: Math.round(insights.reduce((s, i) => s + i.confidence, 0) / insights.length || 0)
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          مساعد الرؤى الاستباقية
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">تحليل تلقائي</Label>
            <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
          </div>
          <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => generateInsights.mutate()} disabled={generateInsights.isPending}>
            {generateInsights.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحليل جديد
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Lightbulb className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-purple-400 text-xs">رؤى نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.high}</p>
            <p className="text-red-400 text-xs">تأثير عالي</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.applied}</p>
            <p className="text-green-400 text-xs">تم تطبيقها</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.avgConfidence}%</p>
            <p className="text-cyan-400 text-xs">متوسط الثقة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Insights List */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              الرؤى الاستباقية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-2">
                <AnimatePresence>
                  {insights.map(insight => {
                    const TypeIcon = getTypeIcon(insight.type);
                    const typeColor = getTypeColor(insight.type);
                    
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 rounded-lg bg-${typeColor}-500/10 border border-${typeColor}-500/30`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded bg-${typeColor}-500/20`}>
                              <TypeIcon className={`w-4 h-4 text-${typeColor}-400`} />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{insight.title}</p>
                              <p className="text-slate-500 text-xs">{insight.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={`bg-${getImpactColor(insight.impact)}-500/20 text-${getImpactColor(insight.impact)}-400 text-xs`}>
                              {insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <Badge className="bg-slate-700 text-slate-300 text-xs">{insight.confidence}%</Badge>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-xs mb-3">{insight.description}</p>
                        
                        {insight.suggestedActions?.length > 0 && (
                          <div className="p-2 bg-slate-900/50 rounded mb-2">
                            <p className="text-slate-500 text-xs mb-1">الإجراءات المقترحة:</p>
                            {insight.suggestedActions.map((action, i) => (
                              <p key={i} className="text-cyan-400 text-xs flex items-center gap-1">
                                <ChevronRight className="w-3 h-3" />
                                {action}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400" onClick={() => feedbackInsight(insight.id, true)}>
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => feedbackInsight(insight.id, false)}>
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 text-slate-400 text-xs" onClick={() => dismissInsight(insight.id)}>
                              تجاهل
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 text-green-400 text-xs" onClick={() => applyInsight(insight)}>
                              <Play className="w-3 h-3 ml-1" />
                              تطبيق
                            </Button>
                            <Link to={createPageUrl(insight.action)}>
                              <Button size="sm" variant="ghost" className="h-6 text-cyan-400 text-xs">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              المحادثة الذكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] mb-3" ref={scrollRef}>
              <div className="space-y-3 pr-2">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-500/20 text-white' : 'bg-slate-800/50 text-slate-300'}`}>
                        <p className="text-sm">{msg.content}</p>
                        {msg.recommendations?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-slate-500 text-xs mb-1">التوصيات:</p>
                            {msg.recommendations.map((rec, j) => (
                              <p key={j} className="text-cyan-400 text-xs flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {rec}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {chatWithAssistant.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن الرؤى أو اطلب تحليل..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSend} disabled={chatWithAssistant.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {['ما أهم الرؤى؟', 'توصيات اليوم', 'تحليل الأداء', 'فرص التحسين'].map(q => (
                <Button key={q} size="sm" variant="outline" className="border-slate-600 text-slate-400 text-xs h-7" onClick={() => chatWithAssistant.mutate(q)}>
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}