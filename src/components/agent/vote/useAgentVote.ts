import { useState } from "react";
import { VoteType } from "@/types/shared";
import { useTenantId } from "@/hooks/useTenantId";

interface UseAgentVoteProps {
  agentVersionId: string;
  initialVoteType?: VoteType | null;
  initialComments?: string;
}

export function useAgentVote({
  agentVersionId,
  initialVoteType = null,
  initialComments = "",
}: UseAgentVoteProps) {
  const [voteType, setVoteType] = useState<VoteType | null>(initialVoteType);
  const [comments, setComments] = useState(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id: tenantId } = useTenantId();

  const submitVote = async () => {
    if (!voteType || !tenantId) return;

    setIsSubmitting(true);

    try {
      // Mock successful vote submission
      console.log(
        `Vote submitted: ${voteType} for agent ${agentVersionId} with comments: ${comments}`,
      );

      // In a real implementation, this would be a call to an API
      // await supabase.from('agent_votes').upsert({
      //   agent_version_id: agentVersionId,
      //   tenant_id: tenantId,
      //   vote_type: voteType,
      //   comment: comments,
      // });

      return true;
    } catch (error) {
      console.error("Error submitting vote:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitComment = async (comment: string) => {
    if (!tenantId) return;

    setIsSubmitting(true);
    setComments(comment);

    try {
      // Mock successful comment submission
      console.log(`Comment submitted for agent ${agentVersionId}: ${comment}`);

      // In a real implementation, this would update just the comment
      return true;
    } catch (error) {
      console.error("Error submitting comment:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    voteType,
    comments,
    isSubmitting,
    setVoteType,
    setComments,
    submitVote,
    submitComment,
  };
}
