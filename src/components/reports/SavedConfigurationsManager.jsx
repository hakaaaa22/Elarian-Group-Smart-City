import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, FolderOpen, Trash2, Copy, Star, Clock, Download, Upload,
  CheckCircle, Settings, Eye, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SavedConfigurationsManager({ currentConfig, onLoadConfig }) {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_reports_saved_configs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);

  const saveConfiguration = () => {
    if (!configName.trim()) {
      toast.error('أدخل اسم التكوين');
      return;
    }

    const newConfig = {
      id: Date.now().toString(),
      name: configName,
      description: configDescription,
      isFavorite,
      config: currentConfig,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ai_reports_saved_configs', JSON.stringify(updatedConfigs));
    
    setConfigName('');
    setConfigDescription('');
    setIsFavorite(false);
    setShowSaveDialog(false);
    toast.success('تم حفظ التكوين بنجاح');
  };

  const loadConfiguration = (config) => {
    onLoadConfig?.(config.config);
    
    // Update last used
    const updatedConfigs = savedConfigs.map(c => 
      c.id === config.id ? { ...c, lastUsed: new Date().toISOString() } : c
    );
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ai_reports_saved_configs', JSON.stringify(updatedConfigs));
    
    toast.success(`تم تحميل: ${config.name}`);
  };

  const deleteConfiguration = (configId) => {
    const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ai_reports_saved_configs', JSON.stringify(updatedConfigs));
    toast.success('تم حذف التكوين');
  };

  const toggleFavorite = (configId) => {
    const updatedConfigs = savedConfigs.map(c => 
      c.id === configId ? { ...c, isFavorite: !c.isFavorite } : c
    );
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ai_reports_saved_configs', JSON.stringify(updatedConfigs));
  };

  const duplicateConfiguration = (config) => {
    const duplicate = {
      ...config,
      id: Date.now().toString(),
      name: `${config.name} (نسخة)`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    const updatedConfigs = [...savedConfigs, duplicate];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('ai_reports_saved_configs', JSON.stringify(updatedConfigs));
    toast.success('تم نسخ التكوين');
  };

  const exportConfigurations = () => {
    const dataStr = JSON.stringify(savedConfigs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ai_reports_configs.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('تم تصدير التكوينات');
  };

  const importConfigurations = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result);
          const merged = [...savedConfigs, ...imported.map(c => ({ ...c, id: Date.now().toString() + Math.random() }))];
          setSavedConfigs(merged);
          localStorage.setItem('ai_reports_saved_configs', JSON.stringify(merged));
          toast.success('تم استيراد التكوينات');
        } catch {
          toast.error('خطأ في قراءة الملف');
        }
      };
      reader.readAsText(file);
    }
  };

  const sortedConfigs = [...savedConfigs].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-cyan-400" />
          <h4 className="text-white font-bold">التكوينات المحفوظة</h4>
          <Badge className="bg-slate-700 text-slate-300">{savedConfigs.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-slate-600" onClick={exportConfigurations}>
            <Download className="w-3 h-3 ml-1" />
            تصدير
          </Button>
          <label>
            <Button size="sm" variant="outline" className="border-slate-600" asChild>
              <span>
                <Upload className="w-3 h-3 ml-1" />
                استيراد
              </span>
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importConfigurations} />
          </label>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowSaveDialog(true)}>
            <Save className="w-3 h-3 ml-1" />
            حفظ الحالي
          </Button>
        </div>
      </div>

      {/* Saved Configurations List */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          {savedConfigs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">لا توجد تكوينات محفوظة</p>
              <p className="text-xs mt-1">احفظ تكوينك الحالي لاستخدامه لاحقاً</p>
            </div>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {sortedConfigs.map(config => (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={() => toggleFavorite(config.id)}
                          >
                            <Star className={`w-3 h-3 ${config.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                          </Button>
                          <span className="text-white font-medium text-sm">{config.name}</span>
                        </div>
                        {config.description && (
                          <p className="text-slate-400 text-xs mt-1 mr-7">{config.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 mr-7 text-slate-500 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(config.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                          {config.lastUsed && (
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              آخر استخدام: {new Date(config.lastUsed).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => loadConfiguration(config)}>
                          <Eye className="w-3 h-3 ml-1" />
                          تحميل
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => duplicateConfiguration(config)}>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteConfiguration(config.id)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-cyan-400" />
              حفظ التكوين الحالي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300 text-sm">اسم التكوين</Label>
              <Input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                placeholder="مثال: تكوين تقارير المبيعات"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">الوصف (اختياري)</Label>
              <Textarea
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
                placeholder="وصف مختصر للتكوين..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isFavorite ? 'default' : 'outline'}
                className={isFavorite ? 'bg-amber-600' : 'border-slate-600'}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={`w-3 h-3 ml-1 ${isFavorite ? 'fill-white' : ''}`} />
                مفضل
              </Button>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={saveConfiguration}>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
              <Button variant="outline" className="border-slate-600" onClick={() => setShowSaveDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}