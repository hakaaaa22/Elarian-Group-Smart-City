import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  LayoutGrid, Plus, Save, Trash2, Settings, Eye, EyeOff, GripVertical,
  BarChart3, MessageSquare, AlertTriangle, FileText, X, Check, Edit2,
  Folder, ChevronDown, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import AIModelPerformanceInsights from '@/components/vision/AIModelPerformanceInsights';
import AISentimentAnalyzer from '@/components/ai/AISentimentAnalyzer';
import AIProactiveAnomalyDetector from '@/components/ai/AIProactiveAnomalyDetector';
import AIAutomatedReportGenerator from '@/components/ai/AIAutomatedReportGenerator';
import CollaborationPanel from '@/components/collaboration/CollaborationPanel';
import PresenceIndicator from '@/components/collaboration/PresenceIndicator';
import CommentSystem from '@/components/collaboration/CommentSystem';

const availableWidgets = [
  { id: 'performance', name: 'أداء النماذج AI', icon: BarChart3, color: 'cyan', component: AIModelPerformanceInsights },
  { id: 'sentiment', name: 'تحليل المشاعر', icon: MessageSquare, color: 'pink', component: AISentimentAnalyzer },
  { id: 'anomaly', name: 'كشف الشذوذات', icon: AlertTriangle, color: 'red', component: AIProactiveAnomalyDetector },
  { id: 'reports', name: 'إنشاء التقارير', icon: FileText, color: 'blue', component: AIAutomatedReportGenerator },
];

const defaultLayout = {
  id: 'default',
  name: 'التخطيط الافتراضي',
  widgets: ['performance', 'anomaly'],
  columns: 1
};

