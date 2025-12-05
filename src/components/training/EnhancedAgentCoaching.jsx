import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, MessageSquare, AlertTriangle, CheckCircle, Lightbulb, TrendingUp,
  TrendingDown, Zap, Target, Heart, Frown, Meh, Smile, ThumbsUp, ThumbsDown,
  Clock, Loader2, RefreshCw, Eye, EyeOff, Sparkles, Shield, FileCheck, Play,
  Users, Award, BookOpen, GraduationCap, Mic, Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const sentimentEmojis = {
  positive: { icon: Smile, color: 'green', label: 'إيجابي' },
  negative: { icon: Frown, color: 'red', label: 'سلبي' },
  neutral: { icon: Meh, color: 'amber', label: 'محايد' },
};

const scenarioTypes = [
  { id: 'complaint', name: 'شكوى عميل غاضب', icon: '😤', difficulty: 'hard' },
  { id: 'technical', name: 'مشكلة تقنية معقدة', icon: '🔧', difficulty: 'medium' },
  { id: 'billing', name: 'استفسار فواتير', icon: '💳', difficulty: 'easy' },
  { id: 'refund', name: 'طلب استرداد', icon: '💰', difficulty: 'hard' },
  { id: 'upgrade', name: 'ترقية خدمة', icon: '⬆️', difficulty: 'easy' },
  { id: 'cancellation', name: 'إلغاء اشتراك', icon: '❌', difficulty: 'medium' },
];

const complianceRules = [
  { id: 'greeting', name: 'التحية المناسبة', checked: false },
  { id: 'identity', name: 'التحقق من الهوية', checked: false },
  { id: 'active_listening', name: 'الاستماع الفعال', checked: false },
  { id: 'solution', name: 'تقديم حل واضح', checked: false },
  { id: 'summary', name: 'تلخيص المحادثة', checked: false },
  { id: 'closing', name: 'الإغلاق المهني', checked: false },
];

