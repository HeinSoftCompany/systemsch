-- =========================================================
-- SYSTEMSCHOOL - DATABASE SUPABASE / POSTGRESQL
-- Sistema escolar MVP para uma única escola
-- Compatível com Supabase SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

do $$ begin create type public.user_role as enum ('admin', 'teacher', 'student'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_status as enum ('active', 'inactive'); exception when duplicate_object then null; end $$;
do $$ begin create type public.school_shift as enum ('morning', 'afternoon', 'evening', 'full_time'); exception when duplicate_object then null; end $$;
do $$ begin create type public.bimester_type as enum ('1', '2', '3', '4'); exception when duplicate_object then null; end $$;
do $$ begin create type public.activity_status as enum ('draft', 'open', 'closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.announcement_audience as enum ('all', 'teachers', 'students', 'class'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  logo_url text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_schools_updated_at on public.schools;
create trigger trg_schools_updated_at before update on public.schools
for each row execute function public.set_updated_at();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null,
  avatar_url text,
  phone text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid unique references public.profiles(id) on delete cascade,
  registration_number text,
  specialization text,
  hire_date date,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at before update on public.teachers
for each row execute function public.set_updated_at();

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid unique references public.profiles(id) on delete cascade,
  enrollment_number text not null,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  address text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, enrollment_number)
);

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at before update on public.students
for each row execute function public.set_updated_at();

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  grade_year text not null,
  shift public.school_shift not null default 'morning',
  academic_year int not null default extract(year from now())::int,
  room text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name, academic_year)
);

drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes
for each row execute function public.set_updated_at();

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  description text,
  workload_hours int,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name)
);

drop trigger if exists trg_subjects_updated_at on public.subjects;
create trigger trg_subjects_updated_at before update on public.subjects
for each row execute function public.set_updated_at();

create table if not exists public.student_classes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  academic_year int not null default extract(year from now())::int,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (student_id, class_id, academic_year)
);

create table if not exists public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, class_id)
);

create table if not exists public.teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, subject_id)
);

create table if not exists public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  title text not null,
  description text,
  bimester public.bimester_type not null,
  due_date date,
  max_score numeric(5,2) not null default 10 check (max_score > 0),
  status public.activity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_activities_updated_at on public.activities;
create trigger trg_activities_updated_at before update on public.activities
for each row execute function public.set_updated_at();

create table if not exists public.activity_submissions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  content text,
  file_url text,
  submitted_at timestamptz,
  score numeric(5,2) check (score >= 0),
  teacher_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, student_id)
);

drop trigger if exists trg_activity_submissions_updated_at on public.activity_submissions;
create trigger trg_activity_submissions_updated_at before update on public.activity_submissions
for each row execute function public.set_updated_at();

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  bimester public.bimester_type not null,
  grade numeric(5,2) not null check (grade >= 0 and grade <= 10),
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_id, subject_id, bimester)
);

drop trigger if exists trg_grades_updated_at on public.grades;
create trigger trg_grades_updated_at before update on public.grades
for each row execute function public.set_updated_at();

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  message text not null,
  audience public.announcement_audience not null default 'all',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at before update on public.announcements
for each row execute function public.set_updated_at();

create or replace view public.student_report_cards as
select
  g.student_id,
  p.full_name as student_name,
  c.name as class_name,
  s.name as subject_name,
  max(case when g.bimester = '1' then g.grade end) as bimester_1,
  max(case when g.bimester = '2' then g.grade end) as bimester_2,
  max(case when g.bimester = '3' then g.grade end) as bimester_3,
  max(case when g.bimester = '4' then g.grade end) as bimester_4,
  round(avg(g.grade), 2) as final_average,
  case
    when avg(g.grade) >= 7 then 'approved'
    when avg(g.grade) >= 5 then 'recovery'
    else 'failed'
  end as result
