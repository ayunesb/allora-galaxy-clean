import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface UserEmail {
  email: string;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: UserEmail[];
}

export interface User {
  id: string;
  email: string;
  role: string;
  lastLogin: string;
  created_at?: string; 
  user_id?: string;
  profiles?: any;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onRemoveUser: (userId: string) => void;
  onOpenInviteDialog: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  searchQuery,
  onSearchChange,
  onUpdateRole,
  onRemoveUser,
  onOpenInviteDialog
}) => {
  // Helper functions
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-500">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500">Admin</Badge>;
      case 'member':
        return <Badge className="bg-green-500">Member</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={onOpenInviteDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage users and their roles within your workspace.
      </p>
      
      <div className="relative w-full md:w-64 mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input 
          placeholder="Search users..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {user.profiles?.avatar_url ? (
                        <AvatarImage src={user.profiles.avatar_url} />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(user.profiles?.first_name, user.profiles?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {user.profiles?.first_name || user.profiles?.last_name ? (
                        <div>
                          {user.profiles?.first_name} {user.profiles?.last_name}
                        </div>
                      ) : (
                        <div className="text-muted-foreground italic">Unnamed User</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.profiles?.email?.[0]?.email || "No email"}
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'admin')}>
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'member')}>
                        Set as Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole(user.user_id, 'viewer')}>
                        Set as Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => onRemoveUser(user.user_id)}
                      >
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No users found {searchQuery ? 'matching your search' : ''}
        </div>
      )}
    </div>
  );
};

export default UserTable;
