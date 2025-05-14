
import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HoverTooltipProps {
  text: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delay?: number;
  className?: string;
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({
  text,
  children,
  side = "top",
  align = "center",
  delay = 0,
  className,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={delay}>
        <TooltipTrigger asChild>
          <div 
            onMouseEnter={() => setOpen(true)} 
            onMouseLeave={() => setOpen(false)}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HoverTooltip;
