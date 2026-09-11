-- Submitted remotely during implementation; verify migration history before applying again.
alter table public.workout_sessions
 add column if not exists prescription_snapshot jsonb,
 add column if not exists is_optional boolean not null default false,
 add column if not exists counts_for_adaptation boolean not null default false,
 add column if not exists adaptation_review jsonb;
update public.workout_sessions s set is_optional=t.is_optional
 from public.workout_templates t where s.workout_template_id=t.id;
alter table public.exercise_sets alter column lumbar_response drop not null,
 alter column lumbar_response drop default;
