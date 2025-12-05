import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code, Copy, Check, Eye, Building2, Heart, Shield, Key, Lock,
  Globe, Zap, BookOpen, Terminal, Play, ChevronDown, ChevronRight,
  FileJson, Database, Server, Webhook, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const apiEndpoints = {
  ai_vision: {
    name: 'AI Vision API',
    icon: Eye,
    color: 'purple',
    baseUrl: '/api/v1/ai-vision',
    endpoints: [
      {
        method: 'GET',
        path: '/models',
        description: 'قائمة جميع نماذج AI المتاحة',
        params: [
          { name: 'category', type: 'string', required: false, description: 'تصفية حسب الفئة' },
          { name: 'status', type: 'string', required: false, description: 'تصفية حسب الحالة (active, inactive)' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "face-recognition",
      "name": "التعرف على الوجوه",
      "category": "people_analytics",
      "accuracy": 98.5,
      "status": "active"
    }
  ],
  "total": 200
}`
      },
      {
        method: 'GET',
        path: '/detections',
        description: 'استرجاع أحدث الكشوفات',
        params: [
          { name: 'camera_id', type: 'string', required: false, description: 'معرف الكاميرا' },
          { name: 'type', type: 'string', required: false, description: 'نوع الكشف' },
          { name: 'limit', type: 'number', required: false, description: 'عدد النتائج (افتراضي: 50)' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "det_123",
      "camera_id": "cam_001",
      "type": "weapon_detection",
      "confidence": 95.2,
      "timestamp": "2024-12-04T10:30:00Z"
    }
  ]
}`
      },
      {
        method: 'POST',
        path: '/analyze',
        description: 'تحليل صورة أو فيديو',
        params: [
          { name: 'file', type: 'file', required: true, description: 'ملف الصورة أو الفيديو' },
          { name: 'models', type: 'array', required: true, description: 'قائمة النماذج المطلوبة' }
        ],
        response: `{
  "success": true,
  "analysis_id": "ana_456",
  "results": [
    {
      "model": "face-recognition",
      "detections": [...],
      "confidence": 97.8
    }
  ]
}`
      }
    ]
  },
  municipality: {
    name: 'Municipality API',
    icon: Building2,
    color: 'amber',
    baseUrl: '/api/v1/municipality',
    endpoints: [
      {
        method: 'GET',
        path: '/bins',
        description: 'قائمة الحاويات الذكية',
        params: [
          { name: 'status', type: 'string', required: false, description: 'الحالة (normal, needs_collection, alert)' },
          { name: 'type', type: 'string', required: false, description: 'نوع النفايات' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "bin_001",
      "location": "شارع الملك فهد",
      "fill_level": 85,
      "status": "needs_collection",
      "last_collection": "2024-12-03T08:30:00Z"
    }
  ]
}`
      },
      {
        method: 'GET',
        path: '/lights',
        description: 'حالة إنارة الشوارع',
        params: [
          { name: 'zone', type: 'string', required: false, description: 'المنطقة' },
          { name: 'status', type: 'string', required: false, description: 'الحالة (on, off, fault)' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "light_001",
      "zone": "A",
      "status": "on",
      "brightness": 80,
      "energy_consumption": 150
    }
  ]
}`
      },
      {
        method: 'POST',
        path: '/lights/{id}/control',
        description: 'التحكم بإنارة معينة',
        params: [
          { name: 'action', type: 'string', required: true, description: 'الإجراء (on, off, dim)' },
          { name: 'brightness', type: 'number', required: false, description: 'مستوى السطوع (0-100)' }
        ],
        response: `{
  "success": true,
  "message": "تم تحديث حالة الإنارة"
}`
      }
    ]
  },
  hospital: {
    name: 'Hospital API',
    icon: Heart,
    color: 'pink',
    baseUrl: '/api/v1/hospital',
    endpoints: [
      {
        method: 'GET',
        path: '/patients',
        description: 'قائمة المرضى',
        params: [
          { name: 'department', type: 'string', required: false, description: 'القسم' },
          { name: 'status', type: 'string', required: false, description: 'الحالة' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "pat_001",
      "mrn": "MRN123456",
      "name": "أحمد محمد",
      "department": "ICU",
      "admission_date": "2024-12-01"
    }
  ]
}`
      },
      {
        method: 'GET',
        path: '/beds',
        description: 'حالة الأسرة',
        params: [
          { name: 'ward', type: 'string', required: false, description: 'الجناح' },
          { name: 'status', type: 'string', required: false, description: 'الحالة (available, occupied)' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "bed_001",
      "ward": "ICU",
      "room": "101",
      "status": "occupied",
      "patient_id": "pat_001"
    }
  ],
  "summary": {
    "total": 450,
    "occupied": 352,
    "available": 98
  }
}`
      },
      {
        method: 'GET',
        path: '/medications',
        description: 'مخزون الأدوية',
        params: [
          { name: 'category', type: 'string', required: false, description: 'الفئة' },
          { name: 'low_stock', type: 'boolean', required: false, description: 'المخزون المنخفض فقط' }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "med_001",
      "name": "الأنسولين",
      "category": "hormonal",
      "quantity": 45,
      "reorder_level": 50,
      "status": "low_stock"
    }
  ]
}`
      }
    ]
  }
};

const codeExamples = {
  javascript: `// JavaScript / Node.js
