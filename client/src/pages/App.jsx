import React from 'react'
import { Link, Route, Routes, NavLink } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Purchases from './Purchases.jsx'
import Transfers from './Transfers.jsx'
import Assignments from './Assignments.jsx'
import Login from './Login.jsx'
import { AuthProvider } from '../state/AuthContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import Admin from './Admin.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <nav className="sidebar panel">
          <h3 className="brand">Assets</h3>
          <UserMenu />
          <NavLinks />
        </nav>
        <main className="main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/purchases" element={<Protected><Purchases /></Protected>} />
            <Route path="/transfers" element={<Protected><Transfers /></Protected>} />
            <Route path="/assignments" element={<Protected><Assignments /></Protected>} />
            <Route path="/admin" element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

function Protected({ children }) {
  const { token } = useAuth()
  if (!token) {
    window.location.href = '/login'
    return null
  }
  return children
}

function ProtectedAdmin({ children }) {
  const { token, role } = useAuth()
  if (!token) { window.location.href = '/login'; return null }
  if (role !== 'admin') { return <div>Forbidden</div> }
  return children
}

function UserMenu() {
  const { token, role, logout } = useAuth()
  if (!token) return null
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-title">Signed in</div>
      <div className="card-value" style={{ fontSize:16 }}>{role}</div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn btn-outline" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}

function NavLinks() {
  const { role } = useAuth()
  return (
    <ul className="nav">
      <li><NavLink to="/" end>Dashboard</NavLink></li>
      {(role === 'admin' || role === 'logistics_officer') && (
        <>
          <li><NavLink to="/purchases">Purchases</NavLink></li>
          <li><NavLink to="/transfers">Transfers</NavLink></li>
        </>
      )}
      {(role === 'admin' || role === 'base_commander') && (
        <li><NavLink to="/assignments">Assignments & Expenditures</NavLink></li>
      )}
      {role === 'admin' && (
        <li><NavLink to="/admin">Admin</NavLink></li>
      )}
    </ul>
  )
}


