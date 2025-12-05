import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Database, RefreshCw, Upload, Download, ArrowLeftRight, CheckCircle, AlertTriangle,
  Clock, User, Phone, Mail, History, Zap, Brain, Settings, Filter, Search,
  Link2, Unlink, Activity, TrendingUp, FileText, Loader2, Target, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const crmSystems = [
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', color: 'blue' },
  { id: 'hubspot', name: 'HubSpot', icon: '🔶', color: 'orange' },
  { id: 'zoho', name: 'Zoho CRM', icon: '📊', color: 'red' },
  { id: 'dynamics', name: 'Microsoft Dynamics', icon: '🔷', color: 'cyan' },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🎯', color: 'green' },
];

const syncFields = [
  { id: 'contact_info', name: 'معلومات الاتصال', enabled: true },
  { id: 'interaction_history', name: 'سجل التفاعلات', enabled: true },
  { id: 'purchase_history', name: 'سجل المشتريات', enabled: true },
  { id: 'support_tickets', name: 'تذاكر الدعم', enabled: true },
  { id: 'notes', name: 'الملاحظات', enabled: false },
  { id: 'custom_fields', name: 'الحقول المخصصة', enabled: false },
];

export default function BidirectionalCRMIntegration({ customerId, onCustomerDataFetched }) {
  const [selectedCRM, setSelectedCRM] = useState('salesforce');
  const [syncConfig, setSyncConfig] = useState({
    autoSync: true,
    syncInterval: 15,
    bidirectional: true,
    conflictResolution: 'crm_priority',
    fields: syncFields,
  });
  const [syncLogs, setSyncLogs] = useState([]);
  const [customerContext, setCustomerContext] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const queryClient = useQueryClient();

  // Fetch customer data from CRM
  const fetchCRMDataMutation = useMutation({
    mutationFn: async (customerId) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بمحاكاة استرجاع بيانات عميل من نظام CRM للعميل رقم ${customerId}:
        
أنشئ بيانات واقعية تشمل:
- معلومات الاتصال الكاملة
- سجل التفاعلات السابقة
- سجل المشتريات
- تذاكر الدعم المفتوحة والمغلقة
- ملاحظات الوكلاء
- تصنيف العميل وقيمته
- تاريخ آخر تحديث`,
        response_json_schema: {
          type: "object",
          properties: {
            customer: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                company: { type: "string" },
                tier: { type: "string" },
                lifetime_value: { type: "number" },
                created_date: { type: "string" },
                last_contact: { type: "string" }
              }
            },
            interactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  type: { type: "string" },
                  channel: { type: "string" },
                  summary: { type: "string" },
                  outcome: { type: "string" },
                  agent: { type: "string" }
                }
              }
            },
            purchases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  product: { type: "string" },
                  amount: { type: "number" },
                  status: { type: "string" }
                }
              }
            },
            tickets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  subject: { type: "string" },
                  status: { type: "string" },
                  priority: { type: "string" },
                  created: { type: "string" }
                }
              }
            },
            notes: { type: "array", items: { type: "string" } },
            preferences: {
              type: "object",
              properties: {
                preferred_channel: { type: "string" },
                best_contact_time: { type: "string" },
                language: { type: "string" }
              }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setCustomerContext(data);
      onCustomerDataFetched?.(data);
      addSyncLog('fetch', 'success', 'تم استرجاع بيانات العميل من CRM');
      toast.success('تم تحميل سياق العميل من CRM');
    },
    onError: () => {
      addSyncLog('fetch', 'error', 'فشل استرجاع البيانات');
      toast.error('حدث خطأ في الاتصال بـ CRM');
    }
  });

  // Push updates to CRM
  const pushToCRMMutation = useMutation({
    mutationFn: async (updateData) => {
      // Simulate push to CRM
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, timestamp: new Date().toISOString() };
    },
    onSuccess: () => {
      addSyncLog('push', 'success', 'تم تحديث CRM بنجاح');
      toast.success('تم مزامنة البيانات مع CRM');
    }
  });

  const addSyncLog = (type, status, message) => {
    setSyncLogs(prev => [{
      id: Date.now(),
      type,
      status,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
  };

  // Auto-sync effect
  useEffect(() => {
    if (syncConfig.autoSync && customerId) {
      fetchCRMDataMutation.mutate(customerId);
      
      const interval = setInterval(() => {
        fetchCRMDataMutation.mutate(customerId);
      }, syncConfig.syncInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [syncConfig.autoSync, syncConfig.syncInterval, customerId]);

  const toggleField = (fieldId) => {
    setSyncConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, enabled: !f.enabled } : f
      )
    }));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={fetchCRMDataMutation.isPending ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: fetchCRMDataMutation.isPending ? Infinity : 0, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20"
          >
            <Database className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div>
            <h4 className="text-white font-bold">تكامل CRM ثنائي الاتجاه</h4>
            <p className="text-slate-400 text-xs">مزامنة تلقائية • استرجاع السياق • تحديث فوري</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
            {isConnected ? <><Link2 className="w-3 h-3 ml-1" /> متصل</> : <><Unlink className="w-3 h-3 ml-1" /> غير متصل</>}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-500/50"
            onClick={() => fetchCRMDataMutation.mutate(customerId)}
            disabled={fetchCRMDataMutation.isPending}
          >
            {fetchCRMDataMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="context">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="context" className="data-[state=active]:bg-blue-500/20 text-xs">
            <User className="w-3 h-3 ml-1" />
            سياق العميل
          </TabsTrigger>
          <TabsTrigger value="sync" className="data-[state=active]:bg-purple-500/20 text-xs">
            <ArrowLeftRight className="w-3 h-3 ml-1" />
            المزامنة
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-amber-500/20 text-xs">
            <Settings className="w-3 h-3 ml-1" />
            الإعدادات
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-green-500/20 text-xs">
            <History className="w-3 h-3 ml-1" />
            السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="mt-4 space-y-4">
          {fetchCRMDataMutation.isPending && !customerContext && (
            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-6 text-center">
                <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
                <p className="text-slate-300">جاري استرجاع بيانات العميل من CRM...</p>
              </CardContent>
            </Card>
          )}

          {customerContext && (
            <>
              {/* Customer Profile */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {customerContext.customer?.name?.[0] || 'ع'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-white font-bold text-lg">{customerContext.customer?.name}</h5>
                        {customerContext.customer?.tier === 'VIP' && (
                          <Badge className="bg-amber-500/20 text-amber-400">
                            <Crown className="w-3 h-3 ml-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{customerContext.customer?.company}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customerContext.customer?.email}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customerContext.customer?.phone}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-slate-400 text-xs">القيمة الإجمالية</p>
                      <p className="text-green-400 font-bold text-lg">
                        {customerContext.customer?.lifetime_value?.toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <Activity className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{customerContext.interactions?.length || 0}</p>
                    <p className="text-slate-400 text-xs">تفاعل</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{customerContext.purchases?.length || 0}</p>
                    <p className="text-slate-400 text-xs">عملية شراء</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <FileText className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{customerContext.tickets?.length || 0}</p>
                    <p className="text-slate-400 text-xs">تذكرة</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3 text-center">
                    <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">{customerContext.customer?.last_contact || 'N/A'}</p>
                    <p className="text-slate-400 text-xs">آخر تواصل</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Interactions */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    آخر التفاعلات من CRM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {customerContext.interactions?.slice(0, 5).map((interaction, i) => (
                        <div key={i} className="p-2 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {interaction.type}
                            </Badge>
                            <span className="text-slate-500 text-xs">{interaction.date}</span>
                          </div>
                          <p className="text-white text-sm">{interaction.summary}</p>
                          <p className="text-slate-400 text-xs mt-1">النتيجة: {interaction.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Customer Preferences */}
              {customerContext.preferences && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      تفضيلات العميل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-slate-400 text-xs">القناة المفضلة</p>
                        <p className="text-white text-sm font-medium">{customerContext.preferences.preferred_channel}</p>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-slate-400 text-xs">أفضل وقت للتواصل</p>
                        <p className="text-white text-sm font-medium">{customerContext.preferences.best_contact_time}</p>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-slate-400 text-xs">اللغة</p>
                        <p className="text-white text-sm font-medium">{customerContext.preferences.language}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sync" className="mt-4 space-y-4">
          {/* Sync Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-auto py-4"
              onClick={() => fetchCRMDataMutation.mutate(customerId)}
              disabled={fetchCRMDataMutation.isPending}
            >
              <div className="text-center">
                <Download className="w-6 h-6 mx-auto mb-1" />
                <p className="font-medium">استرجاع من CRM</p>
                <p className="text-xs opacity-70">تحديث البيانات المحلية</p>
              </div>
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 h-auto py-4"
              onClick={() => pushToCRMMutation.mutate({ customerId })}
              disabled={pushToCRMMutation.isPending}
            >
              <div className="text-center">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <p className="font-medium">تحديث CRM</p>
                <p className="text-xs opacity-70">إرسال التغييرات</p>
              </div>
            </Button>
          </div>

          {/* Sync Status */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">حالة المزامنة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {syncConfig.fields.filter(f => f.enabled).map(field => (
                <div key={field.id} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{field.name}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={100} className="w-20 h-2" />
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-4 space-y-4">
          {/* CRM Selection */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">نظام CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {crmSystems.map(crm => (
                  <button
                    key={crm.id}
                    onClick={() => setSelectedCRM(crm.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedCRM === crm.id 
                        ? 'bg-blue-500/20 border-blue-500/50' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{crm.icon}</span>
                    <p className="text-white text-xs mt-1">{crm.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sync Settings */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">إعدادات المزامنة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">مزامنة تلقائية</Label>
                <Switch
                  checked={syncConfig.autoSync}
                  onCheckedChange={(v) => setSyncConfig(prev => ({ ...prev, autoSync: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">مزامنة ثنائية الاتجاه</Label>
                <Switch
                  checked={syncConfig.bidirectional}
                  onCheckedChange={(v) => setSyncConfig(prev => ({ ...prev, bidirectional: v }))}
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">فترة المزامنة (دقائق)</Label>
                <Select
                  value={String(syncConfig.syncInterval)}
                  onValueChange={(v) => setSyncConfig(prev => ({ ...prev, syncInterval: Number(v) }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="5">5 دقائق</SelectItem>
                    <SelectItem value="15">15 دقيقة</SelectItem>
                    <SelectItem value="30">30 دقيقة</SelectItem>
                    <SelectItem value="60">ساعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Field Mapping */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الحقول المتزامنة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncConfig.fields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-slate-300 text-sm">{field.name}</span>
                    <Switch
                      checked={field.enabled}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-green-400" />
                سجل المزامنة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {syncLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لا توجد عمليات مزامنة بعد</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {syncLogs.map(log => (
                      <div key={log.id} className={`p-2 rounded-lg border ${
                        log.status === 'success' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-white text-sm">{log.message}</span>
                          </div>
                          <span className="text-slate-500 text-xs">
                            {log.timestamp.toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}