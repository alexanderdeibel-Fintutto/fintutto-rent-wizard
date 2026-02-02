-- =====================================================
-- SECURITY FIX: Enable RLS and restrict public access
-- Fixes 10 error-level security findings
-- =====================================================

-- =====================================================
-- 1. LEADS TABLE - Contains PII (emails, names, phones)
-- =====================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for lead generation forms
CREATE POLICY "Anonymous can submit leads"
ON public.leads FOR INSERT
TO anon
WITH CHECK (true);

-- Authenticated users can also insert leads
CREATE POLICY "Authenticated can submit leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can read all leads
CREATE POLICY "Admins can read all leads"
ON public.leads FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- Users can view leads assigned to them
CREATE POLICY "Users can view assigned leads"
ON public.leads FOR SELECT
TO authenticated
USING (assigned_to = auth.uid());

-- Admins can update leads
CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));


-- =====================================================
-- 2. ADMIN_LOGS TABLE - Internal operations log
-- =====================================================
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only administrators can read admin logs
CREATE POLICY "Only admins can read admin logs"
ON public.admin_logs FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- No client writes - service role only
CREATE POLICY "No client writes to admin logs"
ON public.admin_logs FOR INSERT
TO authenticated
WITH CHECK (false);


-- =====================================================
-- 3. AFFILIATE_TRACKING TABLE - Financial/commission data
-- Uses partner_users join table for partner relationship
-- =====================================================
ALTER TABLE public.affiliate_tracking ENABLE ROW LEVEL SECURITY;

-- Partners can view their own tracking data (via partner_users)
CREATE POLICY "Partners can view own tracking"
ON public.affiliate_tracking FOR SELECT
TO authenticated
USING (
  partner_id IN (
    SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid()
  )
);

-- Admins can view all tracking
CREATE POLICY "Admins can view all affiliate tracking"
ON public.affiliate_tracking FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- No client writes
CREATE POLICY "No client writes to affiliate tracking"
ON public.affiliate_tracking FOR INSERT
TO authenticated
WITH CHECK (false);


-- =====================================================
-- 4. AI_USAGE_LOGS TABLE - AI costs and usage
-- =====================================================
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI usage
CREATE POLICY "Users can view own AI usage"
ON public.ai_usage_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Org members can view org AI usage
CREATE POLICY "Org members can view org AI usage"
ON public.ai_usage_logs FOR SELECT
TO authenticated
USING (
  org_id IS NOT NULL 
  AND public.is_org_member(auth.uid(), org_id)
);

-- Admins can view all
CREATE POLICY "Admins can view all AI usage"
ON public.ai_usage_logs FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- No client writes
CREATE POLICY "No client writes to AI usage"
ON public.ai_usage_logs FOR INSERT
TO authenticated
WITH CHECK (false);


-- =====================================================
-- 5. SYSTEM_METRICS TABLE - Business metrics
-- =====================================================
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Only administrators can read
CREATE POLICY "Only admins can read system metrics"
ON public.system_metrics FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- Only admins can write
CREATE POLICY "Only admins can write system metrics"
ON public.system_metrics FOR INSERT
TO authenticated
WITH CHECK (public.has_role_by_name(auth.uid(), 'Administrator'));


-- =====================================================
-- 6. WEBHOOK_LOGS TABLE - Sensitive integration data
-- =====================================================
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- No client access - only service role
CREATE POLICY "No client access to webhook logs"
ON public.webhook_logs FOR ALL
TO authenticated
USING (false);


-- =====================================================
-- 7. ERROR_LOGS TABLE - System vulnerabilities info
-- =====================================================
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only administrators can read
CREATE POLICY "Only admins can read error logs"
ON public.error_logs FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- No client writes
CREATE POLICY "No client writes to error logs"
ON public.error_logs FOR INSERT
TO authenticated
WITH CHECK (false);


-- =====================================================
-- 8. PARTNERS TABLE - B2B relationships
-- Uses partner_users join table for user relationship
-- =====================================================
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Partner users can view their partner record (via partner_users)
CREATE POLICY "Partner users can view own partner record"
ON public.partners FOR SELECT
TO authenticated
USING (
  id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

-- Partner admins can update their partner record
CREATE POLICY "Partner admins can update own partner"
ON public.partners FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT partner_id FROM public.partner_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- System admins can view all partners
CREATE POLICY "Admins can view all partners"
ON public.partners FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- System admins can manage all partners
CREATE POLICY "Admins can manage all partners"
ON public.partners FOR ALL
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));


-- =====================================================
-- 9. AUDIT_LOGS TABLE - Security audit trail
-- =====================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role_by_name(auth.uid(), 'Administrator'));

-- Org members can view their org's audit logs
CREATE POLICY "Org members can view org audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  org_id IS NOT NULL 
  AND public.is_org_member(auth.uid(), org_id)
);

-- No client writes - service role only
CREATE POLICY "No client writes to audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (false);