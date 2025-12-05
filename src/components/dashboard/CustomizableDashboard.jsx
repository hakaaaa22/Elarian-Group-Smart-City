import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Settings2, Save, RotateCcw, Loader2, Calendar, ArrowUpDown, 
  TrendingUp, TrendingDown, Zap, DollarSign, BarChart3, PieChart,
  Check, Target, Leaf, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'sonner';
import DashboardWidget from './DashboardWidget';
import WidgetCatalog, { widgetTypes } from './WidgetCatalog';
import WidgetConfigModal from './WidgetConfigModal';
import SystemOverviewWidget from './SystemOverviewWidget';
import InteractiveCharts from './InteractiveCharts';
import DashboardNotifications from './DashboardNotifications';
import AISystemHealthWidget from './AISystemHealthWidget';
import ProactiveAlertsWidget from './ProactiveAlertsWidget';
import IntegratedAIPanel from './IntegratedAIPanel';

// Time period comparison data
const comparisonData = {
  daily: {
    energy: [
      { name: 'اليوم', current: 15.2, previous: 17.8, change: -14.6 },
      { name: 'أمس', current: 17.8, previous: 16.5, change: 7.9 },
    ],
    cost: [
      { name: 'اليوم', current: 45.6, previous: 53.4, change: -14.6 },
      { name: 'أمس', current: 53.4, previous: 49.5, change: 7.9 },
    ],
    hourlyTrend: [
      { hour: '00', today: 1.2, yesterday: 1.4 },
      { hour: '04', today: 0.8, yesterday: 1.0 },
      { hour: '08', today: 2.5, yesterday: 2.8 },
      { hour: '12', today: 3.2, yesterday: 3.5 },
      { hour: '16', today: 4.1, yesterday: 4.8 },
      { hour: '20', today: 3.5, yesterday: 4.2 },
    ]
  },
  weekly: {
    energy: [
      { name: 'هذا الأسبوع', current: 98.5, previous: 112.3, change: -12.3 },
      { name: 'الأسبوع السابق', current: 112.3, previous: 105.7, change: 6.2 },
    ],
    cost: [
      { name: 'هذا الأسبوع', current: 295.5, previous: 336.9, change: -12.3 },
      { name: 'الأسبوع السابق', current: 336.9, previous: 317.1, change: 6.2 },
    ],
    dailyTrend: [
      { day: 'السبت', thisWeek: 14.2, lastWeek: 16.5 },
      { day: 'الأحد', thisWeek: 13.8, lastWeek: 15.2 },
      { day: 'الإثنين', thisWeek: 15.5, lastWeek: 17.1 },
      { day: 'الثلاثاء', thisWeek: 14.1, lastWeek: 15.8 },
      { day: 'الأربعاء', thisWeek: 13.5, lastWeek: 16.2 },
      { day: 'الخميس', thisWeek: 14.8, lastWeek: 15.5 },
      { day: 'الجمعة', thisWeek: 12.6, lastWeek: 16.0 },
    ]
  },
  monthly: {
    energy: [
      { name: 'هذا الشهر', current: 385.2, previous: 425.8, change: -9.5 },
      { name: 'الشهر السابق', current: 425.8, previous: 398.2, change: 6.9 },
    ],
    cost: [
      { name: 'هذا الشهر', current: 1155.6, previous: 1277.4, change: -9.5 },
      { name: 'الشهر السابق', current: 1277.4, previous: 1194.6, change: 6.9 },
    ],
    weeklyTrend: [
      { week: 'الأسبوع 1', thisMonth: 95.2, lastMonth: 108.5 },
      { week: 'الأسبوع 2', thisMonth: 98.5, lastMonth: 112.3 },
      { week: 'الأسبوع 3', thisMonth: 92.1, lastMonth: 105.8 },
      { week: 'الأسبوع 4', thisMonth: 99.4, lastMonth: 99.2 },
    ]
  }
};

// Saving plan impacts
const savingPlanImpacts = [
  { id: 'eco', name: 'الوضع الاقتصادي', status: 'active', savedToday: 2.8, savedMonth: 84, costSaved: 25.2, targetSaving: 25, actualSaving: 23 },
  { id: 'smart_ac', name: 'تحسين المكيف', status: 'active', savedToday: 1.5, savedMonth: 45, costSaved: 13.5, targetSaving: 15, actualSaving: 14 },
  { id: 'night_lights', name: 'إطفاء ليلي', status: 'active', savedToday: 0.8, savedMonth: 24, costSaved: 7.2, targetSaving: 10, actualSaving: 12 },
];

