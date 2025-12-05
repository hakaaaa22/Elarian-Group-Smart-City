import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Route, Brain, RefreshCw, MapPin, Truck, Clock, Package, FileText,
  CheckCircle, AlertTriangle, Navigation, Target, Zap, Users, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// طلبات المواطنين التجريبية
const citizenRequests = [
  { id: 'REQ-001', type: 'report', location: 'حي الورود - شارع 12', lat: 24.7200, lng: 46.6800, priority: 'high', description: 'حاوية مكسورة' },
  { id: 'REQ-002', type: 'report', location: 'حي الورود - شارع 15', lat: 24.7205, lng: 46.6810, priority: 'medium', description: 'امتلاء زائد' },
  { id: 'REQ-003', type: 'bulk', location: 'حي الصفا - فيلا 20', lat: 24.7250, lng: 46.6550, priority: 'medium', description: 'أثاث قديم' },
  { id: 'REQ-004', type: 'report', location: 'المنتزه المركزي', lat: 24.7050, lng: 46.6900, priority: 'critical', description: 'رائحة كريهة' },
  { id: 'REQ-005', type: 'bulk', location: 'حي الصفا - شارع 8', lat: 24.7255, lng: 46.6560, priority: 'low', description: 'مخلفات حديقة' },
  { id: 'REQ-006', type: 'report', location: 'شارع الملك فهد', lat: 24.7136, lng: 46.6753, priority: 'high', description: 'حاوية ممتلئة' },
  { id: 'REQ-007', type: 'report', location: 'شارع الملك فهد - تقاطع 2', lat: 24.7140, lng: 46.6760, priority: 'medium', description: 'غطاء مكسور' },
  { id: 'REQ-008', type: 'bulk', location: 'حي الملقا', lat: 24.7300, lng: 46.6700, priority: 'medium', description: 'معدات مكتبية' },
];

const availableTrucks = [
  { id: 'TRK-001', plate: 'أ ب ج 1234', location: 'المستودع الرئيسي', capacity: 100, lat: 24.7100, lng: 46.6600 },
  { id: 'TRK-002', plate: 'د هـ و 5678', location: 'شارع العليا', capacity: 85, lat: 24.7180, lng: 46.6750 },
  { id: 'TRK-003', plate: 'ز ح ط 9012', location: 'المنطقة الصناعية', capacity: 70, lat: 24.7050, lng: 46.6850 },
];

