-- 20260704020000 was based on a false premise: a bug in the query used to
-- capture the 00000000000000 baseline (tgrelid::regnamespace is not a valid
-- namespace cast, so it silently matched nothing) made it look like no
-- triggers existed anywhere, when trg_profiles_set_updated_at and
-- trg_jobs_set_updated_at had been correctly maintaining updated_at via
-- moddatetime() the whole time. Found on verification right after applying;
-- reverting the redundant trigger + function here rather than rewriting the
-- migrations that already ran. The baseline file has since been corrected
-- to include the real triggers and the moddatetime extension they use.
drop trigger set_updated_at on public.profiles;
drop trigger set_updated_at on public.jobs;
drop function public.set_updated_at();
