
terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.11"
    }
    supabase = {
      source = "supabase/supabase"
      version = "~> 1.0"
    }
  }

  backend "s3" {
    bucket = "allora-os-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# Environments
locals {
  environments = {
    production = {
      domain = "app.alloraos.com"
      environment_variables = {
        NODE_ENV = "production"
      }
    }
    staging = {
      domain = "staging.alloraos.com"
      environment_variables = {
        NODE_ENV = "staging"
      }
    }
  }
}

# Vercel project
resource "vercel_project" "allora_os" {
  name = "allora-os"
  framework = "vite"
  git_repository = {
    type = "github"
    repo = "yourorg/allora-galaxy"
  }
}

# Production environment
resource "vercel_deployment" "production" {
  project_id = vercel_project.allora_os.id
  production = true
  ref = "main"
}

resource "vercel_project_domain" "production" {
  project_id = vercel_project.allora_os.id
  domain     = local.environments.production.domain
}

# Staging environment
resource "vercel_deployment" "staging" {
  project_id = vercel_project.allora_os.id
  production = false
  ref = "develop"
}

resource "vercel_project_domain" "staging" {
  project_id = vercel_project.allora_os.id
  domain     = local.environments.staging.domain
}

# Supabase project
resource "supabase_project" "allora_os" {
  name = "allora-os"
  region = "us-east-1"
  db_password = var.db_password
}

# Supabase database
resource "supabase_database" "staging" {
  project_id = supabase_project.allora_os.id
  name       = "staging"
}

resource "supabase_database" "production" {
  project_id = supabase_project.allora_os.id
  name       = "production"
}
