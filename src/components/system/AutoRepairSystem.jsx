import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Wrench, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2, Shield,
  Zap, Activity, Clock, Settings, Play, Pause, History, Bug, Cpu, Database,
  Wifi, Server, HardDrive, MemoryStick, AlertOctagon, Eye, Brain, TrendingUp,
  Users, Battery, Gauge, BarChart3, Target
} from 'lucide-react';
import ProactiveMonitoringModule from './ProactiveMonitoringModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// System components to monitor
const systemComponents = [
  { id: 'api', name: 'واجهة API', icon: Server, status: 'healthy' },
  { id: 'database', name: 'قاعدة البيانات', icon: Database, status: 'healthy' },
  { id: 'cache', name: 'الذاكرة المؤقتة', icon: MemoryStick, status: 'healthy' },
  { id: 'network', name: 'الشبكة', icon: Wifi, status: 'healthy' },
  { id: 'storage', name: 'التخزين', icon: HardDrive, status: 'healthy' },
  { id: 'ai_engine', name: 'محرك AI', icon: Brain, status: 'healthy' },
];

export default function AutoRepairSystem() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [components, setComponents] = useState(systemComponents);
  const [issues, setIssues] = useState([]);
  const [repairLogs, setRepairLogs] = useState([]);
  const [autoRepairEnabled, setAutoRepairEnabled] = useState(true);
  const [systemHealth, setSystemHealth] = useState(98);

  // Diagnose system issues
  const diagnoseSystemMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بمحاكاة فحص شامل للنظام وتشخيص المشاكل المحتملة:

المكونات المراقبة:
${JSON.stringify(components, null, 2)}

