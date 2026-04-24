import { NavLink } from 'react-router-dom'
import type { UserRole } from '../../types/auth'
import { menuByRole } from './menuConfig'

interface SidebarProps {
  role: UserRole
  isOpen: boolean
  onNavigate: () => void
}

export const Sidebar = ({ role, isOpen, onNavigate }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">SystemSchool</div>
      <nav className="sidebar__nav">
        {menuByRole[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
