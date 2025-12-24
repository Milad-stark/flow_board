import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowRight, Clock, Zap, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatJalaliDateTime } from "@/utils/date";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChallengeDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('id');
  const [answer, setAnswer] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.list();
      return challenges.find(c => c.id === challengeId);
    },
    enabled: !!challengeId,
  });

  const { data: mySubmission } = useQuery({
    queryKey: ['mySubmission', challengeId, user?.id],
    queryFn: async () => {
      const submissions = await base44.entities.ChallengeSubmission.filter({
        challenge_id: challengeId,
        user_id: user.id
      });
      return submissions[0];
    },
    enabled: !!challengeId && !!user?.id,
  });

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['challengeSubmissions', challengeId],
    queryFn: () => base44.entities.ChallengeSubmission.filter({ challenge_id: challengeId }, 'submission_time'),
    enabled: !!challengeId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (answerData) => base44.entities.ChallengeSubmission.create(answerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubmission'] });
      queryClient.invalidateQueries({ queryKey: ['challengeSubmissions'] });
      setAnswer("");
    },
  });

  if (isLoading || !challenge) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!answer.trim()) return;
    submitAnswerMutation.mutate({
      challenge_id: challengeId,
      user_id: user.id,
      answer: answer,
      submission_time: new Date().toISOString()
    });
  };

  const approvedSubmissions = allSubmissions.filter(s => s.status === 'approved');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Leaderboard"))}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold">{challenge.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>توضیحات چالش</CardTitle>
                <Badge className="bg-purple-500 text-white">
                  {challenge.points} امتیاز
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {challenge.description}
              </p>

              {challenge.hints && challenge.hints.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <Label className="font-semibold mb-2 block">💡 راهنمایی‌ها:</Label>
                  <ul className="list-disc list-inside space-y-1">
                    {challenge.hints.map((hint, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {mySubmission ? (
            <Card className={`${
              mySubmission.status === 'approved' ? 'border-green-500 dark:border-green-700' : 
              mySubmission.status === 'rejected' ? 'border-red-500 dark:border-red-700' : 
              'border-yellow-500 dark:border-yellow-700'
            } border-2 dark:bg-slate-800`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {mySubmission.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {mySubmission.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  {mySubmission.status === 'pending' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  پاسخ شما
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{mySubmission.answer}</p>
                </div>
                
                {mySubmission.status === 'pending' && (
                  <Badge className="bg-yellow-500">
                    <Clock className="w-3 h-3 ml-1" />
                    در انتظار بررسی مدیر
                  </Badge>
                )}
                {mySubmission.status === 'approved' && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    تأیید شد - {mySubmission.points_awarded} امتیاز دریافت کردید
                  </Badge>
                )}
                {mySubmission.status === 'rejected' && (
                  <Badge className="bg-red-500">
                    <XCircle className="w-3 h-3 ml-1" />
                    رد شد
                  </Badge>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle>ارسال پاسخ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">پاسخ شما</Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="پاسخ خود را اینجا بنویسید..."
                    rows={8}
                    className="font-mono"
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitAnswerMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4 ml-2" />
                  ارسال پاسخ
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>اطلاعات چالش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">نوع</span>
                <Badge variant="outline">
                  {challenge.type === 'algorithm' && 'الگوریتم'}
                  {challenge.type === 'task' && 'وظیفه'}
                  {challenge.type === 'quiz' && 'آزمون'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">سختی</span>
                <Badge className={`
                  ${challenge.difficulty === 'easy' ? 'bg-green-500' : ''}
                  ${challenge.difficulty === 'medium' ? 'bg-yellow-500' : ''}
                  ${challenge.difficulty === 'hard' ? 'bg-red-500' : ''}
                `}>
                  {challenge.difficulty === 'easy' && 'آسان'}
                  {challenge.difficulty === 'medium' && 'متوسط'}
                  {challenge.difficulty === 'hard' && 'سخت'}
                </Badge>
              </div>

              {challenge.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">مهلت</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatJalaliDateTime(challenge.deadline, 'en')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>
                افراد پاسخ‌دهنده ({approvedSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedSubmissions.map((submission, index) => {
                  const submissionUser = users.find(u => u.id === submission.user_id);
                  return (
                    <div key={submission.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                      <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={submissionUser?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {submissionUser?.full_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{submissionUser?.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatJalaliDateTime(submission.submission_time, 'en')}
                        </p>
                      </div>
                      <Badge className="bg-green-500">
                        +{submission.points_awarded}
                      </Badge>
                    </div>
                  );
                })}
                
                {approvedSubmissions.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    هنوز کسی پاسخ تأیید شده ندارد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}