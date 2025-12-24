import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, List, Grid } from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import FilterBar from "../components/tasks/FilterBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "../components/tasks/TaskForm";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function TaskList() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    project: "all"
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date'),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateDialog(false);
    },
  });

  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (filters.project !== "all" && task.project_id !== filters.project) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('taskList')}</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">
            {filteredTasks.length} {t('tasksFound')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            {t('newTask')}
          </Button>
        </div>
      </div>

      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        projects={projects}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {!isLoading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t('noTasksFound')}
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            {t('searchWithFilters')}
          </p>
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('createTask')}</DialogTitle>
          </DialogHeader>
          <TaskForm
            projects={projects}
            onSubmit={(data) => createTaskMutation.mutate(data)}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
