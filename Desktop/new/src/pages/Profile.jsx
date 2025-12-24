import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Save,
  Upload,
  Trophy,
  TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { startOfMonth, format, subMonths } from "date-fns";
import { useTranslation } from '@/components/common/TranslationProvider';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'fa';
  const theme = user?.theme || 'light';
  const { t } = useTranslation(language);

  const { data: tasks = [] } = useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: () => base44.entities.Task.filter({ assignee_id: user.id }),
    enabled: !!user?.id,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['userTimeEntries', user?.id],
    queryFn: () => base44.entities.TimeEntry.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => base44.entities.Achievement.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const jobRoles = {
    backend_developer: { fa: 'توسعه‌دهنده بک‌اند', en: 'Backend Developer' },
    frontend_developer: { fa: 'توسعه‌دهنده فرانت‌اند', en: 'Frontend Developer' },
    fullstack_developer: { fa: 'توسعه‌دهنده فول‌استک', en: 'Fullstack Developer' },
    ui_ux_designer: { fa: 'طراح UI/UX', en: 'UI/UX Designer' },
    project_manager: { fa: 'مدیر پروژه', en: 'Project Manager' },
    qa_tester: { fa: 'تستر', en: 'QA Tester' },
    devops_engineer: { fa: 'مهندس DevOps', en: 'DevOps Engineer' },
    data_scientist: { fa: 'دانشمند داده', en: 'Data Scientist' },
    mobile_developer: { fa: 'توسعه‌دهنده موبایل', en: 'Mobile Developer' },
    other: { fa: 'سایر', en: 'Other' }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      return file_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const startEditing = () => {
    setFormData({
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      field_of_work: user.field_of_work || '',
      age: user.age || '',
      job_role: user.job_role || 'other'
    });
    setIsEditing(true);
  };

  // Calculate performance data for last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthName = format(date, 'MMMM');

    const monthTasks = tasks.filter(t => {
      const createdDate = new Date(t.created_date);
      return createdDate >= monthStart && createdDate < startOfMonth(subMonths(date, -1));
    });

    const totalEstimate = monthTasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
    const totalLogged = monthTasks.reduce((sum, t) => sum + (t.logged_hours || 0), 0);

    return {
      month: monthName,
      estimated: totalEstimate,
      actual: totalLogged
    };
  });

  const rankColors = {
    bronze: 'bg-orange-100 text-orange-700 border-orange-300',
    silver: 'bg-gray-100 text-gray-700 border-gray-300',
    gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    platinum: 'bg-blue-100 text-blue-700 border-blue-300',
    diamond: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  const rankLabels = {
    bronze: t('bronze'),
    silver: t('silver'),
    gold: t('gold'),
    platinum: t('platinum'),
    diamond: t('diamond'),
  };

  return (
    <div className={`p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900 min-h-screen' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t('profile')}
        </h1>
        {!isEditing ? (
          <Button onClick={startEditing} variant="outline" className={theme === 'dark' ? 'text-white border-slate-600 bg-slate-700 hover:bg-slate-600' : ''}>
            <Edit className="w-4 h-4 ml-2" />
            {t('editProfile')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" className={theme === 'dark' ? 'text-white border-slate-600 bg-slate-700 hover:bg-slate-600' : ''}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={updateProfileMutation.isPending} className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}>
              <Save className="w-4 h-4 ml-2" />
              {t('save')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-blue-100">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-3xl">
                    {user.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : ''}`}>{user.full_name}</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{user.email}</p>
                <Badge className={`mt-2 ${theme === 'dark' ? 'bg-blue-600 text-white' : ''}`}>
                  {user.role === 'admin' ? t('manager') : t('user')}
                </Badge>
              </div>

              <div className={`w-full pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : ''} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('totalPoints')}</span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : ''}`}>{user.total_points || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('rank')}</span>
                  <Badge className={`${rankColors[user.rank || 'bronze']} border`}>
                    {rankLabels[user.rank || 'bronze']}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'} lg:col-span-2`}>
          <CardHeader>
            <CardTitle className={theme === 'dark' ? 'text-white' : ''}>{t('personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('fullName')}</Label>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={theme === 'dark' ? 'text-white' : ''}>{user.full_name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('email')}</Label>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : ''}`}>{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('age')}</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-white' : ''}>{user.age || '-'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('phone')}</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-white' : ''}>{user.phone || '-'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('address')}</Label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <MapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-white' : ''}>{user.address || '-'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('fieldOfWork')}</Label>
                {isEditing ? (
                  <Input
                    value={formData.field_of_work}
                    onChange={(e) => setFormData({ ...formData, field_of_work: e.target.value })}
                    className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <Briefcase className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-white' : ''}>{user.field_of_work || '-'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{language === 'fa' ? 'نقش شغلی' : 'Job Role'}</Label>
                {isEditing ? (
                  <Select value={formData.job_role} onValueChange={(value) => setFormData({ ...formData, job_role: value })}>
                    <SelectTrigger className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}>
                      <SelectValue placeholder={language === 'fa' ? 'انتخاب نقش شغلی' : 'Select Job Role'} />
                    </SelectTrigger>
                    <SelectContent className={theme === 'dark' ? 'bg-slate-700 border-slate-600' : ''}>
                      {Object.entries(jobRoles).map(([key, value]) => (
                        <SelectItem key={key} value={key} className={theme === 'dark' ? 'text-white focus:bg-slate-600' : ''}>
                          {language === 'fa' ? value.fa : value.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <Briefcase className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={theme === 'dark' ? 'text-white' : ''}>
                      {user.job_role ? (language === 'fa' ? jobRoles[user.job_role]?.fa : jobRoles[user.job_role]?.en) || '-' : '-'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={theme === 'dark' ? 'text-gray-300' : ''}>{t('bio')}</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className={theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                ) : (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                    <p className={theme === 'dark' ? 'text-white' : ''}>{user.bio || (language === 'fa' ? 'بیوگرافی وارد نشده است' : 'No biography entered')}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
            <TrendingUp className="w-5 h-5" />
            {t('monthlyPerformance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last6Months} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
              <XAxis
                dataKey="month"
                stroke={theme === 'dark' ? '#cbd5e1' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={theme === 'dark' ? '#cbd5e1' : '#6b7280'}
                style={{ fontSize: '12px' }}
                label={{ value: t('hours'), angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: theme === 'dark' ? '#cbd5e1' : '#6b7280' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                  border: `1px solid ${theme === 'dark' ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: theme === 'dark' ? 'white' : 'black',
                }}
                itemStyle={{ color: theme === 'dark' ? 'white' : 'black' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#cbd5e1' : '#6b7280' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="estimated"
                stroke="#3b82f6"
                name={t('estimatedTime')}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                name={t('loggedTime')}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
              <Trophy className="w-5 h-5 text-yellow-500" />
              {t('recentAchievements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 border-2 border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <Badge className="bg-yellow-500 text-white">+{achievement.points}</Badge>
                  </div>
                  <p className="font-semibold mb-1">
                    {achievement.reason === 'fast_completion' && (language === 'fa' ? 'تکمیل سریع' : 'Fast Completion')}
                    {achievement.reason === 'quality' && (language === 'fa' ? 'کیفیت بالا' : 'High Quality')}
                    {achievement.reason === 'on_time' && (language === 'fa' ? 'به موقع' : 'On Time')}
                    {achievement.reason === 'early' && (language === 'fa' ? 'زودتر از موعد' : 'Earlier Than Scheduled')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}