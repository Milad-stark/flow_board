import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X, Clock, Eye } from "lucide-react";
import { formatJalaliDateTime } from "@/utils/date";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChallengeManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "algorithm",
    difficulty: "medium",
    points: 10,
    deadline: "",
    correct_answer: ""
  });

  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['allChallenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date'),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['pendingSubmissions'],
    queryFn: () => base44.entities.ChallengeSubmission.filter({ status: 'pending' }, '-submission_time'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const createChallengeMutation = useMutation({
    mutationFn: (challengeData) => base44.entities.Challenge.create(challengeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allChallenges'] });
      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        type: "algorithm",
        difficulty: "medium",
        points: 10,
        deadline: "",
        correct_answer: ""
      });
    },
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, status, points }) => {
      await base44.entities.ChallengeSubmission.update(submissionId, {
        status,
        points_awarded: status === 'approved' ? points : 0,
        reviewed_by: (await base44.auth.me()).id
      });
      
      if (status === 'approved') {
        const submission = submissions.find(s => s.id === submissionId);
        const user = users.find(u => u.id === submission.user_id);
        const newPoints = (user.total_points || 0) + points;
        await base44.auth.updateMe({ total_points: newPoints });
        
        await base44.entities.Achievement.create({
          user_id: submission.user_id,
          points,
          reason: 'fast_completion',
          description: `حل چالش: ${challenges.find(c => c.id === submission.challenge_id)?.title}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createChallengeMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت مسابقات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">ایجاد و مدیریت چالش‌ها</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-4 h-4 ml-2" />
          چالش جدید
        </Button>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenges">
            چالش‌ها ({challenges.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            در انتظار بررسی ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{challenge.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge>{challenge.points} امتیاز</Badge>
                        <Badge variant="outline">{challenge.type}</Badge>
                        <Badge variant="outline">{challenge.difficulty}</Badge>
                        {challenge.is_active ? (
                          <Badge className="bg-green-500">فعال</Badge>
                        ) : (
                          <Badge variant="outline">غیرفعال</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4 mt-6">
          {submissions.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="py-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">پاسخی برای بررسی وجود ندارد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => {
                const challenge = challenges.find(c => c.id === submission.challenge_id);
                const user = users.find(u => u.id === submission.user_id);
                
                return (
                  <Card key={submission.id} className="dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {user?.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold">{user?.full_name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">چالش: {challenge?.title}</p>
                            </div>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 ml-1" />
                              {formatJalaliDateTime(submission.submission_time, 'en')}
                            </Badge>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mb-4">
                            <Label className="text-sm font-medium mb-2 block">پاسخ کاربر:</Label>
                            <p className="text-sm whitespace-pre-wrap">{submission.answer}</p>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                            <Label className="text-sm font-medium mb-2 block">پاسخ صحیح:</Label>
                            <p className="text-sm whitespace-pre-wrap">{challenge?.correct_answer}</p>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button
                              onClick={() => reviewSubmissionMutation.mutate({
                                submissionId: submission.id,
                                status: 'approved',
                                points: challenge?.points || 10
                              })}
                              disabled={reviewSubmissionMutation.isPending}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check className="w-4 h-4 ml-2" />
                              تأیید ({challenge?.points} امتیاز)
                            </Button>
                            <Button
                              onClick={() => reviewSubmissionMutation.mutate({
                                submissionId: submission.id,
                                status: 'rejected',
                                points: 0
                              })}
                              disabled={reviewSubmissionMutation.isPending}
                              variant="destructive"
                            >
                              <X className="w-4 h-4 ml-2" />
                              رد
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>ایجاد چالش جدید</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان چالش *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">نوع</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algorithm">الگوریتم</SelectItem>
                    <SelectItem value="task">وظیفه</SelectItem>
                    <SelectItem value="quiz">آزمون</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">سطح دشواری</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">آسان</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">سخت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">امتیاز</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">مهلت</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correct_answer">پاسخ صحیح *</Label>
              <Textarea
                id="correct_answer"
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                rows={3}
                placeholder="پاسخ صحیح را وارد کنید (فقط مدیران می‌بینند)"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                انصراف
              </Button>
              <Button type="submit" disabled={createChallengeMutation.isPending}>
                ایجاد چالش
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}