export default function EnhancedAgentCoaching({ 
  isCallActive, 
  conversationTranscript, 
  customerData,
  onSuggestionApplied,
  agentId
}) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('realtime');
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  const [sentimentScore, setSentimentScore] = useState(50);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [compliance, setCompliance] = useState(complianceRules);
  const [coachingHistory, setCoachingHistory] = useState([]);
  
  // Role-play state
  const [rolePlayActive, setRolePlayActive] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [rolePlayConversation, setRolePlayConversation] = useState([]);
  const [agentInput, setAgentInput] = useState('');
  const [rolePlayFeedback, setRolePlayFeedback] = useState(null);
  const [rolePlayScore, setRolePlayScore] = useState(0);

  const [settings, setSettings] = useState({
    autoAnalyze: true,
    showAlerts: true,
    soundAlerts: false,
    complianceCheck: true,
    sensitivityLevel: 'medium',
  });

  const analysisIntervalRef = useRef(null);

  // Real-time sentiment and compliance analysis
  const analyzeMutation = useMutation({
    mutationFn: async (transcript) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مدرب خدمة عملاء خبير. حلل المحادثة التالية وقدم تغذية راجعة مخصصة في الوقت الفعلي:

المحادثة:
${transcript}

معلومات العميل:
${JSON.stringify(customerData, null, 2)}

قدم تحليلاً شاملاً يتضمن:
1. تحليل المشاعر الحالية للعميل
2. مستوى التوتر والإحباط
3. فحص الامتثال للسياسات
4. اقتراحات فورية للتحسين
5. عبارات مقترحة للاستخدام
6. تحذيرات من أخطاء محتملة
7. تقييم أداء الوكيل الحالي`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            sentiment_score: { type: "number" },
            stress_level: { type: "number" },
            compliance_checks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rule: { type: "string" },
                  passed: { type: "boolean" },
                  note: { type: "string" }
                }
              }
            },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" },
                  suggested_phrase: { type: "string" }
                }
              }
            },
            warnings: { type: "array", items: { type: "string" } },
            agent_score: { type: "number" },
            escalation_risk: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setCurrentSentiment(data.sentiment || 'neutral');
      setSentimentScore(data.sentiment_score || 50);
      setSuggestions(data.suggestions || []);

      // Update compliance
      if (data.compliance_checks) {
        setCompliance(prev => prev.map(rule => {
          const check = data.compliance_checks.find(c => c.rule === rule.id);
          return check ? { ...rule, checked: check.passed } : rule;
        }));
      }

      // Add warnings
      if (data.warnings?.length > 0) {
        const newAlerts = data.warnings.map((w, i) => ({
          id: Date.now() + i,
          message: w,
          type: 'warning',
          timestamp: new Date()
        }));
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        if (settings.soundAlerts) {
          toast.warning(data.warnings[0]);
        }
      }

      // Check escalation risk
      if (data.escalation_risk > 70) {
        toast.error('⚠️ خطر تصعيد مرتفع - يُنصح بتدخل المشرف');
      }

      setCoachingHistory(prev => [{
        timestamp: new Date(),
        sentiment: data.sentiment,
        score: data.agent_score,
        suggestions: data.suggestions?.length || 0
      }, ...prev].slice(0, 20));
    }
  });

  // Generate role-play scenario
  const generateScenarioMutation = useMutation({
    mutationFn: async (scenarioType) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت تقوم بإنشاء سيناريو تدريبي لوكيل خدمة عملاء. نوع السيناريو: ${scenarioType.name}

أنشئ سيناريو واقعي يتضمن:
1. وصف الموقف
2. معلومات العميل الوهمي
3. المشكلة الرئيسية
4. نقاط التحدي
5. الحل الأمثل
6. الرسالة الافتتاحية من العميل`,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_description: { type: "string" },
            customer_persona: {
              type: "object",
              properties: {
                name: { type: "string" },
                mood: { type: "string" },
                history: { type: "string" }
              }
            },
            main_issue: { type: "string" },
            challenges: { type: "array", items: { type: "string" } },
            ideal_resolution: { type: "string" },
            opening_message: { type: "string" },
            evaluation_criteria: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setRolePlayConversation([{
        role: 'customer',
        message: data.opening_message,
        timestamp: new Date()
      }]);
      setSelectedScenario({ ...selectedScenario, ...data });
      setRolePlayActive(true);
      toast.success('تم إنشاء السيناريو - ابدأ الرد!');
    }
  });

  // Evaluate agent response in role-play
  const evaluateResponseMutation = useMutation({
    mutationFn: async ({ agentResponse, conversation, scenario }) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قيّم رد وكيل خدمة العملاء في سيناريو التدريب:

السيناريو: ${scenario.scenario_description}
المشكلة: ${scenario.main_issue}

المحادثة حتى الآن:
${conversation.map(c => `${c.role === 'customer' ? 'العميل' : 'الوكيل'}: ${c.message}`).join('\n')}

الرد الجديد من الوكيل: ${agentResponse}

قيّم الرد وقدم:
1. درجة الجودة (0-100)
2. نقاط القوة
3. نقاط التحسين
4. رد العميل التالي (استمر في التمثيل)
5. هل تم حل المشكلة؟`,
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            customer_response: { type: "string" },
            issue_resolved: { type: "boolean" },
            overall_feedback: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setRolePlayConversation(prev => [
        ...prev,
        { role: 'customer', message: data.customer_response, timestamp: new Date() }
      ]);
      setRolePlayScore(prev => Math.round((prev + data.quality_score) / 2));
      setRolePlayFeedback(data);

      if (data.issue_resolved) {
        toast.success('🎉 تم حل المشكلة بنجاح!');
      }
    }
  });

  // Auto-analyze when call is active
  useEffect(() => {
    if (isCallActive && isEnabled && settings.autoAnalyze && conversationTranscript) {
      analyzeMutation.mutate(conversationTranscript);
      analysisIntervalRef.current = setInterval(() => {
        if (conversationTranscript) {
          analyzeMutation.mutate(conversationTranscript);
        }
      }, 15000);
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isCallActive, isEnabled, settings.autoAnalyze, conversationTranscript]);

  const handleAgentSubmit = () => {
    if (!agentInput.trim()) return;
    
    const newMessage = {
      role: 'agent',
      message: agentInput,
      timestamp: new Date()
    };
    
    setRolePlayConversation(prev => [...prev, newMessage]);
    evaluateResponseMutation.mutate({
      agentResponse: agentInput,
      conversation: [...rolePlayConversation, newMessage],
      scenario: selectedScenario
    });
    setAgentInput('');
  };

  const startScenario = (scenario) => {
    setSelectedScenario(scenario);
    setRolePlayConversation([]);
    setRolePlayFeedback(null);
    setRolePlayScore(0);
    generateScenarioMutation.mutate(scenario);
  };

  const endRolePlay = () => {
    setRolePlayActive(false);
    setSelectedScenario(null);
    setRolePlayConversation([]);
    setRolePlayFeedback(null);
  };

  const sentimentConfig = sentimentEmojis[currentSentiment] || sentimentEmojis.neutral;
  const complianceScore = Math.round((compliance.filter(c => c.checked).length / compliance.length) * 100);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={analyzeMutation.isPending ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: analyzeMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تدريب الوكيل المتقدم بالذكاء الاصطناعي</h4>
            <p className="text-slate-400 text-xs">تحليل مشاعر • فحص امتثال • سيناريوهات تدريبية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCallActive && (
            <Badge className="bg-green-500/20 text-green-400 animate-pulse">
              <span className="w-2 h-2 bg-green-400 rounded-full ml-1"></span>
              مكالمة نشطة
            </Badge>
          )}
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="realtime" className="data-[state=active]:bg-purple-500/20">
            <Zap className="w-3 h-3 ml-1" />
            الوقت الفعلي
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-green-500/20">
            <Shield className="w-3 h-3 ml-1" />
            الامتثال
          </TabsTrigger>
          <TabsTrigger value="roleplay" className="data-[state=active]:bg-cyan-500/20">
            <Users className="w-3 h-3 ml-1" />
            التدريب التمثيلي
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-amber-500/20">
            <BookOpen className="w-3 h-3 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="mt-4 space-y-4">
          {!isEnabled ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <EyeOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">التدريب في الوقت الفعلي معطل</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Sentiment Meter */}
              <Card className={`bg-${sentimentConfig.color}-500/10 border-${sentimentConfig.color}-500/30`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <sentimentConfig.icon className={`w-6 h-6 text-${sentimentConfig.color}-400`} />
                      <span className="text-white font-medium">مشاعر العميل</span>
                    </div>
                    <Badge className={`bg-${sentimentConfig.color}-500/20 text-${sentimentConfig.color}-400`}>
                      {sentimentConfig.label}
                    </Badge>
                  </div>
                  <Progress value={sentimentScore} className="h-4" />
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>سلبي</span>
                    <span className="text-2xl font-bold text-white">{sentimentScore}/100</span>
                    <span>إيجابي</span>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-400" />
                      اقتراحات فورية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[180px]">
                      <div className="space-y-2">
                        {suggestions.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg border ${
                              s.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                              s.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                              'bg-slate-900/50 border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Badge className={
                                  s.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  s.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-slate-600 text-slate-400'
                                }>
                                  {s.type}
                                </Badge>
                                <p className="text-white text-sm mt-1">{s.message}</p>
                                {s.suggested_phrase && (
                                  <div className="mt-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                                    <p className="text-cyan-400 text-xs">💬 عبارة مقترحة:</p>
                                    <p className="text-white text-sm">"{s.suggested_phrase}"</p>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={() => {
                                  onSuggestionApplied?.(s);
                                  toast.success('تم نسخ العبارة');
                                }}
                              >
                                <Zap className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {alerts.length > 0 && (
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      تنبيهات ({alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {alerts.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center gap-2 text-sm text-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          {a.message}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  فحص الامتثال للسياسات
                </CardTitle>
                <Badge className={complianceScore >= 80 ? 'bg-green-500/20 text-green-400' : complianceScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                  {complianceScore}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={complianceScore} className="h-3 mb-4" />
              <div className="space-y-2">
                {compliance.map((rule) => (
                  <div key={rule.id} className={`flex items-center justify-between p-2 rounded-lg ${rule.checked ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-900/50 border border-slate-700'}`}>
                    <div className="flex items-center gap-2">
                      {rule.checked ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                      <span className="text-white text-sm">{rule.name}</span>
                    </div>
                    {rule.checked && <Badge className="bg-green-500/20 text-green-400 text-[10px]">✓</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role-play Tab */}
        <TabsContent value="roleplay" className="mt-4 space-y-4">
          {!rolePlayActive ? (
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  اختر سيناريو تدريبي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {scenarioTypes.map((scenario) => (
                    <Button
                      key={scenario.id}
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-center gap-2 border-slate-700 hover:border-cyan-500/50 ${
                        scenario.difficulty === 'hard' ? 'hover:bg-red-500/10' :
                        scenario.difficulty === 'medium' ? 'hover:bg-amber-500/10' :
                        'hover:bg-green-500/10'
                      }`}
                      onClick={() => startScenario(scenario)}
                      disabled={generateScenarioMutation.isPending}
                    >
                      <span className="text-2xl">{scenario.icon}</span>
                      <span className="text-white text-sm">{scenario.name}</span>
                      <Badge className={
                        scenario.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        scenario.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      }>
                        {scenario.difficulty === 'hard' ? 'صعب' : scenario.difficulty === 'medium' ? 'متوسط' : 'سهل'}
                      </Badge>
                    </Button>
                  ))}
                </div>
                {generateScenarioMutation.isPending && (
                  <div className="mt-4 text-center">
                    <Loader2 className="w-6 h-6 text-cyan-400 mx-auto animate-spin mb-2" />
                    <p className="text-slate-400 text-sm">جاري إنشاء السيناريو...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Scenario Info */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {selectedScenario?.customer_persona?.name || 'العميل'}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400">
                        <Award className="w-3 h-3 ml-1" />
                        النتيجة: {rolePlayScore}%
                      </Badge>
                      <Button size="sm" variant="destructive" onClick={endRolePlay}>
                        إنهاء
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">{selectedScenario?.main_issue}</p>
                </CardContent>
              </Card>

              {/* Conversation */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <ScrollArea className="h-[250px] mb-4">
                    <div className="space-y-3">
                      {rolePlayConversation.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'agent' 
                              ? 'bg-cyan-500/20 border border-cyan-500/30' 
                              : 'bg-slate-700/50'
                          }`}>
                            <p className="text-white text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      {evaluateResponseMutation.isPending && (
                        <div className="flex justify-end">
                          <div className="p-3 bg-slate-700/50 rounded-lg">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Textarea
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      className="bg-slate-900 border-slate-700 text-white resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAgentSubmit();
                        }
                      }}
                    />
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={handleAgentSubmit}
                      disabled={!agentInput.trim() || evaluateResponseMutation.isPending}
                    >
                      إرسال
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback */}
              {rolePlayFeedback && (
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">تقييم الرد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-green-400 text-xs mb-1">نقاط القوة</p>
                        {rolePlayFeedback.strengths?.map((s, i) => (
                          <div key={i} className="flex items-center gap-1 text-sm text-slate-300">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {s}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-amber-400 text-xs mb-1">نقاط التحسين</p>
                        {rolePlayFeedback.improvements?.map((s, i) => (
                          <div key={i} className="flex items-center gap-1 text-sm text-slate-300">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{rolePlayFeedback.overall_feedback}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">سجل التدريب</CardTitle>
            </CardHeader>
            <CardContent>
              {coachingHistory.length === 0 ? (
                <p className="text-slate-400 text-center py-4">لا يوجد سجل بعد</p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {coachingHistory.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.sentiment === 'positive' ? 'bg-green-400' :
                            entry.sentiment === 'negative' ? 'bg-red-400' :
                            'bg-amber-400'
                          }`} />
                          <span className="text-slate-400 text-xs">
                            {entry.timestamp.toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-600 text-slate-300 text-[10px]">
                            {entry.suggestions} اقتراح
                          </Badge>
                          <Badge className={entry.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                            {entry.score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Settings */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.autoAnalyze}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoAnalyze: v }))}
              />
              <Label className="text-slate-400 text-xs">تحليل تلقائي</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.complianceCheck}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, complianceCheck: v }))}
              />
              <Label className="text-slate-400 text-xs">فحص الامتثال</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.soundAlerts}
                onCheckedChange={(v) => setSettings(prev => ({ ...prev, soundAlerts: v }))}
              />
              <Label className="text-slate-400 text-xs">تنبيهات صوتية</Label>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500/50 mr-auto"
              onClick={() => analyzeMutation.mutate(conversationTranscript)}
              disabled={analyzeMutation.isPending || !conversationTranscript}
            >
              {analyzeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}