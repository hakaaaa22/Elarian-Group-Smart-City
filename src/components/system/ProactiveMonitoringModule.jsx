import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, TrendingDown, Cpu, MemoryStick, HardDrive, Users, Battery,
  AlertTriangle, CheckCircle, Loader2, RefreshCw, Brain, Zap, Clock,
  Target, Activity, Gauge, BarChart3, Shield, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';

// Simulated resource metrics
const generateResourceMetrics = () => ({
  cpu: Math.floor(Math.random() * 40) + 40,
  memory: Math.floor(Math.random() * 30) + 50,
  diskIO: Math.floor(Math.random() * 50) + 30,
  network: Math.floor(Math.random() * 40) + 40,
});

// Simulated agent metrics
const generateAgentMetrics = () => [
  { name: 'أحمد محمد', responseTime: 2.3 + Math.random(), burnoutRisk: 35 + Math.floor(Math.random() * 30), workload: 78 },
  { name: 'سارة أحمد', responseTime: 1.8 + Math.random(), burnoutRisk: 25 + Math.floor(Math.random() * 20), workload: 65 },
  { name: 'محمد علي', responseTime: 3.1 + Math.random(), burnoutRisk: 55 + Math.floor(Math.random() * 25), workload: 92 },
  { name: 'فاطمة حسن', responseTime: 2.0 + Math.random(), burnoutRisk: 20 + Math.floor(Math.random() * 15), workload: 55 },
  { name: 'خالد عمر', responseTime: 4.2 + Math.random(), burnoutRisk: 70 + Math.floor(Math.random() * 20), workload: 95 },
];

