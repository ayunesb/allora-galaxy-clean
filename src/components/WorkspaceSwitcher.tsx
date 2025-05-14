
import React from 'react';
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function WorkspaceSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const { currentWorkspace, setCurrentWorkspace, workspaces, loading } = useWorkspace();

  if (loading) {
    return (
      <Button
        variant="outline"
        className={cn("w-[200px] justify-start", className)}
      >
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-[100px] ml-2" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className={cn("w-[200px] justify-between", className)}
        >
          {currentWorkspace ? (
            <>
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${currentWorkspace.id}.png`}
                  alt={currentWorkspace.name}
                />
                <AvatarFallback>{currentWorkspace.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {currentWorkspace.name}
            </>
          ) : (
            "Select workspace"
          )}
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search workspace..." />
            <CommandEmpty>No workspace found.</CommandEmpty>
            
            <CommandGroup heading="Workspaces">
              {workspaces?.map((workspace) => (
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
                      src={`https://avatar.vercel.sh/${workspace.id}.png`}
                      alt={workspace.name}
                    />
                    <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {workspace.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentWorkspace?.id === workspace.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
