import { VoteType } from '@/types/voting';
import React, { useState } from 'react';

const SomeVotingComponent = () => {
  const [vote, setVote] = useState<VoteType | null>(null);

  const handleVote = (voteType: VoteType) => {
    if (voteType === 'up') {
      // Handle upvote
    } else if (voteType === 'down') {
      // Handle downvote
    }
    setVote(voteType);
  };

  return (
    <div>
      <button onClick={() => handleVote('up')}>Upvote</button>
      <button onClick={() => handleVote('down')}>Downvote</button>
      <p>Current vote: {vote}</p>
    </div>
  );
};

export default SomeVotingComponent;