
// Create a mock implementation of Supabase client for testing
import { vi } from 'vitest';
import { supabase as mockClient } from '@/__mocks__/supabaseClient';

// Export the centralized mock implementation
export const supabase = mockClient;
