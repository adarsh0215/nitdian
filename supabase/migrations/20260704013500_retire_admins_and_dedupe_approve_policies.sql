-- The `admins` table is a second, orphaned authorization path: 0 rows, and
-- referenced by zero app code (COMPASS decision 3 retired it from the app in
-- Phase 2, but the DB-level RLS policies referencing it were never cleaned up).
-- The one real role model is member_memberships + membership_privilege
-- (see has_privilege / has_privilege_for_year, used below).
drop policy "Admins full access profiles" on public.profiles;
drop policy "Admins manage jobs" on public.jobs;
drop policy "Admins can read self" on public.admins;
drop policy "Service role manages admins" on public.admins;
drop table public.admins;

-- profiles_update_combined already grants exactly (A OR B) of these two --
-- pure duplication left over from when it was introduced to replace them.
drop policy "profiles_update_approve_all" on public.profiles;
drop policy "profiles_update_approve_batch" on public.profiles;
