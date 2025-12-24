import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Calendar,
  ListTodo
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TaskCard from "../components/tasks/TaskCard";
import { isPast, isToday, isWithinInterval, addDays, startOfDay } from "date-fns";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const theme = user?.theme || 'light';
  const { t } = useTranslation(language);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done').length,
  };

  const myTasks = {
    overdue: tasks.filter(t => 
      t.deadline && 
      isPast(new Date(t.deadline)) && 
      t.status !== 'done'
    ),
    today: tasks.filter(t => 
      t.deadline && 
      isToday(new Date(t.deadline)) &&
      t.status !== 'done'
    ),
    upcoming: tasks.filter(t => 
      t.deadline && 
      isWithinInterval(new Date(t.deadline), {
        start: addDays(startOfDay(new Date()), 1),
        end: addDays(startOfDay(new Date()), 7)
      }) &&
      t.status !== 'done'
    ).slice(0, 5),
  };

  const recentTasks = tasks
    .filter(t => t.status !== 'done')
    .slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t('dashboard')}
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            {language === 'fa' ? 'خلاصه‌ای از وضعیت پروژه‌ها و وظایف شما' : 'Overview of your projects and tasks'}
          </p>
        </div>
        
        <Link to={createPageUrl("TaskList")}>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg text-white">
            <Plus className="w-5 h-5 ml-2 mr-2" />
            {t('newTask')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                {t('totalTasks')}
              </CardTitle>
              <div className={`p-2 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg`}>
                <ListTodo className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.total}</div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
              {language === 'fa' ? `در ${projects.length} پروژه` : `in ${projects.length} projects`}
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                {t('completedTasks')}
              </CardTitle>
              <div className={`p-2 ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg`}>
                <CheckCircle2 className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.completed}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                {t('inProgressTasks')}
              </CardTitle>
              <div className={`p-2 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg`}>
                <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.inProgress}</div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
              {t('needAttention') || (language === 'fa' ? 'نیاز به پیگیری' : 'Need attention')}
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                {t('overdueTasks')}
              </CardTitle>
              <div className={`p-2 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} rounded-lg`}>
                <AlertTriangle className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.overdue}</div>
            <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {language === 'fa' ? 'نیاز به توجه فوری' : 'Urgent attention needed'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <Calendar className="w-5 h-5" />
                {t('myTasksTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTasks.overdue.length > 0 && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    {t('overdueTitle')} ({myTasks.overdue.length})
                  </h3>
                  <div className="grid gap-3">
                    {myTasks.overdue.slice(0, 3).map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {myTasks.today.length > 0 && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                    {t('todayTitle')} ({myTasks.today.length})
                  </h3>
                  <div className="grid gap-3">
                    {myTasks.today.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {myTasks.upcoming.length > 0 && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {t('upcomingTitle')} ({myTasks.upcoming.length})
                  </h3>
                  <div className="grid gap-3">
                    {myTasks.upcoming.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {myTasks.overdue.length === 0 && myTasks.today.length === 0 && myTasks.upcoming.length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'fa' ? 'شما وظیفه‌ای با مهلت نزدیک ندارید' : 'No upcoming deadlines'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
            <CardHeader>
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('activeProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.filter(p => p.status === 'active').slice(0, 5).map(project => {
                const projectTasks = tasks.filter(t => t.project_id === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'done').length;
                const progress = projectTasks.length > 0 
                  ? Math.round((completedTasks / projectTasks.length) * 100) 
                  : 0;

                return (
                  <div key={project.id} className={`p-3 rounded-lg hover:shadow-sm transition-shadow ${theme === 'dark' ? 'border border-slate-700' : 'border border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{project.name}</h4>
                      </div>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{progress}%</span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                      {projectTasks.length} {language === 'fa' ? 'وظیفه' : 'tasks'}
                    </p>
                  </div>
                );
              })}
              
              {projects.filter(p => p.status === 'active').length === 0 && (
                <div className={`text-center py-6 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                  <p className="text-sm">{language === 'fa' ? 'هیچ پروژه فعالی وجود ندارد' : 'No active projects'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
            <CardHeader>
              <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.slice(0, 5).map(task => (
                  <div key={task.id} className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                        {language === 'fa' ? 'به‌روزرسانی شد' : 'Updated'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}