
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Grid3X3, Brain, Search as SearchIcon,
  Map, Plane, Camera, User, MessageSquare, Settings, Car, Shield, LogOut,
  ChevronLeft, ChevronRight, Bell, Menu, X, Cable, Wand2, GraduationCap,
  Users, Plug, Cpu, LayoutGrid, Palette, GitBranch, PanelTop, UserCog,
  BarChart3, Sparkles, Home, History, FileText, Wrench, Package, Phone, Calendar, Building2,
  Radio, Monitor, Headphones, Activity, ClipboardList, Keyboard, Fuel, Droplets, Leaf,
  ShoppingBag, Factory, Sun, Globe, Eye, Zap, Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/notifications/NotificationBell';
import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import EnhancedAIChatbot from '@/components/chatbot/EnhancedAIChatbot';
import OnboardingSystem from '@/components/onboarding/OnboardingSystem';
import CustomerAIChatbot from '@/components/chat/CustomerAIChatbot';

const menuItems = [
  // 1) لوحات التحكم الرئيسية
  { nameKey: 'dashboards', icon: LayoutDashboard, page: null, isGroup: true, children: [
    { nameKey: 'dashboard', icon: LayoutDashboard, page: 'Home' },
    { nameKey: 'centralDashboard', icon: Activity, page: 'CentralDashboard' },
    { nameKey: 'commandCenter', icon: Monitor, page: 'CommandCenter' },
    { nameKey: 'customDashboard', icon: LayoutGrid, page: 'CustomDashboard' },
  ]},
  
  // 2) المدينة الذكية
  { nameKey: 'smartCity', icon: Brain, page: null, isGroup: true, children: [
    { nameKey: 'smartCityBrain', icon: Brain, page: 'SmartCityBrain' },
    { nameKey: 'cityTwin', icon: Globe, page: 'CityDigitalTwin' },
    { nameKey: 'smartGovernance', icon: Building2, page: 'SmartGovernance' },
    { nameKey: 'smartTraffic', icon: Car, page: 'SmartTrafficMobility' },
    { nameKey: 'smartUtilities', icon: Droplets, page: 'SmartUtilities' },
    { nameKey: 'smartEnvironment', icon: Leaf, page: 'SmartEnvironment' },
    { nameKey: 'smartSafety', icon: Shield, page: 'SmartPublicSafety' },
    { nameKey: 'smartEducation', icon: GraduationCap, page: 'SmartEducation' },
    { nameKey: 'smartCommerce', icon: ShoppingBag, page: 'SmartCommerce' },
    { nameKey: 'smartIndustrial', icon: Factory, page: 'SmartIndustrial' },
    { nameKey: 'smartEnergy', icon: Sun, page: 'SmartEnergy' },
  ]},
  
  // 3) الخرائط والمواقع
  { nameKey: 'maps', icon: Map, page: null, isGroup: true, children: [
    { nameKey: 'smartCityMap', icon: Map, page: 'SmartCityMap' },
    { nameKey: 'unifiedMap', icon: Map, page: 'UnifiedMap' },
    { nameKey: 'indoorTracking', icon: Radio, page: 'IndoorTracking' },
  ]},
  
  // 4) الذكاء الاصطناعي والرؤية
  { nameKey: 'ai', icon: Brain, page: null, isGroup: true, children: [
    { nameKey: 'aiVision', icon: Eye, page: 'AIVisionHub' },
    { nameKey: 'aiCapabilities', icon: Brain, page: 'AICapabilities' },
    { nameKey: 'aiModels', icon: Cpu, page: 'AIModels' },
    { nameKey: 'aiTraining', icon: GraduationCap, page: 'AITraining' },
    { nameKey: 'aiInsights', icon: Sparkles, page: 'AIInsights' },
    { nameKey: 'analyticsBuilder', icon: Wand2, page: 'AnalyticsBuilder' },
    { nameKey: 'aiAssistant', icon: MessageSquare, page: 'Assistant' },
    { nameKey: 'adminAssistant', icon: Headphones, page: 'AdminAssistant' },
  ]},
  
  // 5) الكاميرات والمراقبة
  { nameKey: 'cameraAnalytics', icon: Camera, page: null, isGroup: true, children: [
    { nameKey: 'cameraProtocols', icon: Cable, page: 'CameraProtocols' },
    { nameKey: 'cameraHealth', icon: Camera, page: 'CameraHealth' },
    { nameKey: 'forensicHub', icon: SearchIcon, page: 'ForensicHub' },
    { nameKey: 'trafficIntelligence', icon: Car, page: 'TrafficIntelligence' },
    { nameKey: 'droneFusion', icon: Plane, page: 'DroneFusion' },
    { nameKey: 'modules', icon: Grid3X3, page: 'Modules' },
  ]},
  
  // 6) أجهزة IoT والأتمتة
  { nameKey: 'iot', icon: Cpu, page: null, isGroup: true, children: [
    { nameKey: 'devices', icon: Cpu, page: 'DeviceManagement' },
    { nameKey: 'deviceConfig', icon: Radio, page: 'DeviceConfiguration' },
    { nameKey: 'smartHome', icon: Home, page: 'SmartHome' },
    { nameKey: 'towerManagement', icon: Radio, page: 'TowerManagement' },
  ]},
  
  // 7) إدارة الزوار والتصاريح
  { nameKey: 'visitors', icon: Users, page: null, isGroup: true, children: [
    { nameKey: 'visitorManagement', icon: Users, page: 'VisitorManagement' },
    { nameKey: 'visitorPortal', icon: Globe, page: 'VisitorSelfServicePortal' },
  ]},
  
  // 8) الأسطول والمركبات
  { nameKey: 'fleet', icon: Car, page: null, isGroup: true, children: [
    { nameKey: 'fleetAdvanced', icon: Car, page: 'FleetAdvanced' },
    { nameKey: 'vehicleManagement', icon: Car, page: 'VehicleManagement' },
    { nameKey: 'smartRouting', icon: Car, page: 'SmartRouting' },
    { nameKey: 'fuelManagement', icon: Fuel, page: 'FuelManagement' },
  ]},
  
  // 9) النفايات والبيئة
  { nameKey: 'waste', icon: Package, page: null, isGroup: true, children: [
    { nameKey: 'wasteManagement', icon: Package, page: 'WasteManagement' },
    { nameKey: 'citizenWasteReports', icon: FileText, page: 'CitizenWasteReports' },
  ]},
  
  // 10) المخزون والمشتريات
  { nameKey: 'procurement', icon: Package, page: null, isGroup: true, children: [
    { nameKey: 'inventory', icon: Package, page: 'InventoryManagement' },
    { nameKey: 'contractors', icon: Users, page: 'ContractorManagement' },
    { nameKey: 'supplierManagement', icon: Building2, page: 'SupplierManagement' },
    { nameKey: 'assets', icon: Package, page: 'AssetManagement' },
  ]},
  
  // 11) المستشفيات والرعاية الصحية
  { nameKey: 'hospitalCommand', icon: Building2, page: 'HospitalCommandCenter' },
  
  // 12) التقارير والتحليلات
  { nameKey: 'reports', icon: BarChart3, page: null, isGroup: true, children: [
    { nameKey: 'reportsDashboard', icon: BarChart3, page: 'ReportsDashboard' },
    { nameKey: 'reportBuilder', icon: FileText, page: 'ReportBuilder' },
    { nameKey: 'advancedReports', icon: BarChart3, page: 'AdvancedReports' },
    { nameKey: 'dataAnalytics', icon: BarChart3, page: 'DataAnalytics' },
    { nameKey: 'reportsCenter', icon: FileText, page: 'ReportsCenter' },
    { nameKey: 'aiReports', icon: Brain, page: 'AIReportsManagement' },
    { nameKey: 'resourceAllocation', icon: Activity, page: 'ResourceAllocation' },
  ]},
  
  // 13) الاتصالات ومراكز الاتصال
  { nameKey: 'communication', icon: Phone, page: null, isGroup: true, children: [
    { nameKey: 'callCenter', icon: Phone, page: 'CallCenter' },
    { nameKey: 'unifiedCallCenter', icon: Headphones, page: 'UnifiedCallCenter' },
    { nameKey: 'advancedCallCenter', icon: Brain, page: 'AdvancedCallCenter' },
    { nameKey: 'communicationHub', icon: MessageSquare, page: 'CommunicationHub' },
    { nameKey: 'notificationCenter', icon: Bell, page: 'NotificationCenter' },
  ]},
  
  // 14) العمليات والصيانة
  { nameKey: 'operations', icon: Wrench, page: null, isGroup: true, children: [
    { nameKey: 'maintenance', icon: Wrench, page: 'MaintenanceTracker' },
    { nameKey: 'technicianScheduling', icon: Calendar, page: 'TechnicianScheduling' },
    { nameKey: 'technicianMobile', icon: Phone, page: 'TechnicianMobileApp' },
    { nameKey: 'hrWorkforce', icon: Users, page: 'HRWorkforce' },
  ]},
  
  // 15) الأمن والامتثال
  { nameKey: 'security', icon: Shield, page: null, isGroup: true, children: [
    { nameKey: 'cybersecurity', icon: Shield, page: 'CybersecurityMap' },
    { nameKey: 'complianceCenter', icon: Shield, page: 'ComplianceCenter' },
    { nameKey: 'auditLog', icon: History, page: 'AuditLog' },
  ]},
  
  // 16) إدارة المستخدمين والصلاحيات
  { nameKey: 'iam', icon: UserCog, page: null, isGroup: true, children: [
    { nameKey: 'userManagement', icon: UserCog, page: 'UserManagement' },
    { nameKey: 'roleManagement', icon: Shield, page: 'RoleManagement' },
    { nameKey: 'clients', icon: Users, page: 'ClientManagement' },
  ]},
  
  // 17) إدارة النظام والموارد
  { nameKey: 'resourceManagement', icon: Settings, page: null, isGroup: true, children: [
    { nameKey: 'integrations', icon: Plug, page: 'Integrations' },
    { nameKey: 'documentManagement', icon: FileText, page: 'DocumentManagement' },
    { nameKey: 'solutionTemplates', icon: Grid3X3, page: 'SolutionTemplates' },
    { nameKey: 'widgetsLibrary', icon: LayoutGrid, page: 'WidgetsLibrary' },
    { nameKey: 'ruleChains', icon: GitBranch, page: 'RuleChains' },
    { nameKey: 'dashboardBuilder', icon: PanelTop, page: 'DashboardBuilder' },
    { nameKey: 'whiteLabeling', icon: Palette, page: 'WhiteLabeling' },
  ]},
  
  // 18) الإعدادات
  { nameKey: 'settings', icon: Settings, page: null, isGroup: true, children: [
    { nameKey: 'generalSettings', icon: Settings, page: 'Settings' },
    { nameKey: 'enhancedSettings', icon: Palette, page: 'EnhancedSettings' },
    { nameKey: 'interfaceSettings', icon: Palette, page: 'InterfaceSettings' },
    { nameKey: 'advancedSettings', icon: Keyboard, page: 'AdvancedSettings' },
    { nameKey: 'systemConfig', icon: Settings, page: 'SystemConfiguration' },
    { nameKey: 'profile', icon: User, page: 'Profile' },
    { nameKey: 'advancedPreferences', icon: Sliders, page: 'AdvancedUserPreferences' },
  ]},
  
  // 19) بوابة المطورين
  { nameKey: 'developerPortal', icon: Cpu, page: 'DeveloperPortal' },
];

