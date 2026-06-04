-- Lesson notes — private per-student, per-lesson
create table public.lesson_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  content    text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_notes enable row level security;

create policy "Students read own notes"
  on public.lesson_notes for select using (auth.uid() = user_id);

create policy "Students insert own notes"
  on public.lesson_notes for insert with check (auth.uid() = user_id);

create policy "Students update own notes"
  on public.lesson_notes for update using (auth.uid() = user_id);

create trigger lesson_notes_updated_at
  before update on public.lesson_notes
  for each row execute function public.set_updated_at();

-- Grant access to authenticated role
grant select, insert, update on public.lesson_notes to authenticated;
