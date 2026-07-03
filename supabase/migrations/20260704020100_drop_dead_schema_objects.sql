-- Dead schema objects found while closing out Phase 4's foundations work,
-- none referenced by app code (zero .from()/.rpc() callers) or by the
-- functions actually used in RLS (has_privilege / has_privilege_for_year,
-- which only touch member_memberships + membership_privilege).

-- email_text domain is NOT dropped: profiles.email actually uses it
-- (information_schema.udt_name reports domain-typed columns under their
-- base representation, which is what made it look unused at first).

-- get_active_privileges/get_user_privileges are the only things that join
-- membership_type, and neither is called anywhere; app_is_active_admin is
-- the same kind of leftover as the admins table dropped in P4.2 (checks
-- member_memberships directly, but nothing calls it either). All three
-- must go before membership_type so nothing references it.
drop function public.get_active_privileges(text);
drop function public.get_user_privileges(text);
drop function public.app_is_active_admin(text);

-- Unused lookup tables: app hardcodes these values in
-- lib/validation/onboarding.ts instead of reading from them.
drop table public.employment_type;
drop table public.membership_type;

-- login_history (613 rows, orphaned since P0.3) and its dependent view
-- user_signin_pivot_last_10_days are deliberately kept -- real historical
-- data, not dropping it without a decision to do so (see docs/tickets.md P5.2).
