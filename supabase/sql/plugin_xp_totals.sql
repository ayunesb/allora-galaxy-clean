
CREATE OR REPLACE VIEW plugin_xp_totals AS  
SELECT  
  plugin_id,  
  SUM(xp_earned) AS total_xp,  
  COUNT(*) AS executions  
FROM plugin_logs  
GROUP BY plugin_id;
