import type { StudentResult } from '../types/school'

export interface GradeSummary {
  average: number
  result: StudentResult
}

export const calculateGradeResult = (average: number): StudentResult => {
  if (average >= 7) return 'approved'
  if (average >= 5) return 'recovery'
  return 'failed'
}

export const calculateFinalAverage = (grades: number[]): GradeSummary => {
  if (grades.length === 0) {
    return { average: 0, result: 'failed' }
  }

  const total = grades.reduce((sum, value) => sum + value, 0)
  const average = Number((total / grades.length).toFixed(2))

  return {
    average,
    result: calculateGradeResult(average),
  }
}