const response = await fetch('https://api.smartcity.sa/api/v1/ai-vision/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`,

  python: `# Python
import requests

response = requests.get(
    'https://api.smartcity.sa/api/v1/ai-vision/models',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)
data = response.json()
print(data)`,

  curl: `# cURL
curl -X GET 'https://api.smartcity.sa/api/v1/ai-vision/models' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`
};

export default function PublicAPIDocumentation() {
  const [selectedModule, setSelectedModule] = useState('ai_vision');
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedText, setCopiedText] = useState(null);
  const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxx');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success('تم النسخ');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const module = apiEndpoints[selectedModule];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-cyan-400" />
            Public API Documentation
          </h2>
          <p className="text-slate-400 text-sm">واجهة برمجة التطبيقات للتكامل مع أنظمة خارجية</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
          <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" />
          API v1.0
        </Badge>
      </div>

      {/* API Key Section */}
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">مفتاح API الخاص بك</p>
                <p className="text-amber-400/70 text-sm">استخدم هذا المفتاح في جميع الطلبات</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={apiKey}
                readOnly
                className="bg-slate-800/50 border-slate-700 text-white w-64 font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(apiKey, 'apiKey')}
                className="border-amber-500/50 text-amber-400"
              >
                {copiedText === 'apiKey' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Object.entries(apiEndpoints).map(([key, mod]) => (
          <Button
            key={key}
            variant={selectedModule === key ? 'default' : 'outline'}
            onClick={() => setSelectedModule(key)}
            className={selectedModule === key ? `bg-${mod.color}-600` : 'border-slate-600'}
          >
            <mod.icon className="w-4 h-4 ml-2" />
            {mod.name}
          </Button>
        ))}
      </div>

      {/* Base URL */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Base URL:</span>
              <code className="text-cyan-400 font-mono">https://api.smartcity.sa{module.baseUrl}</code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(`https://api.smartcity.sa${module.baseUrl}`, 'baseUrl')}
              className="text-slate-400"
            >
              {copiedText === 'baseUrl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-3">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          Endpoints
        </h3>
        {module.endpoints.map((endpoint, i) => (
          <Card key={i} className="glass-card border-indigo-500/20 bg-[#0f1629]/80 overflow-hidden">
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                    endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                    endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-white font-mono text-sm">{endpoint.path}</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">{endpoint.description}</span>
                  {expandedEndpoint === i ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expandedEndpoint === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-slate-700"
                >
                  <div className="p-4 space-y-4">
                    {/* Parameters */}
                    {endpoint.params.length > 0 && (
                      <div>
                        <h4 className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                          <FileJson className="w-4 h-4" />
                          Parameters
                        </h4>
                        <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                          {endpoint.params.map((param, j) => (
                            <div key={j} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <code className="text-cyan-400">{param.name}</code>
                                <Badge className="bg-slate-700 text-slate-300 text-xs">{param.type}</Badge>
                                {param.required && <Badge className="bg-red-500/20 text-red-400 text-xs">مطلوب</Badge>}
                              </div>
                              <span className="text-slate-500">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-slate-400 text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          Response
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(endpoint.response, `response-${i}`)}
                          className="text-slate-400 h-7"
                        >
                          {copiedText === `response-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-green-400">{endpoint.response}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Code Examples */}
      <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            أمثلة الكود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code, lang)}
                    className="absolute top-2 left-2 text-slate-400"
                  >
                    {copiedText === lang ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-cyan-400 text-sm">{code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="glass-card border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Webhook className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Webhooks</p>
              <p className="text-purple-400/70 text-sm">استقبل إشعارات فورية عند حدوث أحداث معينة</p>
            </div>
            <Button variant="outline" className="border-purple-500/50 text-purple-400">
              <Settings className="w-4 h-4 ml-2" />
              إعداد Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}