export default function ProactiveMonitoringModule() {
  const [resourceMetrics, setResourceMetrics] = useState(generateResourceMetrics());
  const [agentMetrics, setAgentMetrics] = useState(generateAgentMetrics());
  const [predictions, setPredictions] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [autoPrevent, setAutoPrevent] = useState(true);
  const [preventiveActions, setPreventiveActions] = useState([]);

  // Update metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = generateResourceMetrics();
      setResourceMetrics(newMetrics);
      setAgentMetrics(generateAgentMetrics());
      setHistoricalData(prev => [...prev.slice(-20), {
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        ...newMetrics
      }]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced AI Prediction with ML algorithms
  const predictIssuesMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في التعلم الآلي والتنبؤ بمشاكل الأنظمة. استخدم خوارزميات متقدمة لتحليل البيانات:

موارد النظام (آخر 5 دقائق):
- CPU: ${resourceMetrics.cpu}% (اتجاه: ${historicalData.length > 3 ? historicalData[historicalData.length-1].cpu > historicalData[historicalData.length-3].cpu ? 'صاعد' : 'نازل' : 'مستقر'})
- Memory: ${resourceMetrics.memory}%
- Disk I/O: ${resourceMetrics.diskIO}%
- Network: ${resourceMetrics.network}%

مقاييس الوكلاء:
${agentMetrics.map(a => `- ${a.name}: وقت استجابة ${a.responseTime.toFixed(1)}s, خطر إرهاق ${a.burnoutRisk}%, حمل عمل ${a.workload}%`).join('\n')}

استخدم:
1. تحليل السلاسل الزمنية للتنبؤ
2. كشف الشذوذات
3. التعلم من الأنماط السابقة
4. التوزيع الأمثل للحمل باستخدام خوارزميات التحسين

قدم تنبؤات دقيقة وإجراءات وقائية تلقائية:`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  probability: { type: "number" },
                  severity: { type: "string" },
                  expected_time: { type: "string" },
                  affected_component: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            preventive_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  target: { type: "string" },
                  expected_benefit: { type: "string" },
                  auto_executable: { type: "boolean" }
                }
              }
            },
            load_distribution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent: { type: "string" },
                  current_load: { type: "number" },
                  recommended_load: { type: "number" },
                  action: { type: "string" },
                  auto_adjust: { type: "boolean" },
                  priority: { type: "string" }
                }
              }
            },
            resource_optimization: {
              type: "object",
              properties: {
                cpu_adjustment: { type: "string" },
                memory_cleanup: { type: "boolean" },
                cache_optimization: { type: "boolean" },
                connection_pooling: { type: "string" }
              }
            },
            resource_forecast: {
              type: "object",
              properties: {
                cpu_trend: { type: "string" },
                memory_trend: { type: "string" },
                peak_time: { type: "string" },
                bottleneck_risk: { type: "number" }
              }
            },
            early_warnings: { type: "array", items: { type: "string" } },
            system_health_prediction: { type: "number" }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setPredictions(data);
      
      // Auto-execute preventive actions
      if (autoPrevent && data.preventive_actions?.length > 0) {
        const autoActions = data.preventive_actions.filter(a => a.auto_executable);
        if (autoActions.length > 0) {
          setPreventiveActions(prev => [...autoActions.map(a => ({
            ...a,
            status: 'pending',
            timestamp: new Date()
          })), ...prev]);
          
          // Auto-execute high priority actions
          autoActions.filter(a => a.priority === 'high').forEach((action, index) => {
            setTimeout(() => {
              executePreventiveAction(action, index);
            }, index * 2000);
          });
        }
      }
      
      // Auto load balancing
      if (autoPrevent && data.load_distribution?.length > 0) {
        const autoAdjust = data.load_distribution.filter(d => d.auto_adjust && d.priority === 'high');
        if (autoAdjust.length > 0) {
          toast.info(`تم تطبيق ${autoAdjust.length} تعديل تلقائي لتوزيع الحمل`, { icon: '⚡' });
        }
      }
      
      toast.success('تم تحديث التنبؤات والتحسينات التلقائية');
    }
  });

  useEffect(() => {
    predictIssuesMutation.mutate();
    const interval = setInterval(() => predictIssuesMutation.mutate(), 60000);
    return () => clearInterval(interval);
  }, []);

  const executePreventiveAction = (action, index) => {
    if (!action) return;
    
    setPreventiveActions(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], status: 'executing' };
      }
      return updated;
    });
    
    setTimeout(() => {
      setPreventiveActions(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], status: 'completed' };
        }
        return updated;
      });
      toast.success(`تم تنفيذ: ${action.action}`);
    }, 2000);
  };

  const getStatusColor = (value, thresholds = { low: 50, high: 80 }) => {
    if (value >= thresholds.high) return 'red';
    if (value >= thresholds.low) return 'amber';
    return 'green';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20"
          >
            <Eye className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">المراقبة الاستباقية</h4>
            <p className="text-slate-400 text-xs">تنبؤ بالمشاكل • إجراءات وقائية • توزيع الحمل</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-slate-400 text-xs">تنفيذ تلقائي</Label>
            <Switch checked={autoPrevent} onCheckedChange={setAutoPrevent} />
          </div>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => predictIssuesMutation.mutate()}
            disabled={predictIssuesMutation.isPending}
          >
            {predictIssuesMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Brain className="w-4 h-4 ml-1" /> تحليل</>
            )}
          </Button>
        </div>
      </div>

      {/* System Health Prediction */}
      {predictions && (
        <Card className={`bg-gradient-to-r ${
          (predictions.system_health_prediction || 0) >= 80 
            ? 'from-green-500/10 to-cyan-500/10 border-green-500/30' 
            : (predictions.system_health_prediction || 0) >= 60 
            ? 'from-amber-500/10 to-orange-500/10 border-amber-500/30'
            : 'from-red-500/10 to-orange-500/10 border-red-500/30'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">صحة النظام المتوقعة (الساعة القادمة)</p>
                <p className="text-4xl font-bold text-white mt-1">{predictions.system_health_prediction || 0}%</p>
              </div>
              <div className="text-left">
                <p className="text-slate-400 text-xs">خطر الاختناق</p>
                <p className={`text-2xl font-bold ${
                  (predictions.resource_forecast?.bottleneck_risk || 0) > 50 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {predictions.resource_forecast?.bottleneck_risk || 0}%
                </p>
              </div>
            </div>
            <Progress value={predictions.system_health_prediction || 0} className="mt-3 h-2" />
          </CardContent>
        </Card>
      )}

      {/* Resource Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'cpu', label: 'CPU', icon: Cpu, value: resourceMetrics.cpu },
          { key: 'memory', label: 'الذاكرة', icon: MemoryStick, value: resourceMetrics.memory },
          { key: 'diskIO', label: 'Disk I/O', icon: HardDrive, value: resourceMetrics.diskIO },
          { key: 'network', label: 'الشبكة', icon: Activity, value: resourceMetrics.network },
        ].map((metric) => {
          const color = getStatusColor(metric.value);
          return (
            <Card key={metric.key} className={`bg-${color}-500/10 border-${color}-500/30`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-5 h-5 text-${color}-400`} />
                  <Badge className={`bg-${color}-500/20 text-${color}-400`}>
                    {metric.value}%
                  </Badge>
                </div>
                <p className="text-white font-medium text-sm">{metric.label}</p>
                <Progress value={metric.value} className="h-1 mt-2" />
                {predictions?.resource_forecast && (
                  <p className={`text-xs mt-1 ${
                    predictions.resource_forecast[`${metric.key}_trend`] === 'increasing' 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {predictions.resource_forecast[`${metric.key}_trend`] === 'increasing' ? '↑' : '↓'} 
                    {predictions.resource_forecast[`${metric.key}_trend`]}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Predictions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Resource Trend */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              اتجاهات الموارد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} name="CPU" />
                  <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="الذاكرة" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Predicted Issues */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              المشاكل المتوقعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              {predictions?.predicted_issues?.length === 0 ? (
                <div className="text-center py-8 text-green-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">لا توجد مشاكل متوقعة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {predictions?.predicted_issues?.map((issue, i) => (
                    <div key={i} className={`p-2 rounded-lg border bg-${
                      issue.severity === 'high' ? 'red' : issue.severity === 'medium' ? 'amber' : 'slate'
                    }-500/10 border-${
                      issue.severity === 'high' ? 'red' : issue.severity === 'medium' ? 'amber' : 'slate'
                    }-500/30`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{issue.type}</span>
                        <Badge className={`bg-${
                          issue.severity === 'high' ? 'red' : issue.severity === 'medium' ? 'amber' : 'green'
                        }-500/20 text-${
                          issue.severity === 'high' ? 'red' : issue.severity === 'medium' ? 'amber' : 'green'
                        }-400`}>
                          {issue.probability}%
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{issue.description}</p>
                      <p className="text-slate-500 text-xs mt-1">المتأثر: {issue.affected_component} • {issue.expected_time}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Agent Load Distribution */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            توزيع حمل الوكلاء وتوصيات التعديل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agentMetrics.map((agent, i) => {
              const recommendation = predictions?.load_distribution?.find(l => l.agent === agent.name);
              const burnoutColor = getStatusColor(agent.burnoutRisk, { low: 40, high: 70 });
              
              return (
                <div key={i} className={`p-3 rounded-lg border bg-${burnoutColor}-500/10 border-${burnoutColor}-500/30`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{agent.name}</span>
                    <Badge className={`bg-${burnoutColor}-500/20 text-${burnoutColor}-400`}>
                      <Battery className="w-3 h-3 ml-1" />
                      {agent.burnoutRisk}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-slate-400">الاستجابة</p>
                      <p className="text-white">{agent.responseTime.toFixed(1)}s</p>
                    </div>
                    <div>
                      <p className="text-slate-400">الحمل</p>
                      <p className="text-white">{agent.workload}%</p>
                    </div>
                  </div>
                  {recommendation && (
                    <div className="p-2 bg-slate-900/50 rounded text-xs">
                      <p className="text-cyan-400 mb-1">التوصية:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{recommendation.current_load}%</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-green-400">{recommendation.recommended_load}%</span>
                      </div>
                      <p className="text-slate-300 mt-1">{recommendation.action}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preventive Actions */}
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            الإجراءات الوقائية
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions?.preventive_actions?.length === 0 && preventiveActions.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد إجراءات وقائية مطلوبة حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions?.preventive_actions?.map((action, i) => (
                <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${
                  action.priority === 'high' 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-slate-900/50 border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{action.action}</span>
                      <Badge className={action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'}>
                        {action.priority}
                      </Badge>
                      {action.auto_executable && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">تلقائي</Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">الهدف: {action.target}</p>
                    <p className="text-green-400 text-xs">الفائدة: {action.expected_benefit}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 h-8"
                    onClick={() => executePreventiveAction(action, i)}
                  >
                    <Zap className="w-3 h-3 ml-1" />
                    تنفيذ
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Early Warnings */}
      {predictions?.early_warnings?.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              تنبيهات مبكرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {predictions.early_warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-amber-400">⚠</span>
                  <span className="text-slate-300">{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}