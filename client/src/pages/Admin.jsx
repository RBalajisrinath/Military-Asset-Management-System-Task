import React, { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function Admin() {
  const { token } = useAuth()
  const [bases, setBases] = useState([])
  const [equip, setEquip] = useState([])
  const [newBase, setNewBase] = useState('')
  const [newEquip, setNewEquip] = useState({ name: '', category: '' })

  async function load() {
    const [b, e] = await Promise.all([
      apiRequest('/api/admin/bases', { token }),
      apiRequest('/api/admin/equipment-types', { token })
    ])
    setBases(b.data || [])
    setEquip(e.data || [])
  }
  useEffect(() => { load() }, [token])

  return (
    <div>
      <div className="header"><h2>Admin</h2><span className="muted">Manage bases and equipment types</span></div>
      <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <section className="panel" style={{ padding:16 }}>
          <div className="header" style={{ marginBottom:10 }}>
            <h3>Bases</h3>
          </div>
          <div className="row" style={{ marginBottom:12 }}>
            <input className="input" placeholder="New base name" value={newBase} onChange={e=>setNewBase(e.target.value)} />
            <button className="btn" onClick={async()=>{ if(!newBase.trim()) return; await apiRequest('/api/admin/bases', { method:'POST', token, body:{ name:newBase } }); setNewBase(''); load(); }}>Add Base</button>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th style={{ width:90 }}>Actions</th></tr>
            </thead>
            <tbody>
              {bases.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>
                    <button className="btn btn-danger" onClick={async()=>{ await apiRequest(`/api/admin/bases/${b.id}`, { method:'DELETE', token }); load(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel" style={{ padding:16 }}>
          <div className="header" style={{ marginBottom:10 }}>
            <h3>Equipment Types</h3>
          </div>
          <div className="row" style={{ marginBottom:12 }}>
            <input className="input" placeholder="Name" value={newEquip.name} onChange={e=>setNewEquip(s=>({...s, name:e.target.value}))} />
            <input className="input" placeholder="Category" value={newEquip.category} onChange={e=>setNewEquip(s=>({...s, category:e.target.value}))} />
            <button className="btn" onClick={async()=>{ if(!newEquip.name.trim()||!newEquip.category.trim()) return; await apiRequest('/api/admin/equipment-types', { method:'POST', token, body:newEquip }); setNewEquip({ name:'', category:'' }); load(); }}>Add Type</button>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Category</th><th style={{ width:90 }}>Actions</th></tr>
            </thead>
            <tbody>
              {equip.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.category}</td>
                  <td>
                    <button className="btn btn-danger" onClick={async()=>{ await apiRequest(`/api/admin/equipment-types/${t.id}`, { method:'DELETE', token }); load(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}


