export const ADAPTATION_TARGET = 12
export type CompletedSession = {
 id: string
 status: string
 is_optional: boolean
 counts_for_adaptation: boolean
 deleted_at?: string | null
}
export function countAdaptationSessions(sessions: CompletedSession[]) {
 return new Set(sessions.filter(s=>s.status==='completed'&&!s.is_optional&&s.counts_for_adaptation&&!s.deleted_at).map(s=>s.id)).size
}
export function adaptationStage(completed: number) {
 return Math.min(4, Math.floor(Math.max(0, completed) / 3) + 1)
}
export function targetRpe(completed: number) {
 return ['5–6', '5–6,5', '6–7', '6–7'][adaptationStage(completed)-1]
}
export function canTransition(completed: number, recovered: boolean, stable: boolean, technique: boolean, symptoms: boolean) {
 return completed >= ADAPTATION_TARGET && recovered && stable && technique && !symptoms
}
