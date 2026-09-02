import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { seedExercises, seedWorkouts } from './seedData'

export type InitializationResult = {
  exerciseCount: number
  workoutCount: number
}

export async function initializeUser(user: User): Promise<InitializationResult> {
  if (!supabase) throw new Error('Supabase não configurado.')

  const clientUpdatedAt = new Date().toISOString()
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.email?.split('@')[0] ?? 'Usuário',
    height_cm: 174,
    client_updated_at: clientUpdatedAt,
  })
  if (profileError) throw profileError

  const { data: exercises, error: exerciseError } = await supabase
    .from('exercises')
    .upsert(
      seedExercises.map((exercise) => ({
        user_id: user.id,
        name: exercise.name,
        category: exercise.category,
        instructions: exercise.instructions ?? null,
        safety_notes: exercise.safetyNotes ?? null,
        client_updated_at: clientUpdatedAt,
      })),
      { onConflict: 'user_id,name', ignoreDuplicates: false },
    )
    .select('id,name')
  if (exerciseError) throw exerciseError

  const exerciseIds = new Map((exercises ?? []).map((exercise) => [exercise.name, exercise.id]))

  const { data: workouts, error: workoutError } = await supabase
    .from('workout_templates')
    .upsert(
      seedWorkouts.map((workout, index) => ({
        user_id: user.id,
        code: workout.code,
        name: workout.name,
        description: workout.description,
        weekday: workout.weekday,
        is_optional: workout.optional,
        sort_order: index,
        baseline_version: 'setembro_2026_v2',
        block_name: 'Readaptação — 4 dias + 1 opcional',
        deleted_at: null,
        client_updated_at: clientUpdatedAt,
      })),
      { onConflict: 'user_id,code', ignoreDuplicates: false },
    )
    .select('id,code')
  if (workoutError) throw workoutError

  const workoutIds = new Map((workouts ?? []).map((workout) => [workout.code, workout.id]))
  const templateIds = [...workoutIds.values()]
  if (templateIds.length) {
    const { error: archiveError } = await supabase
      .from('workout_exercises')
      .update({ deleted_at: clientUpdatedAt, client_updated_at: clientUpdatedAt })
      .eq('user_id', user.id)
      .in('workout_template_id', templateIds)
    if (archiveError) throw archiveError
  }
  const workoutExerciseRows = seedWorkouts.flatMap((workout) => {
    const templateId = workoutIds.get(workout.code)
    if (!templateId) throw new Error(`Treino ${workout.code} não foi criado.`)

    return workout.exercises.map((item, index) => {
      const exerciseId = exerciseIds.get(item.exercise)
      if (!exerciseId) throw new Error(`Exercício “${item.exercise}” não foi criado.`)

      return {
        user_id: user.id,
        workout_template_id: templateId,
        exercise_id: exerciseId,
        sort_order: index,
        target_sets: item.sets,
        target_reps_min: item.repsMin ?? null,
        target_reps_max: item.repsMax ?? null,
        target_duration_seconds: item.durationSeconds ?? null,
        rest_seconds: item.restSeconds,
        rest_seconds_min: item.restSeconds,
        rest_seconds_max: item.restSecondsMax ?? item.restSeconds,
        target_rpe_min: item.rpeMin ?? null,
        target_rpe_max: item.rpeMax ?? null,
        progression_notes: 'Double progression: só considerar aumento após atingir o topo da faixa em todas as séries, com técnica, amplitude, RPE, lombar e recuperação adequados.',
        notes: item.notes ?? null,
        safety_notes: item.safetyNotes ?? null,
        deleted_at: null,
        client_updated_at: clientUpdatedAt,
      }
    })
  })

  const { error: workoutExercisesError } = await supabase
    .from('workout_exercises')
    .upsert(workoutExerciseRows, {
      onConflict: 'user_id,workout_template_id,sort_order',
      ignoreDuplicates: false,
    })
  if (workoutExercisesError) throw workoutExercisesError

  return { exerciseCount: exercises?.length ?? 0, workoutCount: workouts?.length ?? 0 }
}
