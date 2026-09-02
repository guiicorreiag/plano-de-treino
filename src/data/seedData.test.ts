import { describe, expect, it } from 'vitest'
import { seedExercises, seedWorkouts } from './seedData'

describe('carga inicial de treinos', () => {
  it('contém os cinco treinos na ordem A/B/C/D/E', () => {
    expect(seedWorkouts.map((workout) => workout.code)).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('mantém somente o treino E como opcional', () => {
    expect(seedWorkouts.filter((workout) => workout.optional).map((workout) => workout.code)).toEqual(['E'])
  })

  it('não referencia exercícios ausentes', () => {
    const names = new Set(seedExercises.map((exercise) => exercise.name))
    const references = seedWorkouts.flatMap((workout) => workout.exercises.map((item) => item.exercise))
    expect(references.every((name) => names.has(name))).toBe(true)
  })

  it('preserva alertas de segurança no leg press', () => {
    expect(seedExercises.find((exercise) => exercise.name.startsWith('Leg press'))?.safetyNotes).toContain('lombar')
  })

  it('usa duas séries de trabalho no bloco de readaptação', () => {
    const workSets = seedWorkouts.flatMap((workout) => workout.exercises)
      .filter((item) => !['Esteira ou bicicleta', 'Cardio leve/moderado'].includes(item.exercise))
    expect(workSets.every((item) => item.sets === 2)).toBe(true)
  })

  it('mantém o treino E curto e sem os complementos removidos', () => {
    const optional = seedWorkouts.find((workout) => workout.code === 'E')!
    expect(optional.exercises.map((item) => item.exercise)).toEqual([
      'Cardio leve/moderado', 'Face pull', 'Rosca martelo com halteres',
      'Tríceps corda', 'Pallof press', 'Prancha lateral modificada',
    ])
  })
})
