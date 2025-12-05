import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Zap, Users, TrendingUp, AlertTriangle, Target, Brain, Play, CheckCircle,
  Clock, Settings, Database, Mail, Phone, Tag, FileText, Loader2, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const automationRules = [
  { 
    id: 'upsell', 
    name: 'فرص البيع الإضافي', 
    icon: TrendingUp, 
    color: 'green',
    description: 'تحديد العملاء المناسبين للترقية أو البيع المتقاطع',
    trigger: 'purchase_intent > 70%'
  },
  { 
    id: 'churn', 
    name: 'خطر المغادرة', 
    icon: AlertTriangle, 
    color: 'red',
    description: 'إنشاء مهام متابعة للعملاء المعرضين للمغادرة',
    trigger: 'churn_risk > 60%'
  },
  { 
    id: 'followup', 
    name: 'المتابعة التلقائية', 
    icon: Clock, 
    color: 'blue',
    description: 'جدولة مكالمات متابعة بناءً على التفاعلات',
    trigger: 'last_contact > 14 days'
  },
  { 
    id: 'satisfaction', 
    name: 'تحسين الرضا', 
    icon: Target, 
    color: 'amber',
    description: 'التواصل مع العملاء ذوي الرضا المنخفض',
    trigger: 'satisfaction < 3.5'
  },
];