from public.grades g
join public.students st on st.id = g.student_id
join public.profiles p on p.id = st.profile_id
join public.classes c on c.id = g.class_id
join public.subjects s on s.id = g.subject_id
group by g.student_id, p.full_name, c.name, s.name;

create or replace function public.current_user_role()
returns public.user_role language sql security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_school_id()
returns uuid language sql security definer set search_path = public as $$
  select school_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_teacher_id()
returns uuid language sql security definer set search_path = public as $$
  select id from public.teachers where profile_id = auth.uid();
$$;

create or replace function public.current_student_id()
returns uuid language sql security definer set search_path = public as $$
  select id from public.students where profile_id = auth.uid();
$$;

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.student_classes enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.class_subjects enable row level security;
alter table public.activities enable row level security;
alter table public.activity_submissions enable row level security;
alter table public.grades enable row level security;
alter table public.announcements enable row level security;

-- =========================================================
-- POLÍTICAS RLS
-- =========================================================

drop policy if exists "schools_select_own_school" on public.schools;
create policy "schools_select_own_school" on public.schools for select using (id = public.current_user_school_id());

drop policy if exists "schools_admin_update_own_school" on public.schools;
create policy "schools_admin_update_own_school" on public.schools for update
using (public.current_user_role() = 'admin' and id = public.current_user_school_id())
with check (public.current_user_role() = 'admin' and id = public.current_user_school_id());

drop policy if exists "profiles_select_own_school" on public.profiles;
create policy "profiles_select_own_school" on public.profiles for select
using (school_id = public.current_user_school_id() or id = auth.uid());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles for insert with check (public.current_user_role() = 'admin');

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles for delete using (public.current_user_role() = 'admin');

drop policy if exists "teachers_select_own_school" on public.teachers;
create policy "teachers_select_own_school" on public.teachers for select using (school_id = public.current_user_school_id());

drop policy if exists "teachers_admin_insert" on public.teachers;
create policy "teachers_admin_insert" on public.teachers for insert with check (public.current_user_role() = 'admin');

drop policy if exists "teachers_admin_update" on public.teachers;
create policy "teachers_admin_update" on public.teachers for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "teachers_admin_delete" on public.teachers;
create policy "teachers_admin_delete" on public.teachers for delete using (public.current_user_role() = 'admin');

drop policy if exists "students_select_own_school" on public.students;
create policy "students_select_own_school" on public.students for select
using (school_id = public.current_user_school_id() or id = public.current_student_id());

drop policy if exists "students_admin_insert" on public.students;
create policy "students_admin_insert" on public.students for insert with check (public.current_user_role() = 'admin');

drop policy if exists "students_admin_update" on public.students;
create policy "students_admin_update" on public.students for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "students_admin_delete" on public.students;
create policy "students_admin_delete" on public.students for delete using (public.current_user_role() = 'admin');

drop policy if exists "classes_select_own_school" on public.classes;
create policy "classes_select_own_school" on public.classes for select using (school_id = public.current_user_school_id());

drop policy if exists "classes_admin_insert" on public.classes;
create policy "classes_admin_insert" on public.classes for insert with check (public.current_user_role() = 'admin');

drop policy if exists "classes_admin_update" on public.classes;
create policy "classes_admin_update" on public.classes for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "classes_admin_delete" on public.classes;
create policy "classes_admin_delete" on public.classes for delete using (public.current_user_role() = 'admin');

drop policy if exists "subjects_select_own_school" on public.subjects;
create policy "subjects_select_own_school" on public.subjects for select using (school_id = public.current_user_school_id());

drop policy if exists "subjects_admin_insert" on public.subjects;
create policy "subjects_admin_insert" on public.subjects for insert with check (public.current_user_role() = 'admin');

drop policy if exists "subjects_admin_update" on public.subjects;
create policy "subjects_admin_update" on public.subjects for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "subjects_admin_delete" on public.subjects;
create policy "subjects_admin_delete" on public.subjects for delete using (public.current_user_role() = 'admin');

