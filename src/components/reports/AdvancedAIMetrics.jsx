import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Brain, TrendingUp, TrendingDown, Activity, AlertTriangle, Target,
  RefreshCw, Zap, LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';

const accuracyTrendData = [
  { date: 'يناير', anomaly: 92.1, prediction: 88.5, recognition: 94.2 },
  { date: 'فبراير', anomaly: 93.4, prediction: 89.2, recognition: 95.1 },
  { date: 'مارس', anomaly: 91.8, prediction: 90.1, recognition: 94.8 },
  { date: 'أبريل', anomaly: 94.5, prediction: 91.3, recognition: 96.2 },
  { date: 'مايو', anomaly: 95.2, prediction: 92.0, recognition: 96.8 },
  { date: 'يونيو', anomaly: 94.8, prediction: 93.5, recognition: 97.1 },
];

const predictionDriftData = [
  { week: 'الأسبوع 1', drift: 0.8, threshold: 5 },
  { week: 'الأسبوع 2', drift: 1.2, threshold: 5 },
  { week: 'الأسبوع 3', drift: 2.1, threshold: 5 },
  { week: 'الأسبوع 4', drift: 1.8, threshold: 5 },
  { week: 'الأسبوع 5', drift: 3.2, threshold: 5 },
  { week: 'الأسبوع 6', drift: 2.5, threshold: 5 },
];

const modelMetrics = [
  { name: 'كشف الشذوذ', accuracy: 94.8, precision: 92.3, recall: 96.1, f1: 94.2, requests: 15420, latency: 45 },
  { name: 'الصيانة التنبؤية', accuracy: 93.5, precision: 91.8, recall: 94.2, f1: 93.0, requests: 8930, latency: 120 },
  { name: 'تحسين المسارات', accuracy: 91.2, precision: 89.5, recall: 92.8, f1: 91.1, requests: 12340, latency: 85 },
  { name: 'التعرف على النفايات', accuracy: 97.1, precision: 96.5, recall: 97.8, f1: 97.1, requests: 5670, latency: 65 },
];

export default function AdvancedAIMetrics() {
  const [selectedModel, setSelectedModel] = useState(null);

  const analyzeModelHealth = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل أداء نماذج الذكاء الاصطناعي، قم بتحليل المقاييس التالية:

النماذج المستخدمة:
${modelMetrics.map(m => `- ${m.name}: دقة ${m.accuracy}%، استدعاء ${m.recall}%، ${m.requests} طلب، تأخير ${m.latency}ms`).join('\n')}

بيانات انحراف التنبؤ:
${predictionDriftData.map(d => `- ${d.week}: انحراف ${d.drift}%`).join('\n')}

قدم:
1. تقييم شامل لصحة كل نموذج
2. تحديد النماذج التي تحتاج إعادة تدريب
3. توصيات لتحسين الأداء
4. تنبيهات للمشاكل المحتملة`,
        response_json_schema: {
          type: "object",
          properties: {
            overallHealth: { type: "string" },
            healthScore: { type: "number" },
            modelAssessments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  model: { type: "string" },
                  status: { type: "string" },
                  score: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            retrainingNeeded: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: () => toast.success('تم تحليل صحة النماذج')
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          تحليل أداء نماذج AI المتقدم
        </h3>
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => analyzeModelHealth.mutate()}
          disabled={analyzeModelHealth.isPending}
        >
          {analyzeModelHealth.isPending ? <RefreshCw className="w-4 h-4 ml-1 animate-spin" /> : <Zap className="w-4 h-4 ml-1" />}
          تحليل الصحة
        </Button>
      </div>

      {/* Model Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {modelMetrics.map(model => (
          <Card 
            key={model.name} 
            className={`glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer transition-all ${selectedModel === model.name ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setSelectedModel(selectedModel === model.name ? null : model.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium text-sm">{model.name}</span>
                <Badge className={model.accuracy >= 95 ? 'bg-green-500/20 text-green-400' : model.accuracy >= 90 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}>
                  {model.accuracy}%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">الدقة</span>
                  <span className="text-white">{model.precision}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">الاستدعاء</span>
                  <span className="text-white">{model.recall}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">التأخير</span>
                  <span className="text-cyan-400">{model.latency}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Accuracy Trends */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              اتجاه الدقة بمرور الوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[85, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="anomaly" stroke="#a855f7" strokeWidth={2} name="كشف الشذوذ" />
                  <Line type="monotone" dataKey="prediction" stroke="#22d3ee" strokeWidth={2} name="التنبؤ" />
                  <Line type="monotone" dataKey="recognition" stroke="#22c55e" strokeWidth={2} name="التعرف" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Drift */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              انحراف التنبؤ (Prediction Drift)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionDriftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="threshold" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="الحد الأقصى" />
                  <Area type="monotone" dataKey="drift" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="الانحراف" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Results */}
      {analyzeModelHealth.data && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">نتائج تحليل الصحة</CardTitle>
              <Badge className={analyzeModelHealth.data.healthScore >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                {analyzeModelHealth.data.healthScore}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm mb-3">{analyzeModelHealth.data.overallHealth}</p>
            {analyzeModelHealth.data.alerts?.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
                <p className="text-red-400 text-xs font-medium mb-1">تنبيهات</p>
                {analyzeModelHealth.data.alerts.map((alert, i) => (
                  <p key={i} className="text-white text-xs">• {alert}</p>
                ))}
              </div>
            )}
            {analyzeModelHealth.data.improvements?.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs font-medium mb-1">توصيات التحسين</p>
                {analyzeModelHealth.data.improvements.slice(0, 3).map((imp, i) => (
                  <p key={i} className="text-white text-xs">• {imp}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}