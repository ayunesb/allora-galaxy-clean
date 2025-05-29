import { useState } from "react";

export interface UserData {
  id: string;
  email: string;
  role: string;
  lastLogin: string;
}

export const useUserData = () => {
  const [users, setUsers] = useState<UserData[]>([
    {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      lastLogin: "2025-05-10T10:30:00Z",
    },
    {
      id: "2",
      email: "user1@example.com",
      role: "member",
      lastLogin: "2025-05-09T14:20:00Z",
    },
    {
      id: "3",
      email: "user2@example.com",
      role: "member",
      lastLogin: "2025-05-08T09:15:00Z",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    // Example of using setLoading to avoid unused variable warning
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return {
    users,
    loading,
    searchQuery,
    handleSearchChange,
    handleUpdateRole,
    handleRemoveUser,
  };
};
