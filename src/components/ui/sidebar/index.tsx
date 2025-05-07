
// This is the main entry point that re-exports all sidebar components
import { SidebarProvider, useSidebar } from './SidebarProvider';
import { Sidebar, SidebarRail, SidebarInset } from './Sidebar';
import { SidebarTrigger } from './SidebarTrigger';
import { SidebarHeader, SidebarFooter, SidebarContent } from './SidebarLayout';
import { SidebarInput } from './SidebarInput';
import { 
  SidebarGroup, 
  SidebarGroupAction, 
  SidebarGroupContent, 
  SidebarGroupLabel 
} from './SidebarGroup';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuAction, 
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from './SidebarMenu';
import { SidebarSeparator } from './SidebarSeparator';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
