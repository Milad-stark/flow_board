import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function Reports() {
  const [selectedProject, setSelectedProject] = useState("all");

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const filteredTasks = selectedProject === "all" 
    ? tasks 
    : tasks.filter(t => t.project_id === selectedProject);

  const statusData = [
    { name: 'انجام نشده', value: filteredTasks.filter(t => t.status === 'todo').length },
    { name: 'در حال انجام', value: filteredTasks.filter(t => t.status === 'in_progress').length },
    { name: 'در بررسی', value: filteredTasks.filter(t => t.status === 'in_review').length },
    { name: 'مسدود', value: filteredTasks.filter(t => t.status === 'blocked').length },
    { name: 'انجام شده', value: filteredTasks.filter(t => t.status === 'done').length },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'کم', value: filteredTasks.filter(t => t.priority === 'low').length },
    { name: 'متوسط', value: filteredTasks.filter(t => t.priority === 'medium').length },
    { name: 'زیاد', value: filteredTasks.filter(t => t.priority === 'high').length },
    { name: 'بحرانی', value: filteredTasks.filter(t => t.priority === 'critical').length },
  ];

  const projectStats = projects.map(project => {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    return {
      name: project.name,
      total: projectTasks.length,
      completed: projectTasks.filter(t => t.status === 'done').length,
      progress: projectTasks.filter(t => t.status === 'in_progress').length,
    };
  });

  const totalHours = filteredTasks.reduce((sum, t) => sum + (t.logged_hours || 0), 0);
  const estimatedHours = filteredTasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
  const completionRate = filteredTasks.length > 0 
    ? Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100)
    : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">تعداد: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">گزارش‌ها و آمار</h1>
          <p className="text-slate-600 mt-1">تحلیل عملکرد پروژه‌ها</p>
        </div>
        
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="انتخاب پروژه" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پروژه‌ها</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                نرخ تکمیل
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{completionRate}%</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                کل وظایف
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{filteredTasks.length}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                زمان ثبت شده
              </CardTitle>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                زمان تخمینی
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{estimatedHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>توزیع وضعیت وظایف</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>توزیع اولویت</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>آمار پروژه‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="square"
              />
              <Bar dataKey="total" fill="#3B82F6" name="کل وظایف" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#10B981" name="تکمیل شده" radius={[8, 8, 0, 0]} />
              <Bar dataKey="progress" fill="#F59E0B" name="در حال انجام" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}