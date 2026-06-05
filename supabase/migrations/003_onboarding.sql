-- Student onboarding questionnaire — one row per student, required before course access
create table public.student_onboarding (
  user_id           uuid primary key references public.users(id) on delete cascade,
  full_name         text,
  country           text,
  years_experience  text,
  offers_facials    text,
  primary_goal      text,
  work_setting      text,
  heard_about       text,
  biggest_challenge text,
  completed_at      timestamptz not null default now()
);

alter table public.student_onboarding enable row level security;

create policy "Users manage own onboarding"
  on public.student_onboarding
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.student_onboarding to authenticated;
grant all on public.student_onboarding to service_role;
