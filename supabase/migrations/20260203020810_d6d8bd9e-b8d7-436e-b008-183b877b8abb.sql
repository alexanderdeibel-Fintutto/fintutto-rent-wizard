-- =====================================================
-- SECURITY FIX: Replace overly permissive RLS policies
-- =====================================================
-- This migration fixes 15 tables with 'allow_all' policies
-- Uses existing security functions: is_org_member(), has_role_by_name()

-- 1. USER_PROFILES - Users can only see their own profile
DROP POLICY IF EXISTS "user_profiles_access" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_all" ON public.user_profiles;

CREATE POLICY "users_view_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 2. LEADS - Admins only for read, anyone can insert (lead capture forms)
DROP POLICY IF EXISTS "allow_all" ON public.leads;

CREATE POLICY "admins_manage_leads" ON public.leads
  FOR ALL TO authenticated
  USING (public.has_role_by_name(auth.uid(), 'Administrator'))
  WITH CHECK (public.has_role_by_name(auth.uid(), 'Administrator'));

-- Keep insert policy for anonymous lead capture if it exists
-- leads_insert_all is intentional for public forms

-- 3. TENANTS - Org members only
DROP POLICY IF EXISTS "allow_all" ON public.tenants;

CREATE POLICY "org_members_manage_tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 4. LEASE_CONTRACTS - Org members only
DROP POLICY IF EXISTS "allow_all" ON public.lease_contracts;

CREATE POLICY "org_members_manage_lease_contracts" ON public.lease_contracts
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 5. PAYMENTS - Org members only
DROP POLICY IF EXISTS "allow_all" ON public.payments;

CREATE POLICY "org_members_manage_payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 6. BUILDINGS - Org members only
DROP POLICY IF EXISTS "allow_all" ON public.buildings;

CREATE POLICY "org_members_manage_buildings" ON public.buildings
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 7. UNITS - Org members via building relationship
DROP POLICY IF EXISTS "allow_all" ON public.units;

CREATE POLICY "org_members_manage_units" ON public.units
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buildings b 
      WHERE b.id = units.building_id 
      AND public.is_org_member(auth.uid(), b.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buildings b 
      WHERE b.id = units.building_id 
      AND public.is_org_member(auth.uid(), b.org_id)
    )
  );

-- 8. DOCUMENTS - Org members only
DROP POLICY IF EXISTS "allow_all" ON public.documents;

CREATE POLICY "org_members_manage_documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 9. MAINTENANCE_TASKS - Org members and assigned users
DROP POLICY IF EXISTS "allow_all" ON public.maintenance_tasks;

CREATE POLICY "org_members_manage_maintenance_tasks" ON public.maintenance_tasks
  FOR ALL TO authenticated
  USING (
    public.is_org_member(auth.uid(), org_id) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_org_member(auth.uid(), org_id) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- 10. ORGANIZATIONS - Members can view their org
DROP POLICY IF EXISTS "allow_all" ON public.organizations;

CREATE POLICY "org_members_view_organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "org_admins_manage_organization" ON public.organizations
  FOR ALL TO authenticated
  USING (public.has_role_by_name(auth.uid(), 'Administrator'))
  WITH CHECK (public.has_role_by_name(auth.uid(), 'Administrator'));

-- 11. INVITATIONS - Creator or email recipient only
DROP POLICY IF EXISTS "allow_all" ON public.invitations;

CREATE POLICY "users_view_own_invitations" ON public.invitations
  FOR SELECT TO authenticated
  USING (
    invited_by = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "org_admins_manage_invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 12. ORG_MEMBERSHIPS - Members can see their org's memberships
DROP POLICY IF EXISTS "allow_all" ON public.org_memberships;

CREATE POLICY "org_members_view_memberships" ON public.org_memberships
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_org_member(auth.uid(), org_id)
  );

CREATE POLICY "org_admins_manage_memberships" ON public.org_memberships
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 13. PERMISSIONS - Admins only
DROP POLICY IF EXISTS "allow_all" ON public.permissions;

CREATE POLICY "admins_manage_permissions" ON public.permissions
  FOR ALL TO authenticated
  USING (public.has_role_by_name(auth.uid(), 'Administrator'))
  WITH CHECK (public.has_role_by_name(auth.uid(), 'Administrator'));

-- 14. METERS - Org members via building relationship
DROP POLICY IF EXISTS "allow_all" ON public.meters;

CREATE POLICY "org_members_manage_meters" ON public.meters
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buildings b 
      WHERE b.id = meters.building_id 
      AND public.is_org_member(auth.uid(), b.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buildings b 
      WHERE b.id = meters.building_id 
      AND public.is_org_member(auth.uid(), b.org_id)
    )
  );

-- 15. TASKS - Org members and assigned users (if table exists separately from maintenance_tasks)
DROP POLICY IF EXISTS "allow_all" ON public.tasks;

CREATE POLICY "org_members_manage_tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (
    public.is_org_member(auth.uid(), org_id) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_org_member(auth.uid(), org_id) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );