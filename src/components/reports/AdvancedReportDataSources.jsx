import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Upload, Database, Link, FileSpreadsheet, Plus, Trash2, Settings,
  CheckCircle, AlertCircle, Loader2, Eye, Merge, Table, Grid3X3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const dataSourceTypes = [
  { id: 'csv', name: 'ملف CSV', icon: FileSpreadsheet, color: 'green' },
  { id: 'api', name: 'API خارجي', icon: Link, color: 'blue' },
  { id: 'crm', name: 'بيانات CRM', icon: Database, color: 'purple' },
];

const mergeStrategies = [
  { id: 'inner', name: 'تقاطع (Inner Join)', description: 'فقط السجلات المتطابقة' },
  { id: 'left', name: 'يسار (Left Join)', description: 'كل سجلات CRM + المتطابقة من الخارجي' },
  { id: 'full', name: 'كامل (Full Join)', description: 'كل السجلات من المصدرين' },
  { id: 'append', name: 'إلحاق (Append)', description: 'إضافة الصفوف الجديدة' },
];

export default function AdvancedReportDataSources({ onDataSourcesChange }) {
  const [dataSources, setDataSources] = useState([
    { id: 'crm_default', type: 'crm', name: 'بيانات CRM الأساسية', status: 'connected', fields: ['customer_id', 'name', 'email', 'value'] }
  ]);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({ type: 'csv', name: '', config: {} });
  const [mergeConfig, setMergeConfig] = useState({ strategy: 'left', keyField: 'customer_id' });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              customer_id: { type: "string" },
              metric1: { type: "number" },
              metric2: { type: "number" },
              category: { type: "string" }
            }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setPreviewData(data.output);
        toast.success('تم تحميل الملف بنجاح');
      }
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      uploadFileMutation.mutate(file);
    }
  };

  const addDataSource = () => {
    const source = {
      id: `source_${Date.now()}`,
      ...newSource,
      status: 'connected',
      fields: previewData ? Object.keys(previewData[0] || {}) : []
    };
    const updated = [...dataSources, source];
    setDataSources(updated);
    onDataSourcesChange?.(updated);
    setShowAddSource(false);
    setNewSource({ type: 'csv', name: '', config: {} });
    setPreviewData(null);
    toast.success('تم إضافة مصدر البيانات');
  };

  const removeSource = (sourceId) => {
    if (sourceId === 'crm_default') return;
    const updated = dataSources.filter(s => s.id !== sourceId);
    setDataSources(updated);
    onDataSourcesChange?.(updated);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h5 className="text-white font-medium flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          مصادر البيانات
        </h5>
        <Button size="sm" className="bg-cyan-600 h-7" onClick={() => setShowAddSource(true)}>
          <Plus className="w-3 h-3 ml-1" />
          إضافة مصدر
        </Button>
      </div>

      {/* Connected Sources */}
      <div className="space-y-2">
        {dataSources.map(source => {
          const typeConfig = dataSourceTypes.find(t => t.id === source.type);
          const Icon = typeConfig?.icon || Database;
          return (
            <div key={source.id} className={`p-3 bg-${typeConfig?.color}-500/10 border border-${typeConfig?.color}-500/30 rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${typeConfig?.color}-400`} />
                  <span className="text-white text-sm font-medium">{source.name}</span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    متصل
                  </Badge>
                </div>
                {source.id !== 'crm_default' && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSource(source.id)}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {source.fields?.slice(0, 5).map(field => (
                  <Badge key={field} variant="outline" className="text-xs border-slate-600">{field}</Badge>
                ))}
                {source.fields?.length > 5 && (
                  <Badge variant="outline" className="text-xs border-slate-600">+{source.fields.length - 5}</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Merge Configuration */}
      {dataSources.length > 1 && (
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Merge className="w-4 h-4 text-purple-400" />
              إعدادات الدمج
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-400 text-xs">استراتيجية الدمج</Label>
                <Select value={mergeConfig.strategy} onValueChange={(v) => setMergeConfig(prev => ({ ...prev, strategy: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {mergeStrategies.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400 text-xs">حقل المطابقة</Label>
                <Select value={mergeConfig.keyField} onValueChange={(v) => setMergeConfig(prev => ({ ...prev, keyField: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="customer_id">customer_id</SelectItem>
                    <SelectItem value="email">email</SelectItem>
                    <SelectItem value="phone">phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Source Panel */}
      {showAddSource && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {dataSourceTypes.filter(t => t.id !== 'crm').map(type => (
                  <Button
                    key={type.id}
                    variant={newSource.type === type.id ? 'default' : 'outline'}
                    className={`h-16 flex-col ${newSource.type === type.id ? `bg-${type.color}-600` : 'border-slate-600'}`}
                    onClick={() => setNewSource(prev => ({ ...prev, type: type.id }))}
                  >
                    <type.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{type.name}</span>
                  </Button>
                ))}
              </div>

              <Input
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم مصدر البيانات"
                className="bg-slate-900 border-slate-700 text-white"
              />

              {newSource.type === 'csv' && (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {uploadFileMutation.isPending ? (
                      <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    )}
                    <p className="text-slate-400 text-sm mt-2">اسحب ملف CSV أو انقر للتحميل</p>
                  </label>
                </div>
              )}

              {newSource.type === 'api' && (
                <div className="space-y-2">
                  <Input
                    placeholder="رابط API"
                    className="bg-slate-900 border-slate-700 text-white"
                    onChange={(e) => setNewSource(prev => ({ ...prev, config: { ...prev.config, url: e.target.value } }))}
                  />
                  <Input
                    placeholder="API Key (اختياري)"
                    className="bg-slate-900 border-slate-700 text-white"
                    onChange={(e) => setNewSource(prev => ({ ...prev, config: { ...prev.config, apiKey: e.target.value } }))}
                  />
                </div>
              )}

              {previewData && (
                <div className="p-2 bg-slate-900 rounded">
                  <p className="text-green-400 text-xs mb-1">معاينة: {previewData.length} صف</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(previewData[0] || {}).map(key => (
                      <Badge key={key} className="text-xs bg-slate-700">{key}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-cyan-600" onClick={addDataSource} disabled={!newSource.name}>
                  إضافة
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={() => setShowAddSource(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}