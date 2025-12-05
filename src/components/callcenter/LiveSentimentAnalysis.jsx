import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, Smile, Frown, Meh, TrendingUp, TrendingDown,
  Bell, Volume2, Brain, Zap, Heart, Angry
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const sentimentEmojis = {
  very_positive: { icon: Smile, color: 'green', label: 'إيجابي جداً' },
  positive: { icon: Smile, color: 'emerald', label: 'إيجابي' },
  neutral: { icon: Meh, color: 'slate', label: 'محايد' },
  negative: { icon: Frown, color: 'amber', label: 'سلبي' },
  very_negative: { icon: Angry, color: 'red', label: 'سلبي جداً' },
};

export default function LiveSentimentAnalysis({ isCallActive, onSentimentAlert }) {
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  const [sentimentScore, setSentimentScore] = useState(50);
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [keywords, setKeywords] = useState([]);

  // Simulate real-time sentiment changes
  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      const newScore = Math.max(0, Math.min(100, sentimentScore + (Math.random() - 0.5) * 20));
      setSentimentScore(newScore);
      
      // Determine sentiment level
      let sentiment = 'neutral';
      if (newScore >= 80) sentiment = 'very_positive';
      else if (newScore >= 60) sentiment = 'positive';
      else if (newScore >= 40) sentiment = 'neutral';
      else if (newScore >= 20) sentiment = 'negative';
      else sentiment = 'very_negative';
      
      setCurrentSentiment(sentiment);
      
      // Add to history
      setSentimentHistory(prev => [...prev.slice(-20), {
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: newScore,
        sentiment
      }]);

      // Alert on negative spike
      if (newScore < 30 && sentimentScore >= 30) {
        const alert = {
          id: Date.now(),
          type: 'negative_spike',
          message: 'انخفاض حاد في مشاعر العميل!',
          time: new Date()
        };
        setAlerts(prev => [alert, ...prev.slice(0, 4)]);
        onSentimentAlert?.(alert);
        toast.warning('⚠️ تنبيه: انخفاض مشاعر العميل!');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isCallActive, sentimentScore]);

  // Simulate keyword extraction
  useEffect(() => {
    if (isCallActive) {
      setKeywords(['خدمة', 'مشكلة', 'سريع', 'شكراً', 'انتظار']);
    }
  }, [isCallActive]);

  const sentimentConfig = sentimentEmojis[currentSentiment];
  const SentimentIcon = sentimentConfig?.icon || Meh;

  return (
    <div className="space-y-3" dir="rtl">
      {/* Live Sentiment Indicator */}
      <Card className={`bg-${sentimentConfig?.color}-500/10 border-${sentimentConfig?.color}-500/30`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={isCallActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <SentimentIcon className={`w-6 h-6 text-${sentimentConfig?.color}-400`} />
              </motion.div>
              <div>
                <p className="text-white font-bold text-sm">{sentimentConfig?.label}</p>
                <p className="text-slate-400 text-xs">تحليل المشاعر الفوري</p>
              </div>
            </div>
            <div className="text-left">
              <p className={`text-2xl font-bold text-${sentimentConfig?.color}-400`}>{sentimentScore.toFixed(0)}%</p>
              {isCallActive && (
                <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">
                  <Activity className="w-2 h-2 ml-1" />
                  مباشر
                </Badge>
              )}
            </div>
          </div>
          <Progress value={sentimentScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Sentiment Timeline */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xs flex items-center gap-2">
            <Activity className="w-3 h-3 text-cyan-400" />
            الخط الزمني للمشاعر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {sentimentHistory.slice(-15).map((entry, i) => {
              const config = sentimentEmojis[entry.sentiment];
              return (
                <div
                  key={i}
                  className={`w-2 h-8 rounded-sm bg-${config?.color}-500/50`}
                  style={{ height: `${Math.max(entry.score * 0.4, 10)}px` }}
                  title={`${entry.time}: ${entry.score.toFixed(0)}%`}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium text-sm">تنبيهات المشاعر</span>
                </div>
                <div className="space-y-1">
                  {alerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="text-xs text-red-300 flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {alert.message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keywords */}
      {keywords.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <p className="text-slate-400 text-xs mb-2">الكلمات المفتاحية المستخرجة</p>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-300">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}