-- profiles.updated_at / jobs.updated_at were never actually updated on writes:
-- no trigger existed, and no app code sets them. set_updated_at() already
-- existed in the DB for exactly this (just never wired up), but wasn't
-- captured in the 00000000000000 baseline since nothing used it at the time.
create or replace function public.set_updated_at()
 returns trigger
 language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();