function LayoutContent({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(['ai']);
  const [user, setUser] = useState(null);
  const { t, isRTL } = useLanguage();

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => 
      prev.includes(groupKey) ? prev.filter(g => g !== groupKey) : [...prev, groupKey]
    );
  };

  const isGroupActive = (group) => {
    return group.children?.some(child => child.page === currentPageName);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className={`min-h-screen bg-[#0a0e1a] text-white ${isRTL ? '' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        :root {
          --bg-primary: #0a0e1a;
          --bg-secondary: #0f1629;
          --bg-card: rgba(15, 22, 41, 0.8);
          --border-color: rgba(99, 102, 241, 0.2);
          --glow-cyan: #22d3ee;
                  --glow-purple: #6366f1;
                  --glow-blue: #3b82f6;
        }
        .glass-card {
          background: linear-gradient(135deg, rgba(15, 22, 41, 0.9) 0%, rgba(15, 22, 41, 0.6) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          backdrop-filter: blur(10px);
        }
        .glow-border {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.1), inset 0 0 20px rgba(99, 102, 241, 0.05);
        }
        .neon-text {
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        .sidebar-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .sidebar-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.1), transparent);
          transition: left 0.5s ease;
        }
        .sidebar-item:hover::before {
          left: 100%;
        }
        .sidebar-item:hover {
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.15) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%);
          transform: translateX(-2px);
        }
        .sidebar-item.active {
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.25) 0%, rgba(34, 211, 238, 0.15) 50%, transparent 100%);
          border-left: 3px solid;
          border-image: linear-gradient(180deg, #a855f7, #22d3ee) 1;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
        }
        [dir="rtl"] .sidebar-item.active {
          border-left: none;
          border-right: 3px solid;
          border-image: linear-gradient(180deg, #a855f7, #22d3ee) 1;
          background: linear-gradient(-90deg, rgba(168, 85, 247, 0.25) 0%, rgba(34, 211, 238, 0.15) 50%, transparent 100%);
        }
        [dir="rtl"] .sidebar-item:hover {
          background: linear-gradient(-90deg, rgba(168, 85, 247, 0.15) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%);
          transform: translateX(2px);
        }
        .menu-icon {
          transition: all 0.3s ease;
        }
        .sidebar-item:hover .menu-icon {
          transform: scale(1.15);
          filter: drop-shadow(0 0 8px currentColor);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 0 0 30px rgba(34, 211, 238, 0.4); }
        }
        .logo-glow {
          animation: pulse-glow 3s ease-in-out infinite;
          border-radius: 12px;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f1629]/95 backdrop-blur-xl border-b border-indigo-500/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2">
              <Menu className="w-6 h-6 text-cyan-400" />
            </button>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/1b5c014af_image.png" 
              alt="Elarian Group Logo" 
              className="h-8 w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-[#0f1629] border-r border-indigo-500/20"
            >
              <div className="p-4 flex items-center justify-between border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/1b5c014af_image.png" 
                    alt="Elarian Group Logo" 
                    className="h-10 w-auto"
                  />
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100%-120px)]">
                {menuItems.map((item) => (
                  item.isGroup ? (
                    <div key={item.nameKey}>
                      <button
                        onClick={() => toggleGroup(item.nameKey)}
                        className={`sidebar-item w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                          isGroupActive(item) ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{t(item.nameKey)}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedGroups.includes(item.nameKey) ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedGroups.includes(item.nameKey) && (
                        <div className="mr-4 pr-4 border-r border-slate-700/50 space-y-1 mt-1">
                          {item.children.map(child => (
                            <Link
                              key={child.page}
                              to={createPageUrl(child.page)}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`sidebar-item flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                currentPageName === child.page ? 'active text-cyan-400' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{t(child.nameKey)}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentPageName === item.page ? 'active text-cyan-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{t(item.nameKey)}</span>
                    </Link>
                  )
                ))}
              </nav>
              <div className="p-4 border-t border-indigo-500/20">
                <LanguageSelector />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`hidden lg:flex fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-screen flex-col bg-gradient-to-b from-[#0f1629]/98 via-[#0d1225]/98 to-[#0a0e1a]/98 backdrop-blur-2xl ${isRTL ? 'border-l' : 'border-r'} border-purple-500/20 z-40 shadow-2xl shadow-purple-900/20`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-center border-b border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-transparent">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="logo-glow p-2"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930def126e302f23b0b6e3d/1b5c014af_image.png" 
              alt="Elarian Group Logo" 
              className={`${collapsed ? 'h-10' : 'h-14'} w-auto transition-all duration-500 filter brightness-110 hue-rotate-[320deg] saturate-150`}
            />
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
          {menuItems.map((item) => (
            item.isGroup ? (
              <div key={item.nameKey}>
                <button
                  onClick={() => !collapsed && toggleGroup(item.nameKey)}
                  className={`sidebar-item w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg ${
                    isGroupActive(item) ? 'text-purple-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 flex-shrink-0 menu-icon ${isGroupActive(item) ? 'text-purple-400' : ''}`} />
                    {!collapsed && <span className="truncate font-medium">{t(item.nameKey)}</span>}
                  </div>
                  {!collapsed && (
                    <motion.div
                      animate={{ rotate: expandedGroups.includes(item.nameKey) ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
                {!collapsed && expandedGroups.includes(item.nameKey) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${isRTL ? 'mr-4 pr-4 border-r' : 'ml-4 pl-4 border-l'} border-purple-500/30 space-y-1 mt-1`}
                  >
                    {item.children.map(child => (
                      <Link
                        key={child.page}
                        to={createPageUrl(child.page)}
                        className={`sidebar-item flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                          currentPageName === child.page ? 'active text-purple-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <child.icon className={`w-4 h-4 flex-shrink-0 menu-icon ${currentPageName === child.page ? 'text-purple-400' : ''}`} />
                        <span className="truncate font-medium">{t(child.nameKey)}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-lg ${
                  currentPageName === item.page ? 'active text-purple-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 menu-icon ${currentPageName === item.page ? 'text-purple-400' : ''}`} />
                {!collapsed && <span className="truncate font-medium">{t(item.nameKey)}</span>}
              </Link>
            )
          ))}
        </nav>

        {/* Language Selector */}
        <div className="px-4 py-2 border-t border-purple-500/20 bg-gradient-to-t from-purple-900/5 to-transparent">
          <LanguageSelector collapsed={collapsed} />
        </div>

        {/* User & Collapse */}
        <div className="p-4 border-t border-purple-500/20 bg-gradient-to-t from-purple-900/10 to-transparent">
          {user && !collapsed && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
              >
                <span className="text-white text-sm font-bold">
                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user.role || 'Operator'}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('logout')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-white ml-auto"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Developer Credit */}
        {!collapsed && (
          <div className="px-4 pb-4 border-t border-slate-700/30 pt-3">
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-1">Developed by</p>
              <p className="text-purple-400 font-bold text-sm">Eng. Khaled El Arian</p>
              <p className="text-slate-600 text-xs">Smart City Solutions Expert</p>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isRTL 
          ? (collapsed ? 'lg:mr-[72px]' : 'lg:mr-[260px]')
          : (collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]')
      } pt-16 lg:pt-0`}>
        {children}
      </main>

      {/* AI Chatbot */}
              <EnhancedAIChatbot />

              {/* Customer AI Chatbot */}
              <CustomerAIChatbot />

              {/* Onboarding System */}
              <OnboardingSystem currentPage={currentPageName} />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  // Landing page without layout
  if (currentPageName === 'LandingPage') {
    return children;
  }

  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}
