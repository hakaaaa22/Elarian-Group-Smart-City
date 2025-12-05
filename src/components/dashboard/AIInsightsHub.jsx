import React, { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Brain, Search, Filter, Clock, AlertTriangle, CheckCircle, TrendingUp,
  Truck, Package, Wrench, Users, Zap, Eye, RefreshCw, ChevronRight,
  Calendar, SortAsc, SortDesc, X, Lightbulb, Target, Activity, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// جميع التنبيهات والرؤى من المساعدين المختلفين
const allInsights = [
  { id: 1, source: 'driver', type: 'route', priority: 'high', title: 'تحسين مسار TRK-001', description: 'فرصة توفير 15 دقيقة بتغيير المسار', time: '2024-12-04 10:30', status: 'pending', action: 'FleetAdvanced' },
  { id: 2, source: 'ai_model', type: 'prediction', priority: 'critical', title: 'توقع ارتفاع النفايات', description: 'زيادة متوقعة 25% في الأسبوع القادم', time: '2024-12-04 09:15', status: 'new', action: 'WasteManagement' },
  { id: 3, source: 'maintenance', type: 'alert', priority: 'high', title: 'صيانة تنبؤية - TRK-003', description: 'المحرك يحتاج فحص خلال 48 ساعة', time: '2024-12-04 08:45', status: 'acknowledged', action: 'FleetAdvanced' },
  { id: 4, source: 'reports', type: 'insight', priority: 'medium', title: 'نمط جديد في المرور', description: 'اكتشاف نمط ازدحام جديد في المنطقة الشمالية', time: '2024-12-04 08:00', status: 'pending', action: 'TrafficIntelligence' },
  { id: 5, source: 'ai_model', type: 'anomaly', priority: 'high', title: 'شذوذ في استهلاك الوقود', description: 'شاحنة TRK-002 تستهلك 18% أكثر', time: '2024-12-04 07:30', status: 'new', action: 'FleetAdvanced' },
  { id: 6, source: 'driver', type: 'traffic', priority: 'medium', title: 'تحديث حركة المرور', description: 'حادث على الدائري الشرقي - تأخير 20 دقيقة', time: '2024-12-04 07:00', status: 'resolved', action: 'SmartCityMap' },
  { id: 7, source: 'reports', type: 'kpi', priority: 'low', title: 'تقرير الأداء الأسبوعي', description: 'تحسن الكفاءة بنسبة 5%', time: '2024-12-03 18:00', status: 'resolved', action: 'ReportsDashboard' },
  { id: 8, source: 'maintenance', type: 'alert', priority: 'medium', title: 'جدولة صيانة دورية', description: '5 مركبات تحتاج صيانة هذا الأسبوع', time: '2024-12-03 16:00', status: 'pending', action: 'MaintenanceTracker' },
];

const sourceConfig = {
  driver: { name: 'مساعد السائق', icon: Truck, color: 'cyan' },
  ai_model: { name: 'نماذج AI', icon: Brain, color: 'purple' },
  maintenance: { name: 'الصيانة', icon: Wrench, color: 'amber' },
  reports: { name: 'التقارير', icon: Activity, color: 'green' },
};

const typeConfig = {
  route: { name: 'مسار', color: 'cyan' },
  prediction: { name: 'تنبؤ', color: 'purple' },
  alert: { name: 'تنبيه', color: 'red' },
  insight: { name: 'رؤية', color: 'green' },
  anomaly: { name: 'شذوذ', color: 'amber' },
  traffic: { name: 'مرور', color: 'blue' },
  kpi: { name: 'مؤشر', color: 'emerald' },
};

export default function AIInsightsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [insights, setInsights] = useState(allInsights);

  // تصفية الرؤى
  const filteredInsights = useMemo(() => {
    return insights
      .filter(insight => {
        const matchesSearch = searchQuery === '' || 
          insight.title.includes(searchQuery) || 
          insight.description.includes(searchQuery);
        const matchesSource = filterSource === 'all' || insight.source === filterSource;
        const matchesPriority = filterPriority === 'all' || insight.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || insight.status === filterStatus;
        
        // تصفية الوقت
        let matchesTime = true;
        if (filterTime !== 'all') {
          const insightDate = new Date(insight.time);
          const now = new Date();
          if (filterTime === 'today') {
            matchesTime = insightDate.toDateString() === now.toDateString();
          } else if (filterTime === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            matchesTime = insightDate >= weekAgo;
          }
        }
        
        return matchesSearch && matchesSource && matchesPriority && matchesStatus && matchesTime;
      })
      .sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [insights, searchQuery, filterSource, filterPriority, filterStatus, filterTime, sortOrder]);

  // تحديث حالة الرؤية
  const updateInsightStatus = (id, newStatus) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    toast.success('تم تحديث الحالة');
  };

  // تحليل AI للرؤى
  const analyzeInsights = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `قم بتحليل الرؤى والتنبيهات التالية وتقديم ملخص وتوصيات:
${filteredInsights.map(i => `- ${i.title}: ${i.description} (أولوية: ${i.priority})`).join('\n')}

قدم:
1. ملخص الوضع الحالي
2. الأنماط المكتشفة
3. التوصيات العاجلة
4. الإجراءات المقترحة`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            urgentActions: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: () => toast.success('تم تحليل الرؤى')
  });

  const stats = {
    total: insights.length,
    critical: insights.filter(i => i.priority === 'critical').length,
    pending: insights.filter(i => i.status === 'pending' || i.status === 'new').length,
    resolved: insights.filter(i => i.status === 'resolved').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSource('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterTime('all');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'yellow';
      default: return 'slate';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return { label: 'جديد', color: 'cyan' };
      case 'pending': return { label: 'معلق', color: 'amber' };
      case 'acknowledged': return { label: 'تم الاطلاع', color: 'blue' };
      case 'resolved': return { label: 'محلول', color: 'green' };
      default: return { label: status, color: 'slate' };
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          مركز رؤى AI الموحد
        </h3>
        <Button variant="outline" className="border-purple-500 text-purple-400" onClick={() => analyzeInsights.mutate()} disabled={analyzeInsights.isPending}>
          {analyzeInsights.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
          تحليل ذكي
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400 text-xs">إجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-red-400 text-xs">حرج</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-amber-400 text-xs">معلق</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
            <p className="text-green-400 text-xs">محلول</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في التنبيهات والرؤى..."
                className="pr-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {/* Filters */}
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(sourceConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="acknowledged">تم الاطلاع</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTime} onValueChange={setFilterTime}>
              <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="الوقت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </Button>

            {(searchQuery || filterSource !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterTime !== 'all') && (
              <Button variant="ghost" size="sm" className="text-slate-400" onClick={clearFilters}>
                <X className="w-4 h-4 ml-1" />
                مسح
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          <AnimatePresence>
            {filteredInsights.map(insight => {
              const source = sourceConfig[insight.source];
              const type = typeConfig[insight.type];
              const SourceIcon = source?.icon || Brain;
              const statusBadge = getStatusBadge(insight.status);

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className={`glass-card border-${getPriorityColor(insight.priority)}-500/30 bg-${getPriorityColor(insight.priority)}-500/5 hover:border-${getPriorityColor(insight.priority)}-500/50 transition-colors`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${source?.color || 'slate'}-500/20`}>
                          <SourceIcon className={`w-4 h-4 text-${source?.color || 'slate'}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium text-sm truncate">{insight.title}</p>
                            <Badge className={`bg-${type?.color || 'slate'}-500/20 text-${type?.color || 'slate'}-400 text-xs`}>
                              {type?.name}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs mb-2 line-clamp-1">{insight.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`bg-${statusBadge.color}-500/20 text-${statusBadge.color}-400 text-xs`}>
                              {statusBadge.label}
                            </Badge>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(insight.time).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-slate-600 text-xs">{source?.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={`bg-${getPriorityColor(insight.priority)}-500/20 text-${getPriorityColor(insight.priority)}-400 text-xs`}>
                            {insight.priority === 'critical' ? 'حرج' : insight.priority === 'high' ? 'عالي' : insight.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                          <div className="flex gap-1">
                            {insight.status !== 'resolved' && (
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-green-400" onClick={() => updateInsightStatus(insight.id, 'resolved')}>
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Link to={createPageUrl(insight.action)}>
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-cyan-400">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredInsights.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد نتائج مطابقة</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}