
import React from "react";
import { diffLines } from "diff";

interface PromptDiffViewerProps {
  oldPrompt: string;
  newPrompt: string;
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

const PromptDiffViewer: React.FC<PromptDiffViewerProps> = ({
  oldPrompt,
  newPrompt,
}) => {
  const diff = diffLines(oldPrompt || "", newPrompt || "");

  return (
    <div className="font-mono text-sm overflow-auto max-h-96 border rounded-md">
      {diff.map((part: DiffPart, index: number) => {
        const color = part.added
          ? "bg-green-100 text-green-800"
          : part.removed
          ? "bg-red-100 text-red-800"
          : "bg-transparent";
        
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        
        return (
          <pre
            key={index}
            className={`p-1 whitespace-pre-wrap ${color}`}
          >
            {part.value.split('\n').map((line: string, lineIndex: number, array: string[]) => {
              // Skip empty lines at the end of the diff part
              if (lineIndex === array.length - 1 && line === '') {
                return null;
              }
              
              return (
                <div key={lineIndex} className="px-2">
                  {prefix}
                  {line}
                </div>
              );
            })}
          </pre>
        );
      })}
    </div>
  );
};

export default PromptDiffViewer;
