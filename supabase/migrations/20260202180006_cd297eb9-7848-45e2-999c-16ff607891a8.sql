-- =====================================================
-- FIX ERROR: RLS Disabled in Public
-- Enable RLS on tables: personas, stripe_webhook_events, vpi_cache
-- =====================================================

-- 1. PERSONAS TABLE
-- This appears to be a reference table for persona definitions
-- Making it read-only for authenticated users
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Personas are typically configuration data - allow read by authenticated users
CREATE POLICY "Authenticated users can read personas" 
ON public.personas 
FOR SELECT 
TO authenticated 
USING (true);

-- Only admins can modify personas (using has_role_by_name helper)
CREATE POLICY "Admins can manage personas" 
ON public.personas 
FOR ALL 
TO authenticated 
USING (public.has_role_by_name(auth.uid(), 'Administrator'));


-- 2. STRIPE_WEBHOOK_EVENTS TABLE
-- Contains Stripe webhook payloads - should only be accessible via service role
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = no direct access from clients
-- This table should only be accessed by Edge Functions using service_role
-- Adding a deny-all policy to make this explicit
CREATE POLICY "No client access to webhook events" 
ON public.stripe_webhook_events 
FOR ALL 
TO authenticated 
USING (false);


-- 3. VPI_CACHE TABLE  
-- Cache for VPI (Verbraucherpreisindex) data - public read, admin write
ALTER TABLE public.vpi_cache ENABLE ROW LEVEL SECURITY;

-- VPI data is public reference data - anyone can read
CREATE POLICY "Anyone can read VPI cache" 
ON public.vpi_cache 
FOR SELECT 
USING (true);

-- Only admins can modify VPI cache data
CREATE POLICY "Admins can manage VPI cache" 
ON public.vpi_cache 
FOR ALL 
TO authenticated 
USING (public.has_role_by_name(auth.uid(), 'Administrator'));