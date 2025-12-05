import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mic, MicOff, Volume2, Brain, Activity, AlertTriangle, Smile, Frown, Meh,
  Zap, Shield, Globe, TrendingUp, TrendingDown, Clock, User, ThumbsUp,
  ThumbsDown, AlertCircle, Loader2, Play, Pause, RotateCw, Languages,
  Gauge, Heart, Angry, Laugh, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Emotion Configuration
const emotions = {
  angry: { icon: Angry, color: 'red', label: 'غاضب', labelEn: 'Angry' },
  frustrated: { icon: Frown, color: 'orange', label: 'محبط', labelEn: 'Frustrated' },
  neutral: { icon: Meh, color: 'slate', label: 'محايد', labelEn: 'Neutral' },
  satisfied: { icon: Smile, color: 'green', label: 'راضٍ', labelEn: 'Satisfied' },
  happy: { icon: Laugh, color: 'emerald', label: 'سعيد', labelEn: 'Happy' },
  confused: { icon: AlertCircle, color: 'amber', label: 'مرتبك', labelEn: 'Confused' },
  threatening: { icon: AlertTriangle, color: 'red', label: 'تهديد', labelEn: 'Threatening' },
  sarcastic: { icon: Eye, color: 'purple', label: 'ساخر', labelEn: 'Sarcastic' },
};

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function VoiceAIEngine({ callData, isActive = false, onAnalysisUpdate }) {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [threatLevel, setThreatLevel] = useState(0);
  const [stressLevel, setStressLevel] = useState(30);
  const [respectLevel, setRespectLevel] = useState(85);
  const [sarcasmDetected, setSarcasmDetected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({
    volume: 45,
    pitch: 50,
    speechRate: 120,
    silenceRatio: 15,
  });

  // Simulate real-time voice analysis
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate changing metrics
      setLiveMetrics(prev => ({
        volume: Math.max(20, Math.min(100, prev.volume + (Math.random() - 0.5) * 20)),
        pitch: Math.max(30, Math.min(90, prev.pitch + (Math.random() - 0.5) * 15)),
        speechRate: Math.max(80, Math.min(180, prev.speechRate + (Math.random() - 0.5) * 30)),
        silenceRatio: Math.max(5, Math.min(40, prev.silenceRatio + (Math.random() - 0.5) * 10)),
      }));

      // Simulate stress fluctuation
      setStressLevel(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 15)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // AI Analysis Mutation
  const voiceAnalysisMutation = useMutation({
    mutationFn: async (audioData) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `تحليل صوتي متقدم للمكالمة:
        
النص: "${audioData.transcript}"
المدة: ${audioData.duration} ثانية
القناة: مكالمة هاتفية

قم بتحليل:
1. اللغة واللهجة المستخدمة
2. المشاعر السائدة (غضب، رضا، إحباط، حياد)
3. نبرة الصوت ومستوى التوتر
4. كشف أي تهديدات أو لغة غير لائقة
5. كشف السخرية والاستهزاء
6. تحديد نية العميل الحقيقية
7. اقتراحات للرد المناسب`,
        response_json_schema: {
          type: "object",
          properties: {
            detected_language: { type: "string" },
            dialect: { type: "string" },
            primary_emotion: { type: "string" },
            emotion_score: { type: "number" },
            stress_level: { type: "number" },
            threat_detected: { type: "boolean" },
            threat_type: { type: "string" },
            sarcasm_detected: { type: "boolean" },
            respect_level: { type: "number" },
            customer_intent: { type: "string" },
            urgency: { type: "string" },
            suggested_tone: { type: "string" },
            suggested_response: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setCurrentEmotion(data.primary_emotion || 'neutral');
      setThreatLevel(data.threat_detected ? 80 : 10);
      setStressLevel(data.stress_level || 30);
      setRespectLevel(data.respect_level || 85);
      setSarcasmDetected(data.sarcasm_detected || false);
      
      if (data.detected_language) {
        const lang = languages.find(l => l.code === data.detected_language);
        setDetectedLanguage(lang || { code: data.detected_language, name: data.detected_language, flag: '🌐' });
      }

      // Add to timeline
      setEmotionTimeline(prev => [...prev, {
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        emotion: data.primary_emotion,
        stress: data.stress_level,
      }]);

      // Add alerts for threats
      if (data.threat_detected) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'threat',
          message: `تهديد مكتشف: ${data.threat_type}`,
          severity: 'critical',
          time: new Date().toLocaleTimeString('ar-SA'),
        }]);
        toast.error('⚠️ تم كشف تهديد في المكالمة!');
      }

      if (data.sarcasm_detected) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'sarcasm',
          message: 'العميل يستخدم لهجة سخرية',
          severity: 'warning',
          time: new Date().toLocaleTimeString('ar-SA'),
        }]);
      }

      if (data.red_flags?.length > 0) {
        data.red_flags.forEach(flag => {
          setAlerts(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: 'flag',
            message: flag,
            severity: 'warning',
            time: new Date().toLocaleTimeString('ar-SA'),
          }]);
        });
      }

      onAnalysisUpdate?.(data);
    },
  });

  const EmotionIcon = emotions[currentEmotion]?.icon || Meh;
  const emotionConfig = emotions[currentEmotion] || emotions.neutral;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isActive ? 'bg-green-500/20 animate-pulse' : 'bg-slate-800/50'}`}>
            <Mic className={`w-6 h-6 ${isActive ? 'text-green-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">محرك الصوت الذكي</h3>
            <p className="text-slate-400 text-sm">Voice AI Engine • ASR • Emotion • Tone</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {detectedLanguage && (
            <Badge className="bg-purple-500/20 text-purple-400">
              {detectedLanguage.flag} {detectedLanguage.name}
            </Badge>
          )}
          <Badge className={isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
            {isActive ? '🔴 مباشر' : '⏸️ متوقف'}
          </Badge>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Current Emotion */}
        <Card className={`bg-${emotionConfig.color}-500/10 border-${emotionConfig.color}-500/30`}>
          <CardContent className="p-4 text-center">
            <EmotionIcon className={`w-8 h-8 text-${emotionConfig.color}-400 mx-auto mb-2`} />
            <p className="text-white font-bold">{emotionConfig.label}</p>
            <p className="text-slate-400 text-xs">المشاعر الحالية</p>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">{stressLevel.toFixed(0)}%</span>
            </div>
            <Progress value={stressLevel} className="h-2 mb-1" />
            <p className="text-slate-400 text-xs">مستوى التوتر</p>
          </CardContent>
        </Card>

        {/* Respect Level */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-white font-bold">{respectLevel}%</span>
            </div>
            <Progress value={respectLevel} className="h-2 mb-1" />
            <p className="text-slate-400 text-xs">مستوى الاحترام</p>
          </CardContent>
        </Card>

        {/* Threat Level */}
        <Card className={`${threatLevel > 50 ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-slate-800/30 border-slate-700/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className={`w-5 h-5 ${threatLevel > 50 ? 'text-red-400' : 'text-green-400'}`} />
              <span className={`font-bold ${threatLevel > 50 ? 'text-red-400' : 'text-white'}`}>{threatLevel}%</span>
            </div>
            <Progress value={threatLevel} className="h-2 mb-1" />
            <p className="text-slate-400 text-xs">مستوى التهديد</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Waveform & Real-time Analysis */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Voice Metrics */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              مقاييس الصوت الحية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">حجم الصوت</span>
                <span className="text-cyan-400">{liveMetrics.volume.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  animate={{ width: `${liveMetrics.volume}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">طبقة الصوت (Pitch)</span>
                <span className="text-purple-400">{liveMetrics.pitch.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{ width: `${liveMetrics.pitch}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">سرعة الكلام</span>
                <span className="text-green-400">{liveMetrics.speechRate.toFixed(0)} ك/د</span>
              </div>
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  animate={{ width: `${(liveMetrics.speechRate / 200) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">نسبة الصمت</span>
                <span className="text-amber-400">{liveMetrics.silenceRatio.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  animate={{ width: `${liveMetrics.silenceRatio}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Red Flags */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              التنبيهات والأعلام الحمراء
              {alerts.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400">{alerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[160px]">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد تنبيهات</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-lg flex items-start gap-2 ${
                        alert.severity === 'critical' ? 'bg-red-500/20 border border-red-500/30' :
                        alert.severity === 'warning' ? 'bg-amber-500/20 border border-amber-500/30' :
                        'bg-slate-700/50'
                      }`}
                    >
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{alert.message}</p>
                        <p className="text-slate-500 text-xs">{alert.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Timeline */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            الخط الزمني للمشاعر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {emotionTimeline.length === 0 ? (
              <div className="text-slate-500 text-sm py-4 text-center w-full">
                سيظهر الخط الزمني للمشاعر هنا أثناء المكالمة
              </div>
            ) : (
              emotionTimeline.map((entry, i) => {
                const emo = emotions[entry.emotion] || emotions.neutral;
                const EmoIcon = emo.icon;
                return (
                  <div key={i} className="flex-shrink-0 text-center">
                    <div className={`w-10 h-10 rounded-full bg-${emo.color}-500/20 flex items-center justify-center mb-1`}>
                      <EmoIcon className={`w-5 h-5 text-${emo.color}-400`} />
                    </div>
                    <p className="text-slate-500 text-[10px]">{entry.time}</p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Badges */}
      <div className="flex flex-wrap gap-2">
        {sarcasmDetected && (
          <Badge className="bg-purple-500/20 text-purple-400 animate-pulse">
            <Eye className="w-3 h-3 ml-1" />
            سخرية مكتشفة
          </Badge>
        )}
        {threatLevel > 50 && (
          <Badge className="bg-red-500/20 text-red-400 animate-pulse">
            <AlertTriangle className="w-3 h-3 ml-1" />
            تهديد مكتشف
          </Badge>
        )}
        {stressLevel > 70 && (
          <Badge className="bg-orange-500/20 text-orange-400 animate-pulse">
            <Activity className="w-3 h-3 ml-1" />
            توتر عالي
          </Badge>
        )}
        {respectLevel < 40 && (
          <Badge className="bg-red-500/20 text-red-400 animate-pulse">
            <ThumbsDown className="w-3 h-3 ml-1" />
            لغة غير لائقة
          </Badge>
        )}
      </div>
    </div>
  );
}