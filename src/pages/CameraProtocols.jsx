import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cable, Plus, Upload, Check, X, Loader2, Settings, Trash2,
  Camera, Wifi, Globe, Lock, Play, Pause, Brain, Sparkles, 
  AlertTriangle, CheckCircle, Lightbulb, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const defaultProtocols = [
  { name: 'RTSP', type: 'rtsp', port: 554, url_template: 'rtsp://{ip}:{port}/{stream}', auth_type: 'digest' },
  { name: 'ONVIF', type: 'onvif', port: 80, url_template: 'http://{ip}:{port}/onvif/device_service', auth_type: 'digest' },
  { name: 'RTMP', type: 'rtmp', port: 1935, url_template: 'rtmp://{ip}:{port}/live/{stream}', auth_type: 'none' },
  { name: 'HLS', type: 'hls', port: 8080, url_template: 'http://{ip}:{port}/{stream}/playlist.m3u8', auth_type: 'none' },
  { name: 'WebRTC', type: 'webrtc', port: 8443, url_template: 'wss://{ip}:{port}/stream/{id}', auth_type: 'token' },
];

const protocolIcons = {
  rtsp: Camera,
  onvif: Settings,
  rtmp: Play,
  hls: Globe,
  webrtc: Wifi,
  http: Globe,
  custom: Cable,
};

const compatibleCameras = {
  rtsp: ['Hikvision', 'Dahua', 'Axis', 'Bosch', 'Hanwha', 'Vivotek'],
  onvif: ['Hikvision', 'Dahua', 'Axis', 'Bosch', 'Hanwha', 'Sony', 'Panasonic'],
  rtmp: ['Generic IP Cameras', 'Encoders', 'Streaming Devices'],
  hls: ['Cloud Cameras', 'Web Cameras', 'Mobile Devices'],
  webrtc: ['Modern IP Cameras', 'IoT Devices', 'Browser-based'],
};

