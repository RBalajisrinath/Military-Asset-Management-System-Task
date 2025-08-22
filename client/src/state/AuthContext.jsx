import React, { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState('')
  const [role, setRole] = useState('admin')
  const [baseId, setBaseId] = useState()

  const logout = () => {
    setToken('')
    setRole('')
    setBaseId('')
    if (typeof window !== 'undefined') window.location.href = '/login'
  }

  const value = useMemo(() => ({ token, setToken, role, setRole, baseId, setBaseId, logout }), [token, role, baseId])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


