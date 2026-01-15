/*
  # Add Project Status Tracking

  1. Changes
    - Add `status` column to projects table with values 'active' or 'completed'
    - Add `completed_at` column to track when a project was marked as completed
    - Update existing projects to have 'active' status by default

  2. Purpose
    - Enable users to mark projects as complete and filter between active and completed projects
    - Track completion timestamps for historical data
    - Users can toggle projects between active and completed status freely
*/

-- Add status column with default value 'active'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add completed_at column for tracking completion timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Create index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Update existing projects to have 'active' status
UPDATE projects SET status = 'active' WHERE status IS NULL OR status = '';