export default function CameraProtocols() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    name: '', type: 'custom', port: 80, url_template: '', auth_type: 'none'
  });
  const [configFile, setConfigFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: protocols = [], isLoading } = useQuery({
    queryKey: ['cameraProtocols'],
    queryFn: () => base44.entities.CameraProtocol.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CameraProtocol.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameraProtocols'] });
      toast.success('تم إضافة البروتوكول بنجاح');
      setShowAddDialog(false);
      setNewProtocol({ name: '', type: 'custom', port: 80, url_template: '', auth_type: 'none' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CameraProtocol.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameraProtocols'] });
      toast.success('تم حذف البروتوكول');
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Advanced AI analysis for protocol configuration
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في بروتوكولات الكاميرات والشبكات. قم بتحليل ملف تكوين البروتوكول هذا بشكل شامل.

اسم الملف: ${file.name}

المطلوب:
1. استخراج جميع تفاصيل البروتوكول
2. استنتاج أي معلمات مفقودة بناءً على نوع البروتوكول
3. اقتراح الإعدادات المثلى للأداء والأمان
4. التحقق من التوافق مع الكاميرات الشائعة
5. تحديد أي مشاكل محتملة أو تحسينات مقترحة

قدم تحليلاً شاملاً مع توصيات.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            port: { type: "number" },
            url_template: { type: "string" },
            auth_type: { type: "string" },
            description: { type: "string" },
            inferred_parameters: {
              type: "object",
              properties: {
                timeout: { type: "number" },
                retry_count: { type: "number" },
                buffer_size: { type: "number" },
                encoding: { type: "string" }
              }
            },
            optimal_settings: {
              type: "object",
              properties: {
                recommended_port: { type: "number" },
                recommended_auth: { type: "string" },
                security_level: { type: "string" },
                performance_tips: { type: "array", items: { type: "string" } }
              }
            },
            compatibility: {
              type: "object",
              properties: {
                compatible_brands: { type: "array", items: { type: "string" } },
                incompatible_brands: { type: "array", items: { type: "string" } },
                compatibility_score: { type: "number" }
              }
            },
            validation: {
              type: "object",
              properties: {
                is_valid: { type: "boolean" },
                issues: { type: "array", items: { type: "string" } },
                warnings: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAiAnalysis(result);
      setNewProtocol({
        name: result.name || '',
        type: result.type || 'custom',
        port: result.optimal_settings?.recommended_port || result.port || 80,
        url_template: result.url_template || '',
        auth_type: result.optimal_settings?.recommended_auth || result.auth_type || 'none'
      });
      
      // Store learned protocol pattern
      if (result.name) {
        await base44.entities.CameraProtocol.create({
          ...result,
          status: 'testing',
          config_schema: {
            inferred: result.inferred_parameters,
            optimal: result.optimal_settings,
            compatibility: result.compatibility
          }
        });
        queryClient.invalidateQueries({ queryKey: ['cameraProtocols'] });
        toast.success('تم تحليل البروتوكول وإضافته للتعلم');
      }
    } catch (error) {
      toast.error('فشل في تحليل الملف');
    }
    setIsUploading(false);
    setIsAnalyzing(false);
  };

  const initializeDefaults = async () => {
    for (const protocol of defaultProtocols) {
      await base44.entities.CameraProtocol.create({ ...protocol, status: 'active' });
    }
    queryClient.invalidateQueries({ queryKey: ['cameraProtocols'] });
    toast.success('تم إضافة البروتوكولات الافتراضية');
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
              <Cable className="w-8 h-8 text-cyan-400" />
              بروتوكولات الكاميرات
            </h1>
            <p className="text-slate-400 mt-1">إدارة وإضافة بروتوكولات الاتصال بالكاميرات</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={initializeDefaults}
              className="border-slate-600 text-slate-300"
            >
              تحميل الافتراضي
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400" asChild>
                <span>
                  {isUploading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                  رفع ملف بروتوكول
                </span>
              </Button>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".json,.xml,.yaml,.conf" />
            </label>
            <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setAiAnalysis(null); }}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة بروتوكول
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0f1629] border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    إضافة بروتوكول جديد (مدعوم بالذكاء الاصطناعي)
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* AI File Upload Section */}
                  <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">تحليل ذكي للملفات</span>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-cyan-500/50 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                          <span className="text-cyan-400 text-sm">جاري التحليل بالذكاء الاصطناعي...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                          <span className="text-slate-400 text-sm">ارفع ملف البروتوكول (JSON, YAML, XML)</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept=".json,.yaml,.yml,.xml,.conf" onChange={handleFileUpload} disabled={isAnalyzing} />
                    </label>
                  </div>

                  {/* AI Analysis Results */}
                  <AnimatePresence>
                    {aiAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                      >
                        {/* Validation Status */}
                        <div className={`p-3 rounded-lg border ${aiAnalysis.validation?.is_valid ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {aiAnalysis.validation?.is_valid ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-amber-400" />
                            )}
                            <span className={`font-medium ${aiAnalysis.validation?.is_valid ? 'text-green-400' : 'text-amber-400'}`}>
                              {aiAnalysis.validation?.is_valid ? 'البروتوكول صالح' : 'يوجد تحذيرات'}
                            </span>
                          </div>
                          {aiAnalysis.validation?.warnings?.length > 0 && (
                            <ul className="text-amber-400/80 text-sm space-y-1">
                              {aiAnalysis.validation.warnings.map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Compatibility */}
                        {aiAnalysis.compatibility && (
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-400 text-sm">التوافق</span>
                              <Badge className="bg-cyan-500/20 text-cyan-400">
                                {aiAnalysis.compatibility.compatibility_score}%
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {aiAnalysis.compatibility.compatible_brands?.map((brand, i) => (
                                <Badge key={i} variant="outline" className="text-green-400 border-green-500/30 text-xs">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {aiAnalysis.validation?.suggestions?.length > 0 && (
                          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 text-sm font-medium">اقتراحات التحسين</span>
                            </div>
                            <ul className="text-slate-300 text-sm space-y-1">
                              {aiAnalysis.validation.suggestions.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Optimal Settings */}
                        {aiAnalysis.optimal_settings?.performance_tips?.length > 0 && (
                          <div className="p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-amber-400" />
                              <span className="text-amber-400 text-sm font-medium">نصائح الأداء</span>
                            </div>
                            <ul className="text-slate-300 text-sm space-y-1">
                              {aiAnalysis.optimal_settings.performance_tips.map((t, i) => (
                                <li key={i}>• {t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="border-t border-slate-700 pt-4">
                    <Label className="text-slate-400 text-xs mb-2 block">أو أدخل يدوياً</Label>
                  </div>
                  
                  <div>
                    <Label className="text-white">اسم البروتوكول</Label>
                    <Input
                      value={newProtocol.name}
                      onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">النوع</Label>
                    <Select value={newProtocol.type} onValueChange={(v) => setNewProtocol({ ...newProtocol, type: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="rtsp">RTSP</SelectItem>
                        <SelectItem value="onvif">ONVIF</SelectItem>
                        <SelectItem value="rtmp">RTMP</SelectItem>
                        <SelectItem value="hls">HLS</SelectItem>
                        <SelectItem value="webrtc">WebRTC</SelectItem>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="custom">مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">المنفذ</Label>
                    <Input
                      type="number"
                      value={newProtocol.port}
                      onChange={(e) => setNewProtocol({ ...newProtocol, port: parseInt(e.target.value) })}
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">قالب URL</Label>
                    <Input
                      value={newProtocol.url_template}
                      onChange={(e) => setNewProtocol({ ...newProtocol, url_template: e.target.value })}
                      placeholder="rtsp://{ip}:{port}/{stream}"
                      className="bg-slate-800/50 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">نوع المصادقة</Label>
                    <Select value={newProtocol.auth_type} onValueChange={(v) => setNewProtocol({ ...newProtocol, auth_type: v })}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="none">بدون</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="digest">Digest</SelectItem>
                        <SelectItem value="token">Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => createMutation.mutate({ ...newProtocol, status: 'active' })} className="w-full bg-cyan-600">
                    حفظ البروتوكول
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((protocol, i) => {
          const Icon = protocolIcons[protocol.type] || Cable;
          return (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{protocol.name}</h3>
                        <p className="text-slate-400 text-sm">{protocol.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <Badge className={`${protocol.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {protocol.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">المنفذ:</span>
                      <span className="text-white">{protocol.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">المصادقة:</span>
                      <span className="text-white">{protocol.auth_type || 'none'}</span>
                    </div>
                    {protocol.url_template && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-300 font-mono break-all">
                        {protocol.url_template}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => deleteMutation.mutate(protocol.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {protocols.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Cable className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">لا توجد بروتوكولات مضافة</p>
          <Button onClick={initializeDefaults} className="mt-4 bg-cyan-600">
            تحميل البروتوكولات الافتراضية
          </Button>
        </div>
      )}
    </div>
  );
}