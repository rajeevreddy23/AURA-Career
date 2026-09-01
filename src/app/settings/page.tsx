'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Sun, Moon, Monitor, Bell, Download,
  Volume2, Keyboard, Shield, Palette,
  Mic, Database, Trash2, Languages, Check, RefreshCw
} from 'lucide-react';

const settingsSections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language & Locale', icon: Languages },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'audio', label: 'Audio & Voice', icon: Volume2 },
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'storage', label: 'Storage & Downloads', icon: Database },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('appearance');
  const [isClient, setIsClient] = useState(false);

  // States
  const [fontSize, setFontSize] = useState('medium');
  const [accentColor, setAccentColor] = useState('purple');
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    courseUpdates: true,
    reminders: true,
    achievements: true,
  });
  const [audioSettings, setAudioSettings] = useState({
    voiceSpeed: 1.0,
    voiceGender: 'female',
    geminiAgent: true,
    autoPlay: true,
  });
  const [storageUsage, setStorageUsage] = useState(0);
  const [downloadQuality, setDownloadQuality] = useState('HD');
  const [privacySettings, setPrivacySettings] = useState({
    learningHistory: true,
    analyticsOptOut: false,
  });
  const [deleteAccountText, setDeleteAccountText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage
    try {
      const storedFontSize = localStorage.getItem('settings_fontsize');
      if (storedFontSize) setFontSize(storedFontSize);

      const storedNotifs = localStorage.getItem('settings_notifications');
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));

      const storedAudio = localStorage.getItem('settings_audio');
      if (storedAudio) setAudioSettings(JSON.parse(storedAudio));

      const storedPrivacy = localStorage.getItem('settings_privacy');
      if (storedPrivacy) setPrivacySettings(JSON.parse(storedPrivacy));

      // Calculate storage usage
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
  const saveFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem('settings_fontsize', size);
    toast.success(`Font size set to ${size}`);
  };

  const saveNotifications = (newVals: typeof notifications) => {
    setNotifications(newVals);
    localStorage.setItem('settings_notifications', JSON.stringify(newVals));
    toast.success('Notification preferences saved');
  };

  const saveAudio = (newVals: typeof audioSettings) => {
    setAudioSettings(newVals);
    localStorage.setItem('settings_audio', JSON.stringify(newVals));
    toast.success('Audio & Voice settings saved');
  };

  const savePrivacy = (newVals: typeof privacySettings) => {
    setPrivacySettings(newVals);
    localStorage.setItem('settings_privacy', JSON.stringify(newVals));
    toast.success('Privacy preferences updated');
  };

  const clearCache = () => {
    try {
      localStorage.clear();
      setStorageUsage(0);
      toast.success('Local cache cleared successfully');
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error('Could not clear cache');
    }
  };

  const exportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `auralearn_settings_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success('Settings and profile data exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your theme, language preferences, AI voice agent, notifications, and local data.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 items-start">
              {/* Sidebar Tabs */}
              <Card className="lg:col-span-1 border border-border shadow-sm">
                <CardContent className="p-2 space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary font-bold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <section.icon className="h-4 w-4 shrink-0" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Content Panel */}
              <div className="lg:col-span-3 space-y-6">
                {/* 1. APPEARANCE */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Color Scheme</CardTitle>
                        <CardDescription>Choose your interface theme</CardDescription>
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
                                'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all',
                                theme === t.id
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/50 text-muted-foreground'
                              )}
                            >
                              <t.icon className="h-6 w-6" />
                              <span className="text-xs font-bold">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Text Scaling</CardTitle>
                        <CardDescription>Adjust font size for lectures and reading</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {['small', 'medium', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => saveFontSize(size)}
                              className={cn(
                                'px-6 py-2.5 rounded-xl border text-xs font-bold transition-all capitalize',
                                fontSize === size
                                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                  : 'border-border hover:border-primary/40 text-muted-foreground'
                              )}
                            >
                              {size} Text
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 2. LANGUAGE & LOCALE */}
                {activeSection === 'language' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Language & Teaching Locale</CardTitle>
                      <CardDescription>
                        Select your preferred language for learning, AI voice narration, and interface labels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={cn(
                              'p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left',
                              language === lang.code
                                ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                                : 'border-border hover:border-primary/40 text-muted-foreground'
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{lang.flag}</span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{lang.name}</p>
                                <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                              </div>
                            </div>
                            {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. NOTIFICATIONS */}
                {activeSection === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Control how you receive lesson reminders and progress alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-1">
                          <div>
                            <p className="font-semibold text-sm capitalize text-foreground">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} updates
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => saveNotifications({ ...notifications, [key]: !value })}
                            className={cn(
                              'h-7 w-12 rounded-full transition-colors relative',
                              value ? 'bg-primary' : 'bg-muted'
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                                value ? 'translate-x-6' : 'translate-x-0.5'
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 4. AUDIO & VOICE */}
                {activeSection === 'audio' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Audio & AI Voice Settings</CardTitle>
                      <CardDescription>Customize voice speech speed, gender, and ambient audio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>Voice Narration Speed</span>
                          <span className="font-mono text-primary font-bold">{audioSettings.voiceSpeed}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={audioSettings.voiceSpeed}
                          onChange={(e) =>
                            saveAudio({ ...audioSettings, voiceSpeed: parseFloat(e.target.value) })
                          }
                          className="w-full accent-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="font-medium text-sm text-foreground">Preferred Professor Voice</p>
                          <p className="text-xs text-muted-foreground">Default gender for AI lecture speech</p>
                        </div>
                        <select
                          value={audioSettings.voiceGender}
                          onChange={(e) => saveAudio({ ...audioSettings, voiceGender: e.target.value })}
                          className="px-3.5 py-1.5 rounded-xl border bg-background text-xs font-semibold"
                        >
                          <option value="female">Bekki (Female - Sweet)</option>
                          <option value="male">Ben (Male - Deep Bass)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="font-medium text-sm text-foreground">Auto-Play Narration</p>
                          <p className="text-xs text-muted-foreground">Automatically speak slide audio when changing concepts</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => saveAudio({ ...audioSettings, autoPlay: !audioSettings.autoPlay })}
                          className={cn(
                            'h-7 w-12 rounded-full transition-colors relative',
                            audioSettings.autoPlay ? 'bg-primary' : 'bg-muted'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                              audioSettings.autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 5. KEYBOARD SHORTCUTS */}
                {activeSection === 'keyboard' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Classroom Keyboard Shortcuts</CardTitle>
                      <CardDescription>Control lecture slides and audio with keyboard shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'Space', desc: 'Play / Pause Narration' },
                          { key: 'N', desc: 'Next Concept Slide' },
                          { key: 'P', desc: 'Previous Concept Slide' },
                          { key: 'F', desc: 'Toggle Fullscreen Mode' },
                          { key: 'M', desc: 'Mute / Unmute Audio' },
                          { key: '?', desc: 'Toggle Live Q&A Drawer' },
                        ].map((shortcut) => (
                          <div
                            key={shortcut.key}
                            className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border"
                          >
                            <span className="text-xs font-medium text-muted-foreground">{shortcut.desc}</span>
                            <kbd className="px-2 py-1 rounded-lg bg-background border shadow-xs text-xs font-bold font-mono text-primary">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 6. STORAGE & DOWNLOADS */}
                {activeSection === 'storage' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Storage & Local Cache</CardTitle>
                      <CardDescription>Manage offline progress and exported notes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between p-4 border rounded-2xl bg-card">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Local Storage Cache</p>
                          <p className="text-xs text-muted-foreground">
                            {(storageUsage / 1024).toFixed(2)} KB saved locally
                          </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={clearCache}>
                          Clear Cache
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-2xl bg-card">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Export Backup</p>
                          <p className="text-xs text-muted-foreground">Download all local progress and settings as JSON</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={exportData}>
                          <Download className="h-4 w-4 mr-1.5" />
                          Export Data
                        </Button>
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <label className="text-xs font-semibold text-muted-foreground">Download Quality</label>
                        <div className="flex gap-4">
                          {['HD', 'SD'].map((q) => (
                            <label key={q} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                              <input
                                type="radio"
                                name="quality"
                                checked={downloadQuality === q}
                                onChange={() => {
                                  setDownloadQuality(q);
                                  toast.success(`Quality set to ${q}`);
                                }}
                                className="accent-primary"
                              />
                              <span>{q} Quality</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 7. PRIVACY & SECURITY */}
                {activeSection === 'privacy' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy & Security</CardTitle>
                      <CardDescription>Manage your data sharing and account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Public Profile Visibility</p>
                          <p className="text-xs text-muted-foreground">Show your verified achievements on leaderboard</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            savePrivacy({ ...privacySettings, learningHistory: !privacySettings.learningHistory })
                          }
                          className={cn(
                            'h-7 w-12 rounded-full transition-colors relative',
                            privacySettings.learningHistory ? 'bg-primary' : 'bg-muted'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                              privacySettings.learningHistory ? 'translate-x-6' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">Analytics Opt-Out</p>
                          <p className="text-xs text-muted-foreground">Do not share telemetry data</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            savePrivacy({ ...privacySettings, analyticsOptOut: !privacySettings.analyticsOptOut })
                          }
                          className={cn(
                            'h-7 w-12 rounded-full transition-colors relative',
                            privacySettings.analyticsOptOut ? 'bg-primary' : 'bg-muted'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                              privacySettings.analyticsOptOut ? 'translate-x-6' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <Button variant="outline" className="w-full justify-start text-xs font-semibold" onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Personal Data
                        </Button>

                        <Button
                          variant="destructive"
                          className="w-full justify-start text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account & Progress
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-destructive/30 bg-card">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                This action is irreversible. All your progress, certificates, and notes will be permanently erased.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">
                  Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteAccountText}
                  onChange={(e) => setDeleteAccountText(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl bg-background text-sm"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAccountText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteAccountText !== 'DELETE'}
                  onClick={() => {
                    clearCache();
                    setShowDeleteModal(false);
                  }}
                >
                  Delete Account
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
