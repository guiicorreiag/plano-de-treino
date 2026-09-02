export const septemberWeeks = [
  { week: 1, rpe: '5–6', goal: 'Reaprender movimentos e identificar cargas, com cerca de 4 repetições em reserva.' },
  { week: 2, rpe: '5–6,5', goal: 'Consolidar cargas e aumentar repetições quando possível.' },
  { week: 3, rpe: '6–7', goal: 'Progredir moderadamente apenas quando todos os critérios forem atingidos.' },
  { week: 4, rpe: '6–7', goal: 'Consolidar sem obrigação de superar a semana 3.' },
] as const

export const lumbarGuidance = {
  green: 'Padrão habitual, estável e sem sintomas neurológicos: continuar.',
  yellow: 'Dor aumenta, muda ou altera a execução: reduzir amplitude e carga; substituir se persistir.',
  red: 'Dor forte irradiada, dormência, formigamento significativo, fraqueza nova, alteração urinária/intestinal ou dormência perineal: interromper e buscar avaliação apropriada.',
} as const

export function septemberWeek(date = new Date()) {
  if (date.getFullYear() === 2026 && date.getMonth() === 8) return Math.min(4, Math.ceil(date.getDate() / 7))
  return 1
}
