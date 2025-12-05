import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Plus, Search, RefreshCw, Download, Edit, Trash2, Play,
  Pause, Copy, MoreVertical, CheckCircle, XCircle, Clock, Activity,
  Zap, Filter as FilterIcon, ArrowRight, Settings
} from 'lucide-react';
import RuleChainBuilder from '@/components/resources/RuleChainBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const mockRuleChains = [
  { id: 'rc1', name: 'Root Rule Chain', type: 'root', status: 'active', nodes: 12, connections: 15, lastUpdated: '2025-11-01', isRoot: true },
  { id: 'rc2', name: 'Temperature Alerts', type: 'custom', status: 'active', nodes: 8, connections: 10, lastUpdated: '2025-11-05', isRoot: false },
  { id: 'rc3', name: 'Fleet Tracking', type: 'custom', status: 'active', nodes: 15, connections: 20, lastUpdated: '2025-10-28', isRoot: false },
  { id: 'rc4', name: 'Energy Monitoring', type: 'custom', status: 'inactive', nodes: 6, connections: 7, lastUpdated: '2025-10-15', isRoot: false },
  { id: 'rc5', name: 'Security Alerts', type: 'custom', status: 'active', nodes: 10, connections: 12, lastUpdated: '2025-11-02', isRoot: false },
];

const ruleNodeTypes = [
  { id: 'filter', name: 'فلتر', icon: FilterIcon, color: 'amber' },
  { id: 'enrichment', name: 'إثراء', icon: Zap, color: 'cyan' },
  { id: 'transformation', name: 'تحويل', icon: ArrowRight, color: 'purple' },
  { id: 'action', name: 'إجراء', icon: Play, color: 'green' },
  { id: 'external', name: 'خارجي', icon: Settings, color: 'rose' },
];

export default function RuleChains() {
  const [ruleChains, setRuleChains] = useState(mockRuleChains);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredRuleChains = ruleChains.filter(rc =>
    rc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: ruleChains.length,
    active: ruleChains.filter(rc => rc.status === 'active').length,
    totalNodes: ruleChains.reduce((acc, rc) => acc + rc.nodes, 0),
  };

  const toggleStatus = (id) => {
    setRuleChains(ruleChains.map(rc =>
      rc.id === id ? { ...rc, status: rc.status === 'active' ? 'inactive' : 'active' } : rc
    ));
    toast.success('تم تحديث حالة السلسلة');
  };

  return (
    <div className="min-h-screen p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-cyan-400" />
              سلاسل القواعد والأتمتة
            </h1>
            <p className="text-slate-400 mt-1">إنشاء قواعد تلقائية للاستجابة للأحداث والتنبيهات</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 ml-2" />
                سلسلة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1629] border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">إنشاء سلسلة قواعد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">اسم السلسلة</Label>
                  <Input className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="مثال: Temperature Processing" />
                </div>
                <div>
                  <Label className="text-slate-300">الوصف</Label>
                  <Input className="bg-slate-800/50 border-slate-700 text-white mt-1" placeholder="وصف السلسلة..." />
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => { setShowAddDialog(false); toast.success('تم إنشاء السلسلة'); }}>
                  إنشاء
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <GitBranch className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">إجمالي السلاسل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-slate-400 text-sm">نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalNodes}</p>
              <p className="text-slate-400 text-sm">إجمالي العقد</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mb-4">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في السلاسل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule Chains List */}
      <div className="space-y-4">
        {filteredRuleChains.map((chain, i) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 hover:border-cyan-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/20">
                      <GitBranch className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{chain.name}</h3>
                        {chain.isRoot && <Badge className="bg-amber-500/20 text-amber-400">Root</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-sm mt-1">
                        <span>{chain.nodes} عقدة</span>
                        <span>{chain.connections} اتصال</span>
                        <span>آخر تحديث: {chain.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={chain.status === 'active'}
                      onCheckedChange={() => toggleStatus(chain.id)}
                    />
                    <Badge className={chain.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {chain.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Advanced Builder */}
      <RuleChainBuilder />

      {/* Node Types Reference */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-6">
        <CardHeader>
          <CardTitle className="text-white text-sm">أنواع العقد المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ruleNodeTypes.map(node => (
              <Badge key={node.id} className={`bg-${node.color}-500/20 text-${node.color}-400`}>
                <node.icon className="w-3 h-3 ml-1" />
                {node.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}