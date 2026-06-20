export type QuizDifficulty = 'easy' | 'medium' | 'hard'

export type QuizQuestion = {
  question: string
  options: [string, string, string, string]
  correct_answer: string
  explanation: string
}

export type QuizRecord = {
  id: string
  uid: string
  difficulty: QuizDifficulty
  question_count: number
  title: string
  source_file_ids: string[]
  questions: QuizQuestion[]
  created_at: string
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  uid: string
  score: number
  total_questions: number
  percentage: number
  answers: string[]
  completed_in_seconds?: number | null
  created_at: string
}

export type QuizStats = {
  total_quizzes_completed: number
  average_score: number
  total_attempts: number
}