drop policy if exists "student_classes_select_related" on public.student_classes;
create policy "student_classes_select_related" on public.student_classes for select
using (
  public.current_user_role() = 'admin'
  or student_id = public.current_student_id()
  or exists (select 1 from public.teacher_classes tc where tc.class_id = student_classes.class_id and tc.teacher_id = public.current_teacher_id())
);

drop policy if exists "student_classes_admin_insert" on public.student_classes;
create policy "student_classes_admin_insert" on public.student_classes for insert with check (public.current_user_role() = 'admin');

drop policy if exists "student_classes_admin_update" on public.student_classes;
create policy "student_classes_admin_update" on public.student_classes for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "student_classes_admin_delete" on public.student_classes;
create policy "student_classes_admin_delete" on public.student_classes for delete using (public.current_user_role() = 'admin');

drop policy if exists "teacher_classes_select_related" on public.teacher_classes;
create policy "teacher_classes_select_related" on public.teacher_classes for select
using (public.current_user_role() = 'admin' or teacher_id = public.current_teacher_id());

drop policy if exists "teacher_classes_admin_insert" on public.teacher_classes;
create policy "teacher_classes_admin_insert" on public.teacher_classes for insert with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_classes_admin_update" on public.teacher_classes;
create policy "teacher_classes_admin_update" on public.teacher_classes for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_classes_admin_delete" on public.teacher_classes;
create policy "teacher_classes_admin_delete" on public.teacher_classes for delete using (public.current_user_role() = 'admin');

drop policy if exists "teacher_subjects_select_related" on public.teacher_subjects;
create policy "teacher_subjects_select_related" on public.teacher_subjects for select
using (public.current_user_role() = 'admin' or teacher_id = public.current_teacher_id());

drop policy if exists "teacher_subjects_admin_insert" on public.teacher_subjects;
create policy "teacher_subjects_admin_insert" on public.teacher_subjects for insert with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_subjects_admin_update" on public.teacher_subjects;
create policy "teacher_subjects_admin_update" on public.teacher_subjects for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "teacher_subjects_admin_delete" on public.teacher_subjects;
create policy "teacher_subjects_admin_delete" on public.teacher_subjects for delete using (public.current_user_role() = 'admin');

drop policy if exists "class_subjects_select_related" on public.class_subjects;
create policy "class_subjects_select_related" on public.class_subjects for select
using (
  public.current_user_role() = 'admin'
  or teacher_id = public.current_teacher_id()
  or exists (select 1 from public.student_classes sc where sc.class_id = class_subjects.class_id and sc.student_id = public.current_student_id())
);

drop policy if exists "class_subjects_admin_insert" on public.class_subjects;
create policy "class_subjects_admin_insert" on public.class_subjects for insert with check (public.current_user_role() = 'admin');

drop policy if exists "class_subjects_admin_update" on public.class_subjects;
create policy "class_subjects_admin_update" on public.class_subjects for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "class_subjects_admin_delete" on public.class_subjects;
create policy "class_subjects_admin_delete" on public.class_subjects for delete using (public.current_user_role() = 'admin');

drop policy if exists "activities_select_related" on public.activities;
create policy "activities_select_related" on public.activities for select
using (
  public.current_user_role() = 'admin'
  or teacher_id = public.current_teacher_id()
  or exists (select 1 from public.student_classes sc where sc.class_id = activities.class_id and sc.student_id = public.current_student_id())
);

drop policy if exists "activities_admin_insert" on public.activities;
create policy "activities_admin_insert" on public.activities for insert with check (public.current_user_role() = 'admin');

drop policy if exists "activities_teacher_insert" on public.activities;
create policy "activities_teacher_insert" on public.activities for insert
with check (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id());

drop policy if exists "activities_admin_update" on public.activities;
create policy "activities_admin_update" on public.activities for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "activities_teacher_update" on public.activities;
create policy "activities_teacher_update" on public.activities for update
using (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id())
with check (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id());

