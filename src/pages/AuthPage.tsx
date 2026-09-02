import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'sign-in' | 'sign-up'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href.split('#')[0] },
        })

    if (result.error) {
      setError(result.error.message)
    } else if (mode === 'sign-up' && !result.data.session) {
      setMessage('Conta criada. Confirme seu e-mail para entrar.')
    }
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">PT</div>
        <p className="eyebrow">SEU ACOMPANHAMENTO</p>
        <h1>Plano de Treino</h1>
        <p className="muted">Treinos, evolução corporal e cuidado com a lombar em um só lugar.</p>

        <div className="segmented" role="tablist" aria-label="Modo de acesso">
          <button className={mode === 'sign-in' ? 'active' : ''} onClick={() => setMode('sign-in')} type="button">Entrar</button>
          <button className={mode === 'sign-up' ? 'active' : ''} onClick={() => setMode('sign-up')} type="button">Criar conta</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error && <p className="feedback error" role="alert">{error}</p>}
          {message && <p className="feedback success" role="status">{message}</p>}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Aguarde…' : mode === 'sign-in' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>
      </section>
    </main>
  )
}
