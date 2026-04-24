import { Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  title: string
  onOpenMenu: () => void
}

export const Header = ({ title, onOpenMenu }: HeaderProps) => {
  const { user, role, signOut } = useAuth()
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Usuário'

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="header">
      <div className="header__left">
        <button type="button" className="header__menu-button" onClick={onOpenMenu}>
          <Menu size={18} />
        </button>
        <h1 className="header__title">{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="header__user">
          <div className="header__name">{displayName}</div>
          <div className="header__role">{role ?? 'sem perfil'}</div>
        </div>
        <button type="button" className="header__logout" onClick={handleSignOut}>
          Sair
        </button>
      </div>
    </header>
  )
}
