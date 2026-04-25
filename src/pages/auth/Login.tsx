import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Login = () => {
  const { signIn, user, role, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'teacher') return <Navigate to="/teacher" replace />
    if (role === 'student') return <Navigate to="/student" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : 'Erro ao fazer login. Verifique as configuracoes do Supabase.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <h1 style={{ margin: 0 }}>Entrar no SystemSchool</h1>
        <p style={{ margin: 0, color: '#4b5563' }}>
          Use seu e-mail e senha cadastrados no sistema.
        </p>

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p style={{ color: '#dc2626', margin: 0 }}>{error}</p> : null}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
