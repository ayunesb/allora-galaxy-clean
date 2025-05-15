
import { format } from 'date-fns';

// Function to format date strings with fallback for undefined/null values
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'PPp');
  } catch (error) {
    return dateString;
  }
};

// Helper function to format user data
export const formatUser = (user: any) => {
  if (!user) return 'Unknown User';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  // Check if user is a string (just the ID)
  if (typeof user === 'string') {
    return user.substring(0, 8) + '...';
  }
  
  return user.first_name || user.last_name || user.email || user.id?.substring(0, 8) + '...';
};
