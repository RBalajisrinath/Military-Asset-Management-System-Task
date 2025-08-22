import React, { useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { setToken, setRole, setBaseId } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRoleLocal] = useState('admin')
  const [baseIdLocal, setBaseIdLocal] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmitLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
      setToken(res.token)
      setRole(res.user.role)
      setBaseId(res.user.base_id || '')
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  async function onSubmitRegister(e) {
    e.preventDefault()
    setError('')
    try {
      const body = { email, password, role, base_id: baseIdLocal ? Number(baseIdLocal) : null }
      await apiRequest('/auth/register', { method: 'POST', body })
      // After register, log in automatically
      await onSubmitLogin(e)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <div className="blob one"></div>
        <div className="blob two"></div>
        <div className="blob three"></div>
      </div>
      <div className="auth-card">
        <h2 className="logo">Military Asset Management</h2>
        <div className="subtitle">Secure access with role-based control</div>
        <div className="auth-header">
          <button className={`tab ${mode==='login' ? 'active' : ''}`} onClick={()=>setMode('login')}>Login</button>
          <button className={`tab ${mode==='register' ? 'active' : ''}`} onClick={()=>setMode('register')}>Register</button>
        </div>
        {mode==='login' ? (
          <form className="stack" onSubmit={onSubmitLogin}>
            {error && <div style={{ color: 'crimson' }}>{error}</div>}
            <div>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Sign in</button>
            <div className="hint">Use your issued military email and password</div>
          </form>
        ) : (
          <form className="stack" onSubmit={onSubmitRegister}>
            {error && <div style={{ color: 'crimson' }}>{error}</div>}
            <div>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <div>
              <label>Role</label>
              <select className="input" value={role} onChange={e=>setRoleLocal(e.target.value)}>
                <option value="admin">admin</option>
                <option value="base_commander">base_commander</option>
                <option value="logistics_officer">logistics_officer</option>
              </select>
            </div>
            <div>
              <label>Base ID (optional)</label>
              <input className="input" value={baseIdLocal} onChange={e=>setBaseIdLocal(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Create account</button>
            <div className="hint">Admins can assign base later if unknown</div>
          </form>
        )}
      </div>
    </div>
  )
}


