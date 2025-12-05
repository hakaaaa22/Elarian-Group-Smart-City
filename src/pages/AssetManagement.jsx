import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Package, Plus, Search, Filter, Download, QrCode, Upload, Eye, Edit,
  Trash2, Car, Wrench, AlertTriangle, CheckCircle, Clock, MapPin, User,
  FileText, Camera, Calendar, TrendingUp, DollarSign, Activity, Shield,
  Gauge, Fuel, Battery, Radio, Radar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AssetManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filter, setFilter] = useState({ type: 'all', status: 'all', search: '' });

  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list('-created_date', 100)
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => base44.entities.WorkOrder.list('-created_date', 50)
  });

  const createAsset = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      setShowAddDialog(false);
      toast.success('تم إضافة الأصل');
    }
  });

  const decodeVIN = useMutation({
    mutationFn: async (vin) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `فك شفرة رقم VIN التالي وقدم معلومات عن المركبة: ${vin}`,
        response_json_schema: {
          type: "object",
          properties: {
            manufacturer: { type: "string" },
            model: { type: "string" },
            year: { type: "number" },
            type: { type: "string" },
            engine: { type: "string" }
          }
        }
      });
    },
    onSuccess: (data) => {
      toast.success('تم جلب بيانات المركبة');
    }
  });

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    vehicles: assets.filter(a => a.asset_type === 'vehicle').length,
  };

  const filteredAssets = assets.filter(asset => {
    if (filter.type !== 'all' && asset.asset_type !== filter.type) return false;
    if (filter.status !== 'all' && asset.status !== filter.status) return false;
    if (filter.search && !asset.name?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'amber';
      case 'inactive': return 'slate';
      case 'checked_out': return 'cyan';
      case 'lost': return 'red';
      default: return 'slate';
    }
  };

  const getLifecycleColor = (stage) => {
    switch (stage) {
      case 'new': return 'green';
      case 'operational': return 'cyan';
      case 'aging': return 'amber';
      case 'retirement_planned': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-cyan-400" />
              إدارة الأصول المتقدمة
            </h1>
            <p className="text-slate-400 mt-1">تتبع شامل للمركبات والمعدات والأصول</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-green-500 text-green-400">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة أصل
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-cyan-500/10 border-cyan-500/30">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-cyan-400 text-xs">إجمالي الأصول</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.active}</p>
            <p className="text-green-400 text-xs">نشطة</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <Wrench className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.maintenance}</p>
            <p className="text-amber-400 text-xs">تحت الصيانة</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <Car className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.vehicles}</p>
            <p className="text-purple-400 text-xs">مركبات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            placeholder="بحث..."
            className="bg-slate-800/50 border-slate-700 text-white pr-10"
          />
        </div>
        <Select value={filter.type} onValueChange={(v) => setFilter(prev => ({ ...prev, type: v }))}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="vehicle">مركبات</SelectItem>
            <SelectItem value="equipment">معدات</SelectItem>
            <SelectItem value="weapon">أسلحة</SelectItem>
            <SelectItem value="device">أجهزة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.status} onValueChange={(v) => setFilter(prev => ({ ...prev, status: v }))}>
          <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="maintenance">صيانة</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map(asset => (
          <Card key={asset.id} className={`glass-card border-${getStatusColor(asset.status)}-500/30 bg-[#0f1629]/80 cursor-pointer hover:border-cyan-500/50`} onClick={() => { setSelectedAsset(asset); setShowDetailsDialog(true); }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${getStatusColor(asset.status)}-500/20`}>
                    {asset.asset_type === 'vehicle' ? <Car className={`w-5 h-5 text-${getStatusColor(asset.status)}-400`} /> :
                     asset.asset_type === 'weapon' ? <Shield className={`w-5 h-5 text-${getStatusColor(asset.status)}-400`} /> :
                     <Package className={`w-5 h-5 text-${getStatusColor(asset.status)}-400`} />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{asset.name}</p>
                    <p className="text-slate-400 text-sm">{asset.asset_number || asset.serial_number}</p>
                  </div>
                </div>
                <Badge className={`bg-${getStatusColor(asset.status)}-500/20 text-${getStatusColor(asset.status)}-400`}>
                  {asset.status === 'active' ? 'نشط' : asset.status === 'maintenance' ? 'صيانة' : asset.status === 'checked_out' ? 'مستخدم' : 'غير نشط'}
                </Badge>
              </div>

              <div className="space-y-2">
                {asset.assigned_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="w-3 h-3" />
                    {asset.assigned_name}
                  </div>
                )}
                {asset.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {asset.location}
                  </div>
                )}
                {(asset.rfid_tag || asset.uwb_tag) && (
                  <div className="flex gap-2">
                    {asset.rfid_tag && <Badge className="bg-purple-500/20 text-purple-400 text-xs"><Radio className="w-3 h-3 ml-1" />RFID</Badge>}
                    {asset.uwb_tag && <Badge className="bg-cyan-500/20 text-cyan-400 text-xs"><Radar className="w-3 h-3 ml-1" />UWB</Badge>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#0f1629] border-slate-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              {selectedAsset?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <Tabs defaultValue="info">
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="info">المعلومات</TabsTrigger>
                <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
                <TabsTrigger value="documents">المستندات</TabsTrigger>
                <TabsTrigger value="tracking">التتبع</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded">
                    <p className="text-slate-400 text-xs">النوع</p>
                    <p className="text-white">{selectedAsset.asset_type}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded">
                    <p className="text-slate-400 text-xs">الحالة</p>
                    <Badge className={`bg-${getStatusColor(selectedAsset.status)}-500/20 text-${getStatusColor(selectedAsset.status)}-400`}>
                      {selectedAsset.status}
                    </Badge>
                  </div>
                  {selectedAsset.odometer && (
                    <div className="p-3 bg-slate-800/50 rounded">
                      <p className="text-slate-400 text-xs">عداد المسافة</p>
                      <p className="text-white">{selectedAsset.odometer?.toLocaleString()} كم</p>
                    </div>
                  )}
                  {selectedAsset.assigned_name && (
                    <div className="p-3 bg-slate-800/50 rounded">
                      <p className="text-slate-400 text-xs">معين إلى</p>
                      <p className="text-white">{selectedAsset.assigned_name}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-4">
                <div className="space-y-2">
                  {workOrders.filter(wo => wo.asset_id === selectedAsset.id).slice(0, 5).map(wo => (
                    <div key={wo.id} className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-white font-medium">{wo.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`bg-${wo.status === 'completed' ? 'green' : 'amber'}-500/20 text-${wo.status === 'completed' ? 'green' : 'amber'}-400`}>
                          {wo.status}
                        </Badge>
                        <span className="text-slate-500 text-xs">{wo.completed_date || wo.scheduled_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="mt-4">
                <div className="space-y-4">
                  {selectedAsset.rfid_tag && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">RFID Tracking</span>
                      </div>
                      <p className="text-slate-400 text-sm">معرف: {selectedAsset.rfid_tag}</p>
                    </div>
                  )}
                  {selectedAsset.uwb_tag && (
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Radar className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-medium">UWB Tracking</span>
                      </div>
                      <p className="text-slate-400 text-sm">معرف: {selectedAsset.uwb_tag}</p>
                      <p className="text-cyan-400 text-sm mt-1">دقة: 10-30 سم</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}