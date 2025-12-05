import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, MessageSquare, AlertTriangle, CheckCircle, Lightbulb, TrendingUp,
  TrendingDown, Volume2, VolumeX, Zap, Target, Heart, Frown, Meh, Smile,
  ThumbsUp, ThumbsDown, Clock, Loader2, RefreshCw, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const sentimentEmojis = {
  positive: { icon: Smile, color: 'green', label: 'إيجابي' },
  negative: { icon: Frown, color: 'red', label: 'سلبي' },
  neutral: { icon: Meh, color: 'amber', label: 'محايد' },
};

export default function RealtimeAgentCoaching({ 
  isCallActive, 
  conversationTranscript, 
  customerData,
  onSuggestionApplied 
}) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  const [sentimentScore, setSentimentScore] = useState(50);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [coachingHistory, setCoachingHistory] = useState([]);
  const [settings, setSettings] = useState({
    autoAnalyze: true,
    showAlerts: true,
    soundAlerts: false,
    sensitivityLevel: 'medium',
  });
  const analysisIntervalRef = useRef(null);

  // Real-time sentiment analysis
  const analyzeSentimentMutation = useMutation({
    mutationFn: async (transcript) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل المشاعر والسياق في الوقت الفعلي لهذه المحادثة مع العميل:

المحادثة:
${transcript}

معلومات العميل:
${JSON.stringify(customerData, null, 2)}

قدم:
1. المشاعر الحالية (positive/negative/neutral)
2. درجة المشاعر (0-100)
3. إشارات التحذير إن وجدت
4. اقتراحات فورية للوكيل
5. نقاط القوة في أداء الوكيل
6. مجالات التحسين الفوري`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            sentiment_score: { type: "number" },
            sentiment_trend: { type: "string" },
            warning_signals: { type: "array", items: { type: "string" } },
            immediate_suggestions: {
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
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommended_response: { type: "string" },
            escalation_needed: { type: "boolean" },
            customer_intent: { type: "string" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setCurrentSentiment(data.sentiment || 'neutral');
      setSentimentScore(data.sentiment_score || 50);
      setSuggestions(data.immediate_suggestions || []);

      // Add warnings as alerts
      if (data.warning_signals?.length > 0) {
        const newAlerts = data.warning_signals.map((signal, i) => ({
          id: Date.now() + i,
          message: signal,
          type: 'warning',
          timestamp: new Date()
        }));
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));

        if (settings.soundAlerts && settings.showAlerts) {
          // Play alert sound
          toast.warning(data.warning_signals[0]);
        }
      }

      // Add to coaching history
      setCoachingHistory(prev => [{
        timestamp: new Date(),
        sentiment: data.sentiment,
        score: data.sentiment_score,
        suggestions: data.immediate_suggestions?.length || 0
      }, ...prev].slice(0, 20));

      // Check for escalation
      if (data.escalation_needed) {
        toast.error('⚠️ يُوصى بتصعيد هذه المكالمة');
      }
    }
  });

  // Auto-analyze when call is active
  useEffect(() => {
    if (isCallActive && isEnabled && settings.autoAnalyze && conversationTranscript) {
      // Initial analysis
      analyzeSentimentMutation.mutate(conversationTranscript);

      // Set up interval for continuous analysis
      analysisIntervalRef.current = setInterval(() => {
        if (conversationTranscript) {
          analyzeSentimentMutation.mutate(conversationTranscript);
        }
      }, 15000); // Every 15 seconds
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isCallActive, isEnabled, settings.autoAnalyze, conversationTranscript]);

  const applySuggestion = (suggestion) => {
    onSuggestionApplied?.(suggestion);
    toast.success('تم تطبيق الاقتراح');
  };

  const getSentimentIcon = () => {
    const config = sentimentEmojis[currentSentiment] || sentimentEmojis.neutral;
    return config;
  };

  const sentimentConfig = getSentimentIcon();

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={analyzeSentimentMutation.isPending ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: analyzeSentimentMutation.isPending ? Infinity : 0 }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">التدريب في الوقت الفعلي</h4>
            <p className="text-slate-400 text-xs">تحليل مستمر • اقتراحات فورية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCallActive && (
            <Badge className="bg-green-500/20 text-green-400 animate-pulse">
              <span className="w-2 h-2 bg-green-400 rounded-full ml-1"></span>
              مكالمة نشطة
            </Badge>
          )}
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {!isEnabled ? (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <EyeOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">التدريب في الوقت الفعلي معطل</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
              <div className="relative">
                <Progress value={sentimentScore} className="h-4" />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>سلبي</span>
                  <span>محايد</span>
                  <span>إيجابي</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-white">{sentimentScore}</span>
                <span className="text-slate-400">/100</span>
                {sentimentScore > 50 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : sentimentScore < 50 ? (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Suggestions */}
          {suggestions.length > 0 && (
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  اقتراحات فورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {suggestions.map((suggestion, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 rounded-lg border ${
                            suggestion.priority === 'high' 
                              ? 'bg-red-500/10 border-red-500/30' 
                              : suggestion.priority === 'medium'
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-slate-900/50 border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={
                                  suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  suggestion.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-slate-600 text-slate-400'
                                }>
                                  {suggestion.type}
                                </Badge>
                              </div>
                              <p className="text-white text-sm">{suggestion.message}</p>
                              {suggestion.action && (
                                <p className="text-cyan-400 text-xs mt-1">💡 {suggestion.action}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              <Zap className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {settings.showAlerts && alerts.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  تنبيهات
                  <Badge className="bg-red-500/20 text-red-400">{alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-1">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded text-sm">
                        <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-slate-300 flex-1">{alert.message}</span>
                        <span className="text-slate-500 text-xs">
                          {alert.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <MessageSquare className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{suggestions.length}</p>
                <p className="text-slate-400 text-xs">اقتراح نشط</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{alerts.length}</p>
                <p className="text-slate-400 text-xs">تنبيه</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{coachingHistory.length}</p>
                <p className="text-slate-400 text-xs">تحليل</p>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إعدادات التدريب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300 text-xs">تحليل تلقائي</Label>
                  <Switch
                    checked={settings.autoAnalyze}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoAnalyze: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300 text-xs">إظهار التنبيهات</Label>
                  <Switch
                    checked={settings.showAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, showAlerts: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300 text-xs">تنبيهات صوتية</Label>
                  <Switch
                    checked={settings.soundAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, soundAlerts: v }))}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-500/50"
                  onClick={() => analyzeSentimentMutation.mutate(conversationTranscript)}
                  disabled={analyzeSentimentMutation.isPending || !conversationTranscript}
                >
                  {analyzeSentimentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><RefreshCw className="w-4 h-4 ml-1" /> تحليل الآن</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}