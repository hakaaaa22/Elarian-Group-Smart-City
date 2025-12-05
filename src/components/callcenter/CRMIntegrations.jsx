import React, { useState } from 'react';
import {
  Link2, Database, FileText, Settings, CheckCircle, AlertTriangle,
  RefreshCw, ArrowLeftRight, Users, Search, Book, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const integrations = [
  { 
    id: 'salesforce', 
    name: 'Salesforce', 
    type: 'CRM',
    logo: '☁️',
    connected: true,
    syncStatus: 'active',
    lastSync: '2 دقيقة',
    features: ['جهات الاتصال', 'الفرص', 'الحالات', 'المهام'],
    bidirectional: true
  },
  { 
    id: 'hubspot', 
    name: 'HubSpot', 
    type: 'CRM',
    logo: '🧡',
    connected: true,
    syncStatus: 'active',
    lastSync: '5 دقائق',
    features: ['جهات الاتصال', 'الصفقات', 'التذاكر', 'الشركات'],
    bidirectional: true
  },
  { 
    id: 'zendesk', 
    name: 'Zendesk', 
    type: 'KB',
    logo: '📚',
    connected: false,
    syncStatus: 'inactive',
    lastSync: null,
    features: ['المقالات', 'الفئات', 'البحث'],
    bidirectional: false
  },
  { 
    id: 'confluence', 
    name: 'Confluence', 
    type: 'KB',
    logo: '📖',
    connected: true,
    syncStatus: 'active',
    lastSync: '10 دقائق',
    features: ['الصفحات', 'المساحات', 'البحث'],
    bidirectional: false
  },
  { 
    id: 'freshdesk', 
    name: 'Freshdesk', 
    type: 'KB',
    logo: '🎫',
    connected: false,
    syncStatus: 'inactive',
    lastSync: null,
    features: ['قاعدة المعرفة', 'التذاكر'],
    bidirectional: true
  },
];

const mockKBArticles = [
  { id: 1, title: 'كيفية إعادة تعيين كلمة المرور', category: 'الحساب', views: 1250 },
  { id: 2, title: 'استكشاف أخطاء الاتصال', category: 'الدعم الفني', views: 890 },
  { id: 3, title: 'سياسة الاسترجاع والاستبدال', category: 'السياسات', views: 650 },
];

export default function CRMIntegrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState(integrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfig, setShowConfig] = useState(null);

  const toggleConnection = (id) => {
    setConnectedIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected, syncStatus: !int.connected ? 'active' : 'inactive' } : int
    ));
    toast.success('تم تحديث حالة الاتصال');
  };

  const syncNow = (id) => {
    toast.success('جاري المزامنة...');
    setTimeout(() => toast.success('تمت المزامنة بنجاح'), 1500);
  };

  const searchKB = () => {
    if (!searchQuery) return;
    toast.success(`جاري البحث عن: ${searchQuery}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-400" />
          تكامل CRM وقاعدة المعرفة
        </h3>
        <Badge className="bg-green-500/20 text-green-400">
          {connectedIntegrations.filter(i => i.connected).length} متصل
        </Badge>
      </div>

      {/* Quick KB Search */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Book className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchKB()}
                placeholder="البحث السريع في قاعدة المعرفة..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <Button onClick={searchKB} className="bg-purple-600 hover:bg-purple-700">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {mockKBArticles.slice(0, 3).map(article => (
              <Badge key={article.id} className="bg-slate-700 text-slate-300 cursor-pointer hover:bg-slate-600">
                {article.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CRM Integrations */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          أنظمة CRM
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {connectedIntegrations.filter(i => i.type === 'CRM').map(int => (
            <Card key={int.id} className={`${int.connected ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.logo}</span>
                    <div>
                      <p className="text-white font-medium">{int.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={int.connected ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}>
                          {int.connected ? 'متصل' : 'غير متصل'}
                        </Badge>
                        {int.bidirectional && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                            <ArrowLeftRight className="w-3 h-3" />
                            ثنائي
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch checked={int.connected} onCheckedChange={() => toggleConnection(int.id)} />
                </div>

                {int.connected && (
                  <>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-slate-400">آخر مزامنة: {int.lastSync}</span>
                      <Button size="sm" variant="ghost" onClick={() => syncNow(int.id)}>
                        <RefreshCw className="w-3 h-3 ml-1" />
                        مزامنة
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {int.features.map(f => (
                        <Badge key={f} className="bg-slate-700 text-slate-300 text-xs">{f}</Badge>
                      ))}
                    </div>
                  </>
                )}

                {!int.connected && (
                  <Button className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700" onClick={() => toggleConnection(int.id)}>
                    <Zap className="w-4 h-4 ml-2" />
                    ربط الآن
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Knowledge Base Integrations */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Book className="w-4 h-4 text-purple-400" />
          قواعد المعرفة
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {connectedIntegrations.filter(i => i.type === 'KB').map(int => (
            <Card key={int.id} className={`${int.connected ? 'bg-purple-500/5 border-purple-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">{int.logo}</span>
                <p className="text-white font-medium">{int.name}</p>
                <Badge className={`mt-2 ${int.connected ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                  {int.connected ? 'متصل' : 'غير متصل'}
                </Badge>
                <Button 
                  size="sm" 
                  className={`w-full mt-3 ${int.connected ? 'bg-slate-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  onClick={() => toggleConnection(int.id)}
                >
                  {int.connected ? 'إعدادات' : 'ربط'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Flow Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            حالة تدفق البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">Salesforce → مركز الاتصال</span>
              </div>
              <span className="text-green-400 text-sm">نشط</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">مركز الاتصال → HubSpot</span>
              </div>
              <span className="text-green-400 text-sm">نشط</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Confluence → البحث الذكي</span>
              </div>
              <span className="text-cyan-400 text-sm">مزامنة</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}