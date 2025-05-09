
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface UserStatsFooterProps {
  userCount: number;
  onRefresh: () => void;
}

export const UserStatsFooter: React.FC<UserStatsFooterProps> = ({
  userCount,
  onRefresh
}) => {
  return (
    <CardFooter className="flex justify-between">
      <div className="text-sm text-muted-foreground">
        {userCount} user{userCount !== 1 ? 's' : ''} in this workspace
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Refresh
      </Button>
    </CardFooter>
  );
};

export default UserStatsFooter;
