
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoteButton } from './VoteButton';
import CommentSection from './CommentSection';
import { useAgentVote } from '@/hooks/useAgentVote';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AgentVotePanelProps {
  agentId: string;
  title?: string;
  variant?: 'small' | 'default';
}

export const AgentVotePanel: React.FC<AgentVotePanelProps> = ({ 
  agentId, 
  title = "Agent Feedback",
  variant = 'default'
}) => {
  const [activeTab, setActiveTab] = useState("vote");
  const { 
    userVote,
    upvotes,
    downvotes,
    comments,
    isLoading,
    submitVote,
    submitComment
  } = useAgentVote(agentId);

  const handleComment = async (comment: string): Promise<boolean> => {
    if (!userVote) {
      return false;
    }
    const result = await submitComment(comment);
    return result.success;
  };

  const isSmall = variant === 'small';

  if (isLoading) {
    return (
      <Card className={isSmall ? "w-full" : "max-w-md w-full"}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-6 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-24 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isSmall ? "w-full" : "max-w-md w-full"}>
      <CardHeader className={isSmall ? "pb-2" : "pb-3"}>
        <CardTitle className={isSmall ? "text-lg" : "text-xl"}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vote" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="comments">
              Comments {comments?.length > 0 && `(${comments.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="vote" className="pt-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-muted-foreground mb-4">
                What do you think of this agent's performance?
              </p>
              
              <div className="flex justify-center space-x-6 mb-4">
                <VoteButton 
                  type="up" 
                  count={upvotes} 
                  selected={userVote === 'up'}
                  onClick={() => submitVote('up')}
                />
                <VoteButton 
                  type="down" 
                  count={downvotes} 
                  selected={userVote === 'down'}
                  onClick={() => submitVote('down')}
                />
              </div>
              
              {userVote && (
                <>
                  <Separator className="my-4" />
                  <CommentSection 
                    comments={comments?.filter(c => c.user_id === 'currentUser') || []}
                    onSubmit={handleComment}
                  />
                </>
              )}
              
              {!userVote && comments?.length > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("comments")}
                  className="mt-4"
                >
                  View {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="pt-4">
            <CommentSection 
              comments={comments || []}
              onSubmit={handleComment}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
