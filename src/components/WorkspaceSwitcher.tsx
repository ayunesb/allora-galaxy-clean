
// Remove the unused Tenant import and fix the component
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function WorkspaceSwitcher() {
  const { tenant, tenants, setTenant } = useWorkspace();
  const [open, setOpen] = useState(false);

  if (!tenants || tenants.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between overflow-hidden"
        >
          <span className="truncate">{tenant?.name || "Select workspace"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandEmpty>No workspace found.</CommandEmpty>
          <CommandGroup>
            {tenants.map((workspace) => (
              <CommandItem
                key={workspace.id}
                onSelect={() => {
                  setTenant(workspace);
                  setOpen(false);
                }}
                className="text-sm"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    tenant?.id === workspace.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{workspace.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default WorkspaceSwitcher;
