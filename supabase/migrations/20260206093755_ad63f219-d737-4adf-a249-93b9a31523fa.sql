-- Add missing 'name' column for saved calculations
ALTER TABLE public.calculations 
ADD COLUMN IF NOT EXISTS name text;

-- Add a comment explaining the column
COMMENT ON COLUMN public.calculations.name IS 'User-defined name for the saved calculation';