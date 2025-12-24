import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function TaskForm({ task, projects, onSubmit, onCancel, isLoading }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const [formData, setFormData] = useState(task || {
    title: "",
    description: "",
    project_id: projects[0]?.id || "",
    priority: "medium",
    status: "todo",
    deadline: "",
    labels: [],
    estimate_hours: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t('taskTitle')} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('taskTitlePlaceholder')}
          required
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('taskDescription')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('taskDescriptionPlaceholder')}
          rows={4}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">{t('project')} *</Label>
          <Select
            value={formData.project_id}
            onValueChange={(value) => setFormData({ ...formData, project_id: value })}
          >
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue placeholder={t('selectProject')} />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800">
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id} className="dark:text-white">
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">{t('priority')}</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800">
              <SelectItem value="low" className="dark:text-white">{t('low')}</SelectItem>
              <SelectItem value="medium" className="dark:text-white">{t('medium')}</SelectItem>
              <SelectItem value="high" className="dark:text-white">{t('high')}</SelectItem>
              <SelectItem value="critical" className="dark:text-white">{t('critical')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t('status')}</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800">
              <SelectItem value="todo" className="dark:text-white">{t('todo')}</SelectItem>
              <SelectItem value="in_progress" className="dark:text-white">{t('in_progress')}</SelectItem>
              <SelectItem value="in_review" className="dark:text-white">{t('in_review')}</SelectItem>
              <SelectItem value="blocked" className="dark:text-white">{t('blocked')}</SelectItem>
              <SelectItem value="done" className="dark:text-white">{t('done')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">{t('deadlineLabel')}</Label>
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimate">{t('estimateHours')}</Label>
        <Input
          id="estimate"
          type="number"
          min="0"
          step="0.5"
          value={formData.estimate_hours}
          onChange={(e) => setFormData({ ...formData, estimate_hours: parseFloat(e.target.value) })}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
      </div>

      <div className={`flex ${language === 'fa' ? 'justify-start' : 'justify-end'} gap-3 pt-4 border-t dark:border-slate-700`}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <X className={`w-4 h-4 ${language === 'fa' ? 'ml-2' : 'mr-2'}`} />
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className={`w-4 h-4 ${language === 'fa' ? 'ml-2' : 'mr-2'}`} />
          {task ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
}
