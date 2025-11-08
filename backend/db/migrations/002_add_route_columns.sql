-- Add optional metadata columns to routes table for filtering/UI
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS vessel_type TEXT,
  ADD COLUMN IF NOT EXISTS fuel_type TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER;