قدم:
1. قائمة بالمشاكل المكتشفة مع درجة الخطورة
2. الأسباب الجذرية لكل مشكلة
3. خطوات الإصلاح التلقائي
4. التوصيات الوقائية
5. حالة صحة النظام العامة`,
        response_json_schema: {
          type: "object",
          properties: {
            system_health: { type: "number" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  component: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  root_cause: { type: "string" },
                  auto_repairable: { type: "boolean" },
                  repair_steps: { type: "array", items: { type: "string" } },
                  estimated_repair_time: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            component_status: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  status: { type: "string" },
                  health_score: { type: "number" },
                  last_check: { type: "string" }
                }
              }
            },
            preventive_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setSystemHealth(data.system_health || 98);
      setIssues(data.issues || []);
      
      // Update component status
      if (data.component_status) {
        setComponents(prev => prev.map(comp => {
          const status = data.component_status.find(s => s.id === comp.id);
          return status ? { ...comp, status: status.status, health: status.health_score } : comp;
        }));
      }

      toast.success(`تم فحص النظام: ${data.issues?.length || 0} مشكلة مكتشفة`);
    },
    onError: () => {
      toast.error('حدث خطأ في الفحص');
    }
  });

  // Auto repair issue
  const repairIssueMutation = useMutation({
    mutationFn: async (issue) => {
      // Simulate repair process
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, issue_id: issue.id };
    },
    onSuccess: (data, issue) => {
      // Remove repaired issue
      setIssues(prev => prev.filter(i => i.id !== issue.id));
      
      // Add to repair logs
      setRepairLogs(prev => [{
        id: Date.now(),
        issue: issue.title,
        component: issue.component,
        status: 'success',
        timestamp: new Date(),
        steps_completed: issue.repair_steps?.length || 0
      }, ...prev].slice(0, 50));

      toast.success(`تم إصلاح: ${issue.title}`);
    },
    onError: (error, issue) => {
      setRepairLogs(prev => [{
        id: Date.now(),
        issue: issue.title,
        component: issue.component,
        status: 'failed',
        timestamp: new Date(),
        error: 'فشل الإصلاح التلقائي'
      }, ...prev]);

      toast.error(`فشل إصلاح: ${issue.title}`);
    }
  });

  // Auto-monitor effect
  useEffect(() => {
    if (isMonitoring) {
      diagnoseSystemMutation.mutate();
      
      const interval = setInterval(() => {
        diagnoseSystemMutation.mutate();
      }, 60000); // Every minute
      
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  // Auto-repair effect
  useEffect(() => {
    if (autoRepairEnabled && issues.length > 0) {
      const repairableIssues = issues.filter(i => i.auto_repairable && i.severity !== 'critical');
      if (repairableIssues.length > 0) {
        repairIssueMutation.mutate(repairableIssues[0]);
      }
    }
  }, [issues, autoRepairEnabled]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'amber';
      case 'low': return 'green';
      default: return 'slate';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'amber';
      case 'critical': return 'red';
      case 'repairing': return 'blue';
      default: return 'slate';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      case 'repairing': return RefreshCw;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={diagnoseSystemMutation.isPending ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: diagnoseSystemMutation.isPending ? Infinity : 0, ease: "linear" }}
            className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20"
          >
            <Wrench className="w-6 h-6 text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">نظام الإصلاح التلقائي</h3>
            <p className="text-slate-400 text-sm">مراقبة مستمرة • تشخيص AI • إصلاح تلقائي</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-slate-400 text-sm">إصلاح تلقائي</Label>
            <Switch
              checked={autoRepairEnabled}
              onCheckedChange={setAutoRepairEnabled}
            />
          </div>
          <Button
            variant="outline"
            className={`border-green-500/50 ${isMonitoring ? 'bg-green-500/20' : ''}`}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <><Pause className="w-4 h-4 ml-2" /> إيقاف المراقبة</>
            ) : (
              <><Play className="w-4 h-4 ml-2" /> بدء المراقبة</>
            )}
          </Button>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => diagnoseSystemMutation.mutate()}
            disabled={diagnoseSystemMutation.isPending}
          >
            {diagnoseSystemMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><RefreshCw className="w-4 h-4 ml-2" /> فحص الآن</>
            )}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card className={`bg-gradient-to-r ${
        systemHealth >= 90 ? 'from-green-500/10 to-cyan-500/10 border-green-500/30' :
        systemHealth >= 70 ? 'from-amber-500/10 to-orange-500/10 border-amber-500/30' :
        'from-red-500/10 to-orange-500/10 border-red-500/30'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">صحة النظام العامة</p>
              <p className="text-4xl font-bold text-white mt-1">{systemHealth}%</p>
              <p className="text-slate-400 text-xs mt-1">
                {issues.length} مشكلة نشطة • {repairLogs.filter(l => l.status === 'success').length} إصلاح ناجح
              </p>
            </div>
            <div className={`p-4 rounded-full ${
              systemHealth >= 90 ? 'bg-green-500/20' :
              systemHealth >= 70 ? 'bg-amber-500/20' :
              'bg-red-500/20'
            }`}>
              <Shield className={`w-10 h-10 ${
                systemHealth >= 90 ? 'text-green-400' :
                systemHealth >= 70 ? 'text-amber-400' :
                'text-red-400'
              }`} />
            </div>
          </div>
          <Progress value={systemHealth} className="mt-3 h-3" />
        </CardContent>
      </Card>

      {/* Component Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {components.map((component) => {
          const StatusIcon = getStatusIcon(component.status);
          const color = getStatusColor(component.status);
          return (
            <Card key={component.id} className={`bg-${color}-500/10 border-${color}-500/30`}>
              <CardContent className="p-3 text-center">
                <component.icon className={`w-6 h-6 text-${color}-400 mx-auto mb-2`} />
                <p className="text-white text-sm font-medium">{component.name}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <StatusIcon className={`w-4 h-4 text-${color}-400 ${component.status === 'repairing' ? 'animate-spin' : ''}`} />
                  <span className={`text-xs text-${color}-400`}>
                    {component.status === 'healthy' ? 'سليم' :
                     component.status === 'warning' ? 'تحذير' :
                     component.status === 'critical' ? 'حرج' :
                     component.status === 'repairing' ? 'قيد الإصلاح' : component.status}
                  </span>
                </div>
                {component.health && (
                  <Progress value={component.health} className="h-1 mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="issues">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="issues" className="data-[state=active]:bg-red-500/20">
            <Bug className="w-4 h-4 ml-1" />
            المشاكل ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-green-500/20">
            <History className="w-4 h-4 ml-1" />
            سجل الإصلاحات
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-cyan-500/20">
            <Eye className="w-4 h-4 ml-1" />
            المراقبة
          </TabsTrigger>
          <TabsTrigger value="proactive" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 ml-1" />
            استباقي
          </TabsTrigger>
        </TabsList>

        {/* Active Issues */}
        <TabsContent value="issues" className="mt-4">
          {issues.length === 0 ? (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-white font-medium">لا توجد مشاكل نشطة</p>
                <p className="text-slate-400 text-sm">النظام يعمل بشكل سليم</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {issues.map((issue, i) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`bg-${getSeverityColor(issue.severity)}-500/10 border-${getSeverityColor(issue.severity)}-500/30`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertOctagon className={`w-5 h-5 text-${getSeverityColor(issue.severity)}-400`} />
                            <div>
                              <h5 className="text-white font-medium">{issue.title}</h5>
                              <p className="text-slate-400 text-xs">{issue.component}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`bg-${getSeverityColor(issue.severity)}-500/20 text-${getSeverityColor(issue.severity)}-400`}>
                              {issue.severity === 'critical' ? 'حرج' :
                               issue.severity === 'high' ? 'عالي' :
                               issue.severity === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            {issue.auto_repairable && (
                              <Badge className="bg-green-500/20 text-green-400">قابل للإصلاح</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-300 text-sm mb-3">{issue.description}</p>

                        <div className="p-2 bg-slate-900/50 rounded mb-3">
                          <p className="text-amber-400 text-xs font-medium">السبب الجذري:</p>
                          <p className="text-slate-400 text-sm">{issue.root_cause}</p>
                        </div>

                        {issue.repair_steps?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-cyan-400 text-xs font-medium mb-1">خطوات الإصلاح:</p>
                            <div className="space-y-1">
                              {issue.repair_steps.map((step, j) => (
                                <p key={j} className="text-slate-400 text-xs flex items-center gap-1">
                                  <span className="text-cyan-400">{j + 1}.</span> {step}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {issue.estimated_repair_time}
                            </span>
                            <span>التأثير: {issue.impact}</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-7"
                            onClick={() => repairIssueMutation.mutate(issue)}
                            disabled={repairIssueMutation.isPending}
                          >
                            {repairIssueMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <><Wrench className="w-3 h-3 ml-1" /> إصلاح</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Repair Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-green-400" />
                سجل الإصلاحات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {repairLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد إصلاحات بعد</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {repairLogs.map((log) => (
                      <div key={log.id} className={`p-3 rounded-lg border ${
                        log.status === 'success' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <div>
                              <p className="text-white text-sm">{log.issue}</p>
                              <p className="text-slate-400 text-xs">{log.component}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <Badge className={log.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {log.status === 'success' ? 'نجاح' : 'فشل'}
                            </Badge>
                            <p className="text-slate-500 text-xs mt-1">
                              {log.timestamp.toLocaleTimeString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">إعدادات المراقبة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300">المراقبة المستمرة</Label>
                  <Switch checked={isMonitoring} onCheckedChange={setIsMonitoring} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300">الإصلاح التلقائي</Label>
                  <Switch checked={autoRepairEnabled} onCheckedChange={setAutoRepairEnabled} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300">إشعارات فورية</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                  <Label className="text-slate-300">إصلاح المشاكل الحرجة فقط</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">إحصائيات المراقبة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-cyan-400">{repairLogs.length}</p>
                    <p className="text-slate-400 text-xs">إصلاح إجمالي</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {repairLogs.filter(l => l.status === 'success').length}
                    </p>
                    <p className="text-slate-400 text-xs">إصلاح ناجح</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-amber-400">{issues.length}</p>
                    <p className="text-slate-400 text-xs">مشكلة نشطة</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {Math.round((repairLogs.filter(l => l.status === 'success').length / (repairLogs.length || 1)) * 100)}%
                    </p>
                    <p className="text-slate-400 text-xs">معدل النجاح</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Proactive Monitoring */}
        <TabsContent value="proactive" className="mt-4">
          <ProactiveMonitoringModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}