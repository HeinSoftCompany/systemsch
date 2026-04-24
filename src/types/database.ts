import type {
  Activity,
  ActivitySubmission,
  Announcement,
  Class,
  ClassSubject,
  Grade,
  Profile,
  Student,
  StudentClass,
  Subject,
  Teacher,
  TeacherClass,
  TeacherSubject,
} from './school'

export interface DatabaseTable<TSelect, TInsert = Partial<TSelect>, TUpdate = Partial<TSelect>> {
  Row: TSelect
  Insert: TInsert
  Update: TUpdate
  Relationships: []
}

type GeneratedFields = 'id' | 'created_at' | 'updated_at'

type InsertEntity<T> = Omit<T, GeneratedFields>
type UpdateEntity<T> = Partial<InsertEntity<T>>

export interface Database {
  public: {
    Tables: {
      profiles: DatabaseTable<Profile, InsertEntity<Profile>, UpdateEntity<Profile>>
      teachers: DatabaseTable<Teacher, InsertEntity<Teacher>, UpdateEntity<Teacher>>
      students: DatabaseTable<Student, InsertEntity<Student>, UpdateEntity<Student>>
      classes: DatabaseTable<Class, InsertEntity<Class>, UpdateEntity<Class>>
      subjects: DatabaseTable<Subject, InsertEntity<Subject>, UpdateEntity<Subject>>
      student_classes: DatabaseTable<
        StudentClass,
        InsertEntity<StudentClass>,
        UpdateEntity<StudentClass>
      >
      teacher_classes: DatabaseTable<
        TeacherClass,
        InsertEntity<TeacherClass>,
        UpdateEntity<TeacherClass>
      >
      teacher_subjects: DatabaseTable<
        TeacherSubject,
        InsertEntity<TeacherSubject>,
        UpdateEntity<TeacherSubject>
      >
      class_subjects: DatabaseTable<
        ClassSubject,
        InsertEntity<ClassSubject>,
        UpdateEntity<ClassSubject>
      >
      activities: DatabaseTable<Activity, InsertEntity<Activity>, UpdateEntity<Activity>>
      activity_submissions: DatabaseTable<
        ActivitySubmission,
        InsertEntity<ActivitySubmission>,
        UpdateEntity<ActivitySubmission>
      >
      grades: DatabaseTable<Grade, InsertEntity<Grade>, UpdateEntity<Grade>>
      announcements: DatabaseTable<Announcement, InsertEntity<Announcement>, UpdateEntity<Announcement>>
    }
  }
}

export type TableName = keyof Database['public']['Tables']
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']
