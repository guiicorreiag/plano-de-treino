import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { initializeUser, type InitializationResult } from '../data/initializeUser'

type Props = { user: User; onSignOut: () => Promise<void> }

export function HomePage({ user, onSignOut }: Props) {
  const [result, setResult] = useState<InitializationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setError(null)
    void initializeUser(user)
      .then((value) => active && setResult(value))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : 'Falha ao preparar seus treinos.'))
    return () => { active = false }
  }, [user, attempt])

  if (error) {
    return (
      <main className="center-state">
        <div className="status-icon danger">!</div>
        <h1>Não foi possível sincronizar</h1>
        <p className="muted">Se estiver sem internet, tente novamente quando a conexão retornar.</p>
        <button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button>
      </main>
    )
  }

  if (!result) {
    return (
      <main className="center-state">
        <div className="spinner" aria-label="Carregando" />
        <h1>Preparando seus treinos</h1>
        <p className="muted">Isso acontece apenas no primeiro acesso.</p>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">HOJE</p>
          <h1>Olá, {user.email?.split('@')[0]}</h1>
        </div>
        <button className="icon-button" onClick={() => void onSignOut()} aria-label="Sair">↗</button>
      </header>

      <main className="content">
        <section className="hero-card">
          <div>
            <span className="badge">PRÓXIMO TREINO</span>
            <h2>A — Superior 1</h2>
            <p>Peito, costas, ombros, braços e core</p>
          </div>
          <button className="start-button" disabled>Iniciar treino</button>
          <small>O registro de séries será implementado na próxima etapa.</small>
        </section>

        <section className="metric-grid" aria-label="Resumo semanal">
          <article><strong>0/4</strong><span>Treinos na semana</span></article>
          <article><strong>0 min</strong><span>Cardio na semana</span></article>
          <article><strong>—</strong><span>Dor lombar média</span></article>
          <article><strong>{result.workoutCount}</strong><span>Treinos preparados</span></article>
        </section>

        <section className="safety-card">
          <span className="safety-dot" />
          <div><strong>Check-in da lombar</strong><p>Registre a dor antes do treino para liberar recomendações seguras.</p></div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        <button className="active"><span>●</span>Hoje</button>
        <button disabled><span>▦</span>Treinos</button>
        <button disabled><span>↗</span>Evolução</button>
        <button disabled><span>○</span>Corpo</button>
        <button disabled><span>•••</span>Mais</button>
      </nav>
    </div>
  )
}
