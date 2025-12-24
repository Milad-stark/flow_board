import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (language) => base44.auth.updateMe({ language }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      window.location.reload();
    },
  });

  const currentLanguage = user?.language || 'fa';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => updateLanguageMutation.mutate('fa')}
          className={currentLanguage === 'fa' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        >
          🇮🇷 فارسی
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => updateLanguageMutation.mutate('en')}
          className={currentLanguage === 'en' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}