// Applied scenarios impact
const appliedScenarios = [
  { id: 's1', name: 'خفض درجة المكيف 2°C', appliedDate: '2024-12-01', totalSaved: 45.5, status: 'performing' },
  { id: 's2', name: 'استخدام الإضاءة الذكية', appliedDate: '2024-11-15', totalSaved: 32.8, status: 'performing' },
  { id: 's3', name: 'إيقاف الأجهزة في وضع الاستعداد', appliedDate: '2024-11-20', totalSaved: 18.2, status: 'underperforming' },
];

const defaultWidgets = [
  { id: 'w1', type: 'cameras_online', x: 0, y: 0, w: 1, h: 1 },
  { id: 'w2', type: 'active_incidents', x: 1, y: 0, w: 1, h: 1 },
  { id: 'w3', type: 'people_count', x: 2, y: 0, w: 1, h: 1 },
  { id: 'w4', type: 'traffic_index', x: 3, y: 0, w: 1, h: 1 },
  { id: 'w5', type: 'camera_feed', x: 0, y: 1, w: 2, h: 2 },
  { id: 'w6', type: 'incidents', x: 2, y: 1, w: 1, h: 2 },
  { id: 'w7', type: 'modules', x: 0, y: 3, w: 3, h: 1 },
  { id: 'w8', type: 'city_map', x: 0, y: 4, w: 2, h: 2 },
];

