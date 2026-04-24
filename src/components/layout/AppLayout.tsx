import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { getPageTitle } from './menuConfig'
import './layout.css'

export const AppLayout = () => {
  const { role } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!role) {
    return null
  }

  const title = getPageTitle(location.pathname, role)

  return (
    <div className="app-layout">
      {sidebarOpen ? (
        <button
          aria-label="Fechar menu lateral"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar role={role} isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-layout__content">
        <Header title={title} onOpenMenu={() => setSidebarOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
