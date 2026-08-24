import type {
  AssignmentInput,
  CreateWeeklyScheduleInput,
  WeeklySchedule,
  WeeklyScheduleErrorPayload,
  WeeklyScheduleErrorStatus,
  WeeklyScheduleMutationResult,
  WeeklyScheduleValidationResult,
  WeeklyScheduleViolation
} from '~/types/weekly-schedule'
import { WeeklyScheduleApiError } from '~/types/weekly-schedule'

const RECOGNIZED_ERROR_STATUSES = new Set([400, 403, 404, 409, 422, 500])

const normalizeStatus = (error: any): WeeklyScheduleErrorStatus | null => {
  const candidate = Number(
    error?.response?.status ??
    error?.statusCode ??
    error?.status
  )

  return RECOGNIZED_ERROR_STATUSES.has(candidate)
    ? candidate as WeeklyScheduleErrorStatus
    : null
}

const normalizeError = (error: any): WeeklyScheduleApiError => {
  if (error instanceof WeeklyScheduleApiError) return error

  const nested = error?.data?.error ?? error?.response?._data?.error
  const fallbackData = error?.data ?? error?.response?._data
  const violations = nested?.violations ?? fallbackData?.violations
  const payload: WeeklyScheduleErrorPayload = {
    code: String(nested?.code ?? fallbackData?.code ?? 'WEEKLY_SCHEDULE_REQUEST_FAILED'),
    message: String(
      nested?.message ??
      fallbackData?.message ??
      error?.message ??
      'No fue posible completar la operación de malla semanal'
    ),
    violations: Array.isArray(violations)
      ? violations as WeeklyScheduleViolation[]
      : []
  }

  return new WeeklyScheduleApiError(payload, normalizeStatus(error), { cause: error })
}

const withNormalizedError = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request()
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getWorkerPlannedMinutes = (
  schedule: WeeklySchedule,
  userId: string
): number => schedule.assignments
  .filter(assignment => assignment.user_id === userId)
  .reduce((total, assignment) => total + assignment.effective_minutes, 0)

export const useWeeklySchedule = () => {
  const api = useApi()

  const listSchedules = (): Promise<WeeklySchedule[]> =>
    withNormalizedError(async () => {
      const schedules = await api.get('/weekly-schedules')
      return (schedules ?? []) as WeeklySchedule[]
    })

  const getSchedule = (scheduleId: string): Promise<WeeklySchedule> =>
    withNormalizedError(() => api.get(`/weekly-schedules/${encodeURIComponent(scheduleId)}`) as Promise<WeeklySchedule>)

  const createSchedule = (input: CreateWeeklyScheduleInput): Promise<WeeklySchedule> =>
    withNormalizedError(() => api.post('/weekly-schedules', {
      week_start: input.week_start
    }) as Promise<WeeklySchedule>)

  const addAssignment = (
    schedule: WeeklySchedule,
    input: AssignmentInput
  ): Promise<WeeklyScheduleMutationResult> =>
    withNormalizedError(() => api.post(
      `/weekly-schedules/${encodeURIComponent(schedule.schedule_id)}/assignments`,
      {
        expected_version: schedule.version,
        user_id: input.user_id,
        shift_id: input.shift_id,
        work_date: input.work_date
      }
    ) as Promise<WeeklyScheduleMutationResult>)

  const updateAssignment = (
    schedule: WeeklySchedule,
    assignmentId: string,
    input: AssignmentInput
  ): Promise<WeeklyScheduleMutationResult> =>
    withNormalizedError(() => api.put(
      `/weekly-schedules/${encodeURIComponent(schedule.schedule_id)}/assignments/${encodeURIComponent(assignmentId)}`,
      {
        expected_version: schedule.version,
        user_id: input.user_id,
        shift_id: input.shift_id,
        work_date: input.work_date
      }
    ) as Promise<WeeklyScheduleMutationResult>)

  const deleteAssignment = (
    schedule: WeeklySchedule,
    assignmentId: string
  ): Promise<WeeklySchedule> =>
    withNormalizedError(() => api.delete(
      `/weekly-schedules/${encodeURIComponent(schedule.schedule_id)}/assignments/${encodeURIComponent(assignmentId)}?expected_version=${encodeURIComponent(schedule.version)}`
    ) as Promise<WeeklySchedule>)

  const validateSchedule = (schedule: WeeklySchedule): Promise<WeeklyScheduleValidationResult> =>
    withNormalizedError(() => api.post(
      `/weekly-schedules/${encodeURIComponent(schedule.schedule_id)}/validate`,
      undefined
    ) as Promise<WeeklyScheduleValidationResult>)

  const publishSchedule = (schedule: WeeklySchedule): Promise<WeeklySchedule> =>
    withNormalizedError(() => api.post(
      `/weekly-schedules/${encodeURIComponent(schedule.schedule_id)}/publish`,
      undefined
    ) as Promise<WeeklySchedule>)

  return {
    listSchedules,
    getSchedule,
    createSchedule,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    validateSchedule,
    publishSchedule
  }
}
