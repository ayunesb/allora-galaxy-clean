import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { voteOnAgentVersion } from "@/lib/agents/vote";
import { toast } from "@/hooks/use-toast";

interface AgentVotePanelProps {
  agent_version_id: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userId: string;
  disabled?: boolean;
}

const AgentVotePanel = ({ 
  agent_version_id,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userId,
  disabled = false
}: AgentVotePanelProps) => {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(disabled);

  const handleVote = async () => {
    if (!vote || !userId || hasVoted) return;
    
    setIsSubmitting(true);
    try {
      const result = await voteOnAgentVersion(
        agent_version_id,
        vote,
        userId,
        comment
      );
      
      if (result.success) {
        setUpvotes(result.upvotes);
        setDownvotes(result.downvotes);
        setHasVoted(true);
        toast({
          title: "Vote recorded",
          description: "Thank you for your feedback!"
        });
      } else {
        throw new Error(result.error || "Failed to submit vote");
      }
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error submitting vote",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={vote === 'up' ? "default" : "outline"}
          size="sm"
          onClick={() => !hasVoted && setVote('up')}
          disabled={hasVoted || isSubmitting}
          className={vote === 'up' ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          <span>{upvotes}</span>
        </Button>
        
        <Button
          variant={vote === 'down' ? "default" : "outline"}
          size="sm"
          onClick={() => !hasVoted && setVote('down')}
          disabled={hasVoted || isSubmitting}
          className={vote === 'down' ? "bg-red-600 hover:bg-red-700" : ""}
        >
          <ThumbsDown className="mr-1 h-4 w-4" />
          <span>{downvotes}</span>
        </Button>
      </div>
      
      {vote && !hasVoted && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            disabled={isSubmitting}
          />
          
          <Button 
            onClick={handleVote}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </div>
      )}
      
      {hasVoted && (
        <p className="text-sm text-muted-foreground">
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
};

export default AgentVotePanel;
