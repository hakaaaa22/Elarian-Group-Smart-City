import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Plug, Plus, Upload, Key, Link2, Shield, Cloud, Server, Database,
  Check, X, Loader2, Trash2, Settings, Eye, EyeOff, RefreshCw, FileCode,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';

const integrationTypes = [
  { value: 'api', label: 'REST API', icon: Server },
  { value: 'webhook', label: 'Webhook', icon: Link2 },
  { value: 'oauth', label: 'OAuth 2.0', icon: Shield },
  { value: 'sdk', label: 'SDK', icon: FileCode },
  { value: 'custom', label: 'مخصص', icon: Settings },
];

const categories = [
  { value: 'vms', label: 'أنظمة إدارة الفيديو', icon: '📹' },
  { value: 'access_control', label: 'التحكم بالوصول', icon: '🚪' },
  { value: 'alarm', label: 'أنظمة الإنذار', icon: '🔔' },
  { value: 'iot', label: 'إنترنت الأشياء', icon: '📡' },
  { value: 'cloud', label: 'خدمات السحابة', icon: '☁️' },
  { value: 'erp', label: 'أنظمة ERP', icon: '🏢' },
  { value: 'crm', label: 'إدارة العملاء', icon: '👥' },
  { value: 'custom', label: 'أخرى', icon: '🔧' },
];