drop policy if exists "activities_admin_delete" on public.activities;
create policy "activities_admin_delete" on public.activities for delete using (public.current_user_role() = 'admin');

drop policy if exists "activities_teacher_delete" on public.activities;
create policy "activities_teacher_delete" on public.activities for delete
using (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id());

drop policy if exists "submissions_select_related" on public.activity_submissions;
create policy "submissions_select_related" on public.activity_submissions for select
using (
  public.current_user_role() = 'admin'
  or student_id = public.current_student_id()
  or exists (select 1 from public.activities a where a.id = activity_submissions.activity_id and a.teacher_id = public.current_teacher_id())
);

drop policy if exists "submissions_student_insert_own" on public.activity_submissions;
create policy "submissions_student_insert_own" on public.activity_submissions for insert
with check (public.current_user_role() = 'student' and student_id = public.current_student_id());

drop policy if exists "submissions_student_update_own" on public.activity_submissions;
create policy "submissions_student_update_own" on public.activity_submissions for update
using (public.current_user_role() = 'student' and student_id = public.current_student_id())
with check (public.current_user_role() = 'student' and student_id = public.current_student_id());

drop policy if exists "submissions_teacher_update_related" on public.activity_submissions;
create policy "submissions_teacher_update_related" on public.activity_submissions for update
using (
  public.current_user_role() = 'admin'
  or exists (select 1 from public.activities a where a.id = activity_submissions.activity_id and a.teacher_id = public.current_teacher_id())
)
with check (
  public.current_user_role() = 'admin'
  or exists (select 1 from public.activities a where a.id = activity_submissions.activity_id and a.teacher_id = public.current_teacher_id())
);

drop policy if exists "grades_select_related" on public.grades;
create policy "grades_select_related" on public.grades for select
using (
  public.current_user_role() = 'admin'
  or teacher_id = public.current_teacher_id()
  or student_id = public.current_student_id()
);

drop policy if exists "grades_admin_insert" on public.grades;
create policy "grades_admin_insert" on public.grades for insert with check (public.current_user_role() = 'admin');

drop policy if exists "grades_teacher_insert" on public.grades;
create policy "grades_teacher_insert" on public.grades for insert
with check (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id());

drop policy if exists "grades_admin_update" on public.grades;
create policy "grades_admin_update" on public.grades for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "grades_teacher_update" on public.grades;
create policy "grades_teacher_update" on public.grades for update
using (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id())
with check (public.current_user_role() = 'teacher' and teacher_id = public.current_teacher_id());

drop policy if exists "grades_admin_delete" on public.grades;
create policy "grades_admin_delete" on public.grades for delete using (public.current_user_role() = 'admin');

drop policy if exists "announcements_select_related" on public.announcements;
create policy "announcements_select_related" on public.announcements for select
using (
  public.current_user_role() = 'admin'
  or audience = 'all'
  or (public.current_user_role() = 'teacher' and audience in ('teachers', 'all'))
  or (public.current_user_role() = 'student' and audience in ('students', 'all'))
  or (
    audience = 'class'
    and exists (select 1 from public.student_classes sc where sc.class_id = announcements.class_id and sc.student_id = public.current_student_id())
  )
  or (
    audience = 'class'
    and exists (select 1 from public.teacher_classes tc where tc.class_id = announcements.class_id and tc.teacher_id = public.current_teacher_id())
  )
);

drop policy if exists "announcements_admin_insert" on public.announcements;
create policy "announcements_admin_insert" on public.announcements for insert with check (public.current_user_role() = 'admin');

drop policy if exists "announcements_teacher_insert" on public.announcements;
create policy "announcements_teacher_insert" on public.announcements for insert
with check (public.current_user_role() = 'teacher' and author_profile_id = auth.uid());

drop policy if exists "announcements_admin_update" on public.announcements;
create policy "announcements_admin_update" on public.announcements for update
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists "announcements_teacher_update_own" on public.announcements;
create policy "announcements_teacher_update_own" on public.announcements for update
using (public.current_user_role() = 'teacher' and author_profile_id = auth.uid())
with check (public.current_user_role() = 'teacher' and author_profile_id = auth.uid());

