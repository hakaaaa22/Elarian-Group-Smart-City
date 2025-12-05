import Layout from "./Layout.jsx";

import Home from "./Home";

import IncidentCenter from "./IncidentCenter";

import Modules from "./Modules";

import AIModels from "./AIModels";

import SmartCityMap from "./SmartCityMap";

import DroneFusion from "./DroneFusion";

import CameraHealth from "./CameraHealth";

import TrafficIntelligence from "./TrafficIntelligence";

import CybersecurityMap from "./CybersecurityMap";

import FleetTelematics from "./FleetTelematics";

import ForensicHub from "./ForensicHub";

import Assistant from "./Assistant";

import Settings from "./Settings";

import Profile from "./Profile";

import Notifications from "./Notifications";

import AICapabilities from "./AICapabilities";

import CameraProtocols from "./CameraProtocols";

import AITraining from "./AITraining";

import AnalyticsBuilder from "./AnalyticsBuilder";

import ClientManagement from "./ClientManagement";

import Integrations from "./Integrations";

import DeviceManagement from "./DeviceManagement";

import SolutionTemplates from "./SolutionTemplates";

import WidgetsLibrary from "./WidgetsLibrary";

import WhiteLabeling from "./WhiteLabeling";

import RuleChains from "./RuleChains";

import DashboardBuilder from "./DashboardBuilder";

import UserManagement from "./UserManagement";

import DataAnalytics from "./DataAnalytics";

import AIInsights from "./AIInsights";

import SmartHome from "./SmartHome";

import VisitorManagement from "./VisitorManagement";

import ReportBuilder from "./ReportBuilder";

import AuditLog from "./AuditLog";

import MaintenanceTracker from "./MaintenanceTracker";

import InventoryManagement from "./InventoryManagement";

import ContractorManagement from "./ContractorManagement";

import VehicleManagement from "./VehicleManagement";

import AINotificationSettings from "./AINotificationSettings";

import AdvancedReports from "./AdvancedReports";

import TechnicianScheduling from "./TechnicianScheduling";

import TechnicianMobileApp from "./TechnicianMobileApp";

import SupplierManagement from "./SupplierManagement";

import CallCenter from "./CallCenter";

import SmartCity from "./SmartCity";

import WasteManagement from "./WasteManagement";

import SmartRouting from "./SmartRouting";

import AdminAssistant from "./AdminAssistant";

import CommunicationHub from "./CommunicationHub";

import ComplianceCenter from "./ComplianceCenter";

import CommandCenter from "./CommandCenter";

import FleetAdvanced from "./FleetAdvanced";

import HRWorkforce from "./HRWorkforce";

import DeviceConfiguration from "./DeviceConfiguration";

import UnifiedCallCenter from "./UnifiedCallCenter";

import CentralDashboard from "./CentralDashboard";

import CitizenWasteReports from "./CitizenWasteReports";

import ReportsDashboard from "./ReportsDashboard";

import RoleManagement from "./RoleManagement";

import AdvancedSettings from "./AdvancedSettings";

import AssetManagement from "./AssetManagement";

import IndoorTracking from "./IndoorTracking";

import FuelManagement from "./FuelManagement";

import HospitalCommandCenter from "./HospitalCommandCenter";

import SmartCityBrain from "./SmartCityBrain";

import SmartTrafficMobility from "./SmartTrafficMobility";

import SmartUtilities from "./SmartUtilities";

import SmartEnvironment from "./SmartEnvironment";

import SmartGovernance from "./SmartGovernance";

import SmartPublicSafety from "./SmartPublicSafety";

import SmartEducation from "./SmartEducation";

import SmartCommerce from "./SmartCommerce";

import SmartIndustrial from "./SmartIndustrial";

import SmartEnergy from "./SmartEnergy";

import CityDigitalTwin from "./CityDigitalTwin";

import AIVisionHub from "./AIVisionHub";

import AdvancedUserPreferences from "./AdvancedUserPreferences";

import LandingPage from "./LandingPage";

import DeveloperPortal from "./DeveloperPortal";

