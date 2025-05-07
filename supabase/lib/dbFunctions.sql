
-- Function to safely increment the completion_percentage of a strategy
CREATE OR REPLACE FUNCTION public.increment_percentage(
  current_value int, 
  strategy_id uuid,
  amount int
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_percentage int;
BEGIN
  -- Get the current percentage from the database
  SELECT completion_percentage INTO current_percentage 
  FROM strategies 
  WHERE id = strategy_id;
  
  -- Calculate the new percentage, ensuring it doesn't exceed 100
  RETURN LEAST(100, current_percentage + amount);
END;
$$;
