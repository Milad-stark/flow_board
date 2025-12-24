import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip,
  CheckSquare,
  Save,
  Trash2
} from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import { formatJalaliDate, formatJalaliDateTime } from "@/utils/date";

export default function TaskDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('id');

  const [newComment, setNewComment] = useState("");
  const [newTimeLog, setNewTimeLog] = useState({ hours: "", description: "", date: new Date().toISOString().split('T')[0] });

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const tasks = await base44.entities.Task.list();
      return tasks.find(t => t.id === taskId);
    },
    enabled: !!taskId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => base44.entities.Comment.filter({ task_id: taskId }, '-created_date'),
    enabled: !!taskId,
  });

  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timeLogs', taskId],
    queryFn: () => base44.entities.TimeLog.filter({ task_id: taskId }, '-date'),
    enabled: !!taskId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.Comment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment("");
    },
  });

  const createTimeLogMutation = useMutation({
    mutationFn: (timeLogData) => base44.entities.TimeLog.create(timeLogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setNewTimeLog({ hours: "", description: "", date: new Date().toISOString().split('T')[0] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      navigate(createPageUrl("TaskList"));
    },
  });

  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const project = projects.find(p => p.id === task.project_id);
  const totalLoggedHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      task_id: taskId,
      content: newComment
    });
  };

  const handleAddTimeLog = () => {
    if (!newTimeLog.hours || !newTimeLog.date) return;
    createTimeLogMutation.mutate({
      task_id: taskId,
      hours: parseFloat(newTimeLog.hours),
      description: newTimeLog.description,
      date: newTimeLog.date
    });
  };

  const toggleChecklistItem = (index) => {
    const newChecklist = [...(task.checklist || [])];
    newChecklist[index].done = !newChecklist[index].done;
    updateTaskMutation.mutate({
      id: taskId,
      data: { checklist: newChecklist }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("TaskList"))}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
          {project && (
            <p className="text-slate-600 mt-1">پروژه: {project.name}</p>
          )}
        </div>
        <Button
          variant="destructive"
          onClick={() => deleteTaskMutation.mutate(taskId)}
        >
          <Trash2 className="w-4 h-4 ml-2" />
          حذف
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>جزئیات وظیفه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>توضیحات</Label>
                <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                  {task.description || "توضیحاتی ثبت نشده است"}
                </p>
              </div>

              {task.labels && task.labels.length > 0 && (
                <div>
                  <Label>برچسب‌ها</Label>
                  <div className="flex gap-2 mt-2">
                    {task.labels.map((label, idx) => (
                      <Badge key={idx} variant="outline">{label}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1">
                <MessageSquare className="w-4 h-4 ml-2" />
                نظرات ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex-1">
                <CheckSquare className="w-4 h-4 ml-2" />
                چک‌لیست
              </TabsTrigger>
              <TabsTrigger value="time" className="flex-1">
                <Clock className="w-4 h-4 ml-2" />
                ثبت زمان
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4 mt-4">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="نظر خود را بنویسید..."
                    rows={3}
                    className="mb-3"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                  >
                    <MessageSquare className="w-4 h-4 ml-2" />
                    ثبت نظر
                  </Button>
                </CardContent>
              </Card>

              {comments.map(comment => (
                <Card key={comment.id} className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">ک</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-900">{comment.created_by}</span>
                          <span className="text-xs text-slate-500">
                          {formatJalaliDateTime(comment.created_date, 'en')}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>هنوز نظری ثبت نشده است</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4 mt-4">
              <Card className="border-slate-200">
                <CardContent className="pt-6 space-y-3">
                  {task.checklist && task.checklist.length > 0 ? (
                    task.checklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklistItem(index)}
                          className="w-5 h-5 rounded border-slate-300"
                        />
                        <span className={`flex-1 ${item.done ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>چک‌لیستی تعریف نشده است</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-4 mt-4">
              <Card className="border-slate-200">
                <CardContent className="pt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="hours">ساعات</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        value={newTimeLog.hours}
                        onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">تاریخ</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newTimeLog.date}
                        onChange={(e) => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logDesc">توضیحات</Label>
                    <Textarea
                      id="logDesc"
                      value={newTimeLog.description}
                      onChange={(e) => setNewTimeLog({ ...newTimeLog, description: e.target.value })}
                      placeholder="کار انجام شده..."
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleAddTimeLog}
                    disabled={!newTimeLog.hours || createTimeLogMutation.isPending}
                  >
                    <Clock className="w-4 h-4 ml-2" />
                    ثبت زمان
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {timeLogs.map(log => (
                  <Card key={log.id} className="border-slate-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-900">{log.hours} ساعت</span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {formatJalaliDate(log.date, 'en')}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-slate-600 text-sm">{log.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {timeLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>هنوز زمانی ثبت نشده است</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>اطلاعات کلی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600 text-sm">وضعیت</Label>
                <div className="mt-2">
                  <StatusBadge status={task.status} />
                </div>
              </div>

              <div>
                <Label className="text-slate-600 text-sm">اولویت</Label>
                <div className="mt-2">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {task.deadline && (
                <div>
                  <Label className="text-slate-600 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    مهلت انجام
                  </Label>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatJalaliDate(task.deadline, 'en')}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-slate-600 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  زمان کار
                </Label>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">ثبت شده</span>
                    <span className="font-semibold text-slate-900">{totalLoggedHours}h</span>
                  </div>
                  {task.estimate_hours > 0 && (
                    <>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((totalLoggedHours / task.estimate_hours) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">تخمین</span>
                        <span className="font-semibold text-slate-900">{task.estimate_hours}h</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {task.checklist && task.checklist.length > 0 && (
                <div>
                  <Label className="text-slate-600 text-sm">پیشرفت چک‌لیست</Label>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {task.checklist.filter(i => i.done).length} از {task.checklist.length}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {Math.round((task.checklist.filter(i => i.done).length / task.checklist.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(task.checklist.filter(i => i.done).length / task.checklist.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}