import React from "react";
import { diffLines, Change } from "diff";
import * as Diff from 'diff'; // Ensure proper import for the 'diff' module

interface PromptDiffViewerProps {
  oldPrompt: string;
  newPrompt: string;
}

const PromptDiffViewer: React.FC<PromptDiffViewerProps> = ({
  oldPrompt,
  newPrompt,
}) => {
  const diff = diffLines(oldPrompt || "", newPrompt || "");

  return (
    <div role="region" className="font-mono text-sm overflow-auto max-h-96 border rounded-md">
      {diff.map((part: Diff.Change, index: number) => {
        const color = part.added
          ? "bg-green-100 text-green-800"
          : part.removed
          ? "bg-red-100 text-red-800"
          : "bg-transparent";
        
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        
        return (
          <div role="region" key={index} className={`p-1 whitespace-pre-wrap ${color}`}>
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
          </div>
        );
      })}
    </div>
  );
};

export default PromptDiffViewer;