export default function AICustomizableDashboard() {
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem('ai_dashboard_layouts');
    return saved ? JSON.parse(saved) : [defaultLayout];
  });
  const [activeLayoutId, setActiveLayoutId] = useState(() => {
    return localStorage.getItem('ai_active_layout') || 'default';
  });
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSaveLayout, setShowSaveLayout] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingLayoutName, setEditingLayoutName] = useState(false);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedWidgetForComment, setSelectedWidgetForComment] = useState(null);
  const [currentUser, setCurrentUser] = useState({ email: 'user@example.com', name: 'المستخدم الحالي' });

  const activeLayout = layouts.find(l => l.id === activeLayoutId) || layouts[0];

  useEffect(() => {
    localStorage.setItem('ai_dashboard_layouts', JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    localStorage.setItem('ai_active_layout', activeLayoutId);
  }, [activeLayoutId]);

  const updateActiveLayout = (updates) => {
    setLayouts(prev => prev.map(l => 
      l.id === activeLayoutId ? { ...l, ...updates } : l
    ));
  };

  const addWidget = (widgetId) => {
    if (!activeLayout.widgets.includes(widgetId)) {
      updateActiveLayout({ widgets: [...activeLayout.widgets, widgetId] });
      toast.success('تمت إضافة الويدجت');
    }
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    updateActiveLayout({ widgets: activeLayout.widgets.filter(w => w !== widgetId) });
    toast.success('تم إزالة الويدجت');
  };

  const reorderWidgets = (newOrder) => {
    updateActiveLayout({ widgets: newOrder });
  };

  const saveAsNewLayout = () => {
    if (!newLayoutName.trim()) return;
    const newLayout = {
      id: `layout_${Date.now()}`,
      name: newLayoutName,
      widgets: [...activeLayout.widgets],
      columns: activeLayout.columns
    };
    setLayouts(prev => [...prev, newLayout]);
    setActiveLayoutId(newLayout.id);
    setNewLayoutName('');
    setShowSaveLayout(false);
    toast.success('تم حفظ التخطيط الجديد');
  };

  const deleteLayout = (layoutId) => {
    if (layouts.length <= 1) {
      toast.error('لا يمكن حذف التخطيط الأخير');
      return;
    }
    setLayouts(prev => prev.filter(l => l.id !== layoutId));
    if (activeLayoutId === layoutId) {
      setActiveLayoutId(layouts[0].id);
    }
    toast.success('تم حذف التخطيط');
  };

  const renameLayout = (newName) => {
    if (!newName.trim()) return;
    updateActiveLayout({ name: newName });
    setEditingLayoutName(false);
    toast.success('تم تحديث اسم التخطيط');
  };

  const openWidgetComments = (widget) => {
    setSelectedWidgetForComment(widget);
    setCommentDialogOpen(true);
  };

  // Broadcast layout changes (simulated real-time)
  const broadcastLayoutChange = (changeType, details) => {
    // In a real implementation, this would send to a WebSocket server
    console.log('Broadcasting layout change:', changeType, details);
    toast.info(`تم مشاركة التغيير: ${changeType}`);
  };

  const handleReorder = (newOrder) => {
    reorderWidgets(newOrder);
    if (collaborationEnabled) {
      broadcastLayoutChange('reorder', { newOrder });
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toolbar */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-purple-400" />
              
              {/* Presence Indicator in Toolbar */}
              <PresenceIndicator dashboardId={activeLayoutId} currentUser={currentUser} />
              
              {/* Layout Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-600 gap-2">
                    <Folder className="w-4 h-4" />
                    {editingLayoutName ? (
                      <Input
                        value={activeLayout.name}
                        onChange={(e) => updateActiveLayout({ name: e.target.value })}
                        onBlur={() => setEditingLayoutName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingLayoutName(false)}
                        className="w-32 h-6 bg-transparent border-none p-0"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{activeLayout.name}</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  {layouts.map(layout => (
                    <DropdownMenuItem
                      key={layout.id}
                      className={`flex items-center justify-between ${activeLayoutId === layout.id ? 'bg-purple-500/20' : ''}`}
                      onClick={() => setActiveLayoutId(layout.id)}
                    >
                      <span>{layout.name}</span>
                      {activeLayoutId === layout.id && <Check className="w-4 h-4 text-purple-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Edit Layout Name */}
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => setEditingLayoutName(true)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>

              <Badge className="bg-slate-700 text-slate-300">
                {activeLayout.widgets.length} ويدجت
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Columns Toggle */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg">
                <Label className="text-slate-400 text-xs">أعمدة:</Label>
                {[1, 2].map(col => (
                  <Button
                    key={col}
                    size="sm"
                    variant={activeLayout.columns === col ? 'default' : 'ghost'}
                    className={`h-6 w-6 p-0 ${activeLayout.columns === col ? 'bg-purple-600' : ''}`}
                    onClick={() => updateActiveLayout({ columns: col })}
                  >
                    {col}
                  </Button>
                ))}
              </div>

              {/* Edit Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg">
                <Label className="text-slate-400 text-xs">تحرير</Label>
                <Switch checked={editMode} onCheckedChange={setEditMode} />
              </div>

              {/* Add Widget */}
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                onClick={() => setShowAddWidget(true)}
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>

              {/* Save As */}
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                onClick={() => setShowSaveLayout(true)}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ كـ
              </Button>

              {/* Delete Layout */}
              {layouts.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => deleteLayout(activeLayoutId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets Grid */}
      {activeLayout.widgets.length === 0 ? (
        <Card className="bg-slate-800/30 border-slate-700/50 border-dashed">
          <CardContent className="p-12 text-center">
            <LayoutGrid className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">لا توجد ويدجت. أضف ويدجت لبدء تخصيص لوحة التحكم.</p>
            <Button onClick={() => setShowAddWidget(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 ml-1" />
              إضافة ويدجت
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Reorder.Group
          axis="y"
          values={activeLayout.widgets}
          onReorder={handleReorder}
          className={`grid gap-4 ${activeLayout.columns === 2 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
        >
          {activeLayout.widgets.map((widgetId) => {
            const widget = availableWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            const WidgetComponent = widget.component;

            return (
              <Reorder.Item
                key={widgetId}
                value={widgetId}
                dragListener={editMode}
                className="relative"
              >
                <motion.div layout>
                  <Card className={`bg-slate-800/30 border-slate-700/50 ${editMode ? 'ring-2 ring-purple-500/30' : ''}`}>
                    {editMode && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <div className="p-1.5 bg-slate-900/80 rounded cursor-grab">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 bg-red-500/20 hover:bg-red-500/40"
                          onClick={() => removeWidget(widgetId)}
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <widget.icon className={`w-4 h-4 text-${widget.color}-400`} />
                          {widget.name}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-cyan-400"
                          onClick={() => openWidgetComments(widget)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <WidgetComponent />
                    </CardContent>
                  </Card>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة ويدجت</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {availableWidgets.map((widget) => {
              const isAdded = activeLayout.widgets.includes(widget.id);
              return (
                <Card
                  key={widget.id}
                  className={`cursor-pointer transition-all ${
                    isAdded
                      ? 'bg-slate-700/50 border-slate-600 opacity-50'
                      : `bg-${widget.color}-500/10 border-${widget.color}-500/30 hover:border-${widget.color}-500`
                  }`}
                  onClick={() => !isAdded && addWidget(widget.id)}
                >
                  <CardContent className="p-4 text-center">
                    <widget.icon className={`w-8 h-8 mx-auto mb-2 text-${widget.color}-400`} />
                    <p className="text-white text-sm font-medium">{widget.name}</p>
                    {isAdded && <Badge className="mt-2 bg-slate-600 text-xs">مضاف</Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Layout Dialog */}
      <Dialog open={showSaveLayout} onOpenChange={setShowSaveLayout}>
        <DialogContent className="bg-[#0f1629] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">حفظ تخطيط جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">اسم التخطيط</Label>
              <Input
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="أدخل اسم التخطيط..."
                className="bg-slate-800/50 border-slate-700 mt-1"
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={saveAsNewLayout}
              disabled={!newLayoutName.trim()}
            >
              <Save className="w-4 h-4 ml-1" />
              حفظ التخطيط
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaboration Panel */}
      <CollaborationPanel
        dashboardId={activeLayoutId}
        currentUser={currentUser}
        onLayoutChange={broadcastLayoutChange}
        isCollaborationEnabled={collaborationEnabled}
        onToggleCollaboration={setCollaborationEnabled}
      />

      {/* Widget Comment Dialog */}
      <CommentSystem
        entityType="widget"
        entityId={selectedWidgetForComment?.id}
        entityTitle={selectedWidgetForComment?.name}
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
      />
    </div>
  );
}