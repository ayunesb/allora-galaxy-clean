import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DateRange } from "@/types/logs";

export interface SystemLogFilter {
  searchTerm?: string;
  module?: string;
  tenant?: string;
  dateRange?: DateRange;
}

export const fetchSystemLogs = async (filters: SystemLogFilter = {}) => {
  let query = supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.searchTerm) {
    query = query.or(
      `event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`,
    );
  }

  if (filters.module) {
    query = query.eq("module", filters.module);
  }

  if (filters.tenant) {
    query = query.eq("tenant_id", filters.tenant);
  }

  if (filters.dateRange?.from) {
    const fromDate = format(filters.dateRange.from, "yyyy-MM-dd");
    query = query.gte("created_at", `${fromDate}T00:00:00`);
  }

  if (filters.dateRange?.to) {
    const toDate = format(filters.dateRange.to, "yyyy-MM-dd");
    query = query.lte("created_at", `${toDate}T23:59:59`);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error("Error fetching system logs:", error);
    throw error;
  }

  return data;
};

export const fetchLogModules = async () => {
  // Using a different approach to get distinct values
  const { data, error } = await supabase.from("system_logs").select("module");

  if (error) {
    console.error("Error fetching log modules:", error);
    throw error;
  }

  // Extract unique module names
  const uniqueModules = Array.from(
    new Set(data.map((item) => item.module).filter(Boolean)),
  );
  return uniqueModules;
};

export const fetchTenants = async () => {
  const { data, error } = await supabase.from("tenants").select("id, name");

  if (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }

  return data;
};
