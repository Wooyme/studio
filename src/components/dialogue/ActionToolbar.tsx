// src/components/dialogue/ActionToolbar.tsx
"use client";

import { useGame } from '@/context/GameContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as LucideIcons from 'lucide-react';
import { gameActions } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function ActionToolbar() {
  const { 
    currentAction, 
    setCurrentAction, 
    currentBodyPart, 
    setCurrentBodyPart,
    currentTarget,
    setCurrentTarget,
    isActionReady,
    submitPlayerAction,
    isLoading
  } = useGame();
  const { t } = useLocalization();

  const handleActionClick = (actionId: string) => {
    setCurrentAction(gameActions.find(a => a.id === actionId) || null);
  }

  const getFullActionText = () => {
    if (!currentAction) return t('action.placeholder');
    let text = `${t(currentAction.name as any)} `;
    if (currentAction.requiresBodyPart && currentBodyPart) {
      text += `${t('action.with')} ${t(currentBodyPart.name as any)} `;
    }
    if (currentAction.requiresTarget && currentTarget) {
        text += `the "${currentTarget}"`;
    }
    return text;
  }

  const clearSelection = (part: 'action' | 'bodyPart' | 'target') => {
      if (part === 'action') setCurrentAction(null);
      if (part === 'bodyPart') setCurrentBodyPart(null);
      if (part === 'target') setCurrentTarget(null);
  }

  return (
    <TooltipProvider>
      <div className="p-2 border-t bg-card space-y-2">
        <Card className="p-2 flex items-center justify-between text-sm">
           <span className="text-muted-foreground flex-1 truncate">{getFullActionText()}</span>
           {isActionReady() ? (
               <Button size="sm" onClick={submitPlayerAction} disabled={isLoading}>{t('buttons.confirmAction')}</Button>
           ) : (
                <span className="text-xs text-muted-foreground/50">{t('action.hint')}</span>
           )}
        </Card>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                {gameActions.map(action => {
                    const Icon = (LucideIcons as any)[action.icon];
                    return (
                        <Tooltip key={action.id} delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleActionClick(action.id)}
                                className={cn("h-9 w-9", currentAction?.id === action.id && "ring-2 ring-primary")}
                                disabled={isLoading}
                                >
                                <Icon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t(action.name as any)}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
