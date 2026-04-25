-- =====================================================
-- ALUNO: Aluno Teste
-- UID: eb9d736e-01f8-446a-abe3-46d593cc9b94
-- Turma: 6º Ano A
-- =====================================================

-- PROFILE
insert into public.profiles (id, school_id, full_name, email, role, status)
values (
  'eb9d736e-01f8-446a-abe3-46d593cc9b94',
  '11111111-1111-1111-1111-111111111111',
  'Aluno Teste',
  'aluno@escola.com',
  'student',
  'active'
);

-- STUDENT
insert into public.students (
  id,
  school_id,
  profile_id,
  enrollment_number,
  birth_date,
  guardian_name,
  guardian_phone,
  status
)
values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'eb9d736e-01f8-446a-abe3-46d593cc9b94',
  'ALUNO-001',
  '2012-05-10',
  'Responsável Teste',
  '(00) 00000-0000',
  'active'
);

-- VÍNCULO COM TURMA
insert into public.student_classes (student_id, class_id, academic_year, status)
values (
  (select id from public.students where profile_id = 'eb9d736e-01f8-446a-abe3-46d593cc9b94'),
  '22222222-2222-2222-2222-222222222201',
  2026,
  'active'
);