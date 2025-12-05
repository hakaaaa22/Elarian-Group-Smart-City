import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Brain, RefreshCw, Truck, DollarSign, TrendingDown, AlertTriangle,
  CheckCircle, Calendar, Download, BarChart3, PieChart, Clock, Wrench,
  ArrowUp, ArrowDown, Target, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

// تكاليف الصيانة السنوية المتوقعة لكل شاحنة
const annualMaintenanceCosts = [
  { truck: 'TRK-001', preventive: 8500, corrective: 4200, emergency: 2800, parts: 5500, total: 21000 },
  { truck: 'TRK-002', preventive: 6200, corrective: 1500, emergency: 0, parts: 3200, total: 10900 },
  { truck: 'TRK-003', preventive: 12000, corrective: 8500, emergency: 6500, parts: 9800, total: 36800 },
  { truck: 'TRK-004', preventive: 5800, corrective: 2100, emergency: 800, parts: 2900, total: 11600 },
];

// الأعطال المتوقعة مع التكاليف
const predictedFailures = [
  { id: 1, truck: 'TRK-003', plate: 'ز ح ط 9012', component: 'نظام الفرامل', probability: 85, estimatedCost: 4500, preventiveCost: 1200, savings: 3300, timeToFailure: '2-3 أسابيع', severity: 'critical' },
  { id: 2, truck: 'TRK-003', plate: 'ز ح ط 9012', component: 'مضخة الهيدروليك', probability: 72, estimatedCost: 6800, preventiveCost: 2500, savings: 4300, timeToFailure: '4-6 أسابيع', severity: 'high' },
  { id: 3, truck: 'TRK-001', plate: 'أ ب ج 1234', component: 'حساس حرارة المحرك', probability: 65, estimatedCost: 1800, preventiveCost: 450, savings: 1350, timeToFailure: '6-8 أسابيع', severity: 'medium' },
  { id: 4, truck: 'TRK-004', plate: 'ي ك ل 3456', component: 'البطارية', probability: 58, estimatedCost: 2200, preventiveCost: 800, savings: 1400, timeToFailure: '8-10 أسابيع', severity: 'medium' },
  { id: 5, truck: 'TRK-001', plate: 'أ ب ج 1234', component: 'فلتر الوقود', probability: 45, estimatedCost: 650, preventiveCost: 180, savings: 470, timeToFailure: '10-12 أسابيع', severity: 'low' },
];

// اتجاه تكاليف الصيانة الشهرية
const monthlyTrend = [
  { month: 'يوليو', actual: 12500, predicted: 11800, preventive: 8200 },
  { month: 'أغسطس', actual: 15200, predicted: 14500, preventive: 9100 },
  { month: 'سبتمبر', actual: 11800, predicted: 12200, preventive: 7800 },
  { month: 'أكتوبر', actual: 18500, predicted: 17800, preventive: 10500 },
  { month: 'نوفمبر', actual: 14200, predicted: 15100, preventive: 8900 },
  { month: 'ديسمبر', actual: null, predicted: 13500, preventive: 8200 },
];

// توزيع أنواع الصيانة
const maintenanceTypeDistribution = [
  { name: 'وقائية', value: 45, color: '#22c55e' },
  { name: 'تصحيحية', value: 32, color: '#f59e0b' },
  { name: 'طارئة', value: 12, color: '#ef4444' },
  { name: 'قطع غيار', value: 11, color: '#3b82f6' },
];

export default function MaintenanceReportsModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiReport, setAiReport] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const generateReport = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل تكاليف صيانة أسطول شاحنات النفايات، قم بإنشاء تقرير شامل:

بيانات التكاليف السنوية المتوقعة لكل شاحنة:
${annualMaintenanceCosts.map(t => `${t.truck}: وقائية ${t.preventive} + تصحيحية ${t.corrective} + طارئة ${t.emergency} + قطع ${t.parts} = ${t.total} ر.س`).join('\n')}

الأعطال المتوقعة:
${predictedFailures.map(f => `${f.truck} - ${f.component}: احتمالية ${f.probability}%, تكلفة العطل ${f.estimatedCost} ر.س, تكلفة الوقاية ${f.preventiveCost} ر.س`).join('\n')}