drop policy if exists "announcements_admin_delete" on public.announcements;
create policy "announcements_admin_delete" on public.announcements for delete using (public.current_user_role() = 'admin');

drop policy if exists "announcements_teacher_delete_own" on public.announcements;
create policy "announcements_teacher_delete_own" on public.announcements for delete
using (public.current_user_role() = 'teacher' and author_profile_id = auth.uid());

create index if not exists idx_profiles_school_role on public.profiles(school_id, role);
create index if not exists idx_students_school on public.students(school_id);
create index if not exists idx_students_profile on public.students(profile_id);
create index if not exists idx_teachers_school on public.teachers(school_id);
create index if not exists idx_teachers_profile on public.teachers(profile_id);
create index if not exists idx_classes_school_year on public.classes(school_id, academic_year);
create index if not exists idx_subjects_school on public.subjects(school_id);
create index if not exists idx_student_classes_student on public.student_classes(student_id);
create index if not exists idx_student_classes_class on public.student_classes(class_id);
create index if not exists idx_teacher_classes_teacher on public.teacher_classes(teacher_id);
create index if not exists idx_teacher_classes_class on public.teacher_classes(class_id);
create index if not exists idx_teacher_subjects_teacher on public.teacher_subjects(teacher_id);
create index if not exists idx_teacher_subjects_subject on public.teacher_subjects(subject_id);
create index if not exists idx_class_subjects_class on public.class_subjects(class_id);
create index if not exists idx_class_subjects_subject on public.class_subjects(subject_id);
create index if not exists idx_activities_class_subject on public.activities(class_id, subject_id);
create index if not exists idx_activities_teacher on public.activities(teacher_id);
create index if not exists idx_grades_student_subject on public.grades(student_id, subject_id);
create index if not exists idx_grades_class_bimester on public.grades(class_id, bimester);
create index if not exists idx_grades_teacher on public.grades(teacher_id);
create index if not exists idx_announcements_school on public.announcements(school_id, published_at desc);

insert into public.schools (id, name, email, phone, city, state)
values (
  '11111111-1111-1111-1111-111111111111',
  'SystemSchool - Escola Modelo',
  'contato@escola.com',
  '(00) 00000-0000',
  'Cidade',
  'UF'
)
on conflict (id) do nothing;

insert into public.classes (id, school_id, name, grade_year, shift, academic_year)
values
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', '6º Ano A', '6º Ano', 'morning', 2026),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', '7º Ano A', '7º Ano', 'morning', 2026),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', '8º Ano A', '8º Ano', 'afternoon', 2026),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', '9º Ano A', '9º Ano', 'afternoon', 2026)
on conflict (school_id, name, academic_year) do nothing;

insert into public.subjects (id, school_id, name, description, workload_hours)
values
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'Matemática', 'Disciplina de Matemática', 80),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'Português', 'Disciplina de Língua Portuguesa', 80),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'Ciências', 'Disciplina de Ciências', 60),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111111', 'História', 'Disciplina de História', 60),
('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111111', 'Geografia', 'Disciplina de Geografia', 60),
('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111111', 'Inglês', 'Disciplina de Inglês', 40)
on conflict (school_id, name) do nothing;

-- =========================================================
-- CRIAR PROFILE DO ADMIN
-- 1. Supabase > Authentication > Users > Add user
--    email: admin@escola.com
--    senha: 123456
--
-- 2. Copie o ID do usuário criado.
--
-- 3. Rode o comando abaixo substituindo o ID:
--
-- insert into public.profiles (id, school_id, full_name, email, role, status)
-- values (
--   'COLE_AQUI_O_ID_DO_AUTH_USER',
--   '11111111-1111-1111-1111-111111111111',
--   'Administrador',
--   'admin@escola.com',
--   'admin',
--   'active'
-- );
-- =========================================================
