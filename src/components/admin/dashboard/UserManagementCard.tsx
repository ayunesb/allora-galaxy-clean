import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserTable, { User } from "../users/UserTable";

interface UserManagementCardProps {
  users: User[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onRemoveUser: (userId: string) => void;
  onOpenInviteDialog: () => void;
}

export function UserManagementCard({
  users,
  loading,
  searchQuery,
  onSearchChange,
  onUpdateRole,
  onRemoveUser,
  onOpenInviteDialog,
}: UserManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users and their roles within the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable
          users={users}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onUpdateRole={onUpdateRole}
          onRemoveUser={onRemoveUser}
          onOpenInviteDialog={onOpenInviteDialog}
        />
      </CardContent>
    </Card>
  );
}
