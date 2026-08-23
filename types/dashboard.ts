export type DashboardPlanningState = 'published' | 'no_published_schedule'

export interface DashboardPlanningSummary {
  state: DashboardPlanningState
  schedule_id: string | null
  planned_minutes: number
  workers_planned: number
  workers_unassigned: number
}

export interface DashboardAttendanceSummary {
  worked_minutes: number
  workers_with_attendance: number
  workers_present: number
  open_checkins: number
  anomaly_count: number
}

export interface DashboardLatenessSummary {
  evaluated_checkins: number
  late_checkins: number
  late_minutes: number
  unevaluated_checkins: number
}

export interface DashboardAttendanceWithoutPlanningSummary {
  workers: number
  days: number
}

export interface DashboardAnomaly {
  code: string
  message: string
  log_id?: string
  timestamp?: string
}

export interface DashboardWorkerPlanningSummary {
  planned_minutes: number
  planned_days: number
  unassigned_days: number
  no_published_schedule_days: number
}

export interface DashboardWorkerAttendanceSummary {
  worked_minutes: number
  checkin_count: number
  checkout_count: number
  open_checkin: boolean
  anomalies: DashboardAnomaly[]
}

export interface DashboardWorkerSummary {
  user_id: string
  name: string
  planning: DashboardWorkerPlanningSummary
  attendance: DashboardWorkerAttendanceSummary
  lateness: DashboardLatenessSummary
  attendance_without_planning_days: number
  worked_over_configured_weekly_limit: boolean
}

export interface DashboardSummary {
  week_start: string
  week_end: string
  timezone: string
  generated_at: string
  configured_weekly_limit_minutes: number
  planning: DashboardPlanningSummary
  attendance: DashboardAttendanceSummary
  lateness: DashboardLatenessSummary
  attendance_without_planning: DashboardAttendanceWithoutPlanningSummary
  by_worker: DashboardWorkerSummary[]
}
