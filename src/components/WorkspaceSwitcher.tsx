
import React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function WorkspaceSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { currentWorkspace, tenants, setCurrentWorkspace, loading } = useWorkspace();

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-between opacity-70">
        <div className="flex items-center gap-2 truncate">
          <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse"></div>
          <span className="w-20 h-4 bg-gray-200 rounded animate-pulse"></span>
        </div>
        <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (!currentWorkspace) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${currentWorkspace.name}.png`}
                alt={currentWorkspace.name}
              />
              <AvatarFallback>
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{currentWorkspace.name}</span>
          </div>
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search workspace..." />
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {tenants.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => {
                    setCurrentWorkspace(workspace);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${workspace.name}.png`}
                      alt={workspace.name}
                    />
                    <AvatarFallback>
                      {workspace.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{workspace.name}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentWorkspace.id === workspace.id 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
