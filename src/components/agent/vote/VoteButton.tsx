import React from "react";

type VoteButtonProps = {
  onVote: (value: number) => void;
  value: number;
  selected: boolean;
};

export const VoteButton: React.FC<VoteButtonProps> = ({ onVote, value, selected }) => {
  const handleClick = () => onVote(value);

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 border rounded ${selected ? "bg-green-600 text-white" : "bg-gray-100 text-black"}`}
      aria-pressed={selected}
    >
      {value}
    </button>
  );
};
