import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Bell, Volume2, Globe, Save } from "lucide-react";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function Settings() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const theme = user?.theme || 'light';
  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const [settings, setSettings] = useState({
    language: user?.language || 'en',
    notifications_enabled: user?.notifications_enabled ?? true,
    sound_enabled: user?.sound_enabled ?? true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setHasChanges(false);
      window.location.reload();
    },
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            {t('settingsTitle')}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'fa' ? 'تنظیمات شخصی و ترجیحات' : 'Personal settings and preferences'}
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="w-4 h-4 ml-2" />
            {t('saveChanges')}
          </Button>
        )}
      </div>

      <Card className={`bg-white dark:bg-slate-800 dark:border-slate-700`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>{t('interfaceLanguage')}</Label>
              <p className="text-sm text-gray-500">{t('selectLanguage')}</p>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => handleChange('language', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fa">فارسی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-white dark:bg-slate-800 dark:border-slate-700`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>{t('notificationsEnabled')}</Label>
              <p className="text-sm text-gray-500">{t('receiveNotifications')}</p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => handleChange('notifications_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <div>
                <Label>{t('soundEnabled')}</Label>
                <p className="text-sm text-gray-500">{t('playSounds')}</p>
              </div>
            </div>
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(checked) => handleChange('sound_enabled', checked)}
              disabled={!settings.notifications_enabled}
            />
          </div>

          {/* Notification action buttons (functional-ready) */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!user?.id) return;
                base44.entities.Notification.create({
                  id: undefined,
                  user_id: user.id,
                  type: 'task',
                  title: language === 'fa' ? 'اعلان آزمایشی' : 'Test Notification',
                  message: language === 'fa'
                    ? 'این یک اعلان آزمایشی از بخش تنظیمات است.'
                    : 'This is a test notification from Settings.',
                  created_date: new Date().toISOString(),
                  is_read: false,
                }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
                  queryClient.invalidateQueries({ queryKey: ['notifications'] });
                });
              }}
            >
              {language === 'fa' ? 'ارسال اعلان آزمایشی' : 'Send Test Notification'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={async () => {
                if (!user?.id) return;
                const existing = await base44.entities.Notification.filter({ user_id: user.id });
                await Promise.all(existing.map((n) => base44.entities.Notification.delete(n.id)));
                queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
              }}
            >
              {language === 'fa' ? 'حذف همه اعلان‌ها' : 'Clear All Notifications'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-white dark:bg-slate-800 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600">{t('dangerZone')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('logout')}</Label>
              <p className="text-sm text-gray-500">{t('signOut')}</p>
            </div>
            <Button variant="destructive" onClick={() => base44.auth.logout()}>
              {language === 'fa' ? 'خروج' : 'Logout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}