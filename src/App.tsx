import { useAuth } from './auth/AuthProvider'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'

function App() {
  const { loading, user, signOut } = useAuth()

  if (!isSupabaseConfigured) {
    return (
      <main className="center-state">
        <div className="status-icon">⚙</div>
        <h1>Configuração necessária</h1>
        <p className="muted">Preencha as variáveis do arquivo <code>.env.local</code> conforme o <code>.env.example</code>.</p>
      </main>
    )
  }

  if (loading) return <main className="center-state"><div className="spinner" aria-label="Carregando" /></main>
  if (!user) return <AuthPage />
  return <HomePage user={user} onSignOut={signOut} />
}

export default App
