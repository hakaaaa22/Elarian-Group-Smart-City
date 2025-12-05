import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building, Shield, Clock, 
  Activity, Award, Edit, Camera, Save, Bell, Palette, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const activityLog = [
  { action: 'Logged in', time: '2 hours ago', type: 'auth' },
  { action: 'Viewed Incident INC-00245', time: '3 hours ago', type: 'view' },
  { action: 'Updated camera CAM-003', time: '5 hours ago', type: 'update' },
  { action: 'Generated traffic report', time: '1 day ago', type: 'report' },
  { action: 'Resolved Incident INC-00240', time: '2 days ago', type: 'resolve' },
];

const defaultPreferences = {
  notifications: {
    emailCritical: true,
    emailWarning: true,
    emailInfo: false,
    pushNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
  },
  theme: {
    mode: 'dark',
    accentColor: 'cyan',
    compactMode: false,
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: '+1 (555) 000-0000',
    department: 'Security Operations',
    timezone: 'UTC+0',
  });
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      if (userData?.preferences) {
        setPreferences({ ...defaultPreferences, ...userData.preferences });
      }
      if (userData?.phone) setProfileData(prev => ({ ...prev, phone: userData.phone }));
      if (userData?.department) setProfileData(prev => ({ ...prev, department: userData.department }));
      if (userData?.timezone) setProfileData(prev => ({ ...prev, timezone: userData.timezone }));
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ ...profileData });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (e) {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ preferences });
      toast.success('Preferences saved');
    } catch (e) {
      toast.error('Failed to save preferences');
    }
    setIsSaving(false);
  };

  const updateNotificationPref = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateThemePref = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-cyan-400" />
          User Profile
        </h1>
        <p className="text-slate-400 mt-1">View and manage your profile information</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto">
                    <span className="text-4xl text-white font-bold">
                      {user?.full_name?.[0] || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-white mt-4">{user?.full_name || 'User'}</h2>
                <p className="text-slate-400">{user?.email}</p>
                
                <Badge className="mt-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border-cyan-500/30 border">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role || 'Operator'}
                </Badge>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">127</p>
                      <p className="text-xs text-slate-400">Incidents Handled</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">98%</p>
                      <p className="text-xs text-slate-400">Resolution Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'First Responder', desc: '100+ incidents resolved', color: 'amber' },
                { name: 'Eagle Eye', desc: '50+ cameras monitored', color: 'cyan' },
                { name: 'Security Expert', desc: 'Advanced certification', color: 'purple' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg bg-${badge.color}-500/20 flex items-center justify-center`}>
                    <Award className={`w-5 h-5 text-${badge.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{badge.name}</p>
                    <p className="text-slate-400 text-xs">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="theme" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Profile Information</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" /> Full Name
                      </label>
                      <p className="text-white font-medium p-2">{user?.full_name || 'Not set'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </label>
                      <p className="text-white font-medium p-2">{user?.email || 'Not set'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </label>
                      {isEditing ? (
                        <Input 
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">{profileData.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <Building className="w-4 h-4" /> Department
                      </label>
                      {isEditing ? (
                        <Input 
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium p-2">{profileData.department}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Role
                      </label>
                      <p className="text-white font-medium p-2">{user?.role || 'Operator'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Timezone
                      </label>
                      {isEditing ? (
                        <Select value={profileData.timezone} onValueChange={(v) => setProfileData({ ...profileData, timezone: v })}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                            <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                            <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                            <SelectItem value="UTC+1">UTC+1 (Paris)</SelectItem>
                            <SelectItem value="UTC+3">UTC+3 (Moscow)</SelectItem>
                            <SelectItem value="UTC+8">UTC+8 (Singapore)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white font-medium p-2">{profileData.timezone}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="mt-6 bg-cyan-500 hover:bg-cyan-600">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-400" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Email Alerts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Critical Events</Label>
                          <p className="text-slate-400 text-sm">Receive emails for critical incidents and security breaches</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.emailCritical}
                          onCheckedChange={(v) => updateNotificationPref('emailCritical', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Warning Alerts</Label>
                          <p className="text-slate-400 text-sm">Receive emails for warning-level events</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.emailWarning}
                          onCheckedChange={(v) => updateNotificationPref('emailWarning', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Info Notifications</Label>
                          <p className="text-slate-400 text-sm">Receive emails for informational updates</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.emailInfo}
                          onCheckedChange={(v) => updateNotificationPref('emailInfo', v)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-4">Other Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Push Notifications</Label>
                          <p className="text-slate-400 text-sm">Show browser notifications for new alerts</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.pushNotifications}
                          onCheckedChange={(v) => updateNotificationPref('pushNotifications', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Daily Digest</Label>
                          <p className="text-slate-400 text-sm">Receive a daily summary email</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.dailyDigest}
                          onCheckedChange={(v) => updateNotificationPref('dailyDigest', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <Label className="text-white">Weekly Report</Label>
                          <p className="text-slate-400 text-sm">Receive a weekly analytics report</p>
                        </div>
                        <Switch 
                          checked={preferences.notifications.weeklyReport}
                          onCheckedChange={(v) => updateNotificationPref('weeklyReport', v)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSavePreferences} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-600">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Theme Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-white mb-3 block">Theme Mode</Label>
                    <Select value={preferences.theme.mode} onValueChange={(v) => updateThemePref('mode', v)}>
                      <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">Accent Color</Label>
                    <div className="flex gap-3">
                      {[
                        { value: 'cyan', color: 'bg-cyan-500' },
                        { value: 'purple', color: 'bg-purple-500' },
                        { value: 'green', color: 'bg-green-500' },
                        { value: 'amber', color: 'bg-amber-500' },
                        { value: 'red', color: 'bg-red-500' },
                        { value: 'blue', color: 'bg-blue-500' },
                      ].map((c) => (
                        <button
                          key={c.value}
                          onClick={() => updateThemePref('accentColor', c.value)}
                          className={`w-10 h-10 rounded-lg ${c.color} ${
                            preferences.theme.accentColor === c.value 
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' 
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <Label className="text-white">Compact Mode</Label>
                      <p className="text-slate-400 text-sm">Use smaller spacing and fonts</p>
                    </div>
                    <Switch 
                      checked={preferences.theme.compactMode}
                      onCheckedChange={(v) => updateThemePref('compactMode', v)}
                    />
                  </div>

                  <Button onClick={handleSavePreferences} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-600">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Theme
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card className="glass-card border-indigo-500/20 bg-[#0f1629]/80">
                <CardHeader className="border-b border-slate-700/50">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {activityLog.map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'auth' ? 'bg-cyan-500' :
                          activity.type === 'view' ? 'bg-blue-500' :
                          activity.type === 'update' ? 'bg-amber-500' :
                          activity.type === 'report' ? 'bg-purple-500' : 'bg-emerald-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.action}</p>
                        </div>
                        <span className="text-slate-400 text-xs">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}