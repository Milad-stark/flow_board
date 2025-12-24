import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, FolderKanban, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/components/common/TranslationProvider";

export default function Projects() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const language = user?.language || 'en';
  const { t } = useTranslation(language);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const createProjectMutation = useMutation({
    mutationFn: (projectData) => base44.entities.Project.create(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateDialog(false);
      setFormData({ name: "", description: "", color: "#3B82F6" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowEditDialog(false);
      setSelectedProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowDeleteDialog(false);
      setSelectedProject(null);
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProjectMutation.mutate({ id: selectedProject.id, data: formData });
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      color: project.color || "#3B82F6"
    });
    setShowEditDialog(true);
  };

  const handleDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const progress = projectTasks.length > 0 
      ? Math.round((completed / projectTasks.length) * 100) 
      : 0;
    
    return {
      total: projectTasks.length,
      completed,
      progress
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('projectsTitle')}</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-1">{projects.length} {t('activeProjectsCount')}</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Plus className={`w-5 h-5 ${language === 'fa' ? 'ml-2' : 'mr-2'}`} />
          {t('newProject')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const stats = getProjectStats(project.id);
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ backgroundColor: project.color }}
                      >
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg dark:text-white">{project.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 dark:border-slate-600 dark:text-slate-300">
                          {project.status === 'active' ? t('active') : t('inactive')}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="dark:hover:bg-slate-700">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                        <DropdownMenuItem onClick={() => handleEdit(project)} className="dark:text-white dark:hover:bg-slate-700">
                          <Edit className={`w-4 h-4 ${language === 'fa' ? 'ml-2' : 'mr-2'}`} />
                          {t('editProject')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(project)}
                          className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700"
                        >
                          <Trash2 className={`w-4 h-4 ${language === 'fa' ? 'ml-2' : 'mr-2'}`} />
                          {t('deleteProject')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-gray-400">{t('progress')}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.progress}%`,
                          backgroundColor: project.color
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-gray-400">{stats.total} {t('tasks')}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">{stats.completed} {t('completed')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t('noProjectsYet')}
          </h3>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            {t('createFirstProject')}
          </p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('createProject')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">{t('projectName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('projectNamePlaceholder')}
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-gray-300">{t('projectDescription')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('projectDescriptionPlaceholder')}
                rows={3}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="dark:text-gray-300">{t('projectColor')}</Label>
              <div className="flex gap-2">
                {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-300' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className={`flex ${language === 'fa' ? 'justify-start' : 'justify-end'} gap-3 pt-4`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {t('create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('editProjectTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="dark:text-gray-300">{t('projectName')} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('projectNamePlaceholder')}
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="dark:text-gray-300">{t('projectDescription')}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('projectDescriptionPlaceholder')}
                rows={3}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-color" className="dark:text-gray-300">{t('projectColor')}</Label>
              <div className="flex gap-2">
                {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-slate-300' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className={`flex ${language === 'fa' ? 'justify-start' : 'justify-end'} gap-3 pt-4`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={updateProjectMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {t('saveChanges')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">{t('confirmDeleteProject')}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              {t('deleteProjectWarning', { name: selectedProject?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProject && deleteProjectMutation.mutate(selectedProject.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('deleteProject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
