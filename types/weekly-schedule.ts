export type WeeklyScheduleStatus = 'draft' | 'invalid' | 'validated' | 'published'

export interface WeeklyScheduleAssignment {
  assignment_id: string
  schedule_id: string
  user_id: string
  worker_name: string
  shift_id: string
  work_date: string
  start_time: string
  end_time: string
  lunch_start: string | null
  lunch_end: string | null
  effective_minutes: number
}

export interface WeeklySchedule {
  schedule_id: string
  company_id: string
  week_start: string
  status: WeeklyScheduleStatus
  version: number
  validated_version: number | null
  validated_limit_minutes: number | null
  assignments: WeeklyScheduleAssignment[]
}

export interface WeeklyScheduleViolation {
  code: string
  message: string
  user_id?: string
  worker_name?: string
  planned_minutes?: number
  limit_minutes?: number
  exceeded_minutes?: number
  [key: string]: unknown
}

export interface WeeklyScheduleValidationResult {
  schedule: WeeklySchedule
  valid: boolean
  violations: WeeklyScheduleViolation[]
}

export interface WeeklyScheduleMutationResult {
  assignment: WeeklyScheduleAssignment
  schedule: WeeklySchedule
}

export interface CreateWeeklyScheduleInput {
  week_start: string
}

export interface AssignmentInput {
  user_id: string
  shift_id: string
  work_date: string
}

export type WeeklyScheduleErrorStatus = 400 | 403 | 404 | 409 | 422 | 500

export interface WeeklyScheduleErrorPayload {
  code: string
  message: string
  violations: WeeklyScheduleViolation[]
}

export class WeeklyScheduleApiError extends Error {
  readonly status: WeeklyScheduleErrorStatus | null
  readonly code: string
  readonly violations: WeeklyScheduleViolation[]

  constructor(
    payload: WeeklyScheduleErrorPayload,
    status: WeeklyScheduleErrorStatus | null = null,
    options?: ErrorOptions
  ) {
    super(payload.message, options)
    this.name = 'WeeklyScheduleApiError'
    this.status = status
    this.code = payload.code
    this.violations = payload.violations
  }
}
