import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart, Activity, Settings, Save, Plus, X,
  Eye, EyeOff, Move, Palette, Grid, Maximize2, Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

const chartTypes = [
  { id: 'line', name: 'خطي', icon: TrendingUp },
  { id: 'area', name: 'مساحة', icon: Activity },
  { id: 'bar', name: 'أعمدة', icon: BarChart3 },
  { id: 'pie', name: 'دائري', icon: PieChart },
];

const colorPalettes = [
  { id: 'cyan', colors: ['#22d3ee', '#06b6d4', '#0891b2'] },
  { id: 'purple', colors: ['#a855f7', '#9333ea', '#7c3aed'] },
  { id: 'green', colors: ['#22c55e', '#16a34a', '#15803d'] },
  { id: 'amber', colors: ['#f59e0b', '#d97706', '#b45309'] },
  { id: 'mixed', colors: ['#22d3ee', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'] },
];

const availableMetrics = [
  { id: 'sentiment', name: 'تحليل المشاعر', category: 'ai' },
  { id: 'intent', name: 'نية الشراء', category: 'ai' },
  { id: 'churn', name: 'خطر المغادرة', category: 'ai' },
  { id: 'satisfaction', name: 'رضا العملاء', category: 'kpi' },
  { id: 'resolution', name: 'معدل الحل', category: 'kpi' },
  { id: 'response_time', name: 'سرعة الاستجابة', category: 'kpi' },
  { id: 'calls_handled', name: 'المكالمات المعالجة', category: 'operational' },
  { id: 'conversion', name: 'معدل التحويل', category: 'sales' },
];

export default function AdvancedChartDesigner({ onSaveChart, existingCharts = [] }) {
  const [charts, setCharts] = useState(existingCharts);
  const [editingChart, setEditingChart] = useState(null);
  const [showDesigner, setShowDesigner] = useState(false);

  const [chartConfig, setChartConfig] = useState({
    name: '',
    type: 'line',
    metrics: [],
    palette: 'cyan',
    height: 250,
    showLegend: true,
    showGrid: true,
    animated: true,
    position: charts.length,
    visible: true,
  });

  const addMetric = (metricId) => {
    if (!chartConfig.metrics.includes(metricId)) {
      setChartConfig(prev => ({
        ...prev,
        metrics: [...prev.metrics, metricId]
      }));
    }
  };

  const removeMetric = (metricId) => {
    setChartConfig(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m !== metricId)
    }));
  };

  const saveChart = () => {
    if (!chartConfig.name || chartConfig.metrics.length === 0) {
      toast.error('أدخل اسم الرسم البياني واختر مقياس واحد على الأقل');
      return;
    }

    const newChart = { ...chartConfig, id: editingChart?.id || Date.now().toString() };
    
    if (editingChart) {
      setCharts(prev => prev.map(c => c.id === editingChart.id ? newChart : c));
    } else {
      setCharts(prev => [...prev, newChart]);
    }

    onSaveChart?.(newChart);
    resetForm();
    toast.success('تم حفظ الرسم البياني');
  };

  const resetForm = () => {
    setChartConfig({
      name: '',
      type: 'line',
      metrics: [],
      palette: 'cyan',
      height: 250,
      showLegend: true,
      showGrid: true,
      animated: true,
      position: charts.length,
      visible: true,
    });
    setEditingChart(null);
    setShowDesigner(false);
  };

  const editChart = (chart) => {
    setChartConfig(chart);
    setEditingChart(chart);
    setShowDesigner(true);
  };

  const deleteChart = (chartId) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
    toast.success('تم حذف الرسم البياني');
  };

  const toggleChartVisibility = (chartId) => {
    setCharts(prev => prev.map(c => 
      c.id === chartId ? { ...c, visible: !c.visible } : c
    ));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h4 className="text-white font-bold">مصمم الرسوم البيانية</h4>
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowDesigner(true)}
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة رسم بياني
        </Button>
      </div>

      {/* Existing Charts List */}
      {charts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {charts.map(chart => {
            const ChartIcon = chartTypes.find(t => t.id === chart.type)?.icon || BarChart3;
            return (
              <Card key={chart.id} className={`bg-slate-800/30 border-slate-700/50 ${!chart.visible ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ChartIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">{chart.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleChartVisibility(chart.id)}>
                        {chart.visible ? <Eye className="w-3 h-3 text-green-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => editChart(chart)}>
                        <Settings className="w-3 h-3 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteChart(chart.id)}>
                        <X className="w-3 h-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chart.metrics.map(m => (
                      <Badge key={m} variant="outline" className="text-xs border-slate-600">
                        {availableMetrics.find(am => am.id === m)?.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Designer Panel */}
      {showDesigner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  {editingChart ? 'تعديل الرسم البياني' : 'إنشاء رسم بياني جديد'}
                </span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-xs">اسم الرسم البياني</Label>
                  <Input
                    value={chartConfig.name}
                    onChange={(e) => setChartConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white h-8"
                    placeholder="مثال: اتجاهات المشاعر"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">نوع الرسم</Label>
                  <Select value={chartConfig.type} onValueChange={(v) => setChartConfig(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {chartTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <span className="flex items-center gap-2">
                            <type.icon className="w-3 h-3" />
                            {type.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Metrics Selection */}
              <div>
                <Label className="text-slate-300 text-xs mb-2 block">المقاييس</Label>
                <div className="flex flex-wrap gap-2">
                  {availableMetrics.map(metric => {
                    const isSelected = chartConfig.metrics.includes(metric.id);
                    return (
                      <Button
                        key={metric.id}
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-7 text-xs ${isSelected ? 'bg-purple-600' : 'border-slate-600'}`}
                        onClick={() => isSelected ? removeMetric(metric.id) : addMetric(metric.id)}
                      >
                        {metric.name}
                        {isSelected && <X className="w-3 h-3 mr-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <Label className="text-slate-300 text-xs mb-2 block">لوحة الألوان</Label>
                <div className="flex gap-2">
                  {colorPalettes.map(palette => (
                    <Button
                      key={palette.id}
                      size="sm"
                      variant="outline"
                      className={`h-8 px-2 ${chartConfig.palette === palette.id ? 'border-purple-500' : 'border-slate-600'}`}
                      onClick={() => setChartConfig(prev => ({ ...prev, palette: palette.id }))}
                    >
                      <div className="flex gap-0.5">
                        {palette.colors.slice(0, 3).map((color, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <Label className="text-slate-300 text-xs">إظهار الشبكة</Label>
                  <Switch checked={chartConfig.showGrid} onCheckedChange={(v) => setChartConfig(prev => ({ ...prev, showGrid: v }))} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <Label className="text-slate-300 text-xs">إظهار المفتاح</Label>
                  <Switch checked={chartConfig.showLegend} onCheckedChange={(v) => setChartConfig(prev => ({ ...prev, showLegend: v }))} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <Label className="text-slate-300 text-xs">متحرك</Label>
                  <Switch checked={chartConfig.animated} onCheckedChange={(v) => setChartConfig(prev => ({ ...prev, animated: v }))} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <Label className="text-slate-300 text-xs">مرئي</Label>
                  <Switch checked={chartConfig.visible} onCheckedChange={(v) => setChartConfig(prev => ({ ...prev, visible: v }))} />
                </div>
              </div>

              {/* Height */}
              <div>
                <Label className="text-slate-300 text-xs mb-2 block">الارتفاع: {chartConfig.height}px</Label>
                <Slider
                  value={[chartConfig.height]}
                  onValueChange={(v) => setChartConfig(prev => ({ ...prev, height: v[0] }))}
                  min={150}
                  max={400}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={saveChart}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الرسم البياني
                </Button>
                <Button variant="outline" className="border-slate-600" onClick={resetForm}>
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