import React from "react";
import { VoteButton } from "./VoteButton";

type AgentVotePanelProps = {
  onVote: (score: number) => void;
  selectedScore: number;
};

export const AgentVotePanel: React.FC<AgentVotePanelProps> = ({ onVote, selectedScore }) => {
  return (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <VoteButton
          key={score}
          value={score}
          selected={selectedScore === score}
          onVote={onVote}
        />
      ))}
    </div>
  );
};