export default function CitizenRouteOptimizer() {
  const [clusters, setClusters] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [showMap, setShowMap] = useState(true);

  // تجميع الطلبات القريبة جغرافياً
  const clusterRequests = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحليل البيانات الجغرافية، قم بتجميع طلبات المواطنين القريبة جغرافياً:

الطلبات:
${citizenRequests.map(r => `- ${r.id}: ${r.type}, ${r.location}, (${r.lat}, ${r.lng}), أولوية: ${r.priority}`).join('\n')}

قم بـ:
1. تجميع الطلبات القريبة (أقل من 1 كم) في مجموعات
2. حساب مركز كل مجموعة
3. تحديد أولوية كل مجموعة بناءً على الطلبات
4. اقتراح ترتيب زيارة المجموعات`,
        response_json_schema: {
          type: "object",
          properties: {
            clusters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clusterId: { type: "string" },
                  name: { type: "string" },
                  requests: { type: "array", items: { type: "string" } },
                  centerLat: { type: "number" },
                  centerLng: { type: "number" },
                  priority: { type: "string" },
                  totalRequests: { type: "number" },
                  estimatedTime: { type: "string" }
                }
              }
            },
            unclustered: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      setClusters(data.clusters || []);
      toast.success('تم تجميع الطلبات بنجاح');
    }
  });

  // إنشاء مسارات محسنة
  const optimizeRoutes = useMutation({
    mutationFn: async () => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `كخبير في تحسين المسارات اللوجستية، قم بإنشاء مسارات محسنة للشاحنات:

المجموعات المُجمّعة:
${clusters.map(c => `- ${c.clusterId}: ${c.name}, ${c.totalRequests} طلبات, أولوية ${c.priority}`).join('\n')}

الشاحنات المتاحة:
${availableTrucks.map(t => `- ${t.id}: موقع (${t.lat}, ${t.lng}), سعة ${t.capacity}%`).join('\n')}

قم بـ:
1. تعيين كل مجموعة لأقرب شاحنة مناسبة
2. ترتيب المجموعات في كل مسار حسب الأولوية والمسافة
3. حساب الوقت والمسافة الإجمالية
4. تقديم تقدير للوقود المستهلك`,
        response_json_schema: {
          type: "object",
          properties: {
            routes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  truckId: { type: "string" },
                  stops: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        clusterId: { type: "string" },
                        name: { type: "string" },
                        order: { type: "number" },
                        eta: { type: "string" },
                        requests: { type: "number" }
                      }
                    }
                  },
                  totalDistance: { type: "string" },
                  totalTime: { type: "string" },
                  fuelEstimate: { type: "string" }
                }
              }
            },
            totalOptimization: {
              type: "object",
              properties: {
                totalRequests: { type: "number" },
                totalDistance: { type: "string" },
                totalTime: { type: "string" },
                efficiency: { type: "number" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setOptimizedRoutes(data);
      toast.success('تم تحسين المسارات');
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'blue';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="w-5 h-5 text-purple-400" />
          تحسين المسارات للمواطنين
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1">
            <Label className="text-slate-400 text-sm">تحديث تلقائي</Label>
            <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
          </div>
          <Button variant="outline" className="border-cyan-500 text-cyan-400" onClick={() => clusterRequests.mutate()} disabled={clusterRequests.isPending}>
            {clusterRequests.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Layers className="w-4 h-4 ml-2" />}
            تجميع الطلبات
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => optimizeRoutes.mutate()} disabled={optimizeRoutes.isPending || clusters.length === 0}>
            {optimizeRoutes.isPending ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Brain className="w-4 h-4 ml-2" />}
            تحسين المسارات
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: citizenRequests.length, color: 'cyan', icon: FileText },
          { label: 'المجموعات', value: clusters.length, color: 'purple', icon: Layers },
          { label: 'الشاحنات المتاحة', value: availableTrucks.length, color: 'green', icon: Truck },
          { label: 'طلبات عاجلة', value: citizenRequests.filter(r => r.priority === 'critical' || r.priority === 'high').length, color: 'amber', icon: AlertTriangle },
        ].map(stat => (
          <Card key={stat.label} className={`bg-${stat.color}-500/10 border-${stat.color}-500/30`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-1`} />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className={`text-${stat.color}-400 text-xs`}>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Requests & Clusters */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              الطلبات والمجموعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              {clusters.length > 0 ? (
                <div className="space-y-3">
                  {clusters.map(cluster => (
                    <div key={cluster.clusterId} className={`p-3 rounded-lg bg-${getPriorityColor(cluster.priority)}-500/10 border border-${getPriorityColor(cluster.priority)}-500/30`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Layers className={`w-4 h-4 text-${getPriorityColor(cluster.priority)}-400`} />
                          <span className="text-white font-medium">{cluster.name}</span>
                        </div>
                        <Badge className={`bg-${getPriorityColor(cluster.priority)}-500/20 text-${getPriorityColor(cluster.priority)}-400`}>
                          {cluster.totalRequests} طلبات
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cluster.requests?.map(reqId => (
                          <Badge key={reqId} className="bg-slate-700 text-slate-300 text-xs">{reqId}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>الوقت المقدر: {cluster.estimatedTime}</span>
                        <span className={`text-${getPriorityColor(cluster.priority)}-400`}>
                          {cluster.priority === 'critical' ? 'حرج' : cluster.priority === 'high' ? 'عالي' : 'متوسط'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {citizenRequests.map(req => (
                    <div key={req.id} className="p-2 bg-slate-800/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {req.type === 'bulk' ? <Package className="w-4 h-4 text-purple-400" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                        <div>
                          <span className="text-white text-sm">{req.id}</span>
                          <p className="text-slate-500 text-xs">{req.location}</p>
                        </div>
                      </div>
                      <Badge className={`bg-${getPriorityColor(req.priority)}-500/20 text-${getPriorityColor(req.priority)}-400`}>
                        {req.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-400" />
              خريطة المسارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] bg-slate-800/50 rounded-lg flex items-center justify-center relative">
              {/* Map placeholder with markers */}
              <div className="absolute inset-4 border border-slate-700 rounded">
                {citizenRequests.map((req, i) => (
                  <div 
                    key={req.id}
                    className={`absolute w-3 h-3 rounded-full bg-${getPriorityColor(req.priority)}-400`}
                    style={{ 
                      top: `${20 + (i * 10) % 60}%`, 
                      left: `${15 + (i * 12) % 70}%`,
                    }}
                    title={req.location}
                  />
                ))}
                {availableTrucks.map((truck, i) => (
                  <div 
                    key={truck.id}
                    className="absolute"
                    style={{ 
                      top: `${30 + i * 25}%`, 
                      left: `${10 + i * 30}%`,
                    }}
                  >
                    <Truck className="w-5 h-5 text-cyan-400" />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-slate-400">عاجل</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-400">عالي</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400">شاحنة</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimized Routes */}
      {optimizedRoutes && (
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                المسارات المحسنة
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-400">
                <Target className="w-3 h-3 ml-1" />
                كفاءة {optimizedRoutes.totalOptimization?.efficiency || 92}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-2 bg-slate-800/50 rounded text-center">
                <p className="text-white font-bold">{optimizedRoutes.totalOptimization?.totalRequests || citizenRequests.length}</p>
                <p className="text-slate-500 text-xs">طلب</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded text-center">
                <p className="text-white font-bold">{optimizedRoutes.totalOptimization?.totalDistance || '25 كم'}</p>
                <p className="text-slate-500 text-xs">المسافة</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded text-center">
                <p className="text-white font-bold">{optimizedRoutes.totalOptimization?.totalTime || '3 ساعات'}</p>
                <p className="text-slate-500 text-xs">الوقت</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded text-center">
                <p className="text-white font-bold">{optimizedRoutes.routes?.length || 3}</p>
                <p className="text-slate-500 text-xs">مسارات</p>
              </div>
            </div>

            {/* Routes */}
            <div className="space-y-3">
              {optimizedRoutes.routes?.map((route, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">{route.truckId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-700">{route.stops?.length || 0} محطات</Badge>
                      <Badge className="bg-green-500/20 text-green-400">{route.totalTime}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {route.stops?.map((stop, j) => (
                      <div key={j} className="flex items-center">
                        <div className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                          {stop.name || stop.clusterId}
                          <span className="text-slate-500 mr-1">({stop.requests})</span>
                        </div>
                        {j < (route.stops?.length || 0) - 1 && (
                          <Navigation className="w-3 h-3 text-slate-600 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span>المسافة: {route.totalDistance}</span>
                    <span>الوقود: {route.fuelEstimate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {optimizedRoutes.recommendations?.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-xs mb-2">التوصيات</p>
                <ul className="space-y-1">
                  {optimizedRoutes.recommendations.map((rec, i) => (
                    <li key={i} className="text-white text-xs flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}