const statusConfig = {
  active: { label: 'متصل', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  inactive: { label: 'غير متصل', color: 'bg-slate-500/20 text-slate-400', icon: XCircle },
  testing: { label: 'اختبار', color: 'bg-amber-500/20 text-amber-400', icon: RefreshCw },
  error: { label: 'خطأ', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
};

const presetIntegrations = [
  { name: 'Hikvision', category: 'vms', type: 'api', url: 'https://api.hikvision.com' },
  { name: 'Dahua', category: 'vms', type: 'api', url: 'https://api.dahuasecurity.com' },
  { name: 'Milestone XProtect', category: 'vms', type: 'sdk', url: 'https://milestone.api' },
  { name: 'Genetec', category: 'vms', type: 'api', url: 'https://genetec.api' },
  { name: 'AWS S3', category: 'cloud', type: 'api', url: 'https://s3.amazonaws.com' },
  { name: 'Azure Blob', category: 'cloud', type: 'api', url: 'https://blob.core.windows.net' },
  { name: 'Google Cloud', category: 'cloud', type: 'oauth', url: 'https://storage.googleapis.com' },
  { name: 'Salesforce', category: 'crm', type: 'oauth', url: 'https://login.salesforce.com' },
  { name: 'SAP', category: 'erp', type: 'api', url: 'https://api.sap.com' },
];

export default function Integrations() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '', type: 'api', category: 'custom', status: 'inactive',
    config: { base_url: '', api_key: '', api_secret: '', token: '', username: '', password: '', auth_type: 'api_key' },
    endpoints: []
  });
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Integration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('تم إضافة التكامل بنجاح');
      setShowAddDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Integration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('تم تحديث التكامل');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Integration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('تم حذف التكامل');
    },
  });

  const resetForm = () => {
    setNewIntegration({
      name: '', type: 'api', category: 'custom', status: 'inactive',
      config: { base_url: '', api_key: '', api_secret: '', token: '', username: '', password: '', auth_type: 'api_key' },
      endpoints: []
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse this API configuration file and extract integration details.
File name: ${file.name}

Extract the API configuration including name, base URL, authentication details, and endpoints if available.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            category: { type: "string" },
            config: {
              type: "object",
              properties: {
                base_url: { type: "string" },
                api_key: { type: "string" },
                auth_type: { type: "string" }
              }
            },
            endpoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  method: { type: "string" },
                  path: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.name) {
        setNewIntegration({
          ...newIntegration,
          ...result,
          status: 'inactive'
        });
        toast.success('تم استخراج التكوين من الملف');
      }
    } catch (error) {
      toast.error('فشل في تحليل الملف');
    }
    setIsUploading(false);
  };

  const testConnection = async (integration) => {
    updateMutation.mutate({ id: integration.id, data: { status: 'testing' } });
    
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      updateMutation.mutate({ 
        id: integration.id, 
        data: { 
          status: success ? 'active' : 'error',
          error_message: success ? null : 'فشل الاتصال - تحقق من بيانات الاعتماد',
          last_sync: new Date().toISOString()
        } 
      });
      toast[success ? 'success' : 'error'](success ? 'تم الاتصال بنجاح' : 'فشل الاتصال');
    }, 2000);
  };

  const selectPreset = (preset) => {
    setNewIntegration({
      ...newIntegration,
      name: preset.name,
      type: preset.type,
      category: preset.category,
      config: { ...newIntegration.config, base_url: preset.url }
    });
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Plug className="w-8 h-8 text-purple-400" />
              التكاملات و APIs
            </h1>
            <p className="text-slate-400 mt-1">ربط الأنظمة الخارجية وإدارة APIs</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة تكامل
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">إضافة تكامل جديد</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="manual" className="mt-4">
                <TabsList className="bg-slate-800/50">
                  <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
                  <TabsTrigger value="preset">قوالب جاهزة</TabsTrigger>
                  <TabsTrigger value="file">رفع ملف</TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {presetIntegrations.map(preset => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        className="border-slate-600 text-slate-300 justify-start"
                        onClick={() => selectPreset(preset)}
                      >
                        {categories.find(c => c.value === preset.category)?.icon}
                        <span className="mr-2 text-sm">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-400">رفع ملف تكوين (JSON, YAML, XML)</p>
                      </>
                    )}
                    <input type="file" className="hidden" accept=".json,.yaml,.yml,.xml" onChange={handleFileUpload} />
                  </label>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">اسم التكامل</Label>
                      <Input
                        value={newIntegration.name}
                        onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">النوع</Label>
                      <Select value={newIntegration.type} onValueChange={(v) => setNewIntegration({ ...newIntegration, type: v })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {integrationTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">الفئة</Label>
                    <Select value={newIntegration.category} onValueChange={(v) => setNewIntegration({ ...newIntegration, category: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {categories.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            <span className="flex items-center gap-2">
                              <span>{c.icon}</span>
                              <span>{c.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-lg space-y-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      بيانات الاعتماد
                    </h3>
                    
                    <div>
                      <Label className="text-white">Base URL</Label>
                      <Input
                        value={newIntegration.config.base_url}
                        onChange={(e) => setNewIntegration({ 
                          ...newIntegration, 
                          config: { ...newIntegration.config, base_url: e.target.value }
                        })}
                        placeholder="https://api.example.com"
                        className="bg-slate-800/50 border-slate-700 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-white">نوع المصادقة</Label>
                      <Select 
                        value={newIntegration.config.auth_type} 
                        onValueChange={(v) => setNewIntegration({ 
                          ...newIntegration, 
                          config: { ...newIntegration.config, auth_type: v }
                        })}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(newIntegration.config.auth_type === 'api_key' || newIntegration.config.auth_type === 'oauth') && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">API Key</Label>
                          <Input
                            type="password"
                            value={newIntegration.config.api_key}
                            onChange={(e) => setNewIntegration({ 
                              ...newIntegration, 
                              config: { ...newIntegration.config, api_key: e.target.value }
                            })}
                            className="bg-slate-800/50 border-slate-700 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">API Secret</Label>
                          <Input
                            type="password"
                            value={newIntegration.config.api_secret}
                            onChange={(e) => setNewIntegration({ 
                              ...newIntegration, 
                              config: { ...newIntegration.config, api_secret: e.target.value }
                            })}
                            className="bg-slate-800/50 border-slate-700 text-white mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {newIntegration.config.auth_type === 'bearer' && (
                      <div>
                        <Label className="text-white">Token</Label>
                        <Input
                          type="password"
                          value={newIntegration.config.token}
                          onChange={(e) => setNewIntegration({ 
                            ...newIntegration, 
                            config: { ...newIntegration.config, token: e.target.value }
                          })}
                          className="bg-slate-800/50 border-slate-700 text-white mt-1"
                        />
                      </div>
                    )}

                    {newIntegration.config.auth_type === 'basic' && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">اسم المستخدم</Label>
                          <Input
                            value={newIntegration.config.username}
                            onChange={(e) => setNewIntegration({ 
                              ...newIntegration, 
                              config: { ...newIntegration.config, username: e.target.value }
                            })}
                            className="bg-slate-800/50 border-slate-700 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white">كلمة المرور</Label>
                          <Input
                            type="password"
                            value={newIntegration.config.password}
                            onChange={(e) => setNewIntegration({ 
                              ...newIntegration, 
                              config: { ...newIntegration.config, password: e.target.value }
                            })}
                            className="bg-slate-800/50 border-slate-700 text-white mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={() => createMutation.mutate(newIntegration)} 
                disabled={!newIntegration.name}
                className="w-full bg-purple-600 mt-4"
              >
                حفظ التكامل
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي التكاملات', value: integrations.length, color: 'purple' },
          { label: 'متصل', value: integrations.filter(i => i.status === 'active').length, color: 'green' },
          { label: 'غير متصل', value: integrations.filter(i => i.status === 'inactive').length, color: 'slate' },
          { label: 'أخطاء', value: integrations.filter(i => i.status === 'error').length, color: 'red' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integrations List */}
      <div className="space-y-4">
        {integrations.map((integration, i) => {
          const status = statusConfig[integration.status];
          const StatusIcon = status?.icon || XCircle;
          const TypeIcon = integrationTypes.find(t => t.value === integration.type)?.icon || Server;
          
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <TypeIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium flex items-center gap-2">
                          {integration.name}
                          <Badge className={status?.color}>
                            <StatusIcon className={`w-3 h-3 ml-1 ${integration.status === 'testing' ? 'animate-spin' : ''}`} />
                            {status?.label}
                          </Badge>
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {categories.find(c => c.value === integration.category)?.label} • 
                          {integrationTypes.find(t => t.value === integration.type)?.label}
                        </p>
                        {integration.config?.base_url && (
                          <p className="text-slate-500 text-xs font-mono mt-1">{integration.config.base_url}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(integration)}
                        disabled={integration.status === 'testing'}
                        className="border-slate-600 text-slate-300"
                      >
                        {integration.status === 'testing' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="mr-2">اختبار</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(integration.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {integration.error_message && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                      {integration.error_message}
                    </div>
                  )}

                  {integration.endpoints?.length > 0 && (
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value="endpoints" className="border-slate-700">
                        <AccordionTrigger className="text-slate-400 text-sm py-2">
                          Endpoints ({integration.endpoints.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {integration.endpoints.map((ep, ei) => (
                              <div key={ei} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">{ep.method || 'GET'}</Badge>
                                <span className="text-slate-300 font-mono">{ep.path}</span>
                                <span className="text-slate-500">- {ep.name}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {integrations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Plug className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد تكاملات مضافة</p>
          <Button onClick={() => setShowAddDialog(true)} className="mt-4 bg-purple-600">
            إضافة أول تكامل
          </Button>
        </div>
      )}
    </div>
  );
}