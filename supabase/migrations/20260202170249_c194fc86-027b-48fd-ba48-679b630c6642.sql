-- =====================================================
-- SECURITY FIX: Comprehensive RLS Policy Setup
-- =====================================================

-- 1. Create security definer function for role checks (using existing schema)
CREATE OR REPLACE FUNCTION public.has_role_by_name(_user_id UUID, _role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = _user_id
          AND r.name = _role_name
    )
$$;

-- 2. Helper function to check org membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.org_memberships
        WHERE user_id = _user_id
          AND org_id = _org_id
          AND status = 'active'
    )
$$;

-- =====================================================
-- FIX: user_profiles table
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_all" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- =====================================================
-- FIX: stripe_payments table (via stripe_customer_id link to subscriptions)
-- =====================================================
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.stripe_payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.stripe_payments;

-- Users can see payments linked to their org's stripe customer
CREATE POLICY "Users can view own payments" ON public.stripe_payments
    FOR SELECT TO authenticated
    USING (
        stripe_customer_id IN (
            SELECT s.stripe_customer_id 
            FROM public.subscriptions s
            JOIN public.org_memberships om ON s.org_id = om.org_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- =====================================================
-- FIX: products table (allow public read for pricing pages)
-- =====================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Products should be publicly viewable for pricing pages
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT
    USING (is_active = true);

-- Only admins can modify products
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL TO authenticated
    USING (public.has_role_by_name(auth.uid(), 'Administrator'))
    WITH CHECK (public.has_role_by_name(auth.uid(), 'Administrator'));

-- =====================================================
-- FIX: organizations table
-- =====================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.organizations;
DROP POLICY IF EXISTS "Members can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update own organization" ON public.organizations;

CREATE POLICY "Members can view own organization" ON public.organizations
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT org_id FROM public.org_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Owners can update own organization" ON public.organizations
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT org_id FROM public.org_memberships 
            WHERE user_id = auth.uid() 
              AND status = 'active' 
              AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        id IN (
            SELECT org_id FROM public.org_memberships 
            WHERE user_id = auth.uid() 
              AND status = 'active' 
              AND role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- FIX: reading_reminders table
-- =====================================================
ALTER TABLE public.reading_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminders" ON public.reading_reminders;
DROP POLICY IF EXISTS "Users can create own reminders" ON public.reading_reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON public.reading_reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON public.reading_reminders;

CREATE POLICY "Users can view own reminders" ON public.reading_reminders
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own reminders" ON public.reading_reminders
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reminders" ON public.reading_reminders
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reminders" ON public.reading_reminders
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- =====================================================
-- FIX: subscriptions table
-- =====================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view org subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view org subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (
        org_id IN (
            SELECT org_id FROM public.org_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- FIX: stripe_prices table (public read for pricing pages)
-- =====================================================
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.stripe_prices;
DROP POLICY IF EXISTS "Public can view active prices" ON public.stripe_prices;

CREATE POLICY "Public can view active prices" ON public.stripe_prices
    FOR SELECT
    USING (active = true);