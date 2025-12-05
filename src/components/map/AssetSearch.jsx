import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Camera, Trash2, Radio, Car, Building2, MapPin, Filter,
  X, ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// جميع الأصول
const allAssets = [
  // Cameras
  { id: 'CAM-001', name: 'كاميرا المدخل الرئيسي', type: 'camera', status: 'online', zone: 'المركز', lat: 24.7136, lng: 46.6753 },
  { id: 'CAM-002', name: 'كاميرا الموقف A', type: 'camera', status: 'online', zone: 'المركز', lat: 24.7150, lng: 46.6780 },
  { id: 'CAM-003', name: 'كاميرا المنطقة الصناعية', type: 'camera', status: 'warning', zone: 'الصناعية', lat: 24.7080, lng: 46.6820 },
  { id: 'CAM-004', name: 'كاميرا الحديقة', type: 'camera', status: 'offline', zone: 'الشمال', lat: 24.7200, lng: 46.6700 },
  // Towers
  { id: 'TWR-001', name: 'برج الاتصالات المركزي', type: 'tower', status: 'online', zone: 'المركز', lat: 24.7136, lng: 46.6753 },
  { id: 'TWR-002', name: 'برج المنطقة الشرقية', type: 'tower', status: 'warning', zone: 'الشرق', lat: 24.7200, lng: 46.6900 },
  { id: 'TWR-003', name: 'برج المراقبة الجنوبي', type: 'tower', status: 'critical', zone: 'الجنوب', lat: 24.7000, lng: 46.6600 },
  // Bins
  { id: 'BIN-001', name: 'حاوية الشارع الرئيسي', type: 'waste_bin', status: 'warning', zone: 'المركز', lat: 24.7140, lng: 46.6760, fillLevel: 85 },
  { id: 'BIN-002', name: 'حاوية المجمع التجاري', type: 'waste_bin', status: 'online', zone: 'المركز', lat: 24.7160, lng: 46.6790, fillLevel: 45 },
  // Vehicles
  { id: 'VEH-001', name: 'سيارة الدورية 1', type: 'vehicle', status: 'online', zone: 'الشمال', lat: 24.7180, lng: 46.6800 },
  { id: 'VEH-002', name: 'شاحنة النفايات 3', type: 'vehicle', status: 'online', zone: 'المركز', lat: 24.7120, lng: 46.6740 },
];

const assetTypes = [
  { id: 'camera', name: 'كاميرات', icon: Camera, color: 'purple' },
  { id: 'tower', name: 'أبراج', icon: Radio, color: 'cyan' },
  { id: 'waste_bin', name: 'حاويات', icon: Trash2, color: 'green' },
  { id: 'vehicle', name: 'مركبات', icon: Car, color: 'amber' },
];

const statusOptions = [
  { id: 'online', name: 'متصل', color: 'green' },
  { id: 'warning', name: 'تحذير', color: 'amber' },
  { id: 'critical', name: 'حرج', color: 'red' },
  { id: 'offline', name: 'غير متصل', color: 'slate' },
];

const zones = ['الكل', 'المركز', 'الشمال', 'الجنوب', 'الشرق', 'الصناعية'];

export default function AssetSearch({ onAssetSelect, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('الكل');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredAssets = useMemo(() => {
    return allAssets.filter(asset => {
      // Search query
      if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase()) && !asset.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(asset.type)) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) {
        return false;
      }
      // Zone filter
      if (selectedZone !== 'الكل' && asset.zone !== selectedZone) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedTypes, selectedStatus, selectedZone]);

  const toggleType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const getAssetIcon = (type) => {
    const assetType = assetTypes.find(t => t.id === type);
    return assetType?.icon || MapPin;
  };

  const getAssetColor = (type) => {
    const assetType = assetTypes.find(t => t.id === type);
    return assetType?.color || 'slate';
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.id === status);
    return statusOption?.color || 'slate';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatus('all');
    setSelectedZone('الكل');
  };

  const activeFiltersCount = selectedTypes.length + (selectedStatus !== 'all' ? 1 : 0) + (selectedZone !== 'الكل' ? 1 : 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث عن أصل بالاسم أو المعرف..."
          className="bg-slate-800 border-slate-700 pr-10 text-white"
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Quick Type Filters */}
      <div className="flex flex-wrap gap-2">
        {assetTypes.map(type => {
          const Icon = type.icon;
          const isSelected = selectedTypes.includes(type.id);
          return (
            <Button
              key={type.id}
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              className={isSelected ? `bg-${type.color}-600` : 'border-slate-600'}
              onClick={() => toggleType(type.id)}
            >
              <Icon className="w-3 h-3 ml-1" />
              {type.name}
            </Button>
          );
        })}
      </div>

      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-slate-400"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <Filter className="w-4 h-4 ml-2" />
        فلاتر متقدمة
        {activeFiltersCount > 0 && (
          <Badge className="mr-2 bg-cyan-500/20 text-cyan-400">{activeFiltersCount}</Badge>
        )}
        <ChevronRight className={`w-4 h-4 mr-auto transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
      </Button>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">الحالة</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">الكل</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">المنطقة</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" className="text-red-400" onClick={clearFilters}>
                <X className="w-3 h-3 ml-1" />
                مسح الفلاتر
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {filteredAssets.length} نتيجة
        </span>
        {selectedStatus === 'warning' && (
          <Badge className="bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-3 h-3 ml-1" />
            عرض التحذيرات فقط
          </Badge>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAssets.map(asset => {
          const Icon = getAssetIcon(asset.type);
          const typeColor = getAssetColor(asset.type);
          const statusColor = getStatusColor(asset.status);

          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] bg-slate-800/50 border-slate-700 hover:border-${typeColor}-500/50`}
              onClick={() => onAssetSelect?.(asset)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${typeColor}-500/20`}>
                  <Icon className={`w-4 h-4 text-${typeColor}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-xs font-mono">{asset.id}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 text-xs">{asset.zone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-${statusColor}-500 ${asset.status === 'warning' || asset.status === 'critical' ? 'animate-pulse' : ''}`} />
                  <Badge className={`bg-${statusColor}-500/20 text-${statusColor}-400 text-xs`}>
                    {statusOptions.find(s => s.id === asset.status)?.name}
                  </Badge>
                </div>
              </div>

              {/* Additional Info for specific types */}
              {asset.type === 'waste_bin' && asset.fillLevel && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">مستوى الامتلاء</span>
                    <span className={`font-bold ${asset.fillLevel > 80 ? 'text-red-400' : asset.fillLevel > 60 ? 'text-amber-400' : 'text-green-400'}`}>
                      {asset.fillLevel}%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {filteredAssets.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">لا توجد نتائج</p>
            <p className="text-slate-500 text-sm">جرب تعديل معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
}