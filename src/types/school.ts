import type { UserRole, UserStatus } from './auth'

export type SchoolShift = 'morning' | 'afternoon' | 'evening' | 'full_time'
export type Bimester = 1 | 2 | 3 | 4
export type ActivityStatus = 'draft' | 'open' | 'closed'
export type StudentResult = 'approved' | 'recovery' | 'failed'
export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'class'

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface Profile extends BaseEntity {
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface Teacher extends BaseEntity {
  name: string
  email: string
  phone: string
  specialization: string
  linked_subjects: string[]
  linked_classes: string[]
  status: UserStatus
}

export interface Student extends BaseEntity {
  name: string
  email: string
  registration_number: string
  birth_date: string
  class_name: string
  guardian_name: string
  guardian_phone: string
  status: UserStatus
}

export interface Class extends BaseEntity {
  name: string
  grade_year: string
  school_year: number
  shift: SchoolShift
  classroom: string
  status: UserStatus
}

export interface Subject extends BaseEntity {
  name: string
  description: string
  workload_hours: number
  status: UserStatus
}

export interface StudentClass extends BaseEntity {
  student_id: string
  class_id: string
  school_year: number
}

export interface TeacherClass extends BaseEntity {
  teacher_id: string
  class_id: string
  school_year: number
}

export interface TeacherSubject extends BaseEntity {
  teacher_id: string
  subject_id: string
  school_year: number
}

export interface ClassSubject extends BaseEntity {
  class_id: string
  subject_id: string
  teacher_id: string | null
}

export interface Activity extends BaseEntity {
  class_id: string
  subject_id: string
  teacher_id: string
  title: string
  description: string | null
  due_date: string | null
  max_score: number
  bimester: Bimester
  status: ActivityStatus
}

export interface ActivitySubmission extends BaseEntity {
  activity_id: string
  student_id: string
  submitted_at: string | null
  content: string | null
}

export interface Grade extends BaseEntity {
  student_id: string
  subject_id: string
  class_id: string
  bimester: Bimester
  value: number
  result: StudentResult | null
}

export interface Announcement extends BaseEntity {
  author_profile_id: string
  title: string
  content: string
  audience: AnnouncementAudience
  class_id: string | null
  published_at: string | null
}
