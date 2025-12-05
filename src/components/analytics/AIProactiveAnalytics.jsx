import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Package, DollarSign, Wrench,
  AlertTriangle, Zap, Target, Award, Clock, RefreshCw, Brain
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// بيانات استخدام القطع
const partsUsageData = [
  { name: 'فلتر مكيف', usage: 45, trend: 'up', forecast: 52 },
  { name: 'بطارية كاميرا', usage: 28, trend: 'up', forecast: 35 },
  { name: 'زيت محرك', usage: 24, trend: 'stable', forecast: 25 },
  { name: 'حساس حركة', usage: 15, trend: 'down', forecast: 12 },
  { name: 'كابل شبكة', usage: 12, trend: 'stable', forecast: 13 },
];

// بيانات أداء الفنيين
const technicianPerformance = [
  { name: 'محمد أحمد', tasks: 45, avgTime: 1.8, rating: 4.8, efficiency: 92 },
  { name: 'خالد العلي', tasks: 38, avgTime: 2.1, rating: 4.6, efficiency: 85 },
  { name: 'فهد السعيد', tasks: 32, avgTime: 2.5, rating: 4.4, efficiency: 78 },
  { name: 'عبدالله محمد', tasks: 28, avgTime: 1.9, rating: 4.7, efficiency: 88 },
];

// بيانات تكاليف الصيانة vs الاستبدال
const costAnalysisData = [
  { device: 'مكيف سبليت', maintenanceCost: 1200, replacementCost: 3500, recommendation: 'maintain' },
  { device: 'حساس حركة', maintenanceCost: 450, replacementCost: 250, recommendation: 'replace' },
  { device: 'كاميرا IP', maintenanceCost: 800, replacementCost: 1200, recommendation: 'maintain' },
  { device: 'ضاغط مكيف', maintenanceCost: 2500, replacementCost: 2800, recommendation: 'maintain' },
];

const COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e', '#ef4444'];

export default function AIProactiveAnalytics() {
  const [activeTab, setActiveTab] = useState('parts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const analysisMutation = useMutation({
    mutationFn: async (type) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `حلل البيانات التالية وقدم رؤى استراتيجية:

نوع التحليل: ${type}

${type === 'parts' ? `
بيانات استخدام القطع:
${partsUsageData.map(p => `- ${p.name}: ${p.usage} استخدام، اتجاه: ${p.trend}`).join('\n')}
` : type === 'technicians' ? `
أداء الفنيين:
${technicianPerformance.map(t => `- ${t.name}: ${t.tasks} مهمة، متوسط الوقت: ${t.avgTime} ساعة، كفاءة: ${t.efficiency}%`).join('\n')}
` : `
تحليل التكاليف:
${costAnalysisData.map(c => `- ${c.device}: صيانة ${c.maintenanceCost} vs استبدال ${c.replacementCost}`).join('\n')}
`}

قدم:
1. أهم 3 رؤى من البيانات
2. توصيات عملية للتحسين
3. مخاطر محتملة يجب مراقبتها
4. فرص للتوفير أو التحسين`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiInsights(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast.error('فشل التحليل');
      setIsAnalyzing(false);
    }
  });

  const runAnalysis = (type) => {
    setIsAnalyzing(true);
    analysisMutation.mutate(type);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            تحليلات AI الاستباقية
          </h2>
          <p className="text-slate-400 text-sm">رؤى ذكية لتحسين العمليات</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="parts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
            <Package className="w-4 h-4 ml-2" />
            قطع الغيار
          </TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 ml-2" />
            الفنيون
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <DollarSign className="w-4 h-4 ml-2" />
            التكاليف
          </TabsTrigger>
        </TabsList>

        {/* Parts Usage Analysis */}
        <TabsContent value="parts" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">استخدام القطع (الشهر الحالي vs التوقع)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partsUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="usage" name="الاستخدام الحالي" fill="#22d3ee" />
                    <Bar dataKey="forecast" name="التوقع" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Parts */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">القطع الأكثر استهلاكاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partsUsageData.slice(0, 5).map((part, idx) => (
                    <div key={part.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                          idx === 1 ? 'bg-slate-500/20 text-slate-400' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-700 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-white text-sm">{part.name}</p>
                          <p className="text-slate-500 text-xs">
                            {part.trend === 'up' ? '↑ متزايد' : part.trend === 'down' ? '↓ متناقص' : '→ مستقر'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-cyan-400 font-bold">{part.usage}</p>
                        <p className="text-slate-500 text-xs">استخدام</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => runAnalysis('parts')}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحليل AI متقدم
          </Button>
        </TabsContent>

        {/* Technician Performance */}
        <TabsContent value="technicians" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">مقارنة أداء الفنيين</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={technicianPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Bar dataKey="efficiency" name="الكفاءة %" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Technician Cards */}
            <div className="space-y-3">
              {technicianPerformance.map((tech) => (
                <Card key={tech.name} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">{tech.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{tech.tasks} مهمة</span>
                          <span>⏱ {tech.avgTime} ساعة</span>
                          <span>⭐ {tech.rating}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`text-2xl font-bold ${
                          tech.efficiency >= 90 ? 'text-green-400' :
                          tech.efficiency >= 80 ? 'text-cyan-400' :
                          'text-amber-400'
                        }`}>{tech.efficiency}%</p>
                        <p className="text-slate-500 text-xs">كفاءة</p>
                      </div>
                    </div>
                    <Progress value={tech.efficiency} className="h-1.5 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => runAnalysis('technicians')}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحليل AI لفرص التحسين
          </Button>
        </TabsContent>

        {/* Cost Analysis */}
        <TabsContent value="costs" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Cost Comparison Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">الصيانة vs الاستبدال</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="device" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="maintenanceCost" name="تكلفة الصيانة" fill="#22d3ee" />
                    <Bar dataKey="replacementCost" name="تكلفة الاستبدال" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">توصيات اقتصادية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costAnalysisData.map((item) => (
                    <div key={item.device} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.device}</span>
                        <Badge className={
                          item.recommendation === 'maintain' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }>
                          {item.recommendation === 'maintain' ? 'صيانة' : 'استبدال'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">صيانة: {item.maintenanceCost} ر.س</span>
                        <span className="text-slate-400">استبدال: {item.replacementCost} ر.س</span>
                      </div>
                      <p className="text-cyan-400 text-xs mt-1">
                        توفير: {Math.abs(item.maintenanceCost - item.replacementCost)} ر.س
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => runAnalysis('costs')}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
            تحليل AI للاستراتيجية الأمثل
          </Button>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-300 text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                رؤى AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{aiInsights.summary}</p>
              
              {aiInsights.insights?.length > 0 && (
                <div>
                  <h4 className="text-white text-xs font-medium mb-2">الرؤى الرئيسية:</h4>
                  <ul className="space-y-1">
                    {aiInsights.insights.map((insight, i) => (
                      <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                        <Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsights.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-white text-xs font-medium mb-2">التوصيات:</h4>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.map((rec, i) => (
                      <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                        <Target className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}