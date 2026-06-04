-- ============================================================
-- FaceSculpt LMS — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- Extends Supabase auth.users with profile data
-- ============================================================
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null,
  role         text not null default 'student' check (role in ('student', 'admin')),
  stripe_customer_id text,
  access_expires_at  timestamptz,        -- null = no expiry (lifetime access)
  enrolled_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- MODULES
-- ============================================================
create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  order_index  integer not null,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (order_index)
);

-- ============================================================
-- LESSONS
-- ============================================================
create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  title        text not null,
  order_index  integer not null,
  type         text not null check (type in ('theory', 'video', 'quiz', 'download', 'info')),
  content_html text,
  video_url    text,         -- Vimeo video ID (e.g. "123456789")
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (module_id, order_index)
);

-- ============================================================
-- LESSON RESOURCES
-- Downloadable files attached to lessons (PDFs, worksheets, etc.)
-- ============================================================
create table public.lesson_resources (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  label        text not null,            -- e.g. "Muscle Reference PDF"
  file_path    text not null,            -- Supabase Storage path
  file_name    text not null,            -- original filename for download
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- QUIZZES
-- One quiz per lesson (where lesson.type = 'quiz')
-- ============================================================
create table public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null unique references public.lessons(id) on delete cascade,
  pass_mark    integer not null default 80,   -- percentage
  created_at   timestamptz not null default now()
);

create table public.quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  order_index  integer not null,
  created_at   timestamptz not null default now()
);

create table public.quiz_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.quiz_questions(id) on delete cascade,
  option_text  text not null,
  is_correct   boolean not null default false,
  order_index  integer not null default 0
);

-- ============================================================
-- STUDENT PROGRESS
-- One row per student per lesson
-- ============================================================
create table public.student_progress (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  status         text not null default 'not_started'
                   check (status in ('not_started', 'in_progress', 'complete')),
  quiz_attempts  integer not null default 0,
  quiz_passed    boolean not null default false,
  completed_at   timestamptz,
  updated_at     timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
create table public.certificates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.users(id) on delete cascade,
  issued_at    timestamptz not null default now(),
  pdf_path     text         -- Supabase Storage path, null until generated
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on public.lessons (module_id, order_index);
create index on public.student_progress (user_id);
create index on public.student_progress (lesson_id);
create index on public.quiz_questions (quiz_id, order_index);
create index on public.lesson_resources (lesson_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users           enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.quizzes         enable row level security;
alter table public.quiz_questions  enable row level security;
alter table public.quiz_options    enable row level security;
alter table public.student_progress enable row level security;
alter table public.certificates    enable row level security;

-- Helper: get role from JWT custom claim (set by Supabase Auth hook)
create or replace function public.get_role()
returns text
language sql stable
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_role'),
    'student'
  );
$$;

-- USERS
create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Admin can read all users"
  on public.users for select
  using (public.get_role() = 'admin');

create policy "Admin can update any user"
  on public.users for update
  using (public.get_role() = 'admin');

-- MODULES — published modules readable by all authenticated users
create policy "Authenticated users read published modules"
  on public.modules for select
  using (auth.role() = 'authenticated' and is_published = true);

create policy "Admin full access to modules"
  on public.modules for all
  using (public.get_role() = 'admin');

-- LESSONS
create policy "Authenticated users read published lessons"
  on public.lessons for select
  using (auth.role() = 'authenticated' and is_published = true);

create policy "Admin full access to lessons"
  on public.lessons for all
  using (public.get_role() = 'admin');

-- LESSON RESOURCES
create policy "Authenticated users read resources"
  on public.lesson_resources for select
  using (auth.role() = 'authenticated');

create policy "Admin full access to resources"
  on public.lesson_resources for all
  using (public.get_role() = 'admin');

-- QUIZZES, QUESTIONS, OPTIONS — read-only for students
create policy "Authenticated users read quizzes"
  on public.quizzes for select
  using (auth.role() = 'authenticated');

create policy "Admin full access to quizzes"
  on public.quizzes for all
  using (public.get_role() = 'admin');

create policy "Authenticated users read quiz questions"
  on public.quiz_questions for select
  using (auth.role() = 'authenticated');

create policy "Admin full access to quiz questions"
  on public.quiz_questions for all
  using (public.get_role() = 'admin');

create policy "Authenticated users read quiz options"
  on public.quiz_options for select
  using (auth.role() = 'authenticated');

create policy "Admin full access to quiz options"
  on public.quiz_options for all
  using (public.get_role() = 'admin');

-- STUDENT PROGRESS — students see only own rows
create policy "Students read own progress"
  on public.student_progress for select
  using (auth.uid() = user_id);

create policy "Students insert own progress"
  on public.student_progress for insert
  with check (auth.uid() = user_id);

create policy "Students update own progress"
  on public.student_progress for update
  using (auth.uid() = user_id);

create policy "Admin read all progress"
  on public.student_progress for select
  using (public.get_role() = 'admin');

-- CERTIFICATES
create policy "Students read own certificate"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "Admin full access to certificates"
  on public.certificates for all
  using (public.get_role() = 'admin');

-- ============================================================
-- TRIGGER: keep users.updated_at accurate on progress rows
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger student_progress_updated_at
  before update on public.student_progress
  for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: auto-insert user profile row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