export default function ProactiveCRMAutomation() {
  const [enabledRules, setEnabledRules] = useState(['upsell', 'churn']);
  const [identifiedCustomers, setIdentifiedCustomers] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const scanCustomersMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل قاعدة بيانات العملاء وحدد الفرص والمخاطر:

القواعد النشطة:
${enabledRules.map(r => automationRules.find(rule => rule.id === r)?.name).join('\n')}

قم بـ:
1. تحديد عملاء محتملين لـ Upsell (5-7 عملاء)
2. تحديد عملاء معرضين للمغادرة (3-5 عملاء)
3. اقتراح مهام تلقائية لكل عميل
4. تحديد أولوية كل إجراء`,
        response_json_schema: {
          type: "object",
          properties: {
            upsell_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  customer_name: { type: "string" },
                  customer_type: { type: "string" },
                  opportunity_score: { type: "number" },
                  recommended_product: { type: "string" },
                  reason: { type: "string" },
                  suggested_action: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            churn_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  customer_name: { type: "string" },
                  risk_score: { type: "number" },
                  risk_factors: { type: "array", items: { type: "string" } },
                  retention_action: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            auto_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  customer_name: { type: "string" },
                  task_type: { type: "string" },
                  priority: { type: "string" },
                  due_in_days: { type: "number" }
                }
              }
            },
            crm_updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  customer_name: { type: "string" },
                  field: { type: "string" },
                  new_value: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });
      setIsScanning(false);
      return result;
    },
    onSuccess: (data) => {
      const customers = [
        ...(data.upsell_opportunities?.map(c => ({ ...c, type: 'upsell' })) || []),
        ...(data.churn_risks?.map(c => ({ ...c, type: 'churn' })) || [])
      ];
      setIdentifiedCustomers(customers);
      toast.success(`تم تحديد ${customers.length} فرصة/خطر`);
    }
  });

  const executeAutomation = async (customer) => {
    try {
      // Create task
      await base44.entities.Task.create({
        title: customer.type === 'upsell' 
          ? `فرصة بيع: ${customer.customer_name}` 
          : `متابعة عميل معرض للمغادرة: ${customer.customer_name}`,
        description: customer.suggested_action || customer.retention_action,
        priority: customer.priority === 'high' ? 'urgent' : 'medium',
        status: 'pending',
        category: customer.type === 'upsell' ? 'sales' : 'support',
        related_customer: customer.customer_name
      });

      setExecutionLog(prev => [...prev, {
        time: new Date(),
        action: `تم إنشاء مهمة لـ ${customer.customer_name}`,
        type: customer.type,
        status: 'success'
      }]);

      toast.success(`تم إنشاء مهمة لـ ${customer.customer_name}`);
    } catch (error) {
      toast.error('فشل في إنشاء المهمة');
    }
  };

  const executeAllAutomations = async () => {
    for (const customer of identifiedCustomers.slice(0, 5)) {
      await executeAutomation(customer);
    }
    toast.success('تم تنفيذ الأتمتة لجميع العملاء المحددين');
  };

  const toggleRule = (ruleId) => {
    setEnabledRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(r => r !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isScanning ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isScanning ? Infinity : 0 }}
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-green-500/20"
          >
            <Zap className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">أتمتة CRM الاستباقية</h4>
            <p className="text-slate-400 text-xs">تحديد الفرص والمخاطر تلقائياً</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-cyan-600"
          onClick={() => scanCustomersMutation.mutate()}
          disabled={isScanning}
        >
          {isScanning ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري المسح</>
          ) : (
            <><Brain className="w-4 h-4 ml-2" /> مسح العملاء</>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto" />
            <p className="text-xl font-bold text-white mt-1">
              {identifiedCustomers.filter(c => c.type === 'upsell').length}
            </p>
            <p className="text-slate-400 text-xs">فرص بيع</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto" />
            <p className="text-xl font-bold text-white mt-1">
              {identifiedCustomers.filter(c => c.type === 'churn').length}
            </p>
            <p className="text-slate-400 text-xs">خطر مغادرة</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <FileText className="w-5 h-5 text-blue-400 mx-auto" />
            <p className="text-xl font-bold text-white mt-1">{executionLog.length}</p>
            <p className="text-slate-400 text-xs">مهام منفذة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Settings className="w-5 h-5 text-purple-400 mx-auto" />
            <p className="text-xl font-bold text-white mt-1">{enabledRules.length}</p>
            <p className="text-slate-400 text-xs">قواعد نشطة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-cyan-500/20 text-xs">
            <Users className="w-3 h-3 ml-1" />
            العملاء المحددون
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-purple-500/20 text-xs">
            <Settings className="w-3 h-3 ml-1" />
            القواعد
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-green-500/20 text-xs">
            <FileText className="w-3 h-3 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-4">
          {identifiedCustomers.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">اضغط "مسح العملاء" لتحليل قاعدة البيانات</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                <Button size="sm" className="bg-green-600" onClick={executeAllAutomations}>
                  <Play className="w-4 h-4 ml-1" />
                  تنفيذ الكل
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {identifiedCustomers.map((customer, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={`bg-${customer.type === 'upsell' ? 'green' : 'red'}-500/10 border-${customer.type === 'upsell' ? 'green' : 'red'}-500/30`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-${customer.type === 'upsell' ? 'green' : 'red'}-500/20 flex items-center justify-center`}>
                                {customer.type === 'upsell' ? (
                                  <TrendingUp className="w-5 h-5 text-green-400" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-red-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">{customer.customer_name}</p>
                                <p className="text-slate-400 text-xs">
                                  {customer.type === 'upsell' 
                                    ? `فرصة: ${customer.opportunity_score}%` 
                                    : `خطر: ${customer.risk_score}%`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`bg-${customer.priority === 'high' ? 'red' : 'amber'}-500/20 text-${customer.priority === 'high' ? 'red' : 'amber'}-400`}>
                                {customer.priority === 'high' ? 'عالي' : 'متوسط'}
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-7" onClick={() => executeAutomation(customer)}>
                                <Play className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-slate-300 text-xs mt-2">
                            {customer.reason || customer.retention_action}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <div className="space-y-2">
            {automationRules.map(rule => (
              <Card key={rule.id} className={`${enabledRules.includes(rule.id) ? `bg-${rule.color}-500/10 border-${rule.color}-500/30` : 'bg-slate-800/30 border-slate-700/50'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <rule.icon className={`w-5 h-5 text-${rule.color}-400`} />
                      <div>
                        <p className="text-white font-medium">{rule.name}</p>
                        <p className="text-slate-400 text-xs">{rule.description}</p>
                        <Badge variant="outline" className="text-xs mt-1 border-slate-600">{rule.trigger}</Badge>
                      </div>
                    </div>
                    <Switch
                      checked={enabledRules.includes(rule.id)}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          {executionLog.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">لا توجد عمليات منفذة</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {executionLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{log.action}</p>
                      <p className="text-slate-500 text-xs">{log.time.toLocaleTimeString('ar-SA')}</p>
                    </div>
                    <Badge className={`bg-${log.type === 'upsell' ? 'green' : 'red'}-500/20 text-${log.type === 'upsell' ? 'green' : 'red'}-400`}>
                      {log.type === 'upsell' ? 'بيع' : 'احتفاظ'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}