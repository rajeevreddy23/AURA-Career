'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Sun, Moon, Monitor, Bell, Download,
  Volume2, Keyboard, Shield, Palette,
  Mic, Database, Trash2, Languages
} from 'lucide-react';

const settingsSections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'audio', label: 'Audio & Voice', icon: Volume2 },
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'storage', label: 'Storage & Downloads', icon: Database },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [isClient, setIsClient] = useState(false);

  // States
  const [fontSize, setFontSize] = useState('medium');
  const [accentColor, setAccentColor] = useState('blue');
  const [notifications, setNotifications] = useState({
    push: true, email: true, sms: false, courseUpdates: true, reminders: true, achievements: true,
  });
  const [audioSettings, setAudioSettings] = useState({
    voiceSpeed: 1, voiceGender: 'Female', geminiAgent: true, autoPlay: false
  });
  const [storageUsage, setStorageUsage] = useState(0);
  const [downloadQuality, setDownloadQuality] = useState('HD');
  const [privacySettings, setPrivacySettings] = useState({
    learningHistory: true, analyticsOptOut: false
  });
  const [deleteAccountText, setDeleteAccountText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage
    try {
      const storedNotifs = localStorage.getItem('settings_notifications');
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
      
      const storedAudio = localStorage.getItem('settings_audio');
      if (storedAudio) setAudioSettings(JSON.parse(storedAudio));

      const storedPrivacy = localStorage.getItem('settings_privacy');
      if (storedPrivacy) setPrivacySettings(JSON.parse(storedPrivacy));

      // Calculate storage usage roughly
      let totalBytes = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalBytes += (localStorage[key].length + key.length) * 2;
        }
      }
      setStorageUsage(totalBytes);
    } catch (e) {}
  }, []);

  // Save helpers
  const saveNotifications = (newVals: typeof notifications) => {
    setNotifications(newVals);
    localStorage.setItem('settings_notifications', JSON.stringify(newVals));
    toast.success('Notification preferences saved');
  };

  const saveAudio = (newVals: typeof audioSettings) => {
    setAudioSettings(newVals);
    localStorage.setItem('settings_audio', JSON.stringify(newVals));
    toast.success('Audio settings saved');
  };

  const savePrivacy = (newVals: typeof privacySettings) => {
    setPrivacySettings(newVals);
    localStorage.setItem('settings_privacy', JSON.stringify(newVals));
    toast.success('Privacy settings saved');
  };

  const clearCache = () => {
    localStorage.clear();
    setStorageUsage(0);
    toast.success('Cache cleared successfully');
    window.location.reload();
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "auralearn_data.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Data exported successfully');
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <Card className="lg:col-span-1 h-fit">
                <CardContent className="p-2 space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* APPEARANCE */}
                {activeSection === 'appearance' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Choose your preferred color scheme</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'light', icon: Sun, label: 'Light' },
                            { id: 'dark', icon: Moon, label: 'Dark' },
                            { id: 'system', icon: Monitor, label: 'System' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setTheme(t.id as 'light' | 'dark' | 'system');
                                toast.success(`Theme set to ${t.label}`);
                              }}
                              className={cn(
                                'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all',
                                theme === t.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              <t.icon className={cn('h-6 w-6', theme === t.id ? 'text-primary' : 'text-muted-foreground')} />
                              <span className={cn('text-sm font-medium', theme === t.id && 'text-primary')}>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Font Size</CardTitle>
                        <CardDescription>Adjust text size across the platform</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          {['small', 'medium', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => { setFontSize(size); toast.success('Font size saved'); }}
                              className={cn(
                                'px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                                fontSize === size
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/50'
                              )}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* NOTIFICATIONS */}
                {activeSection === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Control how you receive updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs text-muted-foreground">Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications</p>
                          </div>
                          <button
                            onClick={() => saveNotifications({ ...notifications, [key]: !value })}
                            className={cn(
                              'h-7 w-12 rounded-full transition-colors relative',
                              value ? 'bg-primary' : 'bg-muted'
                            )}
                          >
                            <div className={cn(
                              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                              value ? 'translate-x-6' : 'translate-x-0.5'
                            )} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* LANGUAGE */}
                {activeSection === 'language' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Language</CardTitle>
                      <CardDescription>Select your preferred language for the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <select
                        onChange={(e) => toast.success(`Language changed to ${e.target.options[e.target.selectedIndex].text}`)}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                      </select>
                    </CardContent>
                  </Card>
                )}

                {/* AUDIO & VOICE */}
                {activeSection === 'audio' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Audio & Voice Settings</CardTitle>
                      <CardDescription>Customize voice playback and AI narration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Voice Speed ({audioSettings.voiceSpeed}x)</label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1"
                          value={audioSettings.voiceSpeed}
                          onChange={(e) => saveAudio({...audioSettings, voiceSpeed: parseFloat(e.target.value)})}
                          className="w-full accent-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Voice Gender</p>
                          <p className="text-xs text-muted-foreground">Preferred voice for text-to-speech</p>
                        </div>
                        <select 
                          value={audioSettings.voiceGender}
                          onChange={(e) => saveAudio({...audioSettings, voiceGender: e.target.value})}
                          className="px-3 py-1.5 rounded-lg border bg-background"
                        >
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">Gemini Voice Agent</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Enable AI voice assistant powered by Gemini for voice commands and narration</p>
                        </div>
                        <button
                          onClick={() => saveAudio({ ...audioSettings, geminiAgent: !audioSettings.geminiAgent })}
                          className={cn('h-7 w-12 rounded-full transition-colors relative shrink-0', audioSettings.geminiAgent ? 'bg-primary' : 'bg-muted')}
                        >
                          <div className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform', audioSettings.geminiAgent ? 'translate-x-6' : 'translate-x-0.5')} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Auto-play narration</p>
                          <p className="text-xs text-muted-foreground">Automatically play audio when starting a lesson</p>
                        </div>
                        <button
                          onClick={() => saveAudio({ ...audioSettings, autoPlay: !audioSettings.autoPlay })}
                          className={cn('h-7 w-12 rounded-full transition-colors relative shrink-0', audioSettings.autoPlay ? 'bg-primary' : 'bg-muted')}
                        >
                          <div className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform', audioSettings.autoPlay ? 'translate-x-6' : 'translate-x-0.5')} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KEYBOARD SHORTCUTS */}
                {activeSection === 'keyboard' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyboard Shortcuts</CardTitle>
                      <CardDescription>Navigate and control playback faster</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'Space', desc: 'Play / Pause' },
                          { key: 'N', desc: 'Next page' },
                          { key: 'P', desc: 'Previous page' },
                          { key: 'F', desc: 'Fullscreen' },
                          { key: 'M', desc: 'Mute' },
                          { key: '?', desc: 'Help' },
                        ].map((shortcut) => (
                          <div key={shortcut.key} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                            <span className="text-sm text-muted-foreground">{shortcut.desc}</span>
                            <kbd className="px-2 py-1 rounded bg-background border shadow-sm text-xs font-semibold font-mono">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* STORAGE & DOWNLOADS */}
                {activeSection === 'storage' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Storage & Downloads</CardTitle>
                      <CardDescription>Manage offline data and local cache</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <p className="font-medium text-sm">Local Storage Usage</p>
                          <p className="text-xs text-muted-foreground">{(storageUsage / 1024).toFixed(2)} KB used</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={clearCache}>
                          Clear Cache
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <p className="font-medium text-sm">Export Data</p>
                          <p className="text-xs text-muted-foreground">Download all your local settings as JSON</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Download Quality</label>
                        <div className="flex gap-4">
                          {['HD', 'SD'].map((q) => (
                            <label key={q} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="radio" 
                                name="quality" 
                                checked={downloadQuality === q} 
                                onChange={() => { setDownloadQuality(q); toast.success(`Quality set to ${q}`); }}
                                className="accent-primary"
                              />
                              {q}
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* PRIVACY & SECURITY */}
                {activeSection === 'privacy' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy & Security</CardTitle>
                      <CardDescription>Manage your data and privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Learning history visibility</p>
                          <p className="text-xs text-muted-foreground">Show your progress on public profile</p>
                        </div>
                        <button
                          onClick={() => savePrivacy({ ...privacySettings, learningHistory: !privacySettings.learningHistory })}
                          className={cn('h-7 w-12 rounded-full transition-colors relative', privacySettings.learningHistory ? 'bg-primary' : 'bg-muted')}
                        >
                          <div className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform', privacySettings.learningHistory ? 'translate-x-6' : 'translate-x-0.5')} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Analytics opt-out</p>
                          <p className="text-xs text-muted-foreground">Don't share anonymous usage data</p>
                        </div>
                        <button
                          onClick={() => savePrivacy({ ...privacySettings, analyticsOptOut: !privacySettings.analyticsOptOut })}
                          className={cn('h-7 w-12 rounded-full transition-colors relative', privacySettings.analyticsOptOut ? 'bg-primary' : 'bg-muted')}
                        >
                          <div className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform', privacySettings.analyticsOptOut ? 'translate-x-6' : 'translate-x-0.5')} />
                        </button>
                      </div>

                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full justify-start mb-4" onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export My Data
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-lg border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                This action is irreversible. All your progress, certificates, and data will be permanently deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type <span className="font-mono bg-muted px-1 py-0.5 rounded">DELETE</span> to confirm</label>
                <input 
                  type="text" 
                  value={deleteAccountText}
                  onChange={(e) => setDeleteAccountText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteAccountText(''); }}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  disabled={deleteAccountText !== 'DELETE'}
                  onClick={() => {
                    toast.success('Account scheduled for deletion');
                    setShowDeleteModal(false);
                  }}
                >
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </main>
  );
}
