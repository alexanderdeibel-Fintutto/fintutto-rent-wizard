-- Enable RLS on profiles table (fixes SUPA_rls_disabled_in_public and SUPA_policy_exists_rls_disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.profiles;

-- Create proper owner-based policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);