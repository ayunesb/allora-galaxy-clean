
output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.allora_os.id
}

output "production_url" {
  description = "Production URL"
  value       = "https://${local.environments.production.domain}"
}

output "staging_url" {
  description = "Staging URL"
  value       = "https://${local.environments.staging.domain}"
}

output "supabase_project_id" {
  description = "Supabase project ID"
  value       = supabase_project.allora_os.id
}