قدم:
1. ملخص تنفيذي شامل
2. تحليل التكاليف لكل شاحنة
3. توصيات الصيانة الاستباقية
4. توقعات التوفير السنوية
5. أولويات الصيانة المقترحة
6. مقارنة بين الصيانة الاستباقية والتفاعلية`,
        response_json_schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            totalAnnualCost: { type: "number" },
            totalPotentialSavings: { type: "number" },
            savingsPercentage: { type: "number" },
            truckAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  healthStatus: { type: "string" },
                  maintenancePriority: { type: "string" },
                  annualCostForecast: { type: "number" },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            proactiveRecommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  estimatedSavings: { type: "number" },
                  timeframe: { type: "string" }
                }
              }
            },
            quarterlyForecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  quarter: { type: "string" },
                  predictedCost: { type: "number" },
                  mainComponents: { type: "array", items: { type: "string" } }
                }
              }
            },
            keyInsights: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setAiReport(data);
      toast.success('تم إنشاء التقرير بنجاح');
    }
  });

  const totalAnnualCost = annualMaintenanceCosts.reduce((s, t) => s + t.total, 0);
  const totalPotentialSavings = predictedFailures.reduce((s, f) => s + f.savings, 0);
  const avgSavingsPercent = Math.round((totalPotentialSavings / totalAnnualCost) * 100);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'blue';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          تقارير الصيانة التنبؤية
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => generateReport.mutate()} disabled={generateReport.isPending}>
            {generateReport.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تقرير AI شامل
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalAnnualCost.toLocaleString()}</p>
            <p className="text-cyan-400 text-sm">التكلفة السنوية المتوقعة (ر.س)</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalPotentialSavings.toLocaleString()}</p>
            <p className="text-green-400 text-sm">التوفير المحتمل (ر.س)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{avgSavingsPercent}%</p>
            <p className="text-purple-400 text-sm">نسبة التوفير المتوقعة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{predictedFailures.filter(f => f.severity === 'critical').length}</p>
            <p className="text-amber-400 text-sm">أعطال حرجة متوقعة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trucks" className="data-[state=active]:bg-green-500/20">تكاليف الشاحنات</TabsTrigger>
          <TabsTrigger value="failures" className="data-[state=active]:bg-amber-500/20">الأعطال المتوقعة</TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-purple-500/20">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Annual Costs Chart */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  التكاليف السنوية المتوقعة لكل شاحنة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualMaintenanceCosts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="truck" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="preventive" stackId="a" fill="#22c55e" name="وقائية" />
                      <Bar dataKey="corrective" stackId="a" fill="#f59e0b" name="تصحيحية" />
                      <Bar dataKey="emergency" stackId="a" fill="#ef4444" name="طارئة" />
                      <Bar dataKey="parts" stackId="a" fill="#3b82f6" name="قطع غيار" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Type Distribution */}
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  توزيع أنواع الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={maintenanceTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {maintenanceTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">اتجاه تكاليف الصيانة الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} name="الفعلي" connectNulls />
                    <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="المتوقع" />
                    <Line type="monotone" dataKey="preventive" stroke="#22c55e" strokeWidth={2} name="الوقائية فقط" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trucks" className="mt-4">
          <div className="space-y-3">
            {annualMaintenanceCosts.map(truck => (
              <Card key={truck.truck} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-8 h-8 text-cyan-400" />
                      <div>
                        <p className="text-white font-bold">{truck.truck}</p>
                        <p className="text-slate-400 text-sm">التكلفة السنوية الإجمالية</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-white">{truck.total.toLocaleString()} ر.س</p>
                      <Badge className={truck.emergency > 3000 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                        {truck.emergency > 3000 ? 'عالي المخاطر' : 'مستقر'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg text-center">
                      <p className="text-green-400 font-bold">{truck.preventive.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">وقائية</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                      <p className="text-amber-400 font-bold">{truck.corrective.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">تصحيحية</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg text-center">
                      <p className="text-red-400 font-bold">{truck.emergency.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">طارئة</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                      <p className="text-blue-400 font-bold">{truck.parts.toLocaleString()}</p>
                      <p className="text-slate-500 text-xs">قطع غيار</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="failures" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {predictedFailures.map(failure => (
                <Card key={failure.id} className={`border-${getSeverityColor(failure.severity)}-500/30 bg-${getSeverityColor(failure.severity)}-500/5`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-6 h-6 text-${getSeverityColor(failure.severity)}-400`} />
                        <div>
                          <p className="text-white font-bold">{failure.component}</p>
                          <p className="text-slate-400 text-sm">{failure.plate} - {failure.truck}</p>
                        </div>
                      </div>
                      <Badge className={`bg-${getSeverityColor(failure.severity)}-500/20 text-${getSeverityColor(failure.severity)}-400`}>
                        احتمالية {failure.probability}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-red-400 font-bold">{failure.estimatedCost.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">تكلفة العطل (ر.س)</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-green-400 font-bold">{failure.preventiveCost.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">تكلفة الوقاية (ر.س)</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-cyan-400 font-bold">{failure.savings.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">التوفير (ر.س)</p>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded text-center">
                        <p className="text-purple-400 font-bold">{failure.timeToFailure}</p>
                        <p className="text-slate-500 text-xs">الوقت المتوقع</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Progress value={failure.probability} className="flex-1 h-2 ml-4" />
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Wrench className="w-3 h-3 ml-1" />
                        جدولة صيانة وقائية
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          {aiReport ? (
            <div className="space-y-4">
              {/* Executive Summary */}
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">الملخص التنفيذي</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{aiReport.executiveSummary}</p>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-cyan-400">{aiReport.totalAnnualCost?.toLocaleString() || totalAnnualCost.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs">التكلفة السنوية (ر.س)</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-400">{aiReport.totalPotentialSavings?.toLocaleString() || totalPotentialSavings.toLocaleString()}</p>
                      <p className="text-slate-400 text-xs">التوفير المتوقع (ر.س)</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400">{aiReport.savingsPercentage || avgSavingsPercent}%</p>
                      <p className="text-slate-400 text-xs">نسبة التوفير</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proactive Recommendations */}
              {aiReport.proactiveRecommendations?.length > 0 && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      توصيات الصيانة الاستباقية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiReport.proactiveRecommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{rec.action}</p>
                            <p className="text-slate-400 text-sm">{rec.timeframe}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={rec.priority === 'عاجل' || rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600'}>
                              {rec.priority}
                            </Badge>
                            <span className="text-green-400 font-bold">{rec.estimatedSavings?.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              {aiReport.keyInsights?.length > 0 && (
                <Card className="bg-cyan-500/10 border-cyan-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      رؤى رئيسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiReport.keyInsights.map((insight, i) => (
                        <li key={i} className="text-white text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اضغط "تقرير AI شامل" لإنشاء التوصيات</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}