import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import {
  GripVertical, Settings, X, Plus, Save, RotateCcw, Moon, Sun, Palette,
  LayoutGrid, Eye, EyeOff, Maximize2, Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const themes = [
  { id: 'dark', name: 'داكن', icon: Moon, colors: { bg: '#0a0e1a', card: '#0f1629', accent: '#22d3ee' } },
  { id: 'light', name: 'فاتح', icon: Sun, colors: { bg: '#f8fafc', card: '#ffffff', accent: '#0891b2' } },
  { id: 'midnight', name: 'منتصف الليل', icon: Moon, colors: { bg: '#020617', card: '#0f172a', accent: '#8b5cf6' } },
  { id: 'ocean', name: 'المحيط', icon: Palette, colors: { bg: '#0c1222', card: '#132035', accent: '#06b6d4' } },
];

export default function DraggableDashboard({ 
  widgets, 
  setWidgets, 
  availableWidgets = [],
  dashboardId = 'default',
  onSave,
  children 
}) {
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [layoutConfig, setLayoutConfig] = useState({ columns: 2, gap: 4 });
  const [hiddenWidgets, setHiddenWidgets] = useState([]);

  // تحميل التخصيصات المحفوظة
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.dashboard_configs?.[dashboardId]) {
          const config = user.dashboard_configs[dashboardId];
          if (config.widgets) setWidgets(config.widgets);
          if (config.theme) setCurrentTheme(config.theme);
          if (config.layout) setLayoutConfig(config.layout);
          if (config.hiddenWidgets) setHiddenWidgets(config.hiddenWidgets);
        }
      } catch (e) {
        console.log('No saved config');
      }
    };
    loadSavedConfig();
  }, [dashboardId]);

  // حفظ التخصيصات
  const saveConfiguration = async () => {
    try {
      const user = await base44.auth.me();
      const configs = user?.dashboard_configs || {};
      configs[dashboardId] = {
        widgets,
        theme: currentTheme,
        layout: layoutConfig,
        hiddenWidgets,
        savedAt: new Date().toISOString()
      };
      await base44.auth.updateMe({ dashboard_configs: configs });
      toast.success('تم حفظ التخصيصات');
      if (onSave) onSave(configs[dashboardId]);
    } catch (e) {
      toast.error('فشل في حفظ التخصيصات');
    }
  };

  // إعادة تعيين التخصيصات
  const resetConfiguration = async () => {
    try {
      const user = await base44.auth.me();
      const configs = user?.dashboard_configs || {};
      delete configs[dashboardId];
      await base44.auth.updateMe({ dashboard_configs: configs });
      setCurrentTheme('dark');
      setLayoutConfig({ columns: 2, gap: 4 });
      setHiddenWidgets([]);
      toast.success('تم إعادة تعيين التخصيصات');
    } catch (e) {
      toast.error('فشل في إعادة التعيين');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWidgets(items);
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const toggleWidgetVisibility = (widgetId) => {
    if (hiddenWidgets.includes(widgetId)) {
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
    } else {
      setHiddenWidgets([...hiddenWidgets, widgetId]);
    }
  };

  const addWidget = (widget) => {
    setWidgets([...widgets, { ...widget, id: `widget-${Date.now()}` }]);
    setShowAddWidget(false);
  };

  const theme = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div style={{ 
      '--dashboard-bg': theme.colors.bg,
      '--dashboard-card': theme.colors.card,
      '--dashboard-accent': theme.colors.accent
    }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={editMode ? 'default' : 'outline'}
            className={editMode ? 'bg-purple-600' : 'border-slate-600 text-slate-400'}
            onClick={() => setEditMode(!editMode)}
          >
            <LayoutGrid className="w-4 h-4 ml-1" />
            {editMode ? 'إنهاء التعديل' : 'تخصيص'}
          </Button>
          
          {editMode && (
            <>
              <Button size="sm" variant="outline" className="border-green-500 text-green-400" onClick={() => setShowAddWidget(true)}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة
              </Button>
              <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400" onClick={saveConfiguration}>
                <Save className="w-4 h-4 ml-1" />
                حفظ
              </Button>
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-400" onClick={resetConfiguration}>
                <RotateCcw className="w-4 h-4 ml-1" />
                إعادة تعيين
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <Select value={currentTheme} onValueChange={setCurrentTheme}>
            <SelectTrigger className="w-32 h-8 bg-slate-800/50 border-slate-700 text-white text-xs">
              <Palette className="w-3 h-3 ml-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <t.icon className="w-3 h-3" />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Layout Columns */}
          <Select value={layoutConfig.columns.toString()} onValueChange={(v) => setLayoutConfig({ ...layoutConfig, columns: parseInt(v) })}>
            <SelectTrigger className="w-24 h-8 bg-slate-800/50 border-slate-700 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">عمود</SelectItem>
              <SelectItem value="2">عمودين</SelectItem>
              <SelectItem value="3">3 أعمدة</SelectItem>
              <SelectItem value="4">4 أعمدة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Draggable Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-widgets">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className={`grid gap-${layoutConfig.gap}`}
              style={{ gridTemplateColumns: `repeat(${layoutConfig.columns}, 1fr)` }}
            >
              {widgets.filter(w => !hiddenWidgets.includes(w.id)).map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!editMode}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${widget.size === 'large' ? `col-span-${Math.min(layoutConfig.columns, 2)}` : ''} ${snapshot.isDragging ? 'z-50' : ''}`}
                    >
                      <motion.div
                        layout
                        className={`relative ${snapshot.isDragging ? 'ring-2 ring-purple-500' : ''}`}
                      >
                        {editMode && (
                          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-900/80 rounded px-2 py-1">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="w-4 h-4 text-slate-400" />
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400" onClick={() => toggleWidgetVisibility(widget.id)}>
                              <EyeOff className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => removeWidget(widget.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {widget.render ? widget.render() : (
                          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                            <CardContent className="p-4">
                              <p className="text-white">{widget.title || 'Widget'}</p>
                            </CardContent>
                          </Card>
                        )}
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

      {/* Hidden Widgets Indicator */}
      {hiddenWidgets.length > 0 && editMode && (
        <Card className="mt-4 bg-slate-800/50 border-slate-700">
          <CardContent className="p-3">
            <p className="text-slate-400 text-sm mb-2">عناصر مخفية ({hiddenWidgets.length})</p>
            <div className="flex flex-wrap gap-2">
              {widgets.filter(w => hiddenWidgets.includes(w.id)).map(widget => (
                <Badge key={widget.id} className="bg-slate-700 text-slate-300 cursor-pointer" onClick={() => toggleWidgetVisibility(widget.id)}>
                  <Eye className="w-3 h-3 ml-1" />
                  {widget.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">إضافة عنصر جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {availableWidgets.map(widget => (
              <Card 
                key={widget.id} 
                className="glass-card border-indigo-500/20 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50 transition-colors"
                onClick={() => addWidget(widget)}
              >
                <CardContent className="p-3 text-center">
                  {widget.icon && <widget.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />}
                  <p className="text-white text-sm">{widget.title}</p>
                  <p className="text-slate-500 text-xs">{widget.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </div>
  );
}