import TowerManagement from "./TowerManagement";

import UnifiedMap from "./UnifiedMap";

import CustomDashboard from "./CustomDashboard";

import SystemConfiguration from "./SystemConfiguration";

import DocumentManagement from "./DocumentManagement";

import NotificationCenter from "./NotificationCenter";

import InterfaceSettings from "./InterfaceSettings";

import LiveMapDashboard from "./LiveMapDashboard";

import VisitorSelfServicePortal from "./VisitorSelfServicePortal";

import ResourceAllocation from "./ResourceAllocation";

import ReportsCenter from "./ReportsCenter";

import AdvancedCallCenter from "./AdvancedCallCenter";

import EnhancedSettings from "./EnhancedSettings";

import AIReportsManagement from "./AIReportsManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    IncidentCenter: IncidentCenter,
    
    Modules: Modules,
    
    AIModels: AIModels,
    
    SmartCityMap: SmartCityMap,
    
    DroneFusion: DroneFusion,
    
    CameraHealth: CameraHealth,
    
    TrafficIntelligence: TrafficIntelligence,
    
    CybersecurityMap: CybersecurityMap,
    
    FleetTelematics: FleetTelematics,
    
    ForensicHub: ForensicHub,
    
    Assistant: Assistant,
    
    Settings: Settings,
    
    Profile: Profile,
    
    Notifications: Notifications,
    
    AICapabilities: AICapabilities,
    
    CameraProtocols: CameraProtocols,
    
    AITraining: AITraining,
    
    AnalyticsBuilder: AnalyticsBuilder,
    
    ClientManagement: ClientManagement,
    
    Integrations: Integrations,
    
    DeviceManagement: DeviceManagement,
    
    SolutionTemplates: SolutionTemplates,
    
    WidgetsLibrary: WidgetsLibrary,
    
    WhiteLabeling: WhiteLabeling,
    
    RuleChains: RuleChains,
    
    DashboardBuilder: DashboardBuilder,
    
    UserManagement: UserManagement,
    
    DataAnalytics: DataAnalytics,
    
    AIInsights: AIInsights,
    
    SmartHome: SmartHome,
    
    VisitorManagement: VisitorManagement,
    
    ReportBuilder: ReportBuilder,
    
    AuditLog: AuditLog,
    
    MaintenanceTracker: MaintenanceTracker,
    
    InventoryManagement: InventoryManagement,
    
    ContractorManagement: ContractorManagement,
    
    VehicleManagement: VehicleManagement,
    
    AINotificationSettings: AINotificationSettings,
    
    AdvancedReports: AdvancedReports,
    
    TechnicianScheduling: TechnicianScheduling,
    
    TechnicianMobileApp: TechnicianMobileApp,
    
    SupplierManagement: SupplierManagement,
    
    CallCenter: CallCenter,
    
    SmartCity: SmartCity,
    
    WasteManagement: WasteManagement,
    
    SmartRouting: SmartRouting,
    
    AdminAssistant: AdminAssistant,
    
    CommunicationHub: CommunicationHub,
    
    ComplianceCenter: ComplianceCenter,
    
    CommandCenter: CommandCenter,
    
    FleetAdvanced: FleetAdvanced,
    
    HRWorkforce: HRWorkforce,
    
    DeviceConfiguration: DeviceConfiguration,
    
    UnifiedCallCenter: UnifiedCallCenter,
    
    CentralDashboard: CentralDashboard,
    
    CitizenWasteReports: CitizenWasteReports,
    
    ReportsDashboard: ReportsDashboard,
    
    RoleManagement: RoleManagement,
    
    AdvancedSettings: AdvancedSettings,
    
    AssetManagement: AssetManagement,
    
    IndoorTracking: IndoorTracking,
    
    FuelManagement: FuelManagement,
    
    HospitalCommandCenter: HospitalCommandCenter,
    
    SmartCityBrain: SmartCityBrain,
    
    SmartTrafficMobility: SmartTrafficMobility,
    
    SmartUtilities: SmartUtilities,
    
    SmartEnvironment: SmartEnvironment,
    
    SmartGovernance: SmartGovernance,
    
    SmartPublicSafety: SmartPublicSafety,
    
    SmartEducation: SmartEducation,
    
    SmartCommerce: SmartCommerce,
    
    SmartIndustrial: SmartIndustrial,
    
    SmartEnergy: SmartEnergy,
    
    CityDigitalTwin: CityDigitalTwin,
    
    AIVisionHub: AIVisionHub,
    
    AdvancedUserPreferences: AdvancedUserPreferences,
    
    LandingPage: LandingPage,
    
    DeveloperPortal: DeveloperPortal,
    
    TowerManagement: TowerManagement,
    
    UnifiedMap: UnifiedMap,
    
    CustomDashboard: CustomDashboard,
    
    SystemConfiguration: SystemConfiguration,
    
    DocumentManagement: DocumentManagement,
    
    NotificationCenter: NotificationCenter,
    
    InterfaceSettings: InterfaceSettings,
    
    LiveMapDashboard: LiveMapDashboard,
    
    VisitorSelfServicePortal: VisitorSelfServicePortal,
    
    ResourceAllocation: ResourceAllocation,
    
    ReportsCenter: ReportsCenter,
    
    AdvancedCallCenter: AdvancedCallCenter,
    
    EnhancedSettings: EnhancedSettings,
    
    AIReportsManagement: AIReportsManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/IncidentCenter" element={<IncidentCenter />} />
                
                <Route path="/Modules" element={<Modules />} />
                
                <Route path="/AIModels" element={<AIModels />} />
                
                <Route path="/SmartCityMap" element={<SmartCityMap />} />
                
                <Route path="/DroneFusion" element={<DroneFusion />} />
                
                <Route path="/CameraHealth" element={<CameraHealth />} />
                
                <Route path="/TrafficIntelligence" element={<TrafficIntelligence />} />
                
                <Route path="/CybersecurityMap" element={<CybersecurityMap />} />
                
                <Route path="/FleetTelematics" element={<FleetTelematics />} />
                
                <Route path="/ForensicHub" element={<ForensicHub />} />
                
                <Route path="/Assistant" element={<Assistant />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/AICapabilities" element={<AICapabilities />} />
                
                <Route path="/CameraProtocols" element={<CameraProtocols />} />
                
                <Route path="/AITraining" element={<AITraining />} />
                
                <Route path="/AnalyticsBuilder" element={<AnalyticsBuilder />} />
                
                <Route path="/ClientManagement" element={<ClientManagement />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/DeviceManagement" element={<DeviceManagement />} />
                
                <Route path="/SolutionTemplates" element={<SolutionTemplates />} />
                
                <Route path="/WidgetsLibrary" element={<WidgetsLibrary />} />
                
                <Route path="/WhiteLabeling" element={<WhiteLabeling />} />
                
                <Route path="/RuleChains" element={<RuleChains />} />
                
                <Route path="/DashboardBuilder" element={<DashboardBuilder />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/DataAnalytics" element={<DataAnalytics />} />
                
                <Route path="/AIInsights" element={<AIInsights />} />
                
                <Route path="/SmartHome" element={<SmartHome />} />
                
                <Route path="/VisitorManagement" element={<VisitorManagement />} />
                
                <Route path="/ReportBuilder" element={<ReportBuilder />} />
                
                <Route path="/AuditLog" element={<AuditLog />} />
                
                <Route path="/MaintenanceTracker" element={<MaintenanceTracker />} />
                
                <Route path="/InventoryManagement" element={<InventoryManagement />} />
                
                <Route path="/ContractorManagement" element={<ContractorManagement />} />
                
                <Route path="/VehicleManagement" element={<VehicleManagement />} />
                
                <Route path="/AINotificationSettings" element={<AINotificationSettings />} />
                
                <Route path="/AdvancedReports" element={<AdvancedReports />} />
                
                <Route path="/TechnicianScheduling" element={<TechnicianScheduling />} />
                
                <Route path="/TechnicianMobileApp" element={<TechnicianMobileApp />} />
                
                <Route path="/SupplierManagement" element={<SupplierManagement />} />
                
                <Route path="/CallCenter" element={<CallCenter />} />
                
                <Route path="/SmartCity" element={<SmartCity />} />
                
                <Route path="/WasteManagement" element={<WasteManagement />} />
                
                <Route path="/SmartRouting" element={<SmartRouting />} />
                
                <Route path="/AdminAssistant" element={<AdminAssistant />} />
                
                <Route path="/CommunicationHub" element={<CommunicationHub />} />
                
                <Route path="/ComplianceCenter" element={<ComplianceCenter />} />
                
                <Route path="/CommandCenter" element={<CommandCenter />} />
                
                <Route path="/FleetAdvanced" element={<FleetAdvanced />} />
                
                <Route path="/HRWorkforce" element={<HRWorkforce />} />
                
                <Route path="/DeviceConfiguration" element={<DeviceConfiguration />} />
                
                <Route path="/UnifiedCallCenter" element={<UnifiedCallCenter />} />
                
                <Route path="/CentralDashboard" element={<CentralDashboard />} />
                
                <Route path="/CitizenWasteReports" element={<CitizenWasteReports />} />
                
                <Route path="/ReportsDashboard" element={<ReportsDashboard />} />
                
                <Route path="/RoleManagement" element={<RoleManagement />} />
                
                <Route path="/AdvancedSettings" element={<AdvancedSettings />} />
                
                <Route path="/AssetManagement" element={<AssetManagement />} />
                
                <Route path="/IndoorTracking" element={<IndoorTracking />} />
                
                <Route path="/FuelManagement" element={<FuelManagement />} />
                
                <Route path="/HospitalCommandCenter" element={<HospitalCommandCenter />} />
                
                <Route path="/SmartCityBrain" element={<SmartCityBrain />} />
                
                <Route path="/SmartTrafficMobility" element={<SmartTrafficMobility />} />
                
                <Route path="/SmartUtilities" element={<SmartUtilities />} />
                
                <Route path="/SmartEnvironment" element={<SmartEnvironment />} />
                
                <Route path="/SmartGovernance" element={<SmartGovernance />} />
                
                <Route path="/SmartPublicSafety" element={<SmartPublicSafety />} />
                
                <Route path="/SmartEducation" element={<SmartEducation />} />
                
                <Route path="/SmartCommerce" element={<SmartCommerce />} />
                
                <Route path="/SmartIndustrial" element={<SmartIndustrial />} />
                
                <Route path="/SmartEnergy" element={<SmartEnergy />} />
                
                <Route path="/CityDigitalTwin" element={<CityDigitalTwin />} />
                
                <Route path="/AIVisionHub" element={<AIVisionHub />} />
                
                <Route path="/AdvancedUserPreferences" element={<AdvancedUserPreferences />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/DeveloperPortal" element={<DeveloperPortal />} />
                
                <Route path="/TowerManagement" element={<TowerManagement />} />
                
                <Route path="/UnifiedMap" element={<UnifiedMap />} />
                
                <Route path="/CustomDashboard" element={<CustomDashboard />} />
                
                <Route path="/SystemConfiguration" element={<SystemConfiguration />} />
                
                <Route path="/DocumentManagement" element={<DocumentManagement />} />
                
                <Route path="/NotificationCenter" element={<NotificationCenter />} />
                
                <Route path="/InterfaceSettings" element={<InterfaceSettings />} />
                
                <Route path="/LiveMapDashboard" element={<LiveMapDashboard />} />
                
                <Route path="/VisitorSelfServicePortal" element={<VisitorSelfServicePortal />} />
                
                <Route path="/ResourceAllocation" element={<ResourceAllocation />} />
                
                <Route path="/ReportsCenter" element={<ReportsCenter />} />
                
                <Route path="/AdvancedCallCenter" element={<AdvancedCallCenter />} />
                
                <Route path="/EnhancedSettings" element={<EnhancedSettings />} />
                
                <Route path="/AIReportsManagement" element={<AIReportsManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}