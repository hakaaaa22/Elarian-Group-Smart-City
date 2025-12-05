import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Calendar, TrendingUp, TrendingDown, AlertTriangle, Sparkles,
  Download, Clock, BarChart3, Loader2, Settings, Plus, Bell, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

const trendData = [
  { day: 'السبت', detections: 1200, accuracy: 94.2 },
  { day: 'الأحد', detections: 1450, accuracy: 94.8 },
  { day: 'الإثنين', detections: 1800, accuracy: 95.1 },
  { day: 'الثلاثاء', detections: 1650, accuracy: 94.5 },
  { day: 'الأربعاء', detections: 2100, accuracy: 95.8 },
  { day: 'الخميس', detections: 1900, accuracy: 95.2 },
  { day: 'الجمعة', detections: 1350, accuracy: 94.9 },
];

export default function AIVisionReporting() {
  const [showScheduler, setShowScheduler] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    frequency: 'daily',
    metrics: ['detections', 'accuracy'],
    recipients: '',
    time: '08:00'
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  const queryClient = useQueryClient();

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['vision-reports'],
    queryFn: () => base44.entities.ScheduledReport.filter({ report_type: 'ai_vision' }, '-created_date', 10),
  });

  // Generate AI Report
  const generateReportMutation = useMutation({
    mutationFn: async (period) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ تقرير AI Vision شامل للفترة: ${period}

البيانات:
- إجمالي الكشوفات: 12,450
- متوسط الدقة: 94.8%
- النماذج النشطة: 85
- التنبيهات: 23

قدم:
1. ملخص تنفيذي
2. أهم الاتجاهات والأنماط
3. الشذوذات المكتشفة
4. تنبؤات للفترة القادمة
5. توصيات قابلة للتنفيذ`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  change: { type: "number" },
                  trend: { type: "string" }
                }
              }
            },
            trends: { type: "array", items: { type: "string" } },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                next_period_detections: { type: "number" },
                accuracy_forecast: { type: "number" },
                risk_level: { type: "string" },
                confidence: { type: "number" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast.success('تم إنشاء التقرير');
    }
  });

  const scheduleReport = async () => {
    await base44.entities.ScheduledReport.create({
      name: reportConfig.name,
      report_type: 'ai_vision',
      schedule: reportConfig.frequency,
      schedule_time: reportConfig.time,
      recipients: reportConfig.recipients?.split(',').map(e => e.trim()),
      filters: { metrics: reportConfig.metrics },
      is_active: true
    });
    queryClient.invalidateQueries({ queryKey: ['vision-reports'] });
    toast.success('تم جدولة التقرير');
    setShowScheduler(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">التقارير الذكية</h4>
            <p className="text-slate-400 text-xs">تقارير تلقائية • تنبؤات • رؤى</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 h-8" onClick={() => setShowScheduler(true)}>
            <Plus className="w-3 h-3 ml-1" />
            جدولة
          </Button>
          <Select defaultValue="daily" onValueChange={(v) => generateReportMutation.mutate(v)}>
            <SelectTrigger className="w-32 h-8 bg-blue-600 border-0 text-white">
              <SelectValue placeholder="إنشاء تقرير" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'كشوفات اليوم', value: '2,450', change: 12, color: 'cyan' },
          { label: 'متوسط الدقة', value: '95.2%', change: 1.2, color: 'green' },
          { label: 'تنبيهات', value: '8', change: -25, color: 'amber' },
          { label: 'نماذج نشطة', value: '85', change: 3, color: 'purple' },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">{stat.label}</p>
                <span className={`text-xs flex items-center ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">اتجاه الأسبوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
                <Area type="monotone" dataKey="detections" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {generateReportMutation.isPending && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-slate-300">جاري إنشاء التقرير...</p>
          </CardContent>
        </Card>
      )}

      {generatedReport && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                التقرير المُنشأ
              </CardTitle>
              <Button size="sm" variant="outline" className="border-blue-500/50 h-7">
                <Download className="w-3 h-3 ml-1" />
                تحميل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-sm">{generatedReport.executive_summary}</p>

            {/* Predictions */}
            {generatedReport.predictions && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h5 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  التنبؤات
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-slate-400 text-xs">كشوفات متوقعة</p>
                    <p className="text-white font-bold">{generatedReport.predictions.next_period_detections?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">دقة متوقعة</p>
                    <p className="text-white font-bold">{generatedReport.predictions.accuracy_forecast}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">مستوى المخاطر</p>
                    <Badge className={generatedReport.predictions.risk_level === 'low' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {generatedReport.predictions.risk_level}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Anomalies */}
            {generatedReport.anomalies?.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h5 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  الشذوذات المكتشفة
                </h5>
                <div className="space-y-2">
                  {generatedReport.anomalies.slice(0, 3).map((a, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-white">{a.type}</p>
                      <p className="text-slate-400 text-xs">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {generatedReport.recommendations?.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h5 className="text-green-400 font-medium mb-2">التوصيات</h5>
                {generatedReport.recommendations.slice(0, 4).map((r, i) => (
                  <p key={i} className="text-slate-300 text-sm">✓ {r}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            التقارير المجدولة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledReports.length === 0 ? (
            <p className="text-slate-500 text-center py-4 text-sm">لا توجد تقارير مجدولة</p>
          ) : (
            <div className="space-y-2">
              {scheduledReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <div>
                    <p className="text-white text-sm">{r.name}</p>
                    <p className="text-slate-400 text-xs">{r.schedule} - {r.schedule_time}</p>
                  </div>
                  <Badge className={r.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600'}>
                    {r.is_active ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">جدولة تقرير جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اسم التقرير</Label>
              <Input
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">التكرار</Label>
                <Select value={reportConfig.frequency} onValueChange={(v) => setReportConfig({ ...reportConfig, frequency: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">الوقت</Label>
                <Input
                  type="time"
                  value={reportConfig.time}
                  onChange={(e) => setReportConfig({ ...reportConfig, time: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">المستلمون (بريد إلكتروني)</Label>
              <Input
                value={reportConfig.recipients}
                onChange={(e) => setReportConfig({ ...reportConfig, recipients: e.target.value })}
                placeholder="email@example.com"
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={scheduleReport}>
              <Calendar className="w-4 h-4 ml-2" />
              جدولة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}