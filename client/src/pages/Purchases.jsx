import React, { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function Purchases() {
  const { token, baseId, role } = useAuth()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ equipment_type_id: '', start_date: '', end_date: '' })
  const [form, setForm] = useState({ equipment_type_id: '', quantity: '', unit_cost: '', purchased_at: '' })
  const [adminBaseId, setAdminBaseId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    if (!baseId) return
    const qs = new URLSearchParams()
    qs.set('base_id', baseId)
    if (filters.equipment_type_id) qs.set('equipment_type_id', filters.equipment_type_id)
    if (filters.start_date) qs.set('start_date', filters.start_date)
    if (filters.end_date) qs.set('end_date', filters.end_date)
    const res = await apiRequest(`/api/purchases?${qs.toString()}`, { token })
    setRows(res.data || [])
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const chosenBaseId = role === 'admin' ? Number(adminBaseId) : baseId
    const equipmentTypeIdNum = Number(form.equipment_type_id)
    const quantityNum = Number(form.quantity)
    if (!chosenBaseId || !equipmentTypeIdNum || !quantityNum) {
      setError('Please provide Base ID (if admin), Equipment Type ID, and Quantity (>0)')
      return
    }
    const payload = {
      base_id: chosenBaseId,
      equipment_type_id: equipmentTypeIdNum,
      quantity: quantityNum,
      unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
      purchased_at: form.purchased_at || undefined
    }
    try {
      await apiRequest('/api/purchases', { method: 'POST', token, body: payload })
      setForm({ equipment_type_id: '', quantity: '', unit_cost: '', purchased_at: '' })
      if (role === 'admin' && !filters.base_id) {
        // no base filter state exists here; rely on load() with context baseId
      }
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [token, baseId, filters.equipment_type_id, filters.start_date, filters.end_date])

  return (
    <div>
      <div className="header"><h2>Purchases</h2><span className="muted">Record and view purchases</span></div>
      <form onSubmit={submit} className="row">
        {role === 'admin' && (
          <input className="input" placeholder="Base ID" value={adminBaseId} onChange={e=>setAdminBaseId(e.target.value)} />
        )}
        <input className="input" placeholder="Equipment Type ID" value={form.equipment_type_id} onChange={e=>setForm(f=>({...f, equipment_type_id:e.target.value}))} />
        <input className="input" placeholder="Quantity" value={form.quantity} onChange={e=>setForm(f=>({...f, quantity:e.target.value}))} />
        <input className="input" placeholder="Unit Cost" value={form.unit_cost} onChange={e=>setForm(f=>({...f, unit_cost:e.target.value}))} />
        <input className="input" type="datetime-local" value={form.purchased_at} onChange={e=>setForm(f=>({...f, purchased_at:e.target.value}))} />
        <button className="btn" type="submit">Record Purchase</button>
      </form>
      {error && <div style={{color:'crimson', marginTop:8}}>{error}</div>}

      <div className="toolbar">
        <input className="input" placeholder="Equipment Type ID" value={filters.equipment_type_id} onChange={e=>setFilters(f=>({...f, equipment_type_id:e.target.value}))} />
        <input className="input" type="date" value={filters.start_date} onChange={e=>setFilters(f=>({...f, start_date:e.target.value}))} />
        <input className="input" type="date" value={filters.end_date} onChange={e=>setFilters(f=>({...f, end_date:e.target.value}))} />
      </div>

      <table className="panel" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th><th>Base</th><th>Equipment</th><th>Qty</th><th>Unit Cost</th><th>Purchased At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.base_id}</td>
              <td>{r.equipment_type_id}</td>
              <td>{r.quantity}</td>
              <td>{r.unit_cost ?? '-'}</td>
              <td>{new Date(r.purchased_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