export default function CustomizableDashboard() {
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('daily');
  const [showSavingsImpact, setShowSavingsImpact] = useState(false);
  const queryClient = useQueryClient();

  // Calculate total savings
  const totalSavings = useMemo(() => ({
    today: savingPlanImpacts.reduce((sum, p) => sum + p.savedToday, 0),
    month: savingPlanImpacts.reduce((sum, p) => sum + p.savedMonth, 0),
    cost: savingPlanImpacts.reduce((sum, p) => sum + p.costSaved, 0)
  }), []);

  // Fetch saved layout
  const { data: savedLayouts, isLoading } = useQuery({
    queryKey: ['dashboardLayouts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DashboardLayout.filter({ created_by: user.email });
    },
  });

  // Load saved layout on mount
  useEffect(() => {
    if (savedLayouts && savedLayouts.length > 0) {
      const defaultLayout = savedLayouts.find(l => l.is_default) || savedLayouts[0];
      if (defaultLayout?.widgets) {
        setWidgets(defaultLayout.widgets);
      }
    }
  }, [savedLayouts]);

  // Save layout mutation
  const saveLayoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      const user = await base44.auth.me();
      const existingLayouts = await base44.entities.DashboardLayout.filter({ created_by: user.email });
      
      if (existingLayouts.length > 0) {
        return base44.entities.DashboardLayout.update(existingLayouts[0].id, layoutData);
      } else {
        return base44.entities.DashboardLayout.create(layoutData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardLayouts'] });
      toast.success('Dashboard layout saved!');
      setIsSaving(false);
    },
    onError: () => {
      toast.error('Failed to save layout');
      setIsSaving(false);
    }
  });

  const handleSaveLayout = () => {
    setIsSaving(true);
    saveLayoutMutation.mutate({
      name: 'My Dashboard',
      widgets: widgets,
      is_default: true
    });
  };

  const handleResetLayout = () => {
    setWidgets(defaultWidgets);
    toast.info('Dashboard reset to default');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `w${Date.now()}`,
      type: widgetType.type,
      title: widgetType.title,
      x: 0,
      y: widgets.length,
      w: widgetType.defaultSize.w,
      h: widgetType.defaultSize.h,
    };
    setWidgets([...widgets, newWidget]);
    setShowCatalog(false);
    toast.success(`Added ${widgetType.title} widget`);
  };

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    toast.info('Widget removed');
  };

  const handleResizeWidget = (widgetId, action) => {
    setWidgets(widgets.map(w => {
      if (w.id === widgetId) {
        const newW = action === 'increase' ? Math.min(w.w + 1, 4) : Math.max(w.w - 1, 1);
        return { ...w, w: newW };
      }
      return w;
    }));
  };

  const handleConfigureWidget = (widget) => {
    setConfigWidget(widget);
  };

  const handleSaveConfig = (widgetId, config) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, config } : w
    ));
    toast.success('Widget settings saved');
  };

  const getGridClass = (widget) => {
    const colSpan = `col-span-${Math.min(widget.w, 4)}`;
    const rowSpan = widget.h > 1 ? `row-span-${widget.h}` : '';
    return `${colSpan} ${rowSpan}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCatalog(true)}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLayout}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className={isEditMode ? "bg-purple-600 hover:bg-purple-700" : "border-purple-500/50 text-purple-400 hover:bg-purple-500/10"}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {isEditMode ? 'Done Editing' : 'Customize'}
          </Button>
        </div>
      </div>

      <p className="text-slate-400 mb-4">
        Unified Video Intelligence, IoT, Drones, Traffic, Telematics, Cybersecurity
      </p>

      {/* System Overview */}
      <SystemOverviewWidget />

      {/* AI System Health & Proactive Alerts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <AISystemHealthWidget />
        <ProactiveAlertsWidget />
        <IntegratedAIPanel />
      </div>

      {/* Interactive Charts & Notifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveCharts />
        </div>
        <div>
          <DashboardNotifications />
        </div>
      </div>

      {/* Quick Stats & Comparison Toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={showComparison ? "default" : "outline"}
          size="sm"
          onClick={() => { setShowComparison(!showComparison); setShowSavingsImpact(false); }}
          className={showComparison ? "bg-blue-600 hover:bg-blue-700" : "border-blue-500/50 text-blue-400"}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          مقارنة الفترات
        </Button>
        <Button
          variant={showSavingsImpact ? "default" : "outline"}
          size="sm"
          onClick={() => { setShowSavingsImpact(!showSavingsImpact); setShowComparison(false); }}
          className={showSavingsImpact ? "bg-green-600 hover:bg-green-700" : "border-green-500/50 text-green-400"}
        >
          <Leaf className="w-4 h-4 mr-2" />
          تأثير التوفير
        </Button>
      </div>

      {/* Time Period Comparison Panel */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="glass-card border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    مقارنة الفترات الزمنية
                  </CardTitle>
                  <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                    <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {/* Energy Comparison */}
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">استهلاك الطاقة</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {comparisonData[comparisonPeriod].energy[0].current} kWh
                      </span>
                      <Badge className={`${comparisonData[comparisonPeriod].energy[0].change < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                        {comparisonData[comparisonPeriod].energy[0].change < 0 ? <TrendingDown className="w-3 h-3 inline mr-1" /> : <TrendingUp className="w-3 h-3 inline mr-1" />}
                        {Math.abs(comparisonData[comparisonPeriod].energy[0].change)}%
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      مقارنة بـ {comparisonData[comparisonPeriod].energy[0].previous} kWh
                    </p>
                  </div>

                  {/* Cost Comparison */}
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">التكلفة</span>
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {comparisonData[comparisonPeriod].cost[0].current} ر.س
                      </span>
                      <Badge className={`${comparisonData[comparisonPeriod].cost[0].change < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                        {comparisonData[comparisonPeriod].cost[0].change < 0 ? <TrendingDown className="w-3 h-3 inline mr-1" /> : <TrendingUp className="w-3 h-3 inline mr-1" />}
                        {Math.abs(comparisonData[comparisonPeriod].cost[0].change)}%
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      مقارنة بـ {comparisonData[comparisonPeriod].cost[0].previous} ر.س
                    </p>
                  </div>

                  {/* Savings */}
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-300 text-sm">التوفير المحقق</span>
                      <Leaf className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-400">
                        {(comparisonData[comparisonPeriod].energy[0].previous - comparisonData[comparisonPeriod].energy[0].current).toFixed(1)} kWh
                      </span>
                    </div>
                    <p className="text-green-400/70 text-xs mt-1">
                      {(comparisonData[comparisonPeriod].cost[0].previous - comparisonData[comparisonPeriod].cost[0].current).toFixed(1)} ر.س تم توفيرها
                    </p>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={
                      comparisonPeriod === 'daily' ? comparisonData.daily.hourlyTrend :
                      comparisonPeriod === 'weekly' ? comparisonData.weekly.dailyTrend :
                      comparisonData.monthly.weeklyTrend
                    }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey={comparisonPeriod === 'daily' ? 'hour' : comparisonPeriod === 'weekly' ? 'day' : 'week'} 
                        stroke="#94a3b8" 
                        fontSize={10} 
                      />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                      <Area 
                        type="monotone" 
                        dataKey={comparisonPeriod === 'daily' ? 'yesterday' : comparisonPeriod === 'weekly' ? 'lastWeek' : 'lastMonth'} 
                        stroke="#6366f1" 
                        fill="#6366f1" 
                        fillOpacity={0.2} 
                        name="الفترة السابقة"
                      />
                      <Area 
                        type="monotone" 
                        dataKey={comparisonPeriod === 'daily' ? 'today' : comparisonPeriod === 'weekly' ? 'thisWeek' : 'thisMonth'} 
                        stroke="#22d3ee" 
                        fill="#22d3ee" 
                        fillOpacity={0.3} 
                        name="الفترة الحالية"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings Impact Panel */}
      <AnimatePresence>
        {showSavingsImpact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-400" />
                  تأثير خطط التوفير والسيناريوهات المطبقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Total Savings Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400">{totalSavings.today.toFixed(1)} kWh</p>
                    <p className="text-slate-400 text-xs">توفير اليوم</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400">{totalSavings.month} kWh</p>
                    <p className="text-slate-400 text-xs">توفير الشهر</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400">{totalSavings.cost.toFixed(1)} ر.س</p>
                    <p className="text-slate-400 text-xs">التوفير المالي</p>
                  </div>
                </div>

                {/* Active Plans */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white text-sm font-medium mb-3">خطط التوفير النشطة</h4>
                    <div className="space-y-3">
                      {savingPlanImpacts.map(plan => (
                        <div key={plan.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-white text-sm">{plan.name}</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {plan.savedToday} kWh اليوم
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Progress value={(plan.actualSaving / plan.targetSaving) * 100} className="h-2 flex-1" />
                            <span className={`text-xs ${plan.actualSaving >= plan.targetSaving ? 'text-green-400' : 'text-amber-400'}`}>
                              {plan.actualSaving}% / {plan.targetSaving}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white text-sm font-medium mb-3">السيناريوهات المطبقة</h4>
                    <div className="space-y-3">
                      {appliedScenarios.map(scenario => (
                        <div key={scenario.id} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{scenario.name}</span>
                            <Badge className={`text-xs ${
                              scenario.status === 'performing' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {scenario.status === 'performing' ? 'أداء جيد' : 'أداء منخفض'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">منذ {scenario.appliedDate}</span>
                            <span className="text-green-400">وفّر {scenario.totalSaved} kWh</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Catalog Sidebar */}
      <AnimatePresence>
        {showCatalog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCatalog(false)}
            />
            <WidgetCatalog
              onAddWidget={handleAddWidget}
              onClose={() => setShowCatalog(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Widget Config Modal */}
      <AnimatePresence>
        {configWidget && (
          <WidgetConfigModal
            widget={configWidget}
            onSave={handleSaveConfig}
            onClose={() => setConfigWidget(null)}
          />
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]"
            >
              {widgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${getGridClass(widget)} ${snapshot.isDragging ? 'z-50' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        gridColumn: `span ${Math.min(widget.w, 4)}`,
                        gridRow: widget.h > 1 ? `span ${widget.h}` : undefined,
                      }}
                    >
                      <motion.div
                        layout
                        className={`h-full ${isEditMode ? 'ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[#0a0e1a] rounded-xl' : ''}`}
                      >
                        <DashboardWidget
                          widget={widget}
                          isEditMode={isEditMode}
                          onRemove={handleRemoveWidget}
                          onResize={handleResizeWidget}
                          onConfigure={handleConfigureWidget}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </motion.div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {isEditMode && widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-slate-800/50 mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-white font-medium mb-2">No widgets yet</h3>
          <p className="text-slate-400 mb-4">Click "Add Widget" to start building your dashboard</p>
          <Button
            onClick={() => setShowCatalog(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}
    </div>